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
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    user = new User({ email, password: hashedPassword });
    await user.save();

    // Generate API Key with prefix and more entropy
    const apiKey = `sk_${uuidv4().replace(/-/g, "")}_${uuidv4()
      .replace(/-/g, "")
      .substring(0, 8)}`;
    const planLimit = 50; // Default limit for free users

    // Save API Key
    const apiKeyEntry = new ApiKey({
      userId: user._id,
      apiKey,
      planLimit,
      createdAt: new Date(),
      isActive: true,
    });
    await apiKeyEntry.save();

    res.status(201).json({
      message: "User registered successfully",
      apiKey, // Note: In production, you might want to only show this once
      token: generateToken(user.id),
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Server error during registration" });
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
