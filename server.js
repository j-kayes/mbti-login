const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
require('dotenv').config();

const app = express();

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Setup session management
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  // Set to `true` if using HTTPS
}));

// MongoDB Connection
const mongoURI = process.env.MONGO_PUBLIC_URL || process.env.MONGODB_URI_LOCAL;
mongoose.set('debug', true);
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log(`Connected to MongoDB at ${mongoURI}`))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Define User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gender: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },  // Secure password storage
  mbti_answers: { type: [Number], default: null },
  mbti_type: { type: String, default: null },
  mbti_vector: { type: [Number], default: null },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Render registration form
app.get('/', (req, res) => res.render('register'));

// Render login page
app.get('/login', (req, res) => res.render('login', { error: null }));

// Handle registration
app.post('/submit', async (req, res) => {
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

// TODO: Currently, the login route is not secure nor redirecting the user as necessary.
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Ensure email and password are provided
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

// Handle logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

// Render MBTI quiz
app.get('/quiz', (req, res) => {
  const { name, email, gender } = req.query;
  res.render('quiz', { name, email, gender, mbti_answers: null, mbti_type: null, mbti_vector: null });
});

// Save MBTI results
app.post('/save-mbti', async (req, res) => {
  const { mbti_type, mbti_vector, email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).render('results', { error: 'User not found.' });
    }

    user.mbti_type = mbti_type;
    user.mbti_vector = mbti_vector;
    await user.save();

    const otherUsers = await User.find({ email: { $ne: email } });
    res.render('results', { currentUser: user, otherUsers });
  } catch (error) {
    console.error('Error saving MBTI results:', error);
    res.status(500).render('results', { error: 'Server error.' });
  }
});

// Render similar users page
app.get('/similar-users', async (req, res) => {
  const email = req.query.email;

  try {
    const currentUser = await User.findOne({ email });
    if (!currentUser) {
      return res.status(404).send('Current user not found.');
    }

    const otherUsers = await User.find({
      mbti_type: currentUser.mbti_type,
      email: { $ne: email }
    });

    res.render('similar-users', { currentUser, otherUsers });
  } catch (error) {
    console.error('Error fetching similar users:', error);
    res.status(500).send('An error occurred while fetching similar users.');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
