const axios = require("axios");
const dotenv = require("dotenv");

// ✅ Load environment variables
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = "https://carebuddy-resource.cognitiveservices.azure.com/openai/responses?api-version=2025-04-01-preview"; //"https://api.openai.com/v1/chat/completions"

// ✅ Generate chatbot response using OpenAI API
const generateChatResponse = async (messages) => {
  try {
    console.log("🔹 Loaded API Key:", OPENAI_API_KEY); // Debugging
    if (!OPENAI_API_KEY) {
      throw new Error("❌ Missing OpenAI API key");
    }

    // ✅ Ensure messages array exists
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error("❌ Invalid messages format");
    }

    // ✅ Make API request to OpenAI
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: "gpt-5.2-chat",
        messages: messages,
        temperature: 0.7,
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
    throw new Error("❌ Failed to process chat message.");
  }
};

module.exports = { generateChatResponse };
