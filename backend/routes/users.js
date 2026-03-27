// routes/users.js
const router = require('express').Router();
const admin = require('../utils/firebaseAdmin');
const User = require('../models/User');
const authenticate = require('../utils/authMiddleware');
const { fetchRedoxEHRData, fetchDocumentReferencesDebug } = require('../services/redoxService');

function sanitizeProfileText(value, maxLength) {
  return String(value || "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function validateProfile(body) {
  const ageValue = body?.age;
  const age =
    ageValue === null || ageValue === undefined || ageValue === ""
      ? undefined
      : Number(ageValue);

  if (age !== undefined && (!Number.isInteger(age) || age < 0 || age > 120)) {
    return { error: "Age must be a whole number between 0 and 120." };
  }

  const weight = sanitizeProfileText(body?.weight, 40);
  const height = sanitizeProfileText(body?.height, 20);
  const healthGoals = sanitizeProfileText(body?.healthGoals, 400);

  if (weight && !/^[a-zA-Z0-9.,'"\-\/() %]+$/.test(weight)) {
    return { error: "Weight contains unsupported characters." };
  }

  if (height && !/^[a-zA-Z0-9.'"\-\/ ]+$/.test(height)) {
    return { error: "Height contains unsupported characters." };
  }

  return {
    profile: {
      age,
      weight,
      height,
      healthGoals,
    },
  };
}

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

router.put('/:firebaseUID/profile', authenticate, async (req, res) => {
  try {
    const { firebaseUID } = req.params;

    if (req.user.uid !== firebaseUID) {
      return res.status(403).json({ message: 'Forbidden: Firebase UID mismatch' });
    }

    const validated = validateProfile(req.body || {});
    if (validated.error) {
      return res.status(400).json({ message: validated.error });
    }

    const user = await User.findOneAndUpdate(
      { firebaseUID },
      { $set: { profile: validated.profile } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error("Error updating user profile:", error);
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

// 🔹 Sync User EHR Data from Redox (Protected)
router.post("/:firebaseUID/ehr/redox-sync", authenticate, async (req, res) => {
  try {
    const { firebaseUID } = req.params;

    if (req.user.uid !== firebaseUID) {
      return res.status(403).json({ message: 'Forbidden: Firebase UID mismatch' });
    }

    const ehrData = await fetchRedoxEHRData(req.body || {});

    const ehr = {
      epicPatientID: ehrData.patientID,
      ehrLastSynced: new Date(),
      medicalHistory: {
        conditions: ehrData.conditions,
        medications: ehrData.medications,
        allergies: ehrData.allergies,
        demographics: ehrData.demographics,
        clinicalNotes: ehrData.clinicalNotes,
      },
    };

    const user = await User.findOneAndUpdate(
      { firebaseUID },
      { $set: { ehr } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user,
      synced: {
        patientID: ehrData.patientID,
        conditions: ehrData.conditions.length,
        medications: ehrData.medications.length,
        allergies: ehrData.allergies.length,
        clinicalNotes: ehrData.clinicalNotes.length,
      },
    });
  } catch (error) {
    console.error("Error syncing Redox EHR data:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/:firebaseUID/ehr/redox-documents-debug", authenticate, async (req, res) => {
  try {
    const { firebaseUID } = req.params;

    if (req.user.uid !== firebaseUID) {
      return res.status(403).json({ message: 'Forbidden: Firebase UID mismatch' });
    }

    const limit = Number(req.body?.limit) || 5;
    const debugData = await fetchDocumentReferencesDebug(req.body || {}, Math.min(limit, 10));

    res.json(debugData);
  } catch (error) {
    console.error("Error debugging Redox document references:", error);
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
