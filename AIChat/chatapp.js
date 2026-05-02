import express from 'express';
const app = express();
import 'dotenv/config'
import chatcontroller from './controller/chatcontroller.js';
import bodyParser from 'body-parser';
const PORT = process.env.PORT ;
app.use(bodyParser.json())
app.post('/send-msg', chatcontroller.CallChat);

app.listen(PORT,()=>{
    console.log(`Server started on ${PORT}`);
});
