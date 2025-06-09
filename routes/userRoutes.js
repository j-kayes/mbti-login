const express = require('express');
const User = require('../models/User'); // Import User model
const router = express.Router();

// Render similar users page
router.get('/similar-users', async (req, res) => {
  const email = req.query.email;

  try {
    const currentUser = await User.findOne({ email });
    if (!currentUser) {
      return res.status(404).send('Current user not found.');
    }

    const otherUsers = await User.find({
      email: { $ne: email }
    });

    res.render('similar-users', { currentUser, otherUsers });
  } catch (error) {
    console.error('Error fetching similar users:', error);
    res.status(500).send('An error occurred while fetching similar users.');
  }
});

module.exports = router;