const { redisConnection } = require("../config/redisConfig");
const { ApiKey } = require("../models/user.model");

const syncUsageToDB = async () => {
  try {
    console.log("🔄 Syncing API usage data from Redis to MongoDB...");

    // Get all keys matching "api_key:*"
    const keys = await redisConnection.keys("api_key:*");

    console.log(keys);

    if (keys.length === 0) {
      console.log("✅ No API keys to sync.");
      return;
    }

    for (const key of keys) {
      const cachedData = await redisConnection.get(key);
      if (!cachedData) continue;

      const apiData = JSON.parse(cachedData);
      console.log(apiData);
      const { apiKey, usageCount } = apiData;

      // Update MongoDB
      await ApiKey.updateOne({ apiKey }, { usageCount });

      console.log(`✅ Synced API Key: ${apiKey} - Usage: ${usageCount}`);
    }
  } catch (error) {
    console.error("❌ Error syncing API usage to DB:", error);
  }
};

// Run every 5 minutes
setInterval(syncUsageToDB, 5 * 60 * 1000);

module.exports = syncUsageToDB;
