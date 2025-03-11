const { ApiKey } = require("../models/user.model");

const validateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey) return res.status(401).json({ error: "API key required" });

    const keyData = await ApiKey.findOne({ apiKey });
    if (!keyData) return res.status(403).json({ error: "Invalid API key" });

    if (keyData.usageCount >= keyData.planLimit) {
      return res.status(429).json({ error: "API limit exceeded" });
    }

    // Increase usage count
    keyData.usageCount += 1;
    await keyData.save();

    return res.status(200).json({ valid: true, data: keyData });
  } catch (error) {
    console.error("API Key Middleware Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = validateApiKey;
