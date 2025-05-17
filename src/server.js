require("dotenv").config();
const express = require("express");
const cors = require("cors");
const limiter = require("./middlewares/rate-limiter.js");
const syncUsageToDB = require("./utils/syncUsagetoDb.js");

const connectDB = require("./config/db.js");

const app = express();
app.use(limiter);

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));

connectDB();

const authRoutes = require("./routes/auth.route");
const apiKeyRoute = require("./routes/api-key-validation/index.js");
const fbUserRoute = require("./routes/firebase-auth/index.js");
const userManageRoute = require("./routes/user-management-route/index.js");
const paddleWebhookRoute = require("./routes/paddle-webhook/index.js");

app.get("/auth", (req, res) => {
  res.send("hii! I'm auth-service:)");
});

app.get("/", (req, res) => {
  res.send("pong :)");
});

// app.set("trust proxy", 1);

app.use("/auth/api/paddle", paddleWebhookRoute);
app.use(express.json());
app.use("/auth/api/auth", authRoutes, fbUserRoute);
app.use("/auth/api/api-key", apiKeyRoute);
app.use("/auth/api/user", userManageRoute);

const PORT = process.env.PORT || 5000;
console.log("Starting Auth Service...");

app.listen(PORT, () => console.log(`Auth Service running on port ${PORT}`));

setInterval(syncUsageToDB, 5 * 60 * 1000);
console.log("🔄 API Usage Sync Job scheduled every 5 minutes");
