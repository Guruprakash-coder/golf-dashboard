import express from 'express';
import { db } from '../db.js';
import { authenticateToken, verifyAdmin } from './auth.js';

const router = express.Router();

// Get admin analytics and reports (Admin only)
router.get('/', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const users = await db.getUsers();
    const draws = await db.getDraws();
    const winners = await db.getWinners();
    const donations = await db.getDonations();
    const charities = await db.getCharities();
    const rollover = await db.getJackpotRollover();

    const totalUsersCount = users.length;
    const activeSubsCount = users.filter(u => u.role === 'subscriber' && u.subscriptionStatus === 'active').length;
    const totalPrizePools = draws.reduce((sum, d) => sum + d.jackpotPool + d.match4Pool + d.match3Pool, 0);
    const totalCharityRaised = donations.reduce((sum, d) => sum + d.amount, 0);
    
    // Group donations per charity
    const contributionsByCharity = charities.map(c => {
      const charityDons = donations.filter(d => d.charityId === c.id);
      const total = charityDons.reduce((sum, d) => sum + d.amount, 0);
      return {
        charityId: c.id,
        name: c.name,
        totalRaised: total
      };
    });
    
    // Draws summary
    const drawStats = draws.map(d => {
      const wins = winners.filter(w => w.drawId === d.id);
      return {
        id: d.id,
        date: d.drawDate,
        totalWinners: wins.length,
        jackpotWon: !d.rolledOver
      };
    });
    
    res.json({
      summary: {
        totalUsers: totalUsersCount,
        activeSubscribers: activeSubsCount,
        totalPrizeAllocated: parseFloat(totalPrizePools.toFixed(2)),
        totalCharityDonations: parseFloat(totalCharityRaised.toFixed(2)),
        jackpotRollover: rollover
      },
      charityImpact: contributionsByCharity,
      drawHistory: drawStats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
