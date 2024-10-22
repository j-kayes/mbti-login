const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  gender: String,
  answers: [Number],
  type: String,
  vector: [Number],
});

module.exports = mongoose.model('User', userSchema);
