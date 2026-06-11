//const Servermodels = require("../models/Servermodels.js");
import { embedingsmodel, Chatmodel } from '../models/Servermodels.js'
export async function embedings(params) {

    await embedingsmodel();
}

export async function chats(req, res) {
    try {
        console.log("req.body:", req.body);

        const { msg } = req.body;

        const response = await Chatmodel(msg);

        return res.status(200).json({
            question: msg,
            response
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: error.message
        });
    }
}