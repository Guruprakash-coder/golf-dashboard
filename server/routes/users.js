import express from 'express';
import { db } from '../db.js';
import { authenticateToken, verifyAdmin } from './auth.js';

const router = express.Router();

// List all users (Admin only)
router.get('/', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const users = await db.getUsers();
    const mapped = [];
    for (const u of users) {
      const { passwordHash, ...safe } = u;
      const uScores = await db.getScores(u.id);
      mapped.push({ ...safe, scoreCount: uScores.length });
    }
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update specific user details (Admin only)
router.put('/:id', authenticateToken, verifyAdmin, async (req, res) => {
  const { fullName, subscriptionStatus, subscriptionTier, subscriptionRenewal, role, charityId, charityPercentage } = req.body;
  const updates = {};
  
  if (fullName !== undefined) updates.fullName = fullName;
  if (subscriptionStatus !== undefined) updates.subscriptionStatus = subscriptionStatus;
  if (subscriptionTier !== undefined) updates.subscriptionTier = subscriptionTier;
  if (subscriptionRenewal !== undefined) updates.subscriptionRenewal = subscriptionRenewal;
  if (role !== undefined) updates.role = role;
  if (charityId !== undefined) updates.charityId = charityId;
  if (charityPercentage !== undefined) updates.charityPercentage = Math.max(10, parseInt(charityPercentage));
  
  try {
    const updated = await db.updateUser(req.params.id, updates);
    if (!updated) return res.status(404).json({ error: 'User not found.' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
