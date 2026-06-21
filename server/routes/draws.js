import express from 'express';
import { db } from '../db.js';
import { authenticateToken, verifyAdmin } from './auth.js';

const router = express.Router();

// Helper: Calculate pool values based on active subscriber count
export const calculatePoolValues = async () => {
  const users = await db.getUsers();
  const activeSubsCount = users.filter(u => u.role === 'subscriber' && u.subscriptionStatus === 'active').length;
  
  const contributionPerSub = 10.00;
  const rawPool = activeSubsCount * contributionPerSub;
  const rollover = await db.getJackpotRollover();
  
  const jackpotTier = (rawPool * 0.40) + rollover;
  const match4Tier = rawPool * 0.35;
  const match3Tier = rawPool * 0.25;
  
  return {
    activeSubscribers: activeSubsCount,
    rawPool,
    jackpotTier,
    match4Tier,
    match3Tier,
    rolloverCarried: rollover
  };
};

// Get current pool stats
router.get('/current-pool', async (req, res) => {
  try {
    const stats = await calculatePoolValues();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get previous draw records
router.get('/', async (req, res) => {
  try {
    const draws = await db.getDraws();
    res.json(draws);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper: draw numbers generator
const generateDrawNumbers = async (type) => {
  if (type === 'random') {
    const set = new Set();
    while (set.size < 5) {
      set.add(Math.floor(Math.random() * 45) + 1);
    }
    return Array.from(set).sort((a, b) => a - b);
  } else {
    // Algorithmic
    const users = await db.getUsers();
    const activeSubIds = users
      .filter(u => u.role === 'subscriber' && u.subscriptionStatus === 'active')
      .map(u => u.id);
      
    // Fetch all scores from active users
    const allScores = [];
    for (const userId of activeSubIds) {
      const uScores = await db.getScores(userId);
      allScores.push(...uScores);
    }
    
    if (allScores.length < 5) {
      // Fallback
      return generateDrawNumbers('random');
    }
    
    const frequencies = {};
    for (let i = 1; i <= 45; i++) frequencies[i] = 0;
    allScores.forEach(s => {
      if (frequencies[s.score] !== undefined) frequencies[s.score]++;
    });
    
    const candidates = [];
    for (let i = 1; i <= 45; i++) {
      candidates.push({ number: i, weight: frequencies[i] + 1 });
    }
    
    const selected = new Set();
    while (selected.size < 5) {
      let totalWeight = candidates.reduce((sum, c) => selected.has(c.number) ? sum : sum + c.weight, 0);
      let randomVal = Math.random() * totalWeight;
      
      let runningSum = 0;
      for (const candidate of candidates) {
        if (selected.has(candidate.number)) continue;
        runningSum += candidate.weight;
        if (randomVal <= runningSum) {
          selected.add(candidate.number);
          break;
        }
      }
    }
    
    return Array.from(selected).sort((a, b) => a - b);
  }
};

// Simulation and Pre-analysis (Admin only)
router.post('/simulate', authenticateToken, verifyAdmin, async (req, res) => {
  const { drawType } = req.body;
  const type = drawType === 'algorithmic' ? 'algorithmic' : 'random';
  
  try {
    const winningNumbers = await generateDrawNumbers(type);
    
    const users = await db.getUsers();
    const activeSubscribers = users.filter(u => u.role === 'subscriber' && u.subscriptionStatus === 'active');
    const simulationPools = await calculatePoolValues();
    
    const simWinners = [];
    let match5Count = 0;
    let match4Count = 0;
    let match3Count = 0;
    
    for (const user of activeSubscribers) {
      const uScores = await db.getScores(user.id);
      // latest 5 scores
      const userScores = uScores.slice(0, 5).map(s => s.score);
      
      if (userScores.length === 5) {
        const matches = userScores.filter(score => winningNumbers.includes(score));
        const matchCount = matches.length;
        
        if (matchCount >= 3) {
          if (matchCount === 5) match5Count++;
          if (matchCount === 4) match4Count++;
          if (matchCount === 3) match3Count++;
          
          simWinners.push({
            userId: user.id,
            fullName: user.fullName,
            email: user.email,
            userScores,
            matchCount,
            matches
          });
        }
      }
    }
    
    const prize5PerPerson = match5Count > 0 ? (simulationPools.jackpotTier / match5Count) : 0;
    const prize4PerPerson = match4Count > 0 ? (simulationPools.match4Tier / match4Count) : 0;
    const prize3PerPerson = match3Count > 0 ? (simulationPools.match3Tier / match3Count) : 0;
    
    const mappedWinners = simWinners.map(w => {
      let prize = 0;
      if (w.matchCount === 5) prize = prize5PerPerson;
      if (w.matchCount === 4) prize = prize4PerPerson;
      if (w.matchCount === 3) prize = prize3PerPerson;
      
      return {
        ...w,
        prizeAmount: parseFloat(prize.toFixed(2))
      };
    });
    
    res.json({
      drawType: type,
      winningNumbers,
      pools: {
        jackpot: parseFloat(simulationPools.jackpotTier.toFixed(2)),
        match4: parseFloat(simulationPools.match4Tier.toFixed(2)),
        match3: parseFloat(simulationPools.match3Tier.toFixed(2))
      },
      counts: {
        subscribers: activeSubscribers.length,
        match5: match5Count,
        match4: match4Count,
        match3: match3Count
      },
      winners: mappedWinners,
      willRollover: match5Count === 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Official Draw Publication (Admin only)
router.post('/publish', authenticateToken, verifyAdmin, async (req, res) => {
  const { drawType, winningNumbers, pools, winners, willRollover } = req.body;
  
  if (!winningNumbers || !pools) {
    return res.status(400).json({ error: 'Published draw requires winningNumbers and pool allocation metrics.' });
  }
  
  try {
    const newDrawId = `draw-${Date.now()}`;
    const newDrawRecord = {
      id: newDrawId,
      drawDate: new Date().toISOString().split('T')[0],
      winningNumbers,
      drawType: drawType || 'random',
      status: 'published',
      jackpotPool: pools.jackpot,
      match4Pool: pools.match4,
      match3Pool: pools.match3,
      rolledOver: willRollover
    };
    
    await db.addDraw(newDrawRecord);
    
    const winnersList = winners || [];
    for (const w of winnersList) {
      await db.addWinner({
        id: `winner-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        drawId: newDrawId,
        userId: w.userId,
        matchCount: w.matchCount,
        prizeAmount: w.prizeAmount,
        proofUrl: null,
        status: 'pending',
        createdAt: new Date().toISOString().split('T')[0]
      });
    }
    
    // Rollover allocation
    if (willRollover) {
      await db.setJackpotRollover(pools.jackpot);
    } else {
      await db.setJackpotRollover(1000.00); // Reset to baseline
    }
    
    res.status(201).json({
      success: true,
      message: 'Monthly draw results successfully published officially.',
      draw: newDrawRecord
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
