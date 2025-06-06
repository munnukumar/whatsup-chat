import whatService from "../services/what.service.js";
import FormData from "form-data";

const getWhat = async (req, res, next) => {
    try {
        const response = await whatService.what();
        console.log("Response from whatServvvvvvvvvvvvv");
        console.log(response);
        res.status(200).json({
            data: response.data,
            message: "Data fetched successfully"
        });
    } catch (error) {
        console.error("Error in getWhat controller:", error);
        res.status(500).json({
            data: null,
            message: "Internal server error"
        });
    }
}

const createPersonality = async (req, res) => {
    try {
        console.log("formData", req.body);
        const formData = new FormData();
        formData.append("name", req.body.name);

        if (req.file) {
            formData.append("avatar", req.file.buffer, {
                filename: req.file.originalname,
                contentType: req.file.mimetype
            });
        }

        const response = await whatService.createPersonality(formData);
        console.log("Response from createPersonality:", response);
        res.status(200).json({
            data: response,
            message: "Personality created successfully"
        });
    } catch (error) {
        console.error("Error in createPersonality controller:", error);
        res.status(500).json({
            data: null,
            message: "Internal Server Error"
        });
    }
};

const createChat = async (req, res, next) => {
    try {
        const { sessionId, message, userId, personalityId, wordLimit, modelName, language } = req.body;
        // console.log("Request body in createChat controller :", req.body);
        // console.log("Session ID in createChat controller:", sessionId);
        if (!sessionId || typeof sessionId !== 'string') {
            return res.status(400).json({ message: "Invalid sessionId" });
        }
        const response = await whatService.createChat(sessionId, message, userId, personalityId, wordLimit, modelName, language);
        // console.log("Response from createChat---------------------> :", response);
        res.status(200).json({
            data: response,
            message: "Chat created successfully"
        });
    } catch (error) {
        console.error("Error in createChat controller:", error);
        res.status(500).json({
            data: null,
            message: "Internal Server Error"
        });
    }
}

const createSession = async (req, res, next) => {
    try {
        const { userId, personalityId } = req.body;
        const response = await whatService.createSession(userId, personalityId);
        console.log("Response from createSession:", response);
        res.status(200).json({
            data: response,
            message: "Session created successfully"
        });
    } catch (error) {
        console.error("Error in createSession controller:", error);
        res.status(500).json({
            data: null,
            message: "Internal Server Error"
        });
    }
}

export { getWhat, createPersonality, createChat, createSession };