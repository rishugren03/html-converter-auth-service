const { User, ApiKey } = require("../../../models/user.model");

const getUser = async (req, res) => {
  try {
    const { email } = req.user;

    const user = await User.findOne({ email }).lean();
    const apiKeyDetails = await ApiKey.findOne({ userId: user._id }).lean();

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    // Convert Mongoose documents to plain objects and merge them
    const responseData = {
      ...user,
      apiKey: apiKeyDetails || null,
    };

    res.status(200).json({
      data: responseData,
      message: "User data retrieved successfully",
    });
  } catch (error) {
    console.error("Error in getUser:", error);
    res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = { getUser };
