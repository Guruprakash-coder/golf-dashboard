import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'digital-heroes-super-secret-token-key-2026';

// Middleware for token authentication
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access token required.' });
  
  jwt.verify(token, JWT_SECRET, async (err, tokenUser) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
    
    try {
      const user = await db.getUserById(tokenUser.id);
      if (!user) return res.status(404).json({ error: 'User profile not found.' });
      
      req.user = user;
      next();
    } catch (dbErr) {
      res.status(500).json({ error: 'Internal database verification error.' });
    }
  });
};

// Middleware for admin verification
export const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required.' });
  }
  next();
};

// Middleware for active subscriber checks
export const checkSubscription = (req, res, next) => {
  if (req.user.role === 'admin') {
    return next();
  }
  if (req.user.subscriptionStatus !== 'active') {
    return res.status(403).json({ error: 'Active subscription required to access this feature.' });
  }
  next();
};

// Sign Up
router.post('/signup', async (req, res) => {
  const { email, password, fullName, charityId, charityPercentage } = req.body;
  
  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'Email, password, and full name are required.' });
  }
  
  try {
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const charities = await db.getCharities();
    const charityExists = charities.some(c => c.id === charityId);
    const finalCharityId = charityExists ? charityId : 'charity-1';
    const finalPercentage = Math.max(10, charityPercentage || 10);
    
    const newUser = {
      id: `user-${Date.now()}`,
      email: email.toLowerCase(),
      passwordHash: bcrypt.hashSync(password, 8),
      fullName,
      role: 'subscriber',
      subscriptionStatus: 'inactive',
      subscriptionTier: null,
      subscriptionRenewal: null,
      charityId: finalCharityId,
      charityPercentage: finalPercentage,
      walletBalance: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    const createdUser = await db.createUser(newUser);
    const token = jwt.sign({ id: createdUser.id, role: createdUser.role }, JWT_SECRET, { expiresIn: '7d' });
    
    const { passwordHash, ...userResponse } = createdUser;
    res.status(201).json({ token, user: userResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  
  try {
    const user = await db.getUserByEmail(email);
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const { passwordHash, ...userResponse } = user;
    res.json({ token, user: userResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Me
router.get('/me', authenticateToken, (req, res) => {
  const { passwordHash, ...userResponse } = req.user;
  res.json(userResponse);
});

// Update Profile
router.put('/profile', authenticateToken, async (req, res) => {
  const { fullName, charityId, charityPercentage } = req.body;
  const updates = {};
  
  if (fullName) updates.fullName = fullName;
  if (charityId) {
    const charities = await db.getCharities();
    const charityExists = charities.some(c => c.id === charityId);
    if (charityExists) updates.charityId = charityId;
  }
  if (charityPercentage !== undefined) {
    updates.charityPercentage = Math.max(10, parseInt(charityPercentage));
  }
  
  try {
    const updatedUser = await db.updateUser(req.user.id, updates);
    const { passwordHash, ...userResponse } = updatedUser;
    res.json(userResponse);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
