const { Paddle } = require("@paddle/paddle-node-sdk");

const paddle = new Paddle(process.env.PADDLE_API_KEY || "");

const verifyPaddleWebhook = async (req, res, next) => {
  const signature = req.headers["paddle-signature"];
  const secretKey = process.env.WEBHOOK_SECRET_KEY || "";

  if (!signature || !req.body || !Buffer.isBuffer(req.body)) {
    console.log("❌ Missing or invalid signature or body");
    return res.status(400).send("Invalid request format");
  }

  try {
    const rawRequestBody = req.body.toString("utf8"); // ✅ safely convert
    const eventData = await paddle.webhooks.unmarshal(
      rawRequestBody,
      secretKey,
      signature
    );

    req.paddleEvent = eventData;
    next();
  } catch (error) {
    console.error("❌ Webhook verification failed:", error.message);
    res.status(400).send("Invalid signature");
  }
};

module.exports = verifyPaddleWebhook;
