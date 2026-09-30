import express from 'express';
import {
    registerUser,
    loginUser,
    logoutUser,
} from '../controllers/userController.js';

import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.post('/register', upload.single('profilePicture'), registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);


export default router;