import ReadExpence from "../models/ReadExpence.js";
import expencereader from "../tools/expencereader.tool.js";

const GetExpence = async (req, res) => {
    try {
        const {msg} = req.body ;
         const response = await ReadExpence();        
         const expenceresponse = await expencereader(response,msg)
        return res.status(200).json({
            success: true,
            msg: "Handled",
            expenceresponse :expenceresponse
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            msg: "Internal Server Error",
            error: error.message
        });

    }

};

export default GetExpence;