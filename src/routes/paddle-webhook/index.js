const express = require("express");
const router = express.Router();
const { handlePaddleWebhook } = require("../../controllers/paddle-webhook");
const verifyPaddleWebhook = require("../../middlewares/verify-paddle-webhook");

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  verifyPaddleWebhook,
  handlePaddleWebhook
);

module.exports = router;
