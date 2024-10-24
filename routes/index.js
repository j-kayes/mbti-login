const express = require('express');
const router = express.Router();

// GET request for the home page (index)
router.get('/', (req, res) => {
  res.render('index'); // Renders 'views/index.ejs'
});

// POST request to handle form submission
router.post('/submit', (req, res) => {
  const { name, email, gender } = req.body;

  // Simple validation
  if (!name || !email || !gender) {
    return res.status(400).send('All fields are required!');
  }

  res.send(`Received: Name - ${name}, Email - ${email}, Gender - ${gender}`);
});

module.exports = router;
