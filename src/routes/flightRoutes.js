import express from 'express';
import {
    createFlight,
    getAllFlights,
    getFlightById,
    updateFlight,
    deleteFlight,
} from '../controllers/flightController.js';

import protect from '../middlewares/authMiddleware.js';
import authorize from '../middlewares/roleMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';
import validateObjectId from '../middlewares/validateObjectId.js';

const router = express.Router();

router.post('/', protect, authorize('admin'), upload.single('image'), createFlight);
router.get('/', getAllFlights);
router.get('/:id', validateObjectId, getFlightById);
router.put('/:id', protect, authorize('admin'), validateObjectId, upload.single('image'), updateFlight);
router.delete('/:id', protect, authorize('admin'), validateObjectId, deleteFlight);

export default router;