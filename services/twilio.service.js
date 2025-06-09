import twilio from "twilio";
import dotenv from "dotenv";
// import { getAIResponse } from "./openAi.service.js";
import createChat from "./what.service.js"

dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);


const options = {
  "1": "PM KISAN",
  "2": "PM UJWAL YOJANA",
  "3": "RASHAN CARD",
  "4": "PMJAY"
};

const userSessions = new Map();
const greetingWords = ["hi", "hello", "hey", "help", "hii", "menu"];

export const handleWhatsAppMessage = async (from, userMessage) => {
  const sessionId = "78b8a612-3d23-4975-be29-e05f777ca952";
  const userId = "761565b2-4d68-49ef-8cfa-e5085e5113ba";
  const personalityId = "43738300-5ba6-450c-a7b5-53cb3d36339b";
  const wordLimit = 100;
  const modelName = "gpt-4";
  const language = "en";

  const trimmedMessage = userMessage.trim().toLowerCase();
  const isGreeting = greetingWords.includes(trimmedMessage);

  const topicList = `Please select from the following topics:\n\n1) PM KISAN\n2) PM UJWAL YOJANA\n3) RASHAN CARD\n4) PMJAY`;

  if (isGreeting) {
    return await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: from,
      body: `Welcome!\n\n${topicList}`,
    });
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
    console.log("AI topic intro:", aiReply);

    return await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: from,
      body: `You've selected *${selectedTopic}*.\n\n${aiReply.data}\n\nYou can now ask questions about *${selectedTopic}*.`,
    });
  }

  const selectedTopic = userSessions.get(from);
  if (!selectedTopic) {
    return await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: from,
      body: `Please select a topic before asking questions.\n\n${topicList}`,
    });
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
  console.log("AI response:", aiReply);
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
