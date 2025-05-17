const express = require("express");
const { getUser } = require("../../controllers/user-management/get-user-data");
const verifyFirebaseToken = require("../../middlewares/verify-firebase-token");
const {
  createNewApiKey,
} = require("../../controllers/user-management/generate-new-api-key");

const router = express.Router();

router.get("/get-user", verifyFirebaseToken, getUser);
router.post("/create-new-key", verifyFirebaseToken, createNewApiKey);

module.exports = router;
