const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Import User model

// Registration route
router.get('/register', (req, res) => res.render('register'));

// Login route
router.get('/login', (req, res) => res.render('login'));

// Logout route
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

module.exports = router;