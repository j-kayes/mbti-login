const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  gender: String,
  mbti_answers: [Number],
  mbti_type: String,
  mbti_vector: [Number],
});

module.exports = mongoose.model('User', userSchema);
