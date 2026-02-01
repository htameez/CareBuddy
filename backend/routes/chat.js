const express = require("express");
const { generateChatResponse } = require("../services/azureOpenAI");
const User = require("../models/User.js");
const authMiddleware = require("../utils/authMiddleware.js");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { firebaseUID, messages } = req.body;

    if (!firebaseUID) {
      return res.status(400).json({ message: "❌ Missing firebaseUID." });
    }
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: "❌ Messages must be a non-empty array." });
    }

    const user = await User.findOne({ firebaseUID }).lean();

    if (!user) {
      return res.status(404).json({ message: "❌ User not found." });
    }

    const gender = user?.ehr?.demographics?.gender ?? "Unknown";
    const birthDate = user?.ehr?.demographics?.birthDate ?? "Unknown";

    const conditions = Array.isArray(user?.ehr?.medicalHistory?.conditions)
      ? user.ehr.medicalHistory.conditions
      : [];

    const medications = Array.isArray(user?.ehr?.medicalHistory?.medications)
      ? user.ehr.medicalHistory.medications
      : [];

    const allergies = Array.isArray(user?.ehr?.medicalHistory?.allergies)
      ? user.ehr.medicalHistory.allergies
      : [];

    const clinicalNotesArr = Array.isArray(user?.ehr?.medicalHistory?.clinicalNotes)
      ? user.ehr.medicalHistory.clinicalNotes
      : [];

    const clinicalNotes = clinicalNotesArr.length
      ? clinicalNotesArr
          .map((n) => `${n?.date ?? "Unknown date"}: ${n?.note ?? ""}`.trim())
          .filter(Boolean)
          .join("\n")
      : "None";

    const userContext = `
Name: ${user?.name ?? "Unknown"}
Gender: ${gender}
Birth date: ${birthDate}
Medical Conditions: ${conditions.length ? conditions.join(", ") : "None"}
Medications: ${medications.length ? medications.join(", ") : "None"}
Allergies: ${allergies.length ? allergies.join(", ") : "None"}
Clinical Notes:
${clinicalNotes}
    `.trim();

    const chatMessages = [
      {
        role: "system",
        content:
          "You are a healthcare assistant. Use the user's medical context when relevant. If information is missing, ask clarifying questions. Do not invent diagnoses.",
      },
      { role: "user", content: userContext },
      ...messages,
    ];

    const aiResponse = await generateChatResponse(chatMessages);

    return res.json({ response: aiResponse });
  } catch (error) {
    console.error("❌ Error processing chatbot request:", error?.response?.data || error?.message || error);
    return res.status(500).json({ message: "❌ Internal Server Error" });
  }
});

module.exports = router;