import express from 'express';
import { db } from '../db.js';
import { authenticateToken, verifyAdmin } from './auth.js';

const router = express.Router();

// Get list of all winners (includes joind fields)
router.get('/', async (req, res) => {
  try {
    const winners = await db.getWinners();
    const users = await db.getUsers();
    const draws = await db.getDraws();
    
    const extended = winners.map(w => {
      const u = users.find(user => user.id === w.userId);
      const d = draws.find(draw => draw.id === w.drawId);
      return {
        ...w,
        userName: u ? u.fullName : 'Unknown User',
        userEmail: u ? u.email : '',
        drawDate: d ? d.drawDate : ''
      };
    });
    
    res.json(extended);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload proof score (Winners only)
router.post('/:id/proof', authenticateToken, async (req, res) => {
  const { proofUrl } = req.body;
  if (!proofUrl) {
    return res.status(400).json({ error: 'Proof screenshot or link is required.' });
  }
  
  try {
    const winners = await db.getWinners();
    const winner = winners.find(w => w.id === req.params.id);
    if (!winner) return res.status(404).json({ error: 'Winner entry not found.' });
    
    if (winner.userId !== req.user.id) {
      return res.status(403).json({ error: 'You are not authorized to submit proof for this win.' });
    }
    
    const updated = await db.updateWinner(req.params.id, { proofUrl });
    res.json({ success: true, winner: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin verify payout (Approve/Reject)
router.put('/:id', authenticateToken, verifyAdmin, async (req, res) => {
  const { action, status } = req.body; // action: 'approve' or 'reject'
  
  try {
    const winners = await db.getWinners();
    const winner = winners.find(w => w.id === req.params.id);
    if (!winner) return res.status(404).json({ error: 'Winner entry not found.' });
    
    let updatedStatus = winner.status;
    
    if (action === 'approve') {
      updatedStatus = 'paid';
      // Credit to user balance
      const user = await db.getUserById(winner.userId);
      if (user) {
        const newBalance = (user.walletBalance || 0) + winner.prizeAmount;
        await db.updateUser(user.id, { walletBalance: newBalance });
      }
    } else if (action === 'reject') {
      updatedStatus = 'rejected';
    } else if (status) {
      updatedStatus = status;
    }
    
    const updated = await db.updateWinner(req.params.id, { status: updatedStatus });
    res.json({ success: true, winner: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
