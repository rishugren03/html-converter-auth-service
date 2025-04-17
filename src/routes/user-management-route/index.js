const express = require("express");
const { getUser } = require("../../controllers/user-management/get-user-data");
const verifyFirebaseToken = require("../../middlewares/verify-firebase-token");

const router = express.Router();

router.get("/get-user", verifyFirebaseToken, getUser);

module.exports = router;
