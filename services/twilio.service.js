import twilio from "twilio";
import dotenv from "dotenv";
import { getAIResponse } from "./openAi.service.js";

dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export const handleWhatsAppMessage = async (from, userMessage) => {
  const aiReply = await getAIResponse(userMessage);

  return await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_NUMBER,
    to: from,
    body: aiReply,
  });
};
