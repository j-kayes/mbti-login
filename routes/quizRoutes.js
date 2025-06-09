
const express = require('express');
const User = require('../models/User'); // Import User model
const router = express.Router();

// Render MBTI quiz
router.get('/quiz', (req, res) => {
  const { name, email, gender } = req.query;
  res.render('quiz', { name, email, gender, mbti_answers: null, mbti_type: null, mbti_vector: null });
});

// Save MBTI results
router.post('/save-mbti', async (req, res) => {
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

module.exports = router;