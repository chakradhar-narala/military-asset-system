const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

// @route POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { username, password, role, baseId } = req.body;
        const user = new User({ username, password, role, baseId });
        await user.save();
        res.status(201).json({ message: "User registered" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role, baseId: user.baseId },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, user: { username: user.username, role: user.role, baseId: user.baseId } });
    } catch (err) {
        console.error('[AUTH ERROR]:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
