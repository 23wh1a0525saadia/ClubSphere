const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config(); // .env is in the SAME folder

const app = express();

// Middleware
app.use(express.json());

// Debug (you can remove later)
console.log("DEBUG MONGO_URI:", process.env.MONGO_URI);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected to ClubSphere DB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Test route
app.get("/", (req, res) => {
  res.send("ClubSphere Backend Connected Successfully");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
