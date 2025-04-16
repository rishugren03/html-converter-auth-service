const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      require("../../firebase-service-account.json")
    ),
  });
}

const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const idToken = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!idToken) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      firebaseSignInProvider: decodedToken.firebase?.sign_in_provider || null,
    };

    next();
  } catch (error) {
    console.error("Firebase Token Verification Failed:", error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = verifyFirebaseToken;
