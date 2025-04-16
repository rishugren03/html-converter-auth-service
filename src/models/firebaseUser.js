const mongoose = require("mongoose");

const firebaseUserSchema = new mongoose.Schema({
  localId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    required: true,
  },
  lastLoginAt: {
    type: Date,
  },
  lastRefreshAt: {
    type: Date,
  },
  passwordHash: {
    type: String,
  },
  passwordUpdatedAt: {
    type: Date,
  },
  providerUserInfo: {
    type: String,
  },
});

const FirebaseUser = mongoose.model("FirebaseUser", firebaseUserSchema);

module.exports = { FirebaseUser };
