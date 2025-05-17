const mongoose = require("mongoose");
const { Schema } = mongoose;
const { User } = require("./user.model");

const SubscriptionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  subscriptionId: { type: String, required: true, unique: true },
  customerId: { type: String, required: true },
  priceId: { type: String, required: true },
  priceName: { type: String, required: true },
  productId: { type: String, required: true },
  status: { type: String, required: true }, // active, canceled, past_due etc.
  currencyCode: { type: String, required: true }, // USD, INR etc.
  interval: { type: String, required: true }, // month, year
  frequency: { type: Number, required: true }, // 1, 12 etc.
  nextBilledAt: { type: Date, required: true },
  startedAt: { type: Date, required: true },
  canceledAt: { type: Date, default: null },

  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
});

const Subscription = mongoose.model("Subscription", SubscriptionSchema);

module.exports = { Subscription };
