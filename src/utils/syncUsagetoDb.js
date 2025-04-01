const { redisConnection } = require("../config/redisConfig");
const { ApiKey } = require("../models/user.model");

const syncUsageToDB = async () => {
  try {
    console.log("🔄 Syncing API usage data from Redis to MongoDB...");

    // Get all keys matching "api_key:*"
    const keys = await redisConnection.keys("api_key:*");

    if (keys.length === 0) {
      console.log("✅ No API keys to sync.");
      return;
    }

    for (const key of keys) {
      const cachedData = await redisConnection.get(key);
      if (!cachedData) continue;

      const apiData = JSON.parse(cachedData);
      const { apiKey, usageCount } = apiData;

      // Fetch the existing usageCount from MongoDB for the corresponding API key
      const dbApiKey = await ApiKey.findOne({ apiKey });

      if (!dbApiKey) {
        console.log(`❌ No entry found for API Key: ${apiKey}`);
        continue; // Skip if no entry found
      }

      // Only sync if the usage count has changed
      if (dbApiKey.usageCount !== usageCount) {
        // Update MongoDB with the new usage count
        await ApiKey.updateOne({ apiKey }, { usageCount });
        console.log(`✅ Synced API Key: ${apiKey} - Usage: ${usageCount}`);
      } else {
        console.log(`🛑 No change in usage count for API Key: ${apiKey}`);
      }
    }
  } catch (error) {
    console.error("❌ Error syncing API usage to DB:", error);
  }
};

// Run every 5 minutes
setInterval(syncUsageToDB, 3 * 60 * 1000);

module.exports = syncUsageToDB;
