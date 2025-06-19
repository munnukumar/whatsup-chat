import express from "express";
import { receiveAndReply,smsWebhook} from "../controller/twilio.controller.js";

const router = express.Router();

// router.post("/send-whatsapp", sendWhatsAppMessage);
router.post("/webhook", receiveAndReply);
router.post("/sms-webhook", smsWebhook);

// router.post('/send', sendSMS);
// router.post('/receive', receiveSMS);

export default router;
