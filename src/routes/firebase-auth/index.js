const express = require("express");
const { saveUser } = require("../../controllers/firebaseAuth");
const verifyFirebaseToken = require("../../middlewares/verify-firebase-token");

const router = express.Router();

router.post("/firebase-register", verifyFirebaseToken, saveUser);

module.exports = router;
