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
const mongoURI = process.env.MONGO_URL || process.env.MONGODB_URI_LOCAL;

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

// Route to get similar users
app.get('/similar-users', async (req, res) => {
  try {
      // Fetch the current user's data (e.g., based on a session or a query parameter)
      const currentUser = await User.findOne({ email: req.userEmail }); 
      
      if (!currentUser || !currentUser.mbtiVector) {
          return res.json({ message: 'Please complete the quiz to find similar users.' });
      }

      // Fetch all other users from the database
      const allUsers = await User.find({ _id: { $ne: currentUser._id } });  // Exclude the current user

      // Calculate the Euclidean distance for each user
      const usersWithDistance = allUsers.map(user => {
          const distance = calculateEuclideanDistance(currentUser.mbtiVector, user.mbtiVector);
          return {
              name: user.name,
              email: user.email,
              gender: user.gender,
              mbti_answers: user.answers,
              mbti_vector: user.mbtiVector,
              mbti_type: user.type,
              euclidian_distance: distance,
          };
      });

      // Sort users by distance (closest first)
      usersWithDistance.sort((a, b) => a.distance - b.distance);

      // Send the sorted list of users to the client
      res.json({ users: usersWithDistance });
  } catch (error) {
      console.error('Error fetching similar users:', error);
      res.status(500).json({ error: 'An error occurred while fetching similar users.' });
  }
});

// POST route to save MBTI results
app.post('/save-mbti', async (req, res) => {
  const { mbti_type, mbti_vector, email } = req.body;  // Get data from the request body
  console.log(req.body);
  try {
      // Find the user by their email
      const user = await User.findOne({ email });
      if (!user) {
          console.log("user not found");
          return res.status(404).json({ success: false, error: 'User not found.' });
      }

      // Update the user's MBTI type and vector
      user.mbti_type = mbti_type;
      user.mbti_vector = mbti_vector;
      // Save the updated user to the database
      await user.save();

      // Send a success response
      res.json({ success: true, message: 'MBTI results saved successfully.' });
  } catch (error) {
      console.error('Error saving MBTI vector:', error);
      res.status(500).json({ success: false, error: 'Server error. Could not save MBTI results.' });
  }
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
