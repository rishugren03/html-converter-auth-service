const { redisConnection } = require("../config/redisConfig");
const { ApiKey, User } = require("../models/user.model");

const validateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey) return res.status(401).json({ error: "API key required" });

    // Fetch from Redis or MongoDB
    let keyData = await redisConnection.get(`api_key:${apiKey}`);
    let userPlan;

    if (keyData) {
      keyData = JSON.parse(keyData);
    } else {
      keyData = await ApiKey.findOne({ apiKey });
      if (!keyData) return res.status(403).json({ error: "Invalid API key" });

      const user = await User.findById(keyData.userId);
      if (!user) return res.status(403).json({ error: "User not found" });

      userPlan = user.plan;

      // Store in Redis with both keyData and plan
      await redisConnection.setex(
        `api_key:${apiKey}`,
        600,
        JSON.stringify({ ...keyData.toObject(), plan: userPlan })
      );
    }

    // Get usage count
    let usageCount = await redisConnection.get(`api_usage:${apiKey}`);
    if (usageCount === null) {
      usageCount = keyData.usageCount || 0; // Initialize from DB
      await redisConnection.set(`api_usage:${apiKey}`, usageCount);
    }
    usageCount = parseInt(usageCount);

    // Get the plan limit (either from Redis-stored data or from the plan object)
    const planLimit = keyData.planLimit || (keyData.plan && keyData.plan.limit);

    if (usageCount >= planLimit) {
      return res.status(429).json({ error: "API limit exceeded" });
    }

    // Increment usage count for this request
    await redisConnection.incr(`api_usage:${apiKey}`);

    // Attach key data to request for downstream middleware
    req.apiKeyData = keyData;
    next();
  } catch (error) {
    console.error("API Key Middleware Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = validateApiKey;
