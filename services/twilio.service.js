import fs from "fs";
import https from "https";
import { FormData, File } from "formdata-node";
import { fileFromPath } from "formdata-node/file-from-path";
import { fetch } from "undici";
import twilio from "twilio";
import { OpenAI } from "openai";
import axios from "axios";
import dotenv from "dotenv";
import createChat from "./what.service.js";
import { transliterate } from "transliteration";

dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const options = {
  "1": "PM KISAN",
  "2": "PM UJWAL YOJANA",
  "3": "RASHAN CARD",
  "4": "PMJAY"
};

const optionAliases = {
  "1": "1", "one": "1", "first": "1", "first option": "1", "pm kisan": "1",
  "2": "2", "two": "2", "second": "2", "second option": "2", "pm ujwal yojana": "2", "ujwala yojana": "2",
  "3": "3", "three": "3", "third": "3", "third option": "3", "rashan card": "3", "ration card": "3",
  "4": "4", "four": "4", "fourth": "4", "fourth option": "4", "pmjay": "4", "pm jay": "4"
};

const languageOptions = {
  "हिन्दी": "hi", "hindi": "hi",
  "english": "en",
  "मराठी": "mr", "marathi": "mr",
  "ગુજરાતી": "gu", "gujarati": "gu",
  "বাংলা": "bn", "bengali": "bn"
};

const userSessions = new Map();     // stores topic per user
const userLanguages = new Map();    // stores language per user
const greetingWords = ["hi", "hello", "hey", "help", "hii", "menu"];
const topicList = `Please select from the following topics:\n\n1) PM KISAN\n2) PM UJWAL YOJANA\n3) RASHAN CARD\n4) PMJAY`;

const downloadAudioFile = async (mediaUrl, from) => {
  const response = await axios.get(mediaUrl, {
    responseType: "arraybuffer",
    auth: {
      username: process.env.TWILIO_ACCOUNT_SID,
      password: process.env.TWILIO_AUTH_TOKEN,
    },
    httpsAgent: new https.Agent({ rejectUnauthorized: false })
  });
  const filePath = `/tmp/audio-${from}.ogg`;
  fs.writeFileSync(filePath, response.data);
  return filePath;
};

export const transcribeAudio = async (filePath) => {
  const form = new FormData();
  const audioFile = await fileFromPath(filePath);

  form.set('file', audioFile);
  form.set('model', 'whisper-1');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: form,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Transcription failed: ${JSON.stringify(data)}`);
  }

  return data.text;
};

export const handleWhatsAppMessage = async (from, message) => {
  const sessionId = "78b8a612-3d23-4975-be29-e05f777ca952";
  const userId = "761565b2-4d68-49ef-8cfa-e5085e5113ba";
  const personalityId = "a5ed65f8-1264-49ac-91c4-4dea07ba647d";
  const wordLimit = 100;
  const modelName = "gpt-4";

  let userMessage = message.Body?.trim().toLowerCase() || "";

  const isVoice = message.NumMedia > 0 && message.MediaContentType0?.includes("audio");
  if (isVoice) {
    const audioPath = await downloadAudioFile(message.MediaUrl0, from);
    let rawTranscript = await transcribeAudio(audioPath);
  
    // Normalize voice transcription
    userMessage = transliterate(rawTranscript)
      .replace(/[^\w\s]|_/g, "") // Remove punctuation like P.M.
      .replace(/\s+/g, " ")       // Collapse multiple spaces
      .toLowerCase()
      .trim();
  
    console.log("🎙️ Cleaned user message:", userMessage);
  }

  const isGreeting = greetingWords.includes(userMessage);
  if (isGreeting) {
    return await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: from,
      body: `Welcome!\n\n${topicList}`,
    });
  }

  const normalizedOption = optionAliases[userMessage];
  const langCode = languageOptions[userMessage.toLowerCase()];
  const selectedLang = userLanguages.get(from);
  const selectedTopic = userSessions.get(from);

  // 🎯 If message includes both topic and language (spoken directly)
  if (normalizedOption && options[normalizedOption] && langCode) {
    const topic = options[normalizedOption];
    userSessions.set(from, topic);
    userLanguages.set(from, langCode);

    const introMessage = `Give a short and clear overview about the Indian government scheme "${topic}".`;
    const aiReply = await createChat.createChat(
      sessionId,
      introMessage,
      userId,
      personalityId,
      wordLimit,
      modelName,
      langCode
    );

    return await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: from,
      body: `You've selected *${topic}*.\n\n${aiReply.data}\n\nYou can now ask questions about *${topic}*.`,
    });
  }

  // 🧩 If only topic is selected
  if (normalizedOption && options[normalizedOption]) {
    const topic = options[normalizedOption];
    userSessions.set(from, topic);
    userLanguages.delete(from); // clear previous language
    return await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: from,
      body: `You've selected *${topic}*.\n\nPlease select your language:\nहिन्दी\nEnglish\nमराठी\nગુજરાતી\nবাংলা`,
    });
  }

  // 🧩 If language is selected after topic
  if (selectedTopic && !selectedLang && langCode) {
    userLanguages.set(from, langCode);

    const introMessage = `Give a short and clear overview about the Indian government scheme "${selectedTopic}".`;
    const aiReply = await createChat.createChat(
      sessionId,
      introMessage,
      userId,
      personalityId,
      wordLimit,
      modelName,
      langCode
    );

    return await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: from,
      body: `You've selected *${selectedTopic}*.\n\n${aiReply.data}\n\nYou can now ask questions about *${selectedTopic}*.`,
    });
  }

  // ⚠️ If no topic yet
  if (!selectedTopic) {
    return await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: from,
      body: `Please select a topic before asking questions.\n\n${topicList}`,
    });
  }

  // ⚠️ If no language yet
  if (!selectedLang) {
    return await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: from,
      body: `Please select your preferred language:\nहिन्दी\nEnglish\nमराठी\nગુજરાતી\nবাংলা`,
    });
  }

  // ✅ Final Q&A handling
  const finalMessage = `The current topic is "${selectedTopic}". If the following question is unrelated to this topic, respond with "off-topic". Otherwise, answer properly.\n\nQuestion: ${userMessage}`;
  const aiReply = await createChat.createChat(
    sessionId,
    finalMessage,
    userId,
    personalityId,
    wordLimit,
    modelName,
    selectedLang
  );

  const aiText = aiReply.data.toLowerCase();
  const isOffTopic = aiText.includes("off-topic");

  if (isOffTopic) {
    return await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: from,
      body: `I'm not aware about this topic.\n\n${topicList}`,
    });
  }

  return await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_NUMBER,
    to: from,
    body: aiReply.data,
  });
};


export const handleSMSMessage = async (from, userMessage) => {
  const sessionId = "78b8a612-3d23-4975-be29-e05f777ca952";
  const userId = "761565b2-4d68-49ef-8cfa-e5085e5113ba";
  const personalityId = "43738300-5ba6-450c-a7b5-53cb3d36339b";
  const wordLimit = 100;
  const modelName = "gpt-4";
  const language = "en";

  const trimmedMessage = userMessage.trim().toLowerCase();
  const isGreeting = greetingWords.includes(trimmedMessage);
  const topicList = `Please select from the following topics:\n\n1) PM KISAN\n2) PM UJWAL YOJANA\n3) RASHAN CARD\n4) PMJAY`;

  const sendSMS = async (text) => {
    const url = "https://enterprise.smsgupshup.com/GatewayAPI/rest";
    await axios.get(url, {
      params: {
        method: "SendMessage",
        send_to: from,
        msg: text,
        msg_type: "TEXT",
        userid: process.env.GUPSHUP_USER_ID,
        auth_scheme: "plain",
        password: process.env.GUPSHUP_API_KEY,
        v: "1.1",
        format: "text",
        channel: "TRANS",
        appid: process.env.GUPSHUP_APP_NAME,
      },
    });
  };

  if (isGreeting) {
    return await sendSMS(`Welcome!\n\n${topicList}`);
  }

  if (["1", "2", "3", "4"].includes(trimmedMessage)) {
    const selectedTopic = options[trimmedMessage];
    userSessions.set(from, selectedTopic);

    const introMessage = `Give a short and clear overview about the Indian government scheme "${selectedTopic}".`;
    const aiReply = await createChat.createChat(
      sessionId,
      introMessage,
      userId,
      personalityId,
      wordLimit,
      modelName,
      language
    );

    return await sendSMS(`You've selected *${selectedTopic}*.\n\n${aiReply.data}\n\nYou can now ask questions about *${selectedTopic}*.`);
  }

  const selectedTopic = userSessions.get(from);
  if (!selectedTopic) {
    return await sendSMS(`Please select a topic before asking questions.\n\n${topicList}`);
  }

  const finalMessage = `The current topic is "${selectedTopic}". If the following question is unrelated to this topic, respond with "off-topic". Otherwise, answer properly.\n\nQuestion: ${userMessage}`;
  const aiReply = await createChat.createChat(
    sessionId,
    finalMessage,
    userId,
    personalityId,
    wordLimit,
    modelName,
    language
  );

  const aiText = aiReply.data.toLowerCase();
  const isOffTopic = aiText.includes("off-topic");

  if (isOffTopic) {
    return await sendSMS(`I'm not aware about this topic.\n\n${topicList}`);
  }

  return await sendSMS(aiReply.data);
};

