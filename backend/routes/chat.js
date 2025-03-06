const express = require("express");
const { generateChatResponse } = require("../services/openaiService");
const User = require("../models/User.js");
const authMiddleware = require("../utils/authMiddleware.js");

const router = express.Router();

// ✅ Fetch user data and generate chatbot response
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { firebaseUID, messages } = req.body;

    if (!firebaseUID || !messages) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // ✅ Retrieve user's EHR data from MongoDB
    const user = await User.findOne({ firebaseUID });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // ✅ Structure user medical data for RAG
    const userContext = `
      Name: ${user.name}
      Gender: ${user.ehr?.demographics?.gender || "Unknown"}
      Age: ${user.ehr?.demographics?.birthDate || "Unknown"}
      Medical Conditions: ${user.ehr?.medicalHistory?.conditions.join(", ") || "None"}
      Medications: ${user.ehr?.medicalHistory?.medications.join(", ") || "None"}
      Allergies: ${user.ehr?.medicalHistory?.allergies.join(", ") || "None"}
      Clinical Notes: ${user.ehr?.medicalHistory?.clinicalNotes.map(n => `${n.date}: ${n.note}`).join("\n") || "None"}
    `;

    // ✅ Append user context to messages
    const chatMessages = [
      { role: "system", content: "You are a healthcare assistant with access to the user's medical history." },
      { role: "user", content: userContext },
      ...messages,
    ];

    // ✅ Generate AI response
    const aiResponse = await generateChatResponse(chatMessages);

    res.json({ response: aiResponse });
  } catch (error) {
    console.error("❌ Error processing chatbot request:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;