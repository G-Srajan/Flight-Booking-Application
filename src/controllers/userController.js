import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate JWT and set it as httpOnly cookie
const generateTokenAndSetCookie = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });

    res.cookie('token', token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    });
};

// @desc   Register a new user
// @route  POST /api/users/register
export const registerUser = async(req, res) => {
    try {
        const { name, email, password, gender } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const profilePicture = req.file ? req.file.path : '';

        const user = await User.create({
            name,
            email,
            password,
            gender,
            profilePicture,
        });

        generateTokenAndSetCookie(res, user._id);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture,
        });
    } catch (error) {

        res.status(500).json({ message: error.message });
    }
};

// @desc   Login user
// @route  POST /api/users/login
export const loginUser = async(req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        generateTokenAndSetCookie(res, user._id);

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture,
        });
    } catch (error) {

        res.status(500).json({ message: error.message });
    }
}; // @desc   Logout user
// @route  POST /api/users/logout
export const logoutUser = (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

// @desc   Get logged-in user's profile
// @route  GET /api/users/profile
export const getUserProfile = async(req, res) => {
    try {
        // req.user is already set by the `protect` middleware — no need to query again
        res.status(200).json(req.user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Update logged-in user's profile
// @route  PUT /api/users/profile
export const updateUserProfile = async(req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        if (req.body.password) {
            user.password = req.body.password; // pre('save') hook will hash it
        }

        if (req.file) {
            user.profilePicture = req.file.path;
        }

        const updatedUser = await user.save();

        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            profilePicture: updatedUser.profilePicture,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};