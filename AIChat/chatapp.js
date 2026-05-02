import express from 'express';
import 'dotenv/config';
import cors from 'cors'
import chatcontroller from './controller/chatcontroller.js';
import bodyParser from 'body-parser';
const PORT = process.env.PORT ;
const app = express();
app.use(cors({
    origin : "*"
}));
app.use(bodyParser.json());
app.post('/send-msg', chatcontroller.CallChat);

app.listen(PORT,()=>{
    console.log(`Server started on ${PORT}`);
});
