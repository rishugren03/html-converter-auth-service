const { User, ApiKey } = require("../../../models/user.model");
const { registerUser } = require("../../firebaseAuth/helper");

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const getUser = async (req, res) => {
  try {
    const { email } = req.user;

    let user = await User.findOne({ email }).lean();

    console.log(user);

    if (!user) {
      console.warn(
        `User not found in DB for email: ${email}, attempting to register...`
      );
      await registerUser({ email });
      await wait(200);
      user = await User.findOne({ email }).lean();
    }

    if (!user || !user._id) {
      return res.status(404).json({ message: "User not found!" });
    }

    const apiKeyDetails = await ApiKey.findOne({ userId: user._id });

    const responseData = {
      ...user,
      apiKey: apiKeyDetails || null,
    };

    res.status(200).json({
      data: responseData,
      message: "User data retrieved successfully",
    });
  } catch (error) {
    console.error("Error in getUser:", error.message);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = { getUser };
