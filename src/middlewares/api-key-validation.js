const { redisConnection } = require("../config/redisConfig");
const { ApiKey } = require("../models/user.model");

const validateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey) return res.status(401).json({ error: "API key required" });

    // Fetch from Redis or MongoDB
    let keyData = await redisConnection.get(`api_key:${apiKey}`);
    if (keyData) {
      keyData = JSON.parse(keyData);
    } else {
      keyData = await ApiKey.findOne({ apiKey });
      if (!keyData) return res.status(403).json({ error: "Invalid API key" });
      await redisConnection.setex(
        `api_key:${apiKey}`,
        600,
        JSON.stringify(keyData)
      );
    }

    // Get usage count
    let usageCount = await redisConnection.get(`api_usage:${apiKey}`);
    if (!usageCount) {
      usageCount = keyData.usageCount; // Initialize from DB
      await redisConnection.set(`api_usage:${apiKey}`, usageCount);
    }
    usageCount = parseInt(usageCount);

    if (usageCount >= keyData.planLimit) {
      return res.status(429).json({ error: "API limit exceeded" });
    }

    return res.status(200).json({ valid: true, data: keyData });
  } catch (error) {
    console.error("API Key Middleware Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = validateApiKey;
