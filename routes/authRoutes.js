const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User'); // Import User model

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: 'Too many server requests. Please try again later.'
});

// Registration route
router.get('/register', (req, res) => res.render('register'));
router.use('/submit', rateLimiter)
router.post('/submit', async (req, res) => {
  const { name, gender, email, password } = req.body;

  try {
    if (!name || !gender || !email || !password) {
      return res.status(400).render('register', { error: 'All fields are required!' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).render('register', { error: 'User with this email already exists!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, gender, email, password: hashedPassword });

    await newUser.save();
    res.redirect(`/quiz?name=${name}&email=${email}&gender=${gender}`);
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).render('register', { error: 'Server error. Try again later.' });
  }
});

// Login route
router.use('/login', rateLimiter)
router.get('/login', (req, res) => res.render('login', { error: null }));

//Login route
// TODO: Currently, the login route is not secure nor redirecting the user as necessary (why is this insecure?)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Ensure email and password are provided'
    if (!email || !password) {
      return res.status(400).render('login', { error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(400).render('login', { error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).render('login', { error: 'Invalid email or password.' });
    }

    req.session.user = user;
    res.redirect(`/similar-users?email=${user.email}`);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).render('login', { error: 'Server error. Please try again.' });
  }
});

// Logout route
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

module.exports = router;