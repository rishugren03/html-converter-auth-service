const express = require("express");
const validateApiKey = require("../../middlewares/api-key-validation");

const router = express.Router();

router.get("/validate", validateApiKey);

module.exports = router;
