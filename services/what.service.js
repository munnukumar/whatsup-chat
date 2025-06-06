import TwinProtocol from "twin-protocol-dev";
import axios from "axios";
import { ENV } from "../config/env.js";

class whatService {
    constructor() {
        this.twinProtocol = new TwinProtocol({
            TP_ACCESS_KEY: ENV.ACCESS_KEY,
            TP_SECRET_KEY: ENV.SECRET_KEY,
            TP_CLIENT_ID: ENV.CLIENT_ID,
            TP_BASE_URL: ENV.TP_BASE_URL,
            TP_WS_URL: ENV.TP_WS_URL
        });
    }

    async what() {
        try {
            const response = await this.twinProtocol.userWithMemory();
            // console.log("The response received is: ", response, 20);
            return response;
        } catch (error) {
            console.error("Error in whatService:", error);
            return {
                data: null,
                message: "Unable to fetch data"
            }
        }
    }

    async createPersonality(formData) {
        try {
            const response = await this.twinProtocol.createPersonality(formData);
            // console.log("Personality creation response:", response);
            return response;
        } catch (error) {
            console.error("Error in createPersonality:", error);
            return {
                data: null,
                message: "Unable to create personality"
            }
        }
    }

     async createChat (sessionId, message, userId, personalityId, wordLimit, modelName, language) {
        return await this.twinProtocol.createChat(
            sessionId,
            message,
            userId,
            personalityId,
            wordLimit,
            modelName,
            language
        );
    };

    async createSession(userId, personalityId) {
        try {
            const response = await this.twinProtocol.createSession(userId, personalityId);
            // console.log("Session creation response:", response);
            return response;
        } catch (error) {
            console.error("Error in createSession:", error);
            return {
                data: null,
                message: "Unable to create session"
            }
        }
    }
}

export default new whatService();
