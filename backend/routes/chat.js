const express = require("express");
const { generateChatResponse } = require("../services/azureOpenAI");
const User = require("../models/User.js");
const authMiddleware = require("../utils/authMiddleware.js");
const { buildRagContext } = require("../services/retrievalService");

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

    const { query, promptContext, retrieval } = buildRagContext(user, messages);

    const chatMessages = [
      {
        role: "system",
        content:
          "You are CareBuddy, a healthcare assistant inside the CareBuddy app. Refer to yourself as CareBuddy, not ChatGPT or OpenAI, unless the user directly asks about the underlying model. Do not reintroduce yourself in every reply. Do not repeatedly greet the user or repeat the user's name unless it is clearly useful in that specific response. Answer directly and naturally. Use only the retrieved patient context when describing chart-specific facts. If information is missing, say so and ask clarifying questions. Do not invent diagnoses. Distinguish patient-record facts from general educational guidance. Never infer race, ethnicity, nationality, religion, or other sensitive attributes unless they are explicitly stated in the retrieved patient context. If those attributes are not explicitly present, say they are unknown or not specified in the chart.",
      },
      {
        role: "user",
        content: `${promptContext}\n\nPatient question:\n${query}`,
      },
      ...messages,
    ];

    const aiResponse = await generateChatResponse(chatMessages);

    await User.updateOne(
      { firebaseUID },
      {
        $push: {
          chatHistory: {
            timestamp: new Date(),
            message: query,
            response: aiResponse,
          },
        },
      }
    );

    return res.json({
      response: aiResponse,
      retrievedContext: retrieval.ranked.map((item) => ({
        label: item.label,
        type: item.type,
        date: item.date,
        text: item.text,
        score: item.score,
      })),
    });
  } catch (error) {
    console.error("❌ Error processing chatbot request:", error?.response?.data || error?.message || error);
    return res.status(500).json({ message: "❌ Internal Server Error" });
  }
});

module.exports = router;
