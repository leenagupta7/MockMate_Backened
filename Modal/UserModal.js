const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create a Schema for the SignupPage
const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  college: {
    type: String,
    required: true,
    trim: true
  },
  techStack: {
    type: String,
    required: true,
    trim: true
  },
  profilePhoto: {
    type: String, // Store the URL or path to the profile photo
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensure email is unique
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    trim: true
  },
  request:[{ type: Schema.Types.ObjectId,
    ref: 'User'}],
  sender:[{ type: Schema.Types.ObjectId,
    ref: 'User'}],
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

// Create a model from the schema
const User = mongoose.model('User', UserSchema);

module.exports = User;
