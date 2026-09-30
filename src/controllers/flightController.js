import Flight from '../models/Flight.js';

// @desc   Create a new flight
// @route  POST /api/flights
// @access Admin only
export const createFlight = async(req, res) => {
    try {
        const {
            flightNumber,
            airline,
            departureCity,
            arrivalCity,
            departureDate,
            arrivalDate,
            price,
            availableSeats,
            flightClass,
        } = req.body;

        const flightExists = await Flight.findOne({ flightNumber });
        if (flightExists) {
            return res.status(400).json({ message: 'Flight with this flight number already exists' });
        }

        const image = req.file ? req.file.path : '';

        const flight = await Flight.create({
            flightNumber,
            airline,
            departureCity,
            arrivalCity,
            departureDate,
            arrivalDate,
            price,
            availableSeats,
            flightClass,
            image,
        });

        res.status(201).json(flight);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc   Get all flights, with optional search filters
// @route  GET /api/flights
// @access Public
export const getAllFlights = async(req, res) => {
    try {
        const { departureCity, arrivalCity, departureDate, flightClass } = req.query;

        const filter = {};

        if (departureCity) {
            filter.departureCity = { $regex: departureCity, $options: 'i' };
        }

        if (arrivalCity) {
            filter.arrivalCity = { $regex: arrivalCity, $options: 'i' };
        }

        if (flightClass) {
            filter.flightClass = flightClass;
        }

        if (departureDate) {
            const startOfDay = new Date(departureDate);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(departureDate);
            endOfDay.setHours(23, 59, 59, 999);

            filter.departureDate = { $gte: startOfDay, $lte: endOfDay };
        }

        const flights = await Flight.find(filter);

        res.status(200).json(flights);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Get a single flight by ID
// @route  GET /api/flights/:id
// @access Public
export const getFlightById = async(req, res) => {
    try {
        const flight = await Flight.findById(req.params.id);

        if (!flight) {
            return res.status(404).json({ message: 'Flight not found' });
        }

        res.status(200).json(flight);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Update flight details
// @route  PUT /api/flights/:id
// @access Admin only
export const updateFlight = async(req, res) => {
    try {
        const flight = await Flight.findById(req.params.id);

        if (!flight) {
            return res.status(404).json({ message: 'Flight not found' });
        }

        const {
            flightNumber,
            airline,
            departureCity,
            arrivalCity,
            departureDate,
            arrivalDate,
            price,
            availableSeats,
            flightClass,
        } = req.body;

        flight.flightNumber = flightNumber !== undefined ? flightNumber : flight.flightNumber;
        flight.airline = airline !== undefined ? airline : flight.airline;
        flight.departureCity = departureCity !== undefined ? departureCity : flight.departureCity;
        flight.arrivalCity = arrivalCity !== undefined ? arrivalCity : flight.arrivalCity;
        flight.departureDate = departureDate !== undefined ? departureDate : flight.departureDate;
        flight.arrivalDate = arrivalDate !== undefined ? arrivalDate : flight.arrivalDate;
        flight.price = price !== undefined ? price : flight.price;
        flight.availableSeats = availableSeats !== undefined ? availableSeats : flight.availableSeats;
        flight.flightClass = flightClass !== undefined ? flightClass : flight.flightClass;

        if (req.file) {
            flight.image = req.file.path;
        }

        const updatedFlight = await flight.save();

        res.status(200).json(updatedFlight);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc   Delete a flight
// @route  DELETE /api/flights/:id
// @access Admin only
export const deleteFlight = async(req, res) => {
    try {
        const flight = await Flight.findById(req.params.id);

        if (!flight) {
            return res.status(404).json({ message: 'Flight not found' });
        }

        await flight.deleteOne();

        res.status(200).json({ message: 'Flight deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};