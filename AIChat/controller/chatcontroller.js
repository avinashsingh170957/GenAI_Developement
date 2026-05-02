import chatmodel from "../models/chatmodel.js";

class ChatController {

    async CallChat(req, res) {
        try {
            const { message } = req.body;
            const response = await chatmodel.chatserver(message);
            if (!message) {
                return res.status(400).json({
                    success: false,
                    message: "Message is required"
                });
            }
            
            return res.status(200).json({
                success: true,
                question : `you asking about ${message}`,
                answer : `${response}`
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: `Server Error ${error}`
            });
        }
    }
}

export default new ChatController();