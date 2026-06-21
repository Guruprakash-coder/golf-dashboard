import express from 'express';
import { db } from '../db.js';
import { authenticateToken, checkSubscription, verifyAdmin } from './auth.js';

const router = express.Router();

// Get current user's scores
router.get('/', authenticateToken, checkSubscription, async (req, res) => {
  try {
    const scores = await db.getScores(req.user.id);
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get scores for a specific user (Admin only)
router.get('/user/:userId', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const scores = await db.getScores(req.params.userId);
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Post a new score
router.post('/', authenticateToken, checkSubscription, async (req, res) => {
  const { score, date } = req.body;
  const parsedScore = parseInt(score);
  
  if (isNaN(parsedScore) || parsedScore < 1 || parsedScore > 45) {
    return res.status(400).json({ error: 'Golf score must be an integer between 1 and 45 (Stableford).' });
  }
  
  if (!date) {
    return res.status(400).json({ error: 'A valid date must be provided for the score.' });
  }

  try {
    // Unique date constraint check
    const duplicate = await db.getScoreByDate(req.user.id, date);
    if (duplicate) {
      return res.status(400).json({ error: `A score entry for ${date} already exists. Duplicate dates are not allowed. Please edit or delete the existing entry.` });
    }
    
    // Manage rolling 5 scores limit: "Only the latest 5 scores are retained. A new score replaces the oldest automatically."
    const userScores = await db.getScores(req.user.id);
    // Sort oldest first to identify which one to discard
    const sortedOldestFirst = [...userScores].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (sortedOldestFirst.length >= 5) {
      const oldestScore = sortedOldestFirst[0];
      await db.deleteScore(oldestScore.id);
    }
    
    const newScoreRecord = {
      id: `score-${Date.now()}`,
      userId: req.user.id,
      score: parsedScore,
      date,
      createdAt: new Date().toISOString()
    };
    
    await db.addScore(newScoreRecord);
    
    // Return the updated reverse chronological list
    const updatedScores = await db.getScores(req.user.id);
    res.status(201).json(updatedScores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit score entry
router.put('/:id', authenticateToken, checkSubscription, async (req, res) => {
  const { score, date } = req.body;
  
  try {
    // Fetch all user scores or find target score directly
    // Let's assume we can fetch target score by verifying owner
    // For local memory, we find it. For Supabase, we check user ownership first.
    // Let's load the current scores for the user:
    const userScores = await db.getScores(req.user.id);
    const scoreRecord = userScores.find(s => s.id === req.params.id);
    
    if (!scoreRecord && req.user.role !== 'admin') {
      return res.status(404).json({ error: 'Score record not found or unauthorized.' });
    }
    
    const updates = {};
    
    if (score !== undefined) {
      const parsedScore = parseInt(score);
      if (isNaN(parsedScore) || parsedScore < 1 || parsedScore > 45) {
        return res.status(400).json({ error: 'Golf score must be an integer between 1 and 45.' });
      }
      updates.score = parsedScore;
    }
    
    if (date !== undefined) {
      if (date !== scoreRecord?.date) {
        const duplicate = await db.getScoreByDate(req.user.id, date);
        if (duplicate) {
          return res.status(400).json({ error: `A score entry for ${date} already exists.` });
        }
      }
      updates.date = date;
    }
    
    const updated = await db.updateScore(req.params.id, updates);
    res.json({ success: true, score: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete score entry
router.delete('/:id', authenticateToken, checkSubscription, async (req, res) => {
  try {
    const userScores = await db.getScores(req.user.id);
    const scoreRecord = userScores.find(s => s.id === req.params.id);
    
    if (!scoreRecord && req.user.role !== 'admin') {
      return res.status(404).json({ error: 'Score record not found or unauthorized.' });
    }
    
    await db.deleteScore(req.params.id);
    res.json({ success: true, message: 'Score record deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin-override update score
router.put('/admin/:id', authenticateToken, verifyAdmin, async (req, res) => {
  const { score, date } = req.body;
  try {
    const updates = {};
    if (score !== undefined) {
      const parsedScore = parseInt(score);
      if (isNaN(parsedScore) || parsedScore < 1 || parsedScore > 45) {
        return res.status(400).json({ error: 'Score must be 1 to 45.' });
      }
      updates.score = parsedScore;
    }
    if (date !== undefined) {
      updates.date = date;
    }
    const updated = await db.updateScore(req.params.id, updates);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
