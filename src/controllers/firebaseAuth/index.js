const bcrypt = require("bcryptjs");
const { FirebaseUser } = require("../../models/firebaseUser");
const { registerUser, loginUser } = require("./helper");

const saveUser = async (req, res) => {
  try {
    const { email, emailVerified, firebaseSignInProvider } = req.user;
    const {
      localId,
      createdAt,
      lastLoginAt,
      lastRefreshAt,
      passwordHash,
      passwordUpdatedAt,
    } = req.body;

    // Check if user already exists
    const existingUser = await FirebaseUser.findOne({ localId });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const user = new FirebaseUser({
      email,
      localId,
      emailVerified,
      createdAt: new Date(Number(createdAt)),
      lastLoginAt: new Date(Number(lastLoginAt)),
      lastRefreshAt: new Date(lastRefreshAt),
      passwordHash,
      passwordUpdatedAt: new Date(Number(passwordUpdatedAt)),
      providerUserInfo: firebaseSignInProvider,
    });

    await user.save();

    await registerUser({ email });

    return res.status(201).json({ message: "User saved successfully", user });
  } catch (error) {
    console.error("Error saving user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { saveUser };
