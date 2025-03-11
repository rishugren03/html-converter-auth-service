const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { User, ApiKey } = require("../models/user.model"); // Updated import

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Register User
const registerUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ email, password: hashedPassword });
    await user.save();

    // Create API Key for the user
    const apiKey = uuidv4();
    const planLimit = 50; // Default limit for free users

    const apiKeyEntry = new ApiKey({ userId: user._id, apiKey, planLimit });
    await apiKeyEntry.save();

    res.json({
      message: "User registered",
      apiKey,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    // Fetch the API key for the user
    const apiKeyEntry = await ApiKey.findOne({ userId: user._id });

    res.json({
      apiKey: apiKeyEntry?.apiKey || null,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { registerUser, loginUser };
