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
            // console.log("whatService is being hit");
            // console.log( "ACCESS_KEY: ", ENV.ACCESS_KEY);
            // console.log( "SECRET_KEY: ", ENV.SECRET_KEY);
            // console.log( "CLIENT_ID: ", ENV.CLIENT_ID);
            // console.log( "TP_BASE_URL: ", ENV.TP_BASE_URL);
            const response = await this.twinProtocol.userWithMemory();
            console.log("The response received is: ", response);
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
            console.log("Personality creation response:", response);
            return response;
        } catch (error) {
            console.error("Error in createPersonality:", error);
            return {
                data: null,
                message: "Unable to create personality"
            }
        }
    }

}

export default new whatService();
