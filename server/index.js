import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'digital-heroes-super-secret-token-key-2026';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ==========================================
// SEED DATA & IN-MEMORY DATABASE STATE
// ==========================================

const seedCharities = [
  {
    id: 'charity-1',
    name: 'Green Fairways Foundation',
    description: 'Pioneering ecological preservation and water conservation on community golf courses. We transform golf lands into local wildlife sanctuaries while maintaining recreational integrity.',
    imageUrl: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=600',
    events: [
      { name: 'Eco-Golf Championship', date: '2026-07-12', description: 'Annual tournament fundraising for local reserve maintenance.' },
      { name: 'Water Preservation Seminar', date: '2026-08-05', description: 'Educating course operators on sustainable irrigation.' }
    ],
    isFeatured: true,
    totalDonations: 4320
  },
  {
    id: 'charity-2',
    name: 'Youth Golf Mentors',
    description: 'Providing golf equipment, access to courses, and professional mentoring to underprivileged youth. Our goal is to teach life skills, discipline, and community leadership through sport.',
    imageUrl: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=600',
    events: [
      { name: 'Kids Golf Clinic', date: '2026-07-20', description: 'Free skills training clinic for local schools.' },
      { name: 'Annual Charity Gala & Auction', date: '2026-09-01', description: 'Gala night auctioning vintage golf memorabilia.' }
    ],
    isFeatured: false,
    totalDonations: 2850
  },
  {
    id: 'charity-3',
    name: 'Hole-In-One Cancer Alliance',
    description: 'Partnering with clinical networks to directly fund local oncology research programs. We leverage local events and sport-focused campaigns to raise awareness and support families in care.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600',
    events: [
      { name: 'Golfing for a Cure', date: '2026-07-28', description: 'Charity scramble with 100% of proceeds supporting local cancer wards.' }
    ],
    isFeatured: true,
    totalDonations: 8900
  },
  {
    id: 'charity-4',
    name: 'Ocean Reef Protection',
    description: 'Restoring marine coral structures and running coastal debris cleanups. Connecting coastal communities with marine biology projects to protect marine ecosystems.',
    imageUrl: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&q=80&w=600',
    events: [
      { name: 'Beach Cleanup & Scramble', date: '2026-08-15', description: 'Coastal cleanup followed by an 18-hole charity event.' }
    ],
    isFeatured: false,
    totalDonations: 1200
  }
];

// Seed users
const seedUsers = [
  {
    id: 'user-admin',
    email: 'admin@digitalheroes.co.in',
    passwordHash: bcrypt.hashSync('admin123', 8),
    fullName: 'David Sterling',
    role: 'admin',
    subscriptionStatus: 'active',
    subscriptionTier: 'yearly',
    subscriptionRenewal: '2027-03-15',
    charityId: 'charity-1',
    charityPercentage: 15,
    walletBalance: 0,
    createdAt: '2026-01-10'
  },
  {
    id: 'user-sub1',
    email: 'golfguy@digitalheroes.co.in',
    passwordHash: bcrypt.hashSync('user123', 8),
    fullName: 'Marcus Vance',
    role: 'subscriber',
    subscriptionStatus: 'active',
    subscriptionTier: 'monthly',
    subscriptionRenewal: '2026-07-15',
    charityId: 'charity-1',
    charityPercentage: 20,
    walletBalance: 250,
    createdAt: '2026-03-01'
  },
  {
    id: 'user-sub2',
    email: 'sarah.jones@gmail.com',
    passwordHash: bcrypt.hashSync('user123', 8),
    fullName: 'Sarah Jones',
    role: 'subscriber',
    subscriptionStatus: 'active',
    subscriptionTier: 'yearly',
    subscriptionRenewal: '2027-02-18',
    charityId: 'charity-3',
    charityPercentage: 10,
    walletBalance: 0,
    createdAt: '2026-02-18'
  },
  {
    id: 'user-sub3',
    email: 'player3@golfmail.com',
    passwordHash: bcrypt.hashSync('user123', 8),
    fullName: 'Alex Rodriguez',
    role: 'subscriber',
    subscriptionStatus: 'active',
    subscriptionTier: 'monthly',
    subscriptionRenewal: '2026-07-02',
    charityId: 'charity-2',
    charityPercentage: 10,
    walletBalance: 0,
    createdAt: '2026-04-10'
  },
  {
    id: 'user-sub4',
    email: 'tom.watson@yahoo.com',
    passwordHash: bcrypt.hashSync('user123', 8),
    fullName: 'Tom Watson',
    role: 'subscriber',
    subscriptionStatus: 'inactive',
    subscriptionTier: 'monthly',
    subscriptionRenewal: '2026-05-15',
    charityId: 'charity-1',
    charityPercentage: 12,
    walletBalance: 0,
    createdAt: '2026-02-15'
  }
];

// Add 5 more subscribers to make the simulation richer
for (let i = 5; i <= 12; i++) {
  seedUsers.push({
    id: `user-sub${i}`,
    email: `player${i}@digitalheroes.co.in`,
    passwordHash: bcrypt.hashSync('user123', 8),
    fullName: `Player ${i} Roberts`,
    role: 'subscriber',
    subscriptionStatus: 'active',
    subscriptionTier: Math.random() > 0.4 ? 'monthly' : 'yearly',
    subscriptionRenewal: '2026-08-20',
    charityId: `charity-${(i % 4) + 1}`,
    charityPercentage: 10 + Math.floor(Math.random() * 5) * 5, // 10%, 15%, 20%, 25%, 30%
    walletBalance: 0,
    createdAt: '2026-05-01'
  });
}

// Seed scores (latest 5 per active subscriber)
const seedScores = [];
// Generate scores for active subscribers
seedUsers.forEach(u => {
  if (u.role === 'subscriber' && u.subscriptionStatus === 'active') {
    // Generate 5 scores on different dates
    const scoreBase = [18, 20, 22, 25, 28, 30, 32, 34, 36, 40];
    for (let day = 1; day <= 5; day++) {
      seedScores.push({
        id: `score-${u.id}-${day}`,
        userId: u.id,
        score: scoreBase[Math.floor(Math.random() * scoreBase.length)],
        date: `2026-06-0${day}`
      });
    }
  }
});

// Seed draws
const seedDraws = [
  {
    id: 'draw-1',
    drawDate: '2026-05-31',
    winningNumbers: [18, 22, 30, 35, 41],
    drawType: 'random',
    status: 'published',
    jackpotPool: 2500.00,
    match4Pool: 2187.50,
    match3Pool: 1562.50,
    rolledOver: false
  }
];

// Seed winners
const seedWinners = [
  {
    id: 'winner-1',
    drawId: 'draw-1',
    userId: 'user-sub1',
    matchCount: 3,
    prizeAmount: 250.00,
    proofUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=400',
    status: 'paid',
    createdAt: '2026-06-01'
  },
  {
    id: 'winner-2',
    drawId: 'draw-1',
    userId: 'user-sub2',
    matchCount: 4,
    prizeAmount: 729.16,
    proofUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=400',
    status: 'pending',
    createdAt: '2026-06-01'
  }
];

// Seed independent donations
const seedDonations = [
  {
    id: 'don-1',
    userId: 'user-sub1',
    charityId: 'charity-1',
    amount: 150.00,
    type: 'independent',
    createdAt: '2026-05-10'
  },
  {
    id: 'don-2',
    userId: 'user-sub2',
    charityId: 'charity-3',
    amount: 50.00,
    type: 'independent',
    createdAt: '2026-06-12'
  }
];

// In-memory Database Store
let db = {
  users: [...seedUsers],
  scores: [...seedScores],
  charities: [...seedCharities],
  draws: [...seedDraws],
  winners: [...seedWinners],
  donations: [...seedDonations],
  jackpotRollover: 1200.00 // Carried forward from previous drawings
};

// ==========================================
// MIDDLEWARE HELPERS
// ==========================================

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access token required.' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
    
    // Fetch fresh user record
    const dbUser = db.users.find(u => u.id === user.id);
    if (!dbUser) return res.status(404).json({ error: 'User profile not found.' });
    
    req.user = dbUser;
    next();
  });
};

const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required.' });
  }
  next();
};

const checkSubscription = (req, res, next) => {
  if (req.user.role === 'admin') {
    return next(); // Admins bypass subscription checks
  }
  if (req.user.subscriptionStatus !== 'active') {
    return res.status(403).json({ error: 'Active subscription required to access this feature.' });
  }
  next();
};

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

app.post('/api/auth/signup', (req, res) => {
  const { email, password, fullName, charityId, charityPercentage } = req.body;
  
  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'Email, password, and full name are required.' });
  }
  
  const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const selectedCharity = db.charities.find(c => c.id === charityId);
  const finalCharityId = selectedCharity ? charityId : 'charity-1';
  const finalPercentage = Math.max(10, charityPercentage || 10);
  
  const newUser = {
    id: `user-${Date.now()}`,
    email: email.toLowerCase(),
    passwordHash: bcrypt.hashSync(password, 8),
    fullName,
    role: 'subscriber',
    subscriptionStatus: 'inactive', // Becomes active after payment flow
    subscriptionTier: null,
    subscriptionRenewal: null,
    charityId: finalCharityId,
    charityPercentage: finalPercentage,
    walletBalance: 0,
    createdAt: new Date().toISOString().split('T')[0]
  };
  
  db.users.push(newUser);
  
  const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
  
  // Exclude password from output
  const { passwordHash, ...userResponse } = newUser;
  res.status(201).json({ token, user: userResponse });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }
  
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  
  const { passwordHash, ...userResponse } = user;
  res.json({ token, user: userResponse });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const { passwordHash, ...userResponse } = req.user;
  res.json(userResponse);
});

// Update profile / charity settings
app.put('/api/auth/profile', authenticateToken, (req, res) => {
  const { fullName, charityId, charityPercentage } = req.body;
  
  if (fullName) req.user.fullName = fullName;
  if (charityId) {
    const charityExists = db.charities.some(c => c.id === charityId);
    if (charityExists) req.user.charityId = charityId;
  }
  if (charityPercentage !== undefined) {
    req.user.charityPercentage = Math.max(10, parseInt(charityPercentage));
  }
  
  const { passwordHash, ...userResponse } = req.user;
  res.json(userResponse);
});

// Admin-triggered subscription / role override
app.put('/api/users/:id', authenticateToken, verifyAdmin, (req, res) => {
  const targetUser = db.users.find(u => u.id === req.params.id);
  if (!targetUser) return res.status(404).json({ error: 'User not found.' });
  
  const { fullName, subscriptionStatus, subscriptionTier, subscriptionRenewal, role, charityId, charityPercentage } = req.body;
  
  if (fullName !== undefined) targetUser.fullName = fullName;
  if (subscriptionStatus !== undefined) targetUser.subscriptionStatus = subscriptionStatus;
  if (subscriptionTier !== undefined) targetUser.subscriptionTier = subscriptionTier;
  if (subscriptionRenewal !== undefined) targetUser.subscriptionRenewal = subscriptionRenewal;
  if (role !== undefined) targetUser.role = role;
  if (charityId !== undefined) targetUser.charityId = charityId;
  if (charityPercentage !== undefined) targetUser.charityPercentage = Math.max(10, parseInt(charityPercentage));
  
  res.json(targetUser);
});

// List users for Admin
app.get('/api/users', authenticateToken, verifyAdmin, (req, res) => {
  const mapped = db.users.map(u => {
    const { passwordHash, ...safe } = u;
    // Attach latest scores count
    const userScores = db.scores.filter(s => s.userId === u.id);
    return { ...safe, scoreCount: userScores.length };
  });
  res.json(mapped);
});

// ==========================================
// SUBSCRIPTION SUBSYSTEM
// ==========================================

app.post('/api/subscription/checkout', authenticateToken, (req, res) => {
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
  
  req.user.subscriptionStatus = 'active';
  req.user.subscriptionTier = tier;
  req.user.subscriptionRenewal = renewalDate.toISOString().split('T')[0];
  
  // Calculate default pool & charity share
  const cost = tier === 'monthly' ? 29.00 : 240.00;
  const charityAmount = cost * (req.user.charityPercentage / 100);
  
  // Record dynamic charity donation
  db.donations.push({
    id: `don-sub-${Date.now()}`,
    userId: req.user.id,
    charityId: req.user.charityId,
    amount: charityAmount,
    type: 'subscription_share',
    createdAt: new Date().toISOString().split('T')[0]
  });
  
  // Add donation value to the charity
  const targetCharity = db.charities.find(c => c.id === req.user.charityId);
  if (targetCharity) {
    targetCharity.totalDonations = (targetCharity.totalDonations || 0) + charityAmount;
  }
  
  res.json({
    success: true,
    message: 'Subscription payment processed and activated successfully.',
    user: req.user
  });
});

app.post('/api/subscription/cancel', authenticateToken, (req, res) => {
  req.user.subscriptionStatus = 'inactive';
  req.user.subscriptionTier = null;
  req.user.subscriptionRenewal = null;
  res.json({ success: true, message: 'Subscription cancelled successfully.', user: req.user });
});

// ==========================================
// GOLF SCORES SUBSYSTEM
// ==========================================

// Get user scores
app.get('/api/scores', authenticateToken, checkSubscription, (req, res) => {
  const userScores = db.scores
    .filter(s => s.userId === req.user.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Reverse chronological order
  
  res.json(userScores);
});

// Get scores of specific user (for Admin)
app.get('/api/scores/user/:userId', authenticateToken, verifyAdmin, (req, res) => {
  const userScores = db.scores
    .filter(s => s.userId === req.params.userId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(userScores);
});

// Post a new golf score
app.post('/api/scores', authenticateToken, checkSubscription, (req, res) => {
  const { score, date } = req.body;
  const parsedScore = parseInt(score);
  
  if (isNaN(parsedScore) || parsedScore < 1 || parsedScore > 45) {
    return res.status(400).json({ error: 'Golf score must be an integer between 1 and 45 (Stableford).' });
  }
  
  if (!date) {
    return res.status(400).json({ error: 'A valid date must be provided for the score.' });
  }

  // Check unique date condition: "Only one score entry is permitted per date. Duplicate scores for the same date are not allowed."
  const duplicate = db.scores.find(s => s.userId === req.user.id && s.date === date);
  if (duplicate) {
    return res.status(400).json({ error: `A score entry for ${date} already exists. Duplicate dates are not allowed. Please edit or delete the existing entry.` });
  }
  
  // Get all user's scores, sorted ascending by date (oldest first)
  const userScores = db.scores
    .filter(s => s.userId === req.user.id)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // "Only the latest 5 scores are retained at any time. A new score replaces the oldest stored score automatically."
  if (userScores.length >= 5) {
    const oldestScore = userScores[0];
    db.scores = db.scores.filter(s => s.id !== oldestScore.id);
  }
  
  const newScoreRecord = {
    id: `score-${Date.now()}`,
    userId: req.user.id,
    score: parsedScore,
    date,
    createdAt: new Date().toISOString()
  };
  
  db.scores.push(newScoreRecord);
  
  // Return updated sorted score list
  const updatedScores = db.scores
    .filter(s => s.userId === req.user.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
    
  res.status(201).json(updatedScores);
});

// Edit score entry
app.put('/api/scores/:id', authenticateToken, checkSubscription, (req, res) => {
  const scoreRecord = db.scores.find(s => s.id === req.params.id);
  if (!scoreRecord) return res.status(404).json({ error: 'Score record not found.' });
  
  // Security check: subscriber can only edit their own score
  if (req.user.role !== 'admin' && scoreRecord.userId !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized to edit this score.' });
  }
  
  const { score, date } = req.body;
  
  if (score !== undefined) {
    const parsedScore = parseInt(score);
    if (isNaN(parsedScore) || parsedScore < 1 || parsedScore > 45) {
      return res.status(400).json({ error: 'Golf score must be an integer between 1 and 45.' });
    }
    scoreRecord.score = parsedScore;
  }
  
  if (date !== undefined) {
    // Check duplicate date constraint if changing date
    if (date !== scoreRecord.date) {
      const duplicate = db.scores.find(s => s.userId === scoreRecord.userId && s.date === date);
      if (duplicate) {
        return res.status(400).json({ error: `A score entry for ${date} already exists.` });
      }
    }
    scoreRecord.date = date;
  }
  
  res.json({ success: true, score: scoreRecord });
});

// Admin edit user score
app.put('/api/admin/scores/:id', authenticateToken, verifyAdmin, (req, res) => {
  const scoreRecord = db.scores.find(s => s.id === req.params.id);
  if (!scoreRecord) return res.status(404).json({ error: 'Score record not found.' });
  
  const { score, date } = req.body;
  if (score !== undefined) {
    const parsedScore = parseInt(score);
    if (isNaN(parsedScore) || parsedScore < 1 || parsedScore > 45) {
      return res.status(400).json({ error: 'Golf score must be an integer between 1 and 45.' });
    }
    scoreRecord.score = parsedScore;
  }
  if (date !== undefined) {
    if (date !== scoreRecord.date) {
      const duplicate = db.scores.find(s => s.userId === scoreRecord.userId && s.date === date);
      if (duplicate) {
        return res.status(400).json({ error: `A score entry for ${date} already exists.` });
      }
    }
    scoreRecord.date = date;
  }
  res.json(scoreRecord);
});

// Delete score entry
app.delete('/api/scores/:id', authenticateToken, checkSubscription, (req, res) => {
  const scoreIndex = db.scores.findIndex(s => s.id === req.params.id);
  if (scoreIndex === -1) return res.status(404).json({ error: 'Score record not found.' });
  
  const scoreRecord = db.scores[scoreIndex];
  
  if (req.user.role !== 'admin' && scoreRecord.userId !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized to delete this score.' });
  }
  
  db.scores.splice(scoreIndex, 1);
  res.json({ success: true, message: 'Score record deleted successfully.' });
});

// ==========================================
// CHARITY DIRECTORY SUBSYSTEM
// ==========================================

app.get('/api/charities', (req, res) => {
  res.json(db.charities);
});

// Add a charity
app.post('/api/charities', authenticateToken, verifyAdmin, (req, res) => {
  const { name, description, imageUrl, events, isFeatured } = req.body;
  
  if (!name || !description) {
    return res.status(400).json({ error: 'Name and description are required.' });
  }
  
  const newCharity = {
    id: `charity-${Date.now()}`,
    name,
    description,
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&q=80&w=600',
    events: events || [],
    isFeatured: !!isFeatured,
    totalDonations: 0
  };
  
  db.charities.push(newCharity);
  res.status(201).json(newCharity);
});

// Edit charity
app.put('/api/charities/:id', authenticateToken, verifyAdmin, (req, res) => {
  const charity = db.charities.find(c => c.id === req.params.id);
  if (!charity) return res.status(404).json({ error: 'Charity not found.' });
  
  const { name, description, imageUrl, events, isFeatured } = req.body;
  
  if (name !== undefined) charity.name = name;
  if (description !== undefined) charity.description = description;
  if (imageUrl !== undefined) charity.imageUrl = imageUrl;
  if (events !== undefined) charity.events = events;
  if (isFeatured !== undefined) charity.isFeatured = isFeatured;
  
  res.json(charity);
});

// Delete charity
app.delete('/api/charities/:id', authenticateToken, verifyAdmin, (req, res) => {
  const index = db.charities.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Charity not found.' });
  
  db.charities.splice(index, 1);
  res.json({ success: true, message: 'Charity deleted successfully.' });
});

// Independent Donations Flow
app.post('/api/charities/:id/donate', authenticateToken, (req, res) => {
  const charity = db.charities.find(c => c.id === req.params.id);
  if (!charity) return res.status(404).json({ error: 'Charity not found.' });
  
  const { amount } = req.body;
  const parsedAmount = parseFloat(amount);
  
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: 'Donation amount must be a positive number.' });
  }
  
  const newDonation = {
    id: `don-${Date.now()}`,
    userId: req.user.id,
    charityId: charity.id,
    amount: parsedAmount,
    type: 'independent',
    createdAt: new Date().toISOString().split('T')[0]
  };
  
  db.donations.push(newDonation);
  charity.totalDonations = (charity.totalDonations || 0) + parsedAmount;
  
  res.status(201).json({ success: true, donation: newDonation, charityTotal: charity.totalDonations });
});

// ==========================================
// DRAW & REWARD SYSTEM (THE ENGINE)
// ==========================================

// Helper: Calculate pool values based on active subscriber count
const calculateCurrentPool = () => {
  const activeSubsCount = db.users.filter(u => u.role === 'subscriber' && u.subscriptionStatus === 'active').length;
  // Suppose monthly contribution per active subscriber is $10.00
  const contributionPerSub = 10.00;
  const rawPool = activeSubsCount * contributionPerSub;
  
  const jackpotTier = (rawPool * 0.40) + db.jackpotRollover; // 40% + Rollover
  const match4Tier = rawPool * 0.35; // 35%
  const match3Tier = rawPool * 0.25; // 25%
  
  return {
    activeSubscribers: activeSubsCount,
    rawPool,
    jackpotTier,
    match4Tier,
    match3Tier,
    rolloverCarried: db.jackpotRollover
  };
};

// Get current pool stats
app.get('/api/draws/current-pool', (req, res) => {
  res.json(calculateCurrentPool());
});

// Get previous draw records
app.get('/api/draws', (req, res) => {
  res.json(db.draws);
});

// Get all winning history
app.get('/api/winners', (req, res) => {
  // Join with user and draw details
  const extendedWinners = db.winners.map(w => {
    const userObj = db.users.find(u => u.id === w.userId);
    const drawObj = db.draws.find(d => d.id === w.drawId);
    return {
      ...w,
      userName: userObj ? userObj.fullName : 'Unknown User',
      userEmail: userObj ? userObj.email : '',
      drawDate: drawObj ? drawObj.drawDate : ''
    };
  });
  res.json(extendedWinners);
});

// Upload proof score (Winners only)
app.post('/api/winners/:id/proof', authenticateToken, (req, res) => {
  const winner = db.winners.find(w => w.id === req.params.id);
  if (!winner) return res.status(404).json({ error: 'Winner entry not found.' });
  
  if (winner.userId !== req.user.id) {
    return res.status(403).json({ error: 'You are not authorized to submit proof for this win.' });
  }
  
  const { proofUrl } = req.body;
  if (!proofUrl) {
    return res.status(400).json({ error: 'Proof screenshot or link is required.' });
  }
  
  winner.proofUrl = proofUrl;
  res.json({ success: true, winner });
});

// Admin verify payout (Approve/Reject)
app.put('/api/admin/winners/:id', authenticateToken, verifyAdmin, (req, res) => {
  const winner = db.winners.find(w => w.id === req.params.id);
  if (!winner) return res.status(404).json({ error: 'Winner entry not found.' });
  
  const { status, action } = req.body; // action: 'approve', 'reject', status: 'paid', etc.
  
  if (action === 'approve') {
    winner.status = 'paid';
    
    // Credit to user wallet balance
    const user = db.users.find(u => u.id === winner.userId);
    if (user) {
      user.walletBalance = (user.walletBalance || 0) + winner.prizeAmount;
    }
  } else if (action === 'reject') {
    winner.status = 'rejected';
  } else if (status) {
    winner.status = status;
  }
  
  res.json({ success: true, winner });
});

// ==========================================
// CORE DRAW LOGIC: RANDOM VS ALGORITHMIC
// ==========================================

const generateDrawNumbers = (type) => {
  if (type === 'random') {
    // Standard lottery style draw: Pick 5 unique numbers in range 1-45
    const set = new Set();
    while (set.size < 5) {
      set.add(Math.floor(Math.random() * 45) + 1);
    }
    return Array.from(set).sort((a, b) => a - b);
  } else {
    // Algorithmic weighted draw: Weighted by most/least frequent user scores
    // Gather all active subscribers' scores
    const activeSubIds = db.users
      .filter(u => u.role === 'subscriber' && u.subscriptionStatus === 'active')
      .map(u => u.id);
      
    const activeScores = db.scores.filter(s => activeSubIds.includes(s.userId));
    
    if (activeScores.length < 5) {
      // Fallback to random if not enough scores
      return generateDrawNumbers('random');
    }
    
    // Count frequencies of each number 1-45
    const frequencies = {};
    for (let i = 1; i <= 45; i++) frequencies[i] = 0;
    activeScores.forEach(s => {
      if (frequencies[s.score] !== undefined) frequencies[s.score]++;
    });
    
    // Calculate weights based on logic:
    // We weight numbers by score frequency. If 'algorithmic', let's say:
    // We favor numbers that are moderately frequent or most frequent.
    // For weighting: weight = frequency + 1 (so even 0-frequency gets a small chance)
    const candidates = [];
    for (let i = 1; i <= 45; i++) {
      candidates.push({ number: i, weight: frequencies[i] + 1 });
    }
    
    // Select 5 unique numbers based on weights
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

// Simulation and Pre-analysis
app.post('/api/admin/draws/simulate', authenticateToken, verifyAdmin, (req, res) => {
  const { drawType } = req.body; // 'random' or 'algorithmic'
  const type = drawType === 'algorithmic' ? 'algorithmic' : 'random';
  
  // 1. Generate Winning Numbers
  const winningNumbers = generateDrawNumbers(type);
  
  // 2. Fetch Active Subscribers & their latest 5 scores
  const activeSubscribers = db.users.filter(u => u.role === 'subscriber' && u.subscriptionStatus === 'active');
  const simulationPools = calculateCurrentPool();
  
  const simWinners = [];
  let match5Count = 0;
  let match4Count = 0;
  let match3Count = 0;
  
  activeSubscribers.forEach(user => {
    // Get user's scores
    const userScores = db.scores
      .filter(s => s.userId === user.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
      .map(s => s.score);
      
    if (userScores.length === 5) {
      // Find intersection matches (order independent)
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
  });
  
  // Calculate individual payout splits
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
});

// Official Draw Publication
app.post('/api/admin/draws/publish', authenticateToken, verifyAdmin, (req, res) => {
  const { drawType, winningNumbers, pools, winners, willRollover } = req.body;
  
  if (!winningNumbers || !pools) {
    return res.status(400).json({ error: 'Published draw requires winningNumbers and pool allocation metrics.' });
  }
  
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
  
  db.draws.push(newDrawRecord);
  
  // Insert official Winners
  const winnersList = winners || [];
  winnersList.forEach(w => {
    db.winners.push({
      id: `winner-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      drawId: newDrawId,
      userId: w.userId,
      matchCount: w.matchCount,
      prizeAmount: w.prizeAmount,
      proofUrl: null, // User must upload proof later
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0]
    });
  });
  
  // Set Rollover state for the next month:
  // If match5Count was 0, carry forward.
  if (willRollover) {
    db.jackpotRollover = pools.jackpot; // Rollover the entire 5-match jackpot pool
  } else {
    db.jackpotRollover = 1000.00; // Reset to standard seed jackpot
  }
  
  res.status(201).json({
    success: true,
    message: 'Monthly draw results successfully published officially.',
    draw: newDrawRecord
  });
});

// ==========================================
// REPORTS & ANALYTICS
// ==========================================

app.get('/api/admin/reports', authenticateToken, verifyAdmin, (req, res) => {
  const totalUsersCount = db.users.length;
  const activeSubsCount = db.users.filter(u => u.role === 'subscriber' && u.subscriptionStatus === 'active').length;
  const totalPrizePools = db.draws.reduce((sum, d) => sum + d.jackpotPool + d.match4Pool + d.match3Pool, 0);
  
  // Calculate total raised for charity
  const totalCharityRaised = db.donations.reduce((sum, d) => sum + d.amount, 0);
  
  // Group charity contributions
  const contributionsByCharity = db.charities.map(c => {
    const charityDons = db.donations.filter(d => d.charityId === c.id);
    const total = charityDons.reduce((sum, d) => sum + d.amount, 0);
    return {
      charityId: c.id,
      name: c.name,
      totalRaised: total
    };
  });
  
  // Historical stats
  const drawStats = db.draws.map(d => {
    const drawWins = db.winners.filter(w => w.drawId === d.id);
    return {
      id: d.id,
      date: d.drawDate,
      totalWinners: drawWins.length,
      jackpotWon: !d.rolledOver
    };
  });
  
  res.json({
    summary: {
      totalUsers: totalUsersCount,
      activeSubscribers: activeSubsCount,
      totalPrizeAllocated: parseFloat(totalPrizePools.toFixed(2)),
      totalCharityDonations: parseFloat(totalCharityRaised.toFixed(2)),
      jackpotRollover: db.jackpotRollover
    },
    charityImpact: contributionsByCharity,
    drawHistory: drawStats
  });
});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {
  console.log(`Digital Heroes Backend Server listening on http://localhost:${PORT}`);
});
