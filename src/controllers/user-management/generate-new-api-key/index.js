const { v4: uuidv4 } = require("uuid");
const { User, ApiKey } = require("../../../models/user.model");

const createNewApiKey = async (req, res) => {
  try {
    const { email } = req.user;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate new API key
    const newApiKey = `sk_${uuidv4().replace(/-/g, "")}_${uuidv4()
      .replace(/-/g, "")
      .substring(0, 8)}`;

    // Set planLimit based on user plan
    let planLimit = 50;
    if (user.plan === "pro") planLimit = 10000;
    else if (user.plan === "pro_max") planLimit = 100000;

    // Check if the user already has an API key
    const existingKey = await ApiKey.findOne({ userId: user._id });

    if (existingKey) {
      // Update existing key
      existingKey.apiKey = newApiKey;
      existingKey.planLimit = planLimit;
      existingKey.usageCount = 0;
      existingKey.createdAt = new Date();
      existingKey.isActive = true;

      await existingKey.save();
    } else {
      // Create a new key
      const newApiKeyEntry = new ApiKey({
        userId: user._id,
        apiKey: newApiKey,
        planLimit,
        usageCount: 0,
        createdAt: new Date(),
        isActive: true,
      });

      await newApiKeyEntry.save();
    }

    return res.status(201).json({
      message: "API key generated successfully",
      apiKey: newApiKey,
    });
  } catch (err) {
    console.error("API Key generation failed:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { createNewApiKey };
