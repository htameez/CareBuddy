const axios = require("axios");
require("dotenv").config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// ✅ Generate chatbot response using OpenAI API
const generateChatResponse = async (messages) => {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error("Missing OpenAI API key");
    }

    // ✅ Ensure messages array exists
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error("Invalid messages format");
    }

    // ✅ Make API request to OpenAI
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: "gpt-4",
        messages: messages, // Send structured chat messages with user context
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // ✅ Return the chatbot response
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("❌ Chatbot error:", error.response?.data || error.message);
    throw new Error("Failed to process chat message.");
  }
};

module.exports = { generateChatResponse };
