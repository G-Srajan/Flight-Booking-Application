import Booking from '../models/Booking.js';
import Flight from '../models/Flight.js';

// @desc   Create a new booking
// @route  POST /api/bookings
// @access Protected (logged-in users)
export const createBooking = async(req, res) => {
    try {
        const { flightId, passengers } = req.body;

        if (!passengers || passengers.length === 0) {
            return res.status(400).json({ message: 'At least one passenger is required' });
        }

        const flight = await Flight.findById(flightId);
        if (!flight) {
            return res.status(404).json({ message: 'Flight not found' });
        }

        const seatsRequested = passengers.length;

        if (flight.availableSeats < seatsRequested) {
            return res.status(400).json({ message: 'Not enough available seats on this flight' });
        }

        const totalPrice = flight.price * seatsRequested;

        const booking = await Booking.create({
            user: req.user._id,
            flightId: flight._id,
            passengers,
            seatsBooked: seatsRequested,
            totalPrice,
            status: 'booked',
        });

        flight.availableSeats -= seatsRequested;
        await flight.save();

        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Get a booking by ID
// @route  GET /api/bookings/:id
// @access Protected (logged-in users)
export const getBookingById = async(req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('flightId');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view this booking' });
        }

        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc   Cancel a booking and restore seats
// @route  PUT /api/bookings/:id/cancel
// @access Protected (logged-in users)
export const cancelBooking = async(req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to cancel this booking' });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({ message: 'Booking is already cancelled' });
        }

        booking.status = 'cancelled';
        await booking.save();

        const flight = await Flight.findById(booking.flightId);
        if (flight) {
            flight.availableSeats += booking.seatsBooked;
            await flight.save();
        }

        res.status(200).json({
            message: 'Booking cancelled successfully. Refund of ₹' + booking.totalPrice + ' will be processed.',
            booking,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};