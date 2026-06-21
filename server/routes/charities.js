import express from 'express';
import { db } from '../db.js';
import { authenticateToken, verifyAdmin } from './auth.js';

const router = express.Router();

// Get list of all charities
router.get('/', async (req, res) => {
  try {
    const charities = await db.getCharities();
    res.json(charities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register a new charity (Admin only)
router.post('/', authenticateToken, verifyAdmin, async (req, res) => {
  const { name, description, imageUrl, events, isFeatured } = req.body;
  
  if (!name || !description) {
    return res.status(400).json({ error: 'Name and description are required.' });
  }
  
  try {
    const newCharity = {
      id: `charity-${Date.now()}`,
      name,
      description,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&q=80&w=600',
      events: events || [],
      isFeatured: !!isFeatured,
      totalDonations: 0
    };
    
    const created = await db.addCharity(newCharity);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a charity (Admin only)
router.put('/:id', authenticateToken, verifyAdmin, async (req, res) => {
  const { name, description, imageUrl, events, isFeatured } = req.body;
  const updates = {};
  
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (imageUrl !== undefined) updates.imageUrl = imageUrl;
  if (events !== undefined) updates.events = events;
  if (isFeatured !== undefined) updates.isFeatured = isFeatured;
  
  try {
    const updated = await db.updateCharity(req.params.id, updates);
    if (!updated) return res.status(404).json({ error: 'Charity not found.' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a charity (Admin only)
router.delete('/:id', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const deleted = await db.deleteCharity(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Charity not found.' });
    res.json({ success: true, message: 'Charity deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Direct independent donation to charity
router.post('/:id/donate', authenticateToken, async (req, res) => {
  const { amount } = req.body;
  const parsedAmount = parseFloat(amount);
  
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: 'Donation amount must be a positive number.' });
  }
  
  try {
    const charities = await db.getCharities();
    const charity = charities.find(c => c.id === req.params.id);
    if (!charity) return res.status(404).json({ error: 'Charity not found.' });
    
    const newDonation = {
      id: `don-${Date.now()}`,
      userId: req.user.id,
      charityId: charity.id,
      amount: parsedAmount,
      type: 'independent',
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    await db.addDonation(newDonation);
    
    // Add to charity running total
    const updatedTotal = (charity.totalDonations || 0) + parsedAmount;
    await db.updateCharity(charity.id, { totalDonations: updatedTotal });
    
    res.status(201).json({ success: true, donation: newDonation, charityTotal: updatedTotal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
