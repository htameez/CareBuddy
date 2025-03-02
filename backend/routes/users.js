// routes/users.js
const router = require('express').Router();
const admin = require('../utils/firebaseAdmin');
const User = require('../models/User');
const authenticate = require('../utils/authMiddleware');

// ✅ Create/Update user (Protected)
router.post('/', authenticate, async (req, res) => {
  try {
    // ✅ Ensure the authenticated user matches the request
    if (req.user.uid !== req.body.firebaseUID) {
      return res.status(403).json({ message: 'Forbidden: Firebase UID mismatch' });
    }

    const user = await User.findOneAndUpdate(
      { firebaseUID: req.body.firebaseUID },
      req.body,
      { upsert: true, new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ✅ Get user by Firebase UID (Protected)
router.get('/:firebaseUID', authenticate, async (req, res) => {
  try {
    if (req.user.uid !== req.params.firebaseUID) {
      return res.status(403).json({ message: 'Forbidden: Firebase UID mismatch' });
    }

    const user = await User.findOne({ firebaseUID: req.params.firebaseUID });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🔹 Update User EHR Data (Protected)
router.put("/:firebaseUID/ehr", authenticate, async (req, res) => {
  try {
    const { firebaseUID } = req.params;
    const { ehr } = req.body;

    const user = await User.findOneAndUpdate(
      { firebaseUID },
      { $set: { ehr, "ehr.ehrLastSynced": new Date() } },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    console.error("Error updating user EHR data:", error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ DELETE User from Firebase Auth and MongoDB
router.delete('/:firebaseUID', async (req, res) => {
    const { firebaseUID } = req.params;
  
    try {
      // Step 1: Delete from Firebase Auth
      await admin.auth().deleteUser(firebaseUID);
      console.log(`✅ Deleted user from Firebase Auth: ${firebaseUID}`);
  
      // Step 2: Delete from MongoDB
      const result = await User.deleteOne({ firebaseUID });
      if (result.deletedCount > 0) {
        console.log(`✅ Deleted user from MongoDB: ${firebaseUID}`);
        return res.status(200).json({ message: '✅ User deleted from Firebase and MongoDB' });
      } else {
        console.warn(`⚠️ No user found in MongoDB with UID: ${firebaseUID}`);
        return res.status(404).json({ message: '⚠️ User not found in MongoDB' });
      }
  
    } catch (error) {
      console.error('❌ Error deleting user:', error.message);
      return res.status(500).json({ message: `Error deleting user: ${error.message}` });
    }
  });

module.exports = router;