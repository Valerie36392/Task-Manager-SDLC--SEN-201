const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { generateToken } = require('../middleware/authmiddleware');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Please provide all required fields' 
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ username }, { email }] 
        });

        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                error: 'User already exists with this username or email' 
            });
        }

        // Create user
        const user = new User({
            username,
            email,
            password
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id, user.username);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                success: false, 
                error: errors.join(', ') 
            });
        }

        res.status(500).json({ 
            success: false, 
            error: 'Registration failed. Please try again.' 
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validation
        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Please provide username and password' 
            });
        }

        // Find user
        const user = await User.findOne({ username });
        
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid credentials' 
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid credentials' 
            });
        }

        // Generate token
        const token = generateToken(user._id, user.username);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Login failed. Please try again.' 
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', require('../middleware/authmiddleware').authenticate, async (req, res) => {
    try {
        res.json({
            success: true,
            user: {
                id: req.user._id,
                username: req.user.username,
                email: req.user.email,
                createdAt: req.user.createdAt
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get user profile' 
        });
    }
});

module.exports = router;