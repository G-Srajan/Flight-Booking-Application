import express from 'express';
import {
    createBooking,
    getBookingById,
    cancelBooking,
} from '../controllers/bookingController.js';

import protect from '../middlewares/authMiddleware.js';
import validateObjectId from '../middlewares/validateObjectId.js';

const router = express.Router();

router.post('/', protect, createBooking);
router.get('/:id', protect, validateObjectId, getBookingById);
router.put('/:id/cancel', protect, validateObjectId, cancelBooking);

export default router;