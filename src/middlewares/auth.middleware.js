const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to protect routes using JWT
const protect = async (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET
    );
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Middleware to verify API Key
const verifyApiKey = async (req, res, next) => {
  const apiKey = req.header("x-api-key");
  if (!apiKey) return res.status(401).json({ error: "API Key required" });

  const user = await User.findOne({ apiKey });
  if (!user) return res.status(403).json({ error: "Invalid API Key" });

  req.user = user;
  next();
};

module.exports = { protect, verifyApiKey };
