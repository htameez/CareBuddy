const { AzureOpenAI } = require("openai");

const client = new AzureOpenAI({
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,        // e.g. https://xxx.cognitiveservices.azure.com
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION || "2024-12-01-preview",
});

/**
 * messages: [{ role: "system"|"user"|"assistant", content: "..." }, ...]
 * returns: string
 */
async function generateChatResponse(messages) {
  if (!process.env.AZURE_OPENAI_ENDPOINT) {
    throw new Error("Missing AZURE_OPENAI_ENDPOINT");
  }
  if (!process.env.AZURE_OPENAI_API_KEY) {
    throw new Error("Missing AZURE_OPENAI_API_KEY");
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("Invalid messages format (expected non-empty array).");
  }

  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  if (!deployment) {
    throw new Error("Missing AZURE_OPENAI_DEPLOYMENT (this is your Azure deployment name).");
  }

  // ✅ Responses API: use `input` (not `messages`)
  // The API reference defines `input` as the request field for text/chat-style items. :contentReference[oaicite:1]{index=1}
  const response = await client.responses.create({
    model: deployment,     // Azure: this should be the DEPLOYMENT name
    input: messages,
  });

  // The Node SDK provides output_text as a convenient aggregated string in many cases. :contentReference[oaicite:2]{index=2}
  if (response.output_text) return response.output_text;

  // Fallback: defensive parsing (in case output_text isn't present)
  const text =
    response?.output?.[0]?.content?.find?.((c) => c.type === "output_text")?.text ||
    response?.output?.[0]?.content?.[0]?.text;

  return text || "Sorry — I couldn't generate a response.";
}

module.exports = { generateChatResponse };