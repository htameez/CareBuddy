const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUID: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  photoURL: String,
  medicalHistory: {
    conditions: [String],
    medications: [String],
    allergies: [String],
    lastUpdate: Date
  },
  chatHistory: [{
    timestamp: Date,
    message: String,
    response: String
  }],
  lastVisit: Date
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);