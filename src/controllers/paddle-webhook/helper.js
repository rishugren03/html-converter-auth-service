const { User, ApiKey } = require("../../models/user.model");
const { FirebaseUser } = require("../../models/firebaseUser");
const { Subscription } = require("../../models/paddle.model"); // assuming default export

const saveSubscriptionStatus = async (eventData) => {
  try {
    const {
      id: subscriptionId,
      customerId,
      status,
      currencyCode,
      startedAt,
      nextBilledAt,
      firstBilledAt,
      canceledAt,
      createdAt,
      updatedAt,
      billingCycle,
      items,
      customData,
    } = eventData;

    console.log("event-data-helper", eventData);

    const localId = customData?.localId;
    if (!localId) throw new Error("Missing localId in Paddle customData");

    // Step 1: Find FirebaseUser by localId
    const firebaseUser = await FirebaseUser.findOne({ localId });
    if (!firebaseUser)
      throw new Error("FirebaseUser not found for localId: " + localId);

    // Step 2: Find User by email
    const user = await User.findOne({ email: firebaseUser.email });
    if (!user)
      throw new Error("User not found for email: " + firebaseUser.email);

    // Step 3: Extract product/plan info from items[0]
    const item = items?.[0];
    if (!item) throw new Error("Missing subscription item");

    const price = item.price;
    const product = item.product;
    const priceId = price?.id;
    const priceName = price?.name || product?.name;

    // Map priceName to internal plan
    const planMap = {
      Pro: "pro",
      Pro_Max: "pro_max", // Adjust as needed
    };
    const plan = planMap[priceName] || "free";

    // Determine planLimit
    const planLimitMap = {
      pro: 10000,
      pro_max: 100000,
    };
    const planLimit = planLimitMap[plan] || 50;

    // Step 4: Save/update subscription in DB
    await Subscription.findOneAndUpdate(
      { subscriptionId },
      {
        user: user._id,
        subscriptionId,
        customerId,
        status,
        currencyCode,
        interval: billingCycle?.interval || "month",
        frequency: billingCycle?.frequency || 1,
        nextBilledAt,
        startedAt,
        firstBilledAt,
        canceledAt,
        createdAt,
        updatedAt,
        priceId,
        priceName,
        productId: product?.id,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Step 5: Update user's plan
    user.plan = plan;
    await user.save();

    // Step 6: Update user's ApiKey (reset usageCount and update planLimit)
    await ApiKey.updateMany(
      { userId: user._id },
      {
        $set: {
          usageCount: 0,
          planLimit,
        },
      }
    );

    console.log("Subscription and plan updated for user:", user.email);
  } catch (err) {
    console.error("Error saving subscription status:", err.message);
  }
};

const cancelSubscriptionStatus = async (eventData) => {
  const { customerId, canceledAt, updatedAt } = eventData;

  // Get subscription from Paddle customer ID
  const subscription = await Subscription.findOne({ customerId });
  if (!subscription) throw new Error("Subscription not found");

  // Get user based on subscription
  const user = await User.findById(subscription.user);
  if (!user) throw new Error("User not found");

  // Update user plan
  user.plan = "free";
  await user.save();

  // Update Subscription with cancellation
  subscription.status = "canceled";
  subscription.canceledAt = canceledAt ? new Date(canceledAt) : new Date();
  subscription.updatedAt = new Date(updatedAt);
  await subscription.save();

  // Update API key limits
  const apiKey = await ApiKey.findOne({ userId: user._id });
  if (apiKey) {
    apiKey.planLimit = 50;
    apiKey.usageCount = 0;
    await apiKey.save();
  }

  console.log(`Cancelled subscription for user ${user.email}`);
};

module.exports = { saveSubscriptionStatus, cancelSubscriptionStatus };
