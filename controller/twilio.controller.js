import { handleWhatsAppMessage, handleSMSMessage } from "../services/twilio.service.js";
// import { handleSMSMessage } from "../services/sms.service.js";

export const receiveAndReply = async (req, res) => {
  try {
    const from = req.body.From;       // WhatsApp sender number
    // const body = req.body.Body;       // WhatsApp message text

    await handleWhatsAppMessage(from, req.body);

    res.status(200).send("Message received and replied");
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Internal Server Error");
  }
};


//SMS
export const smsWebhook = async (req, res) => {
  let from = req.body.From;
  const userMessage = String(req.body.Body || "").trim();
  console.log("req :", req.body);
  console.log("from :", from);
  if (!from.startsWith("+91")) {
    from = "+91" + from.replace(/^0+/, ""); // Remove leading 0s, if any
  }
  console.log("Formatted from:", from);
  console.log("Formatted useMessage:", userMessage);



  try {
    await handleSMSMessage(from, userMessage);
    res.sendStatus(200); // Twilio expects a 200 OK
  } catch (error) {
    console.error("SMS Error:", error);
    res.status(500).send("Internal Server Error");
  }
};


