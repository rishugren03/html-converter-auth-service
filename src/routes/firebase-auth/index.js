const express = require("express");
const {
  saveUser,
} = require("../../controllers/firebaseAuth/save-firebase-user");
const verifyFirebaseToken = require("../../middlewares/verify-firebase-token");

const router = express.Router();

router.post("/firebase-register", verifyFirebaseToken, saveUser);

module.exports = router;
