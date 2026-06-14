import express from 'express'
import configDotenv from 'dotenv'
import serverroutes from './routes/serverroutes.js';
import bodyParser from 'body-parser';
configDotenv.config();
const PORT = process.env.APPPORT
const app = express();
app.use(bodyParser.json())

app.use('/server', serverroutes)

app.listen(PORT, () => {
    console.log(`server started ${PORT}`);
})
