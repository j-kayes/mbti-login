const express = require('express');
const path = require('path');
const session = require('express-session');
require('dotenv').config(); // Load environment variables

const app = express();

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware for session management
app.use(session({
  secret: 'your_secret_key', // Replace with a secure key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Import and use the index route
const indexRouter = require('./routes/index');
app.use('/', indexRouter);

// Set up the port
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
