import express from "express";
import { receiveAndReply } from "../controller/twilio.controller.js";

const router = express.Router();

// router.post("/send-whatsapp", sendWhatsAppMessage);
router.post("/webhook", receiveAndReply);

export default router;
