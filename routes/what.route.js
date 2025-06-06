import { createPersonality, getWhat} from '../controller/what.controller.js';
import express from 'express';
import multer from 'multer';

const router = express.Router();
const upload = multer();

router.g('/user', getWhat);
router.post('/create-personality', upload.single('avatar'), createPersonality);

export default router;

