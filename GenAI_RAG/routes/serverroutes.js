import express from 'express';
import {embedings,chats } from '../controller/ServerController.js';

const serverroutes = express.Router();

serverroutes.post('/chat',chats);
serverroutes.post('/embeding',embedings);

export default serverroutes;