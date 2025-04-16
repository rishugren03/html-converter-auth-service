const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  plan: { type: String, enum: ["free", "pro", "pro-max"], default: "free" },
  freeTrialLimit: { type: Number, default: 50 },
});

const ApiKeySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  apiKey: { type: String, unique: true, required: true },
  usageCount: { type: Number, default: 0 },
  planLimit: { type: Number, required: true }, // Limits based on plan
  createdAt: { type: Date, default: Date.now },
});

// Export models
const User = mongoose.model("User", UserSchema);
const ApiKey = mongoose.model("ApiKey", ApiKeySchema);

module.exports = { User, ApiKey };
