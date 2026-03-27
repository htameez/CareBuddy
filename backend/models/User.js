const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firebaseUID: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    photoURL: String,
    profile: {
      age: { type: Number, min: 0, max: 120 },
      weight: { type: String, maxlength: 40 },
      height: { type: String, maxlength: 20 },
      healthGoals: { type: String, maxlength: 400 },
    },

    // 🔹 Epic EHR Integration (Medical Data Only from Epic)
    ehr: {
      epicPatientID: { type: String, unique: true, sparse: true }, // 🔹 Epic Patient ID
      fhirUserID: { type: String }, // 🔹 Practitioner ID (If doctor/nurse)
      ehrAccessToken: { type: String }, // 🔹 OAuth Access Token
      ehrLastSynced: { type: Date }, // 🔹 Last time data was synced
      medicalHistory: {
        conditions: [String],
        medications: [String],
        allergies: [String],
        demographics: {
          birthDate: String,
          gender: String,
          ethnicity: String,
        },
        clinicalNotes: [
          {
            date: Date,
            note: String,
          },
        ],
      },
    },

    // 🔹 Chatbot interaction history
    chatHistory: [
      {
        timestamp: Date,
        message: String,
        response: String,
      },
    ],

    lastVisit: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
