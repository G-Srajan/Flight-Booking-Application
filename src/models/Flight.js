import mongoose from 'mongoose';

const flightSchema = new mongoose.Schema({
    flightNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    airline: {
        type: String,
        required: true,
        trim: true,
    },
    departureCity: {
        type: String,
        required: true,
        trim: true,
    },
    arrivalCity: {
        type: String,
        required: true,
        trim: true,
    },
    departureDate: {
        type: Date,
        required: true,
    },
    arrivalDate: {
        type: Date,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    availableSeats: {
        type: Number,
        required: true,
    },
    flightClass: {
        type: String,
        enum: ['economy', 'business', 'first'],
        required: true,
    },
    image: {
        type: String,
        default: '',
    },
}, {
    timestamps: { createdAt: true, updatedAt: false },
});

const Flight = mongoose.model('Flight', flightSchema);

export default Flight;