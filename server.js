const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();  // Load environment variables from .env

const app = express();

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Middleware to parse incoming requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Mongoose connection to MongoDB
mongoose.connect(process.env.MONGODB_URI_LOCAL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('Error connecting to MongoDB:', err));

// Define the User schema and model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gender: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Render the registration form using EJS
app.get('/', (req, res) => {
  res.render('index');  // Renders 'views/index.ejs'
});

// POST route to handle form submission and save data to the database
app.post('/submit', async (req, res) => {
  const { name, gender, email } = req.body;
  console.log('Received form data:', req.body);  // Log the received data

  try {
    // Ensure all required fields are filled
    if (!name || !gender || !email) {
      return res.status(400).send('All fields are required!');
    }

    // Check if a user with the same email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('User with this email already exists!');
    }

    // Create a new user instance
    const newUser = new User(req.body);

    // Save the new user to the database
    await newUser.save();

    // Send a success message
    res.status(201).send(`User data saved: Name - ${name}, Email - ${email}, Gender - ${gender}`);
  } catch (error) {
    console.error('Error saving user data:', error);
    res.status(500).send('Server error. Please try again later.');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
