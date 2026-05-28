import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import bodyParser from 'body-parser';

import Requestroutes from './Routes/RequestRouts.js';

const PORT = process.env.PORT;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', Requestroutes);

app.listen(PORT, () => {
    console.log(`Server Started ! ${PORT}`);
});