// utils/authMiddleware.js
const admin = require('firebase-admin');
const path = require('path');

// ✅ Initialize Firebase Admin SDK
const serviceAccount = require(path.join(__dirname, '../firebase-service-account.json'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// ✅ Middleware to Verify Firebase Token
const authenticate = async (req, res, next) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];

  if (!idToken) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase token:', error.message);
    return res.status(403).json({ message: 'Forbidden: Invalid token' });
  }
};

module.exports = authenticate;