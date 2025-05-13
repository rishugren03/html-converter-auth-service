const { ApiKey, User } = require("../models/user.model");
const { redisConnection } = require("../config/redisConfig");

const validateApiKey = async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey) return res.status(401).json({ error: "API key required" });

    // Try Redis
    let cachedData = await redisConnection.get(`api_key:${apiKey}`);
    let keyData;
    let userPlan;

    if (cachedData) {
      console.log("✅ Redis hit");
      keyData = JSON.parse(cachedData);
    } else {
      console.log("❌ Redis miss - checking MongoDB");
      const apiKeyDoc = await ApiKey.findOne({ apiKey });
      if (!apiKeyDoc) return res.status(403).json({ error: "Invalid API key" });

      const user = await User.findById(apiKeyDoc.userId);
      if (!user) return res.status(403).json({ error: "User not found" });

      userPlan = user.plan;

      keyData = {
        ...apiKeyDoc.toObject(),
        plan: userPlan,
      };

      // Cache it in Redis
      await redisConnection.setex(
        `api_key:${apiKey}`,
        600,
        JSON.stringify(keyData)
      );
    }

    // Get or initialize usage count
    let usageCount = await redisConnection.get(`api_usage:${apiKey}`);
    if (usageCount === null) {
      usageCount = keyData.usageCount || 0;
      await redisConnection.set(`api_usage:${apiKey}`, usageCount);
    }

    const planLimit =
      keyData.planLimit || (keyData.plan && keyData.plan.limit) || 50;

    return res.json({
      valid: true,
      data: {
        ...keyData,
        usageCount: parseInt(usageCount),
        planLimit,
      },
    });
  } catch (error) {
    console.error("API Key Controller Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  validateApiKey,
};
