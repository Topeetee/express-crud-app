const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // Ensure username is unique
  },
  email: { 
    type: String,
    required: true,
    unique: true, // Ensure email is unique
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },

});

// Create the User model using the userSchema
const User = mongoose.model('User', userSchema);

module.exports = User;
