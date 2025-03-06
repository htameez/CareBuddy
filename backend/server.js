// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Import Routes
const userRoutes = require("./routes/users");
const chatRoutes = require("./routes/chat"); // 🔹 Ensure chat route is imported

app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes); // 🔹 Corrected route for chat endpoint

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});