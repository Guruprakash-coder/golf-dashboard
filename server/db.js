import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_url_here' && 
  supabaseAnonKey !== 'your_supabase_anon_key_here';

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;

if (isSupabaseConfigured) {
  console.log('Database Mode: Live Supabase connected!');
} else {
  console.log('Database Mode: In-Memory/Local Storage Mock Fallback mode.');
}

// ==========================================
// SEED DATA FOR MOCK STATE
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

// Add 5 more subscribers
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
    charityPercentage: 10 + Math.floor(Math.random() * 5) * 5,
    walletBalance: 0,
    createdAt: '2026-05-01'
  });
}

const seedScores = [];
seedUsers.forEach(u => {
  if (u.role === 'subscriber' && u.subscriptionStatus === 'active') {
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

let inMemoryDb = {
  users: [...seedUsers],
  scores: [...seedScores],
  charities: [...seedCharities],
  draws: [...seedDraws],
  winners: [...seedWinners],
  donations: [...seedDonations],
  jackpotRollover: 1200.00
};

// ==========================================
// ADAPTER INTERFACES
// ==========================================

export const db = {
  // Profiles/Users
  async getUsers() {
    if (supabase) {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      return data;
    }
    return inMemoryDb.users;
  },

  async getUserByEmail(email) {
    if (supabase) {
      const { data, error } = await supabase.from('profiles').select('*').eq('email', email.toLowerCase()).single();
      if (error && error.code !== 'PGRST116') throw error; // ignore no rows error
      return data;
    }
    return inMemoryDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  async getUserById(id) {
    if (supabase) {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    }
    return inMemoryDb.users.find(u => u.id === id);
  },

  async createUser(user) {
    if (supabase) {
      const { data, error } = await supabase.from('profiles').insert(user).select().single();
      if (error) throw error;
      return data;
    }
    inMemoryDb.users.push(user);
    return user;
  },

  async updateUser(id, updates) {
    if (supabase) {
      const { data, error } = await supabase.from('profiles').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    }
    const idx = inMemoryDb.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      inMemoryDb.users[idx] = { ...inMemoryDb.users[idx], ...updates };
      return inMemoryDb.users[idx];
    }
    return null;
  },

  // Scores
  async getScores(userId) {
    if (supabase) {
      const { data, error } = await supabase.from('scores').select('*').eq('user_id', userId).order('date', { ascending: false });
      if (error) throw error;
      return data.map(s => ({
        id: s.id,
        userId: s.user_id,
        score: s.score,
        date: s.date,
        createdAt: s.created_at
      }));
    }
    return inMemoryDb.scores
      .filter(s => s.userId === userId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  async addScore(scoreRecord) {
    if (supabase) {
      const { data, error } = await supabase.from('scores').insert({
        id: scoreRecord.id,
        user_id: scoreRecord.userId,
        score: scoreRecord.score,
        date: scoreRecord.date
      }).select().single();
      if (error) throw error;
      return data;
    }
    inMemoryDb.scores.push(scoreRecord);
    return scoreRecord;
  },

  async updateScore(id, updates) {
    if (supabase) {
      const payload = {};
      if (updates.score !== undefined) payload.score = updates.score;
      if (updates.date !== undefined) payload.date = updates.date;
      const { data, error } = await supabase.from('scores').update(payload).eq('id', id).select().single();
      if (error) throw error;
      return data;
    }
    const score = inMemoryDb.scores.find(s => s.id === id);
    if (score) {
      if (updates.score !== undefined) score.score = updates.score;
      if (updates.date !== undefined) score.date = updates.date;
      return score;
    }
    return null;
  },

  async deleteScore(id) {
    if (supabase) {
      const { error } = await supabase.from('scores').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
    const initialLen = inMemoryDb.scores.length;
    inMemoryDb.scores = inMemoryDb.scores.filter(s => s.id !== id);
    return inMemoryDb.scores.length < initialLen;
  },

  async getScoreByDate(userId, date) {
    if (supabase) {
      const { data } = await supabase.from('scores').select('*').eq('user_id', userId).eq('date', date).single();
      return data;
    }
    return inMemoryDb.scores.find(s => s.userId === userId && s.date === date);
  },

  // Charities
  async getCharities() {
    if (supabase) {
      const { data, error } = await supabase.from('charities').select('*');
      if (error) throw error;
      return data.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        imageUrl: c.image_url,
        events: c.events,
        isFeatured: c.is_featured,
        totalDonations: c.total_donations
      }));
    }
    return inMemoryDb.charities;
  },

  async addCharity(charity) {
    if (supabase) {
      const { data, error } = await supabase.from('charities').insert({
        id: charity.id,
        name: charity.name,
        description: charity.description,
        image_url: charity.imageUrl,
        events: charity.events,
        is_featured: charity.isFeatured,
        total_donations: charity.totalDonations
      }).select().single();
      if (error) throw error;
      return data;
    }
    inMemoryDb.charities.push(charity);
    return charity;
  },

  async updateCharity(id, updates) {
    if (supabase) {
      const payload = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.imageUrl !== undefined) payload.image_url = updates.imageUrl;
      if (updates.events !== undefined) payload.events = updates.events;
      if (updates.isFeatured !== undefined) payload.is_featured = updates.isFeatured;
      if (updates.totalDonations !== undefined) payload.total_donations = updates.totalDonations;
      
      const { data, error } = await supabase.from('charities').update(payload).eq('id', id).select().single();
      if (error) throw error;
      return data;
    }
    const idx = inMemoryDb.charities.findIndex(c => c.id === id);
    if (idx !== -1) {
      inMemoryDb.charities[idx] = { ...inMemoryDb.charities[idx], ...updates };
      return inMemoryDb.charities[idx];
    }
    return null;
  },

  async deleteCharity(id) {
    if (supabase) {
      const { error } = await supabase.from('charities').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
    inMemoryDb.charities = inMemoryDb.charities.filter(c => c.id !== id);
    return true;
  },

  // Draws
  async getDraws() {
    if (supabase) {
      const { data, error } = await supabase.from('draws').select('*').order('draw_date', { ascending: false });
      if (error) throw error;
      return data.map(d => ({
        id: d.id,
        drawDate: d.draw_date,
        winningNumbers: d.winning_numbers,
        drawType: d.draw_type,
        status: d.status,
        jackpotPool: d.jackpot_pool,
        match4Pool: d.match_4_pool,
        match3Pool: d.match_3_pool,
        rolledOver: d.rolled_over
      }));
    }
    return inMemoryDb.draws;
  },

  async addDraw(draw) {
    if (supabase) {
      const { data, error } = await supabase.from('draws').insert({
        id: draw.id,
        draw_date: draw.drawDate,
        winning_numbers: draw.winningNumbers,
        draw_type: draw.drawType,
        status: draw.status,
        jackpot_pool: draw.jackpotPool,
        match_4_pool: draw.match4Pool,
        match_3_pool: draw.match3Pool,
        rolled_over: draw.rolledOver
      }).select().single();
      if (error) throw error;
      return data;
    }
    inMemoryDb.draws.push(draw);
    return draw;
  },

  async getJackpotRollover() {
    if (supabase) {
      // Find latest rollover jackpot pool from settings or draws
      const { data } = await supabase.from('draws').select('jackpot_pool').eq('rolled_over', true).order('draw_date', { ascending: false }).limit(1);
      return data && data[0] ? data[0].jackpot_pool : 1000.00;
    }
    return inMemoryDb.jackpotRollover;
  },

  async setJackpotRollover(amount) {
    if (supabase) {
      return amount; // managed dynamically in database
    }
    inMemoryDb.jackpotRollover = amount;
    return amount;
  },

  // Winners
  async getWinners() {
    if (supabase) {
      const { data, error } = await supabase.from('winners').select('*');
      if (error) throw error;
      return data.map(w => ({
        id: w.id,
        drawId: w.draw_id,
        userId: w.user_id,
        matchCount: w.match_count,
        prizeAmount: w.prize_amount,
        proofUrl: w.proof_url,
        status: w.status,
        createdAt: w.created_at
      }));
    }
    return inMemoryDb.winners;
  },

  async addWinner(winner) {
    if (supabase) {
      const { data, error } = await supabase.from('winners').insert({
        id: winner.id,
        draw_id: winner.drawId,
        user_id: winner.userId,
        match_count: winner.matchCount,
        prize_amount: winner.prizeAmount,
        proof_url: winner.proofUrl,
        status: winner.status
      }).select().single();
      if (error) throw error;
      return data;
    }
    inMemoryDb.winners.push(winner);
    return winner;
  },

  async updateWinner(id, updates) {
    if (supabase) {
      const payload = {};
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.proofUrl !== undefined) payload.proof_url = updates.proofUrl;
      const { data, error } = await supabase.from('winners').update(payload).eq('id', id).select().single();
      if (error) throw error;
      return data;
    }
    const win = inMemoryDb.winners.find(w => w.id === id);
    if (win) {
      if (updates.status !== undefined) win.status = updates.status;
      if (updates.proofUrl !== undefined) win.proofUrl = updates.proofUrl;
      return win;
    }
    return null;
  },

  // Donations
  async getDonations() {
    if (supabase) {
      const { data, error } = await supabase.from('donations').select('*');
      if (error) throw error;
      return data.map(d => ({
        id: d.id,
        userId: d.user_id,
        charityId: d.charity_id,
        amount: d.amount,
        type: d.type,
        createdAt: d.created_at
      }));
    }
    return inMemoryDb.donations;
  },

  async addDonation(donation) {
    if (supabase) {
      const { data, error } = await supabase.from('donations').insert({
        id: donation.id,
        user_id: donation.userId,
        charity_id: donation.charityId,
        amount: donation.amount,
        type: donation.type
      }).select().single();
      if (error) throw error;
      return data;
    }
    inMemoryDb.donations.push(donation);
    return donation;
  }
};
