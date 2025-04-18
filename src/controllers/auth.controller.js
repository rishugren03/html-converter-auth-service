const { v4: uuidv4 } = require("uuid");
const { User, ApiKey } = require("../models/user.model");

const registerUser = async ({ email }) => {
  if (!email) {
    throw new Error("email is required");
  }

  // Check if user already exists
  let user = await User.findOne({ email });
  if (user) {
    throw new Error("User already exists");
  }

  user = new User({ email });
  await user.save();

  // Generate API Key
  const apiKey = `sk_${uuidv4().replace(/-/g, "")}_${uuidv4()
    .replace(/-/g, "")
    .substring(0, 8)}`;
  const apiKeyEntry = new ApiKey({
    userId: user._id,
    apiKey,
    planLimit: 300,
    createdAt: new Date(),
    isActive: true,
  });
  await apiKeyEntry.save();

  return {
    message: "User registered successfully",
    apiKey,
    user: {
      id: user._id,
      email: user.email,
    },
  };
};

const loginUser = async ({ email }) => {
  if (!email) {
    throw new Error("Email is required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const apiKeyEntry = await ApiKey.findOne({ userId: user._id });

  return {
    apiKey: apiKeyEntry?.apiKey || null,
    user: {
      id: user._id,
      email: user.email,
    },
  };
};

module.exports = { registerUser, loginUser };
