import express from 'express';
import { db } from '../db.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Process Checkout (Stripe Simulation)
router.post('/checkout', authenticateToken, async (req, res) => {
  const { tier, billingPeriod, extraDonation, charityId, charityPercentage } = req.body;
  
  const validTiers = ['monthly', 'yearly', 'hero_core', 'yearly_legend', 'custom_hero'];
  if (!validTiers.includes(tier)) {
    return res.status(400).json({ error: 'Invalid subscription plan tier.' });
  }
  
  // Resolve billing period
  let resolvedPeriod = 'monthly';
  if (tier === 'yearly' || tier === 'yearly_legend') resolvedPeriod = 'yearly';
  if (tier === 'custom_hero') resolvedPeriod = billingPeriod || 'monthly';
  
  // Set renewal date
  const renewalDate = new Date();
  if (resolvedPeriod === 'monthly') {
    renewalDate.setMonth(renewalDate.getMonth() + 1);
  } else if (resolvedPeriod === 'quarterly') {
    renewalDate.setMonth(renewalDate.getMonth() + 3);
  } else {
    renewalDate.setFullYear(renewalDate.getFullYear() + 1);
  }
  
  // Resolve base and extra costs
  const baseCost = resolvedPeriod === 'monthly' ? 29.00
                 : resolvedPeriod === 'quarterly' ? 73.95 // ($24.65 * 3)
                 : 240.00; // ($20 * 12)
                 
  const extraVal = parseFloat(extraDonation) || 0;
  const multiplier = resolvedPeriod === 'monthly' ? 1 
                   : resolvedPeriod === 'quarterly' ? 3 
                   : 12;
                   
  const totalCost = baseCost + (extraVal * multiplier);
  
  // Profile settings update
  const profileUpdates = {
    subscriptionStatus: 'active',
    subscriptionTier: resolvedPeriod,
    subscriptionRenewal: renewalDate.toISOString().split('T')[0]
  };
  
  if (charityId) {
    const charities = await db.getCharities();
    if (charities.some(c => c.id === charityId)) {
      profileUpdates.charityId = charityId;
    }
  }
  
  if (charityPercentage !== undefined) {
    profileUpdates.charityPercentage = Math.max(10, parseInt(charityPercentage));
  }
  
  try {
    const updatedUser = await db.updateUser(req.user.id, profileUpdates);
    
    // Calculate charity donation split for this payment
    const donationPercent = updatedUser.charityPercentage || 10;
    const charityAmount = totalCost * (donationPercent / 100);
    
    await db.addDonation({
      id: `don-sub-${Date.now()}`,
      userId: updatedUser.id,
      charityId: updatedUser.charityId,
      amount: parseFloat(charityAmount.toFixed(2)),
      type: 'subscription_share',
      createdAt: new Date().toISOString().split('T')[0]
    });
    
    // Add donation amount to the charity's total raised
    const charities = await db.getCharities();
    const charityObj = charities.find(c => c.id === updatedUser.charityId);
    if (charityObj) {
      const newDonationsTotal = (charityObj.totalDonations || 0) + charityAmount;
      await db.updateCharity(charityObj.id, { totalDonations: parseFloat(newDonationsTotal.toFixed(2)) });
    }
    
    res.json({
      success: true,
      message: `Subscription payment of $${totalCost.toFixed(2)} processed and activated successfully.`,
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
