// utils/firebaseAdmin.js
const admin = require('firebase-admin');
const path = require('path');

// ✅ Load Firebase service account credentials
const serviceAccount = require(path.join(__dirname, '../firebase-service-account.json'));

// ✅ Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;