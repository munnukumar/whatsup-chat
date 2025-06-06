import { handleWhatsAppMessage } from "../services/twilio.service.js";

export const receiveAndReply = async (req, res) => {
    try {
      const from = req.body.From;       // WhatsApp sender number
      const body = req.body.Body;       // WhatsApp message text
  
      await handleWhatsAppMessage(from, body);
  
      res.status(200).send("Message received and replied");
    } catch (err) {
      console.error("Error:", err);
      res.status(500).send("Internal Server Error");
    }
  };
  
