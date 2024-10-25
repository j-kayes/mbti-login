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
const mongoURI = process.env.MONGO_PUBLIC_URL || process.env.MONGODB_URI_LOCAL;

mongoose.set('debug', true);
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log(`Connected to MongoDB at ${mongoURI}`))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Define the User schema and model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gender: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mbti_answers: { type: [Number], required: false, default: null},
  mbti_type: { type: String, required: false, default: null},
  mbti_vector: { type: [Number], required: false, default: null},
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Render the registration form using EJS
app.get('/', (req, res) => {
  res.render('index');  // Renders 'views/index.ejs'
});

app.get('/quiz', (req, res) => {
  const { name, email, gender } = req.query;  // Grab user data from query params
  res.render('quiz', { name, email, gender, mbti_answers: null, mbti_type: null, mbti_vector: null });  // Render the quiz.ejs template
});

// POST route to handle form submission and save data to the database
app.post('/submit', async (req, res) => {
  const { name, gender, email } = req.body;
  console.log('Received form data:', { name, gender, email, mbti_answers: null, mbti_type: null, mbti_vector: null });  // Log the received data

  try {
    // Ensure all required fields are filled
    if (!name || !gender || !email) {
      return res.status(400).send('All fields are required!');
    }

    console.log('Mongoose connection state:', mongoose.connection.readyState);
    // Check if a user with the same email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('User with this email already exists!');
    }

    // Create a new user instance
    const newUser = new User({ name, gender, email, mbti_answers: null, mbti_type: null, mbti_vector: null });

    // Save the new user to the database
    await newUser.save();

    // Send a success message
    res.redirect(`/quiz?name=${name}&email=${email}&gender=${gender}`);
  } catch (error) {
    console.error('Error saving user data:', error);
    res.status(500).send('Server error. Please try again later.');
  }
});

app.get('/other-users', async (req, res) => {
  const email = req.query.email;  // Get the current user's email from query parameters

  try {
    // Find all users except the current user
    const users = await User.find({ email: { $ne: email } });  // Exclude current user using $ne

    // Send the list of users as JSON
    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'An error occurred while fetching users.' });
  }
});


// POST route to save MBTI results and render the result page
app.post('/save-mbti', async (req, res) => {
  const { mbti_type, mbti_vector, email } = req.body;
  console.log(req.body);

  try {
      // Find the user by their email
      const user = await User.findOne({ email });
      if (!user) {
          console.log("User not found");
          return res.status(404).json({ success: false, error: 'User not found.' });
      }

      // Update the user's MBTI type and vector
      user.mbti_type = mbti_type;
      user.mbti_vector = mbti_vector;

      // Save the updated user to the database
      await user.save();

      // Fetch other users excluding the current user
      const otherUsers = await User.find({ email: { $ne: email } });

      // Render the results page, passing the current user's MBTI type and other users
      res.render('results', { currentUser: user, otherUsers });
  } catch (error) {
      console.error('Error saving MBTI vector or fetching other users:', error);
      res.status(500).send('Server error. Could not save MBTI results or fetch other users.');
  }
});

// Route to render the similar-users page with users having the same MBTI type
app.get('/similar-users', async (req, res) => {
  const email = req.query.email;  // Get the current user's email from the query parameters

  try {
    // Find the current user by email
    const currentUser = await User.findOne({ email });

    if (!currentUser) {
      return res.status(404).send('Current user not found.');
    }

    // Find other users with the same MBTI type, excluding the current user
    const otherUsers = await User.find({
      mbti_type: currentUser.mbti_type,  // Find users with the same MBTI type
      email: { $ne: email }              // Exclude the current user
    });

    // Render the EJS page and pass the current user and other users to the template
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
