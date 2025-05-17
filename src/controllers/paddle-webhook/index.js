const {
  saveSubscriptionStatus,
  cancelSubscriptionStatus,
} = require("./helper");

async function handlePaddleWebhook(req, res) {
  const event = req.paddleEvent;
  const { eventType, data } = event;

  console.log(event);

  res.status(200).send("Webhook received");

  // Handle event asynchronously
  try {
    switch (eventType) {
      // case "subscription.created":
      case "subscription.activated":
        await saveSubscriptionStatus(data);
        break;
      case "subscription.canceled":
        await cancelSubscriptionStatus(data);
        break;
      case "subscription.past_due":
        await cancelSubscriptionStatus(data);
        break;
      // case "subscription.paused":
      //   // TODO: implement update logic if needed
      //   break;
      // case "subscription.resumed":
      //   break;
      default:
        console.log("Unhandled Paddle event:", eventType);
    }
  } catch (err) {
    console.error("Error processing Paddle event:", err.message);
  }
}

module.exports = {
  handlePaddleWebhook,
};
