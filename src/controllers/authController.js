// File: controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// In-memory storage for simplicity (use a DB in production)
const users = [];
const clients = {};
const authCodes = {};
const tokens = {};

// Helper function to generate JWT
const generateToken = (payload, expiresIn) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

// Register a new user
exports.register = (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    users.push({ username, password: hashedPassword });
    res.json({ message: 'User registered successfully' });
};

// Login user
exports.login = (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }
    req.session.user = user;
    res.json({ message: 'Login successful' });
};

// Authorize (OAuth redirect after login)
exports.authorize = (req, res) => {
    const { client_id, redirect_uri } = req.query;
    if (!req.session.user) {
        return res.status(401).json({ message: 'User not logged in' });
    }
    const authCode = Math.random().toString(36).substr(2, 10);
    authCodes[authCode] = req.session.user.username;
    res.redirect(`${redirect_uri}?code=${authCode}`);
};

// Exchange authorization code for tokens
exports.getToken = (req, res) => {
    const { code, client_id, client_secret } = req.body;
    if (!authCodes[code]) {
        return res.status(400).json({ message: 'Invalid authorization code' });
    }
    const user = authCodes[code];
    delete authCodes[code];

    const accessToken = generateToken({ user }, process.env.JWT_EXPIRATION);
    const refreshToken = Math.random().toString(36).substr(2, 40);
    tokens[refreshToken] = user;

    res.json({ access_token: accessToken, refresh_token: refreshToken });
};

// Revoke token
exports.revokeToken = (req, res) => {
    const { token } = req.body;
    if (tokens[token]) {
        delete tokens[token];
        return res.json({ message: 'Token revoked successfully' });
    }
    res.status(400).json({ message: 'Invalid token' });
};
