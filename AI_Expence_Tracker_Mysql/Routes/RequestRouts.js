import GetExpence from '../controllers/SendRequest.js';
import express from 'express'
const Requestroutes = express.Router();

Requestroutes.post('/send-request', GetExpence);

export default Requestroutes;