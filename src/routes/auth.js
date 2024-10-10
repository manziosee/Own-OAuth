// File: routes/auth.js
const express = require('express');
const { register, login, authorize, getToken, revokeToken } = require('../controllers/authController');

const router = express.Router();

// User registration
router.post('/register', register);

// User login
router.post('/login', login);

// OAuth authorize route (for client redirection)
router.get('/authorize', authorize);

// OAuth token exchange route
router.post('/token', getToken);

// Token revocation route
router.post('/revoke', revokeToken);

module.exports = router;

