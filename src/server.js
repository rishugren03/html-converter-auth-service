require("dotenv").config();
const express = require("express");
const cors = require("cors");
const limiter = require("./middlewares/rate-limiter.js");

const connectDB = require("./config/db.js");

const app = express();
app.use(limiter);

// Middleware
app.use(cors());
app.use(express.json());

connectDB();

const authRoutes = require("./routes/auth.route");
const apiKeyRoute = require("./routes/api-key-validation/index.js");

app.use("/api/auth", authRoutes);
app.use("/api/api-key", apiKeyRoute);

const PORT = process.env.PORT || 5000;
console.log("Starting Auth Service...");

app.listen(PORT, () => console.log(`Auth Service running on port ${PORT}`));
