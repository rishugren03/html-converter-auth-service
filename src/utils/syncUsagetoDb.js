const { redisConnection } = require("../config/redisConfig");
const { ApiKey } = require("../models/user.model");

const syncUsageToDB = async () => {
  try {
    console.log("🔄 Syncing API usage data from Redis to MongoDB...");

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

      const dbApiKey = await ApiKey.findOne({ apiKey });
      if (!dbApiKey) {
        console.log(`❌ No entry found for API Key: ${apiKey}`);
        continue;
      }

      // ✅ Sync usage count if changed
      if (dbApiKey.usageCount !== usageCount) {
        await ApiKey.updateOne({ apiKey }, { usageCount });
        console.log(`✅ Synced API Key: ${apiKey} - Usage: ${usageCount}`);
      } else {
        console.log(`🛑 No change in usage count for API Key: ${apiKey}`);
      }

      // ✅ Reset TTL if more than 10 min or no expiry
      const ttl = await redisConnection.ttl(key);
      if (ttl === -1 || ttl > 600) {
        await redisConnection.expire(key, 600);
        console.log(`⏳ TTL refreshed for ${key}`);
      }
    }
  } catch (error) {
    console.error("❌ Error syncing API usage to DB:", error);
  }
};

// Run every 5 minutes
setInterval(syncUsageToDB, 5 * 60 * 1000);

module.exports = syncUsageToDB;
