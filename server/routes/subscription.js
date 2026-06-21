import express from 'express';
import { db } from '../db.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Process Checkout (Stripe Simulation)
router.post('/checkout', authenticateToken, async (req, res) => {
  const { tier } = req.body; // 'monthly' or 'yearly'
  
  if (tier !== 'monthly' && tier !== 'yearly') {
    return res.status(400).json({ error: 'Subscription plan tier must be monthly or yearly.' });
  }
  
  const renewalDate = new Date();
  if (tier === 'monthly') {
    renewalDate.setMonth(renewalDate.getMonth() + 1);
  } else {
    renewalDate.setFullYear(renewalDate.getFullYear() + 1);
  }
  
  const updates = {
    subscriptionStatus: 'active',
    subscriptionTier: tier,
    subscriptionRenewal: renewalDate.toISOString().split('T')[0]
  };
  
  try {
    const updatedUser = await db.updateUser(req.user.id, updates);
    
    // Record dynamic charity donation split
    const cost = tier === 'monthly' ? 29.00 : 240.00;
    const charityAmount = cost * (updatedUser.charityPercentage / 100);
    
    await db.addDonation({
      id: `don-sub-${Date.now()}`,
      userId: updatedUser.id,
      charityId: updatedUser.charityId,
      amount: charityAmount,
      type: 'subscription_share',
      createdAt: new Date().toISOString().split('T')[0]
    });
    
    // Add donation amount to the charity
    const charities = await db.getCharities();
    const charityObj = charities.find(c => c.id === updatedUser.charityId);
    if (charityObj) {
      const newDonationsTotal = (charityObj.totalDonations || 0) + charityAmount;
      await db.updateCharity(charityObj.id, { totalDonations: newDonationsTotal });
    }
    
    res.json({
      success: true,
      message: 'Subscription payment processed and activated successfully.',
      user: updatedUser
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel active subscription plan
router.post('/cancel', authenticateToken, async (req, res) => {
  const updates = {
    subscriptionStatus: 'inactive',
    subscriptionTier: null,
    subscriptionRenewal: null
  };
  
  try {
    const updatedUser = await db.updateUser(req.user.id, updates);
    res.json({ success: true, message: 'Subscription cancelled successfully.', user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
