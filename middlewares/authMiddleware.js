const admin = require("../config/firebase-config");

const Protected = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(authorization);
    req.user = decodedToken;
    return next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

module.exports = Protected;
