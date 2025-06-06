import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const getAIResponse = async (userMessage) => {
  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo", // or "gpt-4" if your plan supports it
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant answering user questions relevant to the topic they ask.",
      },
      {
        role: "user",
        content: userMessage,
      },
    ],
  });

  return chatCompletion.choices[0].message.content.trim();
};
