import { createPersonality, getWhat, createChat, createSession} from '../controller/what.controller.js';
import express from 'express';
import multer from 'multer';

const router = express.Router();
const upload = multer();

router.post('/user', getWhat);
router.post('/create-personality', upload.single('avatar'), createPersonality);
router.post('/create-session', createSession);
router.post('/createChat', createChat)

export default router;

