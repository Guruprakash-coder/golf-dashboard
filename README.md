# ⛳ Digital Heroes — Subscription Golf Tracker & Charity Payout Platform

Digital Heroes is a premium, professional-grade subscription golf performance tracking application. It bridges the gap between amateur golf scores (Stableford format), recurring donation allocations, and sweepstakes payouts. 

The application utilizes a clean, modern **MongoDB Atlas-inspired Light Theme** design system to deliver a developer-portal aesthetic.

---

## 🚀 Live Deployments
* **Frontend Client (Vercel):** [Digital Heroes App](https://golf-dashboard-mu.vercel.app/)
* **Backend Server (Render):** `https://golf-dashboard-scou.onrender.com`
* **Database (Supabase):** PostgreSQL Live Instance

---

## ✨ Core Features

### 👤 Subscriber Portal
* **Rolling Score Log (Stableford):** Retains and displays the user's latest 5 round records (values 1–45). If a score is entered for an existing date, the server automatically updates (overrides) the entry for easy testing.
* **Charity Split Slider:** Dynamically slide the split percentage (10% to 100%) to allocate what share of subscription fees goes directly to a designated charity.
* **Winnings Verification Queue:** Winners of the draw can upload proof screenshots of their rounds to verify their claims.

### 💰 Interactive Pricing & Impact Calculator
* **Flexible Billing Cycles:** Supports Monthly, Quarterly (15% off), and Yearly (30% off) selections.
* **Custom Donations:** Choose to add extra support additions to the subscription ($0 to +$100/mo).
* **Impact Breakdowns:** Instantly displays real-time splits of how much goes to the Charity, the Sweepstakes Prize Pool, and the Platform.
* **Dynamic Badges:** Unlocks custom profile badges (*Standard Member*, *Active Advocate*, *Legendary Hero*) based on contribution levels.

### 👑 Admin Control Room
* **Lottery Draw Simulator:** Choose between standard **Random** or **Algorithmic (Frequency-Weighted)** draw mechanics. Run simulations to pre-analyze rollover jackpot sizes and winning probabilities.
* **Override Daily Draws:** Re-run and publish draws on the same date safely; the server automatically cleanses the previous draw for the day to keep logs pristine.
* **Verification & Payout approvals:** Inspect screenshots uploaded by winners to approve and credit wallet balances or reject invalid claims.

---

## 🛠️ Tech Stack
* **Frontend:** Vite, React, Lucide Icons, Vanilla CSS
* **Backend:** Node.js, Express, JSON Web Tokens (JWT), bcryptjs (Unique salting logic)
* **Database:** Supabase (Postgres) with local memory fallback seeder

---

## 🔑 Default Test Credentials
Use the following credentials to evaluate the app:

| Role / Status | Email Address | Password | Details |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@digitalheroes.co.in` | `admin123` | Control Panel access |
| **Active Subscriber** | `golfguy@digitalheroes.co.in` | `user123` | Active subscription ($250 balance) |
| **Active Subscriber** | `sarah.jones@gmail.com` | `user123` | Active subscription |
| **Inactive Subscriber** | `tom.watson@yahoo.com` | `user123` | Inactive (checkout required) |

*Note: All subscriber accounts (`user-sub1` through `user-sub12`) share the default password `user123`.*

---

## ⚙️ Local Setup & Installation

### 1. Prerequisites
Ensure you have **Node.js** (v18+) and **npm** installed.

### 2. Installation
Clone the repository, go to the root directory, and install all dependencies for both the frontend client and backend server:
```bash
npm run install-all
```

### 3. Environment Variables
Create a `.env` file in the root directory:
```env
# Server Config
PORT=5000
JWT_SECRET=your_jwt_secret_here

# Live Supabase connection
# (If left empty, the server automatically boots in offline mock-memory fallback mode)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Running Locally
Run both client and server development setups concurrently:
```bash
npm run dev
```
* The frontend will be available at `http://localhost:3000`
* The backend will run at `http://localhost:5000`

---

## 🗄️ Database Setup (Supabase)
To instantiate the SQL schema:
1. Navigate to the SQL Editor in your **Supabase Dashboard**.
2. Copy and run the contents of [schema.sql](file:///c:/Digital-heroes%20prd/schema.sql).
3. The SQL schema disables RLS by default. If RLS is enabled, ensure you add the `SUPABASE_SERVICE_ROLE_KEY` to your environment variables so the server can securely bypass RLS rules to seed the tables.

---

## 📈 Architecture & Self-Healing Seeder
The backend connects to Supabase and automatically executes a **self-healing upsert script** on startup. If database records are missing or partially populated, it synchronizes all initial charities, users, scores, draws, and winners in correct order of dependency without throwing constraint errors.
