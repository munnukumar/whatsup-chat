import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import ngrok from "@ngrok/ngrok";


import whatRoute from "./routes/what.route.js";
import twilioRoute from "./routes/twilio.route.js";



dotenv.config();
const app = express();
app.use(cookieParser());
app.use(cors({ credentials: true, origin: true })); 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api", whatRoute);
app.use("/twilio", twilioRoute);


const PORT = process.env.PORT || 5000;
app.listen(PORT, async() => {
  console.log(` Server running at http://localhost:${PORT}`);


   // Start Ngrok tunnel
   try {
    console.log("🌐 Starting ngrok tunnel...");

    const tunnel = await ngrok.connect({
      proto: "http",
      authtoken: process.env.NGROK_AUTH_TOKEN,
      addr: PORT,
      // Custom hostname requires a paid plan
      // hostname: "munnu-dev.ngrok-free.app",
    });

    console.log(`🚀 Public URL (ngrok): ${tunnel.url()}`);
    console.log(`📨 Set this as your Twilio webhook: ${tunnel.url()}/twilio/webhook`);
  } catch (ngrokError) {
    console.error("❌ Error starting ngrok tunnel:", ngrokError.message);
    process.exit(1);
  }
});