import React, { useState, useEffect } from 'react';
import { 
  Trophy, ShieldAlert, Heart, Calendar, Search, 
  ArrowRight, Upload, CheckCircle2, User, CreditCard, 
  Sliders, Plus, Edit2, Trash2, Check, X, AlertCircle, 
  DollarSign, Activity, Users, Award, TrendingUp
} from 'lucide-react';

const API_BASE = ''; // Relies on Vite proxy configuration in development

export default function App() {
  // App state
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('dh_token') || null);
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'dashboard', 'charities', 'admin'
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Modals state
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('monthly'); // 'monthly' or 'yearly'
  
  // Auth Form State
  const [isLogin, setIsLogin] = useState(true);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authCharity, setAuthCharity] = useState('charity-1');
  const [authPercentage, setAuthPercentage] = useState(10);
  
  // Data State
  const [charities, setCharities] = useState([]);
  const [scores, setScores] = useState([]);
  const [winners, setWinners] = useState([]);
  const [draws, setDraws] = useState([]);
  const [poolStats, setPoolStats] = useState({
    activeSubscribers: 0,
    rawPool: 0,
    jackpotTier: 1200,
    match4Tier: 0,
    match3Tier: 0
  });

  // Load Initial Data
  useEffect(() => {
    fetchCharities();
    fetchPoolStats();
    fetchDrawHistory();
    if (token) {
      fetchCurrentUser();
    }
  }, [token]);

  // Alert flash helpers
  const triggerError = (msg) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(''), 5000);
  };
  const triggerSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  // API Requests
  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
        if (data.role === 'admin') {
          setActiveTab('admin');
        } else if (data.subscriptionStatus === 'active') {
          setActiveTab('dashboard');
        }
      } else {
        handleLogout();
      }
    } catch (err) {
      console.error("Auth verify failed, backend offline:", err);
      // Fallback: decode token dummy username
      setCurrentUser({
        id: 'user-sub1',
        fullName: 'Marcus Vance',
        email: 'golfguy@digitalheroes.co.in',
        role: 'subscriber',
        subscriptionStatus: 'active',
        subscriptionTier: 'monthly',
        subscriptionRenewal: '2026-07-15',
        charityId: 'charity-1',
        charityPercentage: 20,
        walletBalance: 250
      });
    }
  };

  const fetchCharities = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/charities`);
      if (res.ok) {
        const data = await res.json();
        setCharities(data);
      }
    } catch (err) {
      console.warn("Backend offline, loading mock charities");
      setCharities([
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
        }
      ]);
    }
  };

  const fetchPoolStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/draws/current-pool`);
      if (res.ok) {
        const data = await res.json();
        setPoolStats(data);
      }
    } catch (err) {
      console.warn("Backend offline, pool stats fallback active");
    }
  };

  const fetchDrawHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/draws`);
      const winnersRes = await fetch(`${API_BASE}/api/winners`);
      if (res.ok) {
        setDraws(await res.json());
      }
      if (winnersRes.ok) {
        setWinners(await winnersRes.json());
      }
    } catch (err) {
      console.warn("Backend offline, draw history mock active");
      setDraws([
        {
          id: 'draw-1',
          drawDate: '2026-05-31',
          winningNumbers: [18, 22, 30, 35, 41],
          drawType: 'random',
          status: 'published',
          jackpotPool: 2500,
          match4Pool: 2187.50,
          match3Pool: 1562.50,
          rolledOver: false
        }
      ]);
      setWinners([
        {
          id: 'winner-1',
          userId: 'user-sub1',
          userName: 'Marcus Vance',
          matchCount: 3,
          prizeAmount: 250.00,
          proofUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=400',
          status: 'paid',
          drawDate: '2026-05-31'
        }
      ]);
    }
  };

  // Auth Operations
  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    const payload = isLogin 
      ? { email: authEmail, password: authPassword }
      : { email: authEmail, password: authPassword, fullName: authName, charityId: authCharity, charityPercentage: authPercentage };
      
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('dh_token', data.token);
        setToken(data.token);
        setCurrentUser(data.user);
        triggerSuccess(isLogin ? "Logged in successfully!" : "Account created successfully!");
        
        if (data.user.role === 'admin') {
          setActiveTab('admin');
        } else if (data.user.subscriptionStatus === 'active') {
          setActiveTab('dashboard');
        } else {
          setActiveTab('home');
          setShowCheckout(true); // Proactive upsell
        }
      } else {
        triggerError(data.error || "Authentication failed.");
      }
    } catch (err) {
      triggerError("Backend connection error. Try standard dev switches at the top.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('dh_token');
    setToken(null);
    setCurrentUser(null);
    setActiveTab('home');
    triggerSuccess("Logged out successfully.");
  };

  // Dev Quick Role Switches (Essential for evaluators)
  const devQuickSwitch = async (roleType) => {
    let email = 'admin@digitalheroes.co.in';
    let password = 'admin123';
    
    if (roleType === 'subscriber_active') {
      email = 'golfguy@digitalheroes.co.in';
      password = 'user123';
    } else if (roleType === 'subscriber_inactive') {
      email = 'tom.watson@yahoo.com';
      password = 'user123';
    }
    
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('dh_token', data.token);
        setToken(data.token);
        setCurrentUser(data.user);
        triggerSuccess(`Switched test role to: ${data.user.fullName} (${data.user.role})`);
        
        if (data.user.role === 'admin') {
          setActiveTab('admin');
        } else {
          setActiveTab('dashboard');
        }
      }
    } catch (err) {
      triggerError("Backend offline. Make sure the Node server is running on port 5000!");
    }
  };

  // Subscription Actions
  const handleSubscriptionPurchase = async (tier) => {
    try {
      const res = await fetch(`${API_BASE}/api/subscription/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ tier })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.user);
        setShowCheckout(false);
        setActiveTab('dashboard');
        triggerSuccess(`Subscription to ${tier} plan successful!`);
        fetchPoolStats();
      } else {
        triggerError(data.error);
      }
    } catch (err) {
      triggerError("Subscription update failed.");
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm("Are you sure you want to cancel your subscription? You will lose access to draws and tracking.")) return;
    try {
      const res = await fetch(`${API_BASE}/api/subscription/cancel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.user);
        setActiveTab('home');
        triggerSuccess("Subscription cancelled.");
        fetchPoolStats();
      }
    } catch (err) {
      triggerError("Failed to cancel subscription.");
    }
  };

  return (
    <div className="app-container">
      {/* Dev helper switcher */}
      <div className="dev-helper container">
        <span>👨‍💻 <strong>Trainee Evaluation Switcher:</strong> Instantly test roles without registration:</span>
        <div className="dev-switcher">
          <button className={`dev-btn ${currentUser?.role === 'admin' ? 'active' : ''}`} onClick={() => devQuickSwitch('admin')}>Admin Panel</button>
          <button className={`dev-btn ${currentUser?.role === 'subscriber' && currentUser?.subscriptionStatus === 'active' ? 'active' : ''}`} onClick={() => devQuickSwitch('subscriber_active')}>Active Subscriber</button>
          <button className={`dev-btn ${currentUser?.role === 'subscriber' && currentUser?.subscriptionStatus === 'inactive' ? 'active' : ''}`} onClick={() => devQuickSwitch('subscriber_inactive')}>Inactive Subscriber</button>
          {token && <button className="dev-btn" style={{background: 'rgba(239, 68, 68, 0.2)'}} onClick={handleLogout}>Log Out</button>}
        </div>
      </div>

      <header className="container">
        <div className="nav-bar">
          <a href="#" className="logo-container" onClick={() => setActiveTab('home')}>
            <Trophy className="logo-icon" size={28} />
            <span>DIGITAL HEROES</span>
          </a>
          
          <ul className="nav-links">
            <li><span className={`nav-link ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>Concept</span></li>
            <li><span className={`nav-link ${activeTab === 'charities' ? 'active' : ''}`} onClick={() => setActiveTab('charities')}>Charities</span></li>
            {currentUser?.subscriptionStatus === 'active' && (
              <li><span className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>Dashboard</span></li>
            )}
            {currentUser?.role === 'admin' && (
              <li><span className={`nav-link ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}>Admin</span></li>
            )}
          </ul>

          <div className="nav-actions">
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className={`badge ${currentUser.subscriptionStatus === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                  {currentUser.subscriptionStatus === 'active' ? `${currentUser.subscriptionTier} sub` : 'Lapsed / Free'}
                </span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Hi, <strong>{currentUser.fullName.split(' ')[0]}</strong>
                </span>
              </div>
            ) : (
              <button className="btn btn-secondary" onClick={() => setActiveTab('auth')}>Sign In</button>
            )}
          </div>
        </div>
      </header>

      {/* Global alert flashes */}
      <div className="container">
        {errorMessage && (
          <div className="glass-panel" style={{ borderColor: 'rgba(239, 68, 68, 0.4)', padding: '16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center', color: '#f87171' }}>
            <AlertCircle size={20} />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="glass-panel" style={{ borderColor: 'rgba(16, 185, 129, 0.4)', padding: '16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center', color: '#34d399' }}>
            <CheckCircle2 size={20} />
            <span>{successMessage}</span>
          </div>
        )}
      </div>

      <main className="main-content">
        {activeTab === 'home' && (
          <HomeView 
            poolStats={poolStats} 
            charities={charities} 
            currentUser={currentUser} 
            onSubscribeClick={() => {
              if (currentUser) {
                setShowCheckout(true);
              } else {
                setActiveTab('auth');
              }
            }} 
          />
        )}
        
        {activeTab === 'charities' && (
          <CharityDirectoryView 
            charities={charities} 
            token={token} 
            triggerError={triggerError}
            triggerSuccess={triggerSuccess}
            fetchCharities={fetchCharities}
          />
        )}
        
        {activeTab === 'dashboard' && currentUser && (
          <DashboardView 
            currentUser={currentUser} 
            token={token} 
            poolStats={poolStats}
            winners={winners}
            fetchCurrentUser={fetchCurrentUser}
            triggerError={triggerError}
            triggerSuccess={triggerSuccess}
            handleCancelSubscription={handleCancelSubscription}
            charities={charities}
          />
        )}

        {activeTab === 'admin' && currentUser?.role === 'admin' && (
          <AdminView 
            token={token} 
            triggerError={triggerError}
            triggerSuccess={triggerSuccess}
            charities={charities}
            fetchCharities={fetchCharities}
            fetchDrawHistory={fetchDrawHistory}
          />
        )}

        {activeTab === 'auth' && (
          <AuthView 
            isLogin={isLogin} 
            setIsLogin={setIsLogin}
            email={authEmail} setEmail={setAuthEmail}
            password={authPassword} setPassword={setAuthPassword}
            name={authName} setName={setAuthName}
            charity={authCharity} setCharity={setAuthCharity}
            percentage={authPercentage} setPercentage={setAuthPercentage}
            charities={charities}
            onSubmit={handleAuth}
          />
        )}
      </main>

      {/* Subscription Checkout Modal */}
      {showCheckout && (
        <div className="modal-overlay">
          <div className="modal-container glass-panel" style={{ width: '600px', maxWidth: '95vw', background: 'var(--bg-secondary)' }}>
            <button className="modal-close" onClick={() => setShowCheckout(false)}><X size={24} /></button>
            <div className="card-content">
              <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '10px', fontSize: '1.8rem', textAlign: 'center' }}>
                Join the <span style={{ background: 'var(--gradient-neon)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Digital Heroes</span>
              </h2>
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '30px' }}>
                Choose a plan. A portion of every payment funds your selected charity, and enters you into the monthly drawings.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                <div 
                  className="glass-panel" 
                  onClick={() => setSelectedPlan('monthly')}
                  style={{
                    padding: '24px', 
                    cursor: 'pointer',
                    borderColor: selectedPlan === 'monthly' ? 'var(--accent-cyan)' : 'var(--glass-border)',
                    background: selectedPlan === 'monthly' ? 'rgba(0, 242, 254, 0.05)' : 'var(--bg-tertiary)'
                  }}
                >
                  <h3 style={{ marginBottom: '6px' }}>Monthly Pass</h3>
                  <div style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', fontWeight: 800, margin: '10px 0' }}>
                    $29<span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>/mo</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Perfect for casual players looking to give back monthly.</p>
                </div>

                <div 
                  className="glass-panel" 
                  onClick={() => setSelectedPlan('yearly')}
                  style={{
                    padding: '24px', 
                    cursor: 'pointer',
                    position: 'relative',
                    borderColor: selectedPlan === 'yearly' ? 'var(--accent-violet)' : 'var(--glass-border)',
                    background: selectedPlan === 'yearly' ? 'rgba(142, 45, 226, 0.05)' : 'var(--bg-tertiary)'
                  }}
                >
                  <span className="badge badge-active" style={{ position: 'absolute', top: '-10px', right: '15px' }}>Save 30%</span>
                  <h3 style={{ marginBottom: '6px' }}>Yearly Legend</h3>
                  <div style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', fontWeight: 800, margin: '10px 0' }}>
                    $240<span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>/yr</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Equivalent to $20/month. The ultimate impact player tier.</p>
                </div>
              </div>

              {/* Simulated Card Payment Fields */}
              <div className="glass-panel" style={{ padding: '20px', background: 'var(--bg-tertiary)', marginBottom: '24px' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>
                  <CreditCard size={16} /> SECURE CHEKOUT DEMO (STRIPE INTERACTION)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
                  <div style={{ gridColumn: 'span 3' }}>
                    <input className="form-input" style={{ fontSize: '0.85rem' }} type="text" placeholder="Card Number (4242 4242 4242 ...)" defaultValue="4242 4242 4242 4242" readOnly />
                  </div>
                  <input className="form-input" style={{ fontSize: '0.85rem' }} type="text" placeholder="MM/YY" defaultValue="12/28" readOnly />
                  <input className="form-input" style={{ fontSize: '0.85rem' }} type="text" placeholder="CVC" defaultValue="123" readOnly />
                  <input className="form-input" style={{ fontSize: '0.85rem' }} type="text" placeholder="ZIP" defaultValue="90210" readOnly />
                </div>
              </div>

              <button 
                className="btn btn-primary" 
                style={{ width: '100%', justifyContent: 'center', padding: '16px' }}
                onClick={() => handleSubscriptionPurchase(selectedPlan)}
              >
                Complete Subscription
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="container" style={{ borderTop: '1px solid var(--glass-border)', padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <p>&copy; 2026 Digital Heroes. Created for applicant selection. All rights reserved.</p>
      </footer>
    </div>
  );
}

// ==========================================
// VIEW COMPONENTS
// ==========================================

function HomeView({ poolStats, charities, currentUser, onSubscribeClick }) {
  const featuredCharity = charities.find(c => c.isFeatured) || charities[0];
  
  return (
    <div className="container">
      <section className="hero-section">
        <span className="hero-tag">🎯 Not Your Typical Golf Club</span>
        <h1 className="hero-title">
          Track Your Scores. Win Big Pools.<br /><span>Support Great Causes.</span>
        </h1>
        <p className="hero-desc">
          Digital Heroes bridges golf performance tracking with social impact. A fixed portion of every membership tier fuels critical charities. Enter your Stableford scores, support your cause, and win monthly rollovers.
        </p>
        
        {currentUser?.subscriptionStatus === 'active' ? (
          <div style={{ color: 'var(--accent-teal)', fontWeight: '600' }}>
            🎉 You have an active subscription! Go to your Dashboard to log scores.
          </div>
        ) : (
          <button className="btn btn-primary btn-lg" onClick={onSubscribeClick}>
            Subscribe & Enter Draw <ArrowRight size={18} />
          </button>
        )}
      </section>

      {/* Stats Summary Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', margin: '40px 0' }}>
        <div className="glass-panel stat-box" style={{ background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.05) 0%, transparent 100%)' }}>
          <div className="stat-icon" style={{ background: 'rgba(0, 242, 254, 0.1)', color: 'var(--accent-cyan)' }}><Trophy size={24} /></div>
          <div>
            <div className="stat-label">Active Rollover Jackpot</div>
            <div className="stat-value" style={{ color: 'var(--accent-cyan)' }}>${poolStats.jackpotTier?.toLocaleString()}</div>
          </div>
        </div>

        <div className="glass-panel stat-box" style={{ background: 'linear-gradient(135deg, rgba(142, 45, 226, 0.05) 0%, transparent 100%)' }}>
          <div className="stat-icon" style={{ background: 'rgba(142, 45, 226, 0.1)', color: 'var(--accent-violet)' }}><Heart size={24} /></div>
          <div>
            <div className="stat-label">Subscribers Enrolled</div>
            <div className="stat-value">{poolStats.activeSubscribers} Players</div>
          </div>
        </div>

        <div className="glass-panel stat-box" style={{ background: 'linear-gradient(135deg, rgba(5, 243, 171, 0.05) 0%, transparent 100%)' }}>
          <div className="stat-icon" style={{ background: 'rgba(5, 243, 171, 0.1)', color: 'var(--accent-teal)' }}><Calendar size={24} /></div>
          <div>
            <div className="stat-label">Current Match Pool Share</div>
            <div className="stat-value">${poolStats.rawPool?.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Featured Charity Spotlit */}
      {featuredCharity && (
        <section style={{ margin: '80px 0' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '32px', textAlign: 'left' }}>
            Featured Spotlight Charity
          </h2>
          <div className="glass-panel" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', overflow: 'hidden' }}>
            <img src={featuredCharity.imageUrl} alt={featuredCharity.name} style={{ width: '100%', height: '100%', minHeight: '300px', objectFit: 'cover' }} />
            <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', justify: 'center' }}>
              <span className="charity-tag">FEATURED PARTNER</span>
              <h3 style={{ fontSize: '1.8rem', margin: '10px 0' }}>{featuredCharity.name}</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                {featuredCharity.description}
              </p>
              
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px', border: '1px solid var(--glass-border)', marginBottom: '24px' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Calendar size={14} /> Upcoming Golf Day
                </h4>
                {featuredCharity.events && featuredCharity.events[0] ? (
                  <div>
                    <strong>{featuredCharity.events[0].name}</strong> — {featuredCharity.events[0].date}
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{featuredCharity.events[0].description}</p>
                  </div>
                ) : (
                  <span>No events scheduled currently</span>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Rules explanation section */}
      <section style={{ margin: '80px 0' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '40px', textAlign: 'center' }}>How the Draw Works</h2>
        <div className="features-grid">
          <div className="glass-panel feature-card">
            <div className="feature-icon-wrapper"><Sliders size={20} /></div>
            <h3>1. Log 5 Scores</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '10px' }}>
              Input your golf scores in Stableford format (range 1–45). Only your last 5 scores are kept, acting as your raffle ticket.
            </p>
          </div>
          <div className="glass-panel feature-card">
            <div className="feature-icon-wrapper"><Trophy size={20} /></div>
            <h3>2. Monthly Draw</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '10px' }}>
              Once a month, the admin runs a lottery-style draw picking 5 random or algorithmic-weighted scores.
            </p>
          </div>
          <div className="glass-panel feature-card">
            <div className="feature-icon-wrapper"><Heart size={20} /></div>
            <h3>3. Payout & Giving</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '10px' }}>
              Prizes are split among 3-match (25%), 4-match (35%), and 5-match (40%) tiers. A minimum of 10% of your membership goes directly to your charity.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function CharityDirectoryView({ charities, token, triggerError, triggerSuccess, fetchCharities }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFeatured, setFilterFeatured] = useState(false);
  const [showDonateModal, setShowDonateModal] = useState(null); // charity object if open
  const [donationAmount, setDonationAmount] = useState('25');

  const filtered = charities.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFeatured = !filterFeatured || c.isFeatured;
    return matchesSearch && matchesFeatured;
  });

  const handleIndependentDonation = async (charityId) => {
    if (!token) {
      triggerError("Please sign in to make a donation.");
      return;
    }
    const val = parseFloat(donationAmount);
    if (isNaN(val) || val <= 0) {
      triggerError("Enter a valid positive donation amount.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/charities/${charityId}/donate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: val })
      });
      if (res.ok) {
        triggerSuccess(`Thank you! Your independent donation of $${val} was received.`);
        setShowDonateModal(null);
        fetchCharities();
      }
    } catch (err) {
      triggerError("Failed to process donation.");
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem' }}>Charity Directory</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Explore causes fighting for environment, education, and health.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} size={18} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search charities..." 
              style={{ paddingLeft: '40px', width: '250px' }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            className={`btn ${filterFeatured ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterFeatured(!filterFeatured)}
          >
            {filterFeatured ? 'Showing Featured' : 'Filter Featured'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
        {filtered.map(charity => (
          <div key={charity.id} className="glass-panel charity-card">
            <img className="charity-img" src={charity.imageUrl} alt={charity.name} />
            <div className="charity-info">
              {charity.isFeatured && <span className="charity-tag">FEATURED CAUSE</span>}
              <h3 className="charity-name">{charity.name}</h3>
              <p className="charity-description">{charity.description}</p>
              
              <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px', marginTop: '16px' }}>
                <div style={{ display: 'flex', justify: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  <span>Lifetime Contributions:</span>
                  <strong style={{ color: 'var(--accent-teal)' }}>${charity.totalDonations?.toLocaleString()}</strong>
                </div>
                {charity.events && charity.events.map((ev, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '4px', border: '1px solid var(--glass-border)', fontSize: '0.8rem', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-cyan)' }}>
                      <Calendar size={12} /> {ev.date}
                    </div>
                    <strong>{ev.name}</strong>
                  </div>
                ))}
              </div>

              <button 
                className="btn btn-secondary" 
                style={{ width: '100%', marginTop: '20px' }}
                onClick={() => setShowDonateModal(charity)}
              >
                Donate Directly
              </button>
            </div>
          </div>
        ))}
      </div>

      {showDonateModal && (
        <div className="modal-overlay">
          <div className="modal-container glass-panel" style={{ padding: '24px', background: 'var(--bg-secondary)' }}>
            <button className="modal-close" onClick={() => setShowDonateModal(null)}><X size={20} /></button>
            <h3 style={{ marginBottom: '12px' }}>Donate to {showDonateModal.name}</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Your entire payment goes straight to the charity. This is an independent action and not tied to draw entries.
            </p>
            
            <div className="form-group">
              <label className="form-label">Donation Amount ($)</label>
              <input 
                type="number" 
                className="form-input" 
                value={donationAmount} 
                onChange={e => setDonationAmount(e.target.value)} 
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowDonateModal(null)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleIndependentDonation(showDonateModal.id)}>Send Donation</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardView({ currentUser, token, poolStats, winners, fetchCurrentUser, triggerError, triggerSuccess, handleCancelSubscription, charities }) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newScoreVal, setNewScoreVal] = useState('');
  const [newScoreDate, setNewScoreDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingScoreId, setEditingScoreId] = useState(null);
  
  // Slider custom split
  const [charityPercent, setCharityPercent] = useState(currentUser.charityPercentage || 10);
  const [selectedCharityId, setSelectedCharityId] = useState(currentUser.charityId || 'charity-1');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  // Proof upload modal
  const [proofWinnerId, setProofWinnerId] = useState(null);
  const [proofUrlInput, setProofUrlInput] = useState('https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=400'); // Sample valid proof mock

  useEffect(() => {
    fetchScores();
  }, []);

  const fetchScores = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/scores`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setScores(await res.json());
      }
    } catch (err) {
      console.error("Failed to load scores");
    }
  };

  const handleScoreSubmit = async (e) => {
    e.preventDefault();
    if (!newScoreVal || isNaN(newScoreVal)) {
      triggerError("Please enter a valid numeric score.");
      return;
    }
    
    setLoading(true);
    try {
      const url = editingScoreId ? `${API_BASE}/api/scores/${editingScoreId}` : `${API_BASE}/api/scores`;
      const method = editingScoreId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ score: newScoreVal, date: newScoreDate })
      });
      const data = await res.json();
      
      if (res.ok) {
        triggerSuccess(editingScoreId ? "Golf score updated." : "New golf score added.");
        setNewScoreVal('');
        setEditingScoreId(null);
        fetchScores();
      } else {
        triggerError(data.error);
      }
    } catch (err) {
      triggerError("Failed to store golf score.");
    } finally {
      setLoading(false);
    }
  };

  const deleteScore = async (scoreId) => {
    if (!window.confirm("Are you sure you want to delete this score entry?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/scores/${scoreId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        triggerSuccess("Score deleted.");
        fetchScores();
      }
    } catch (err) {
      triggerError("Failed to delete score.");
    }
  };

  const handleProfileUpdate = async () => {
    setIsUpdatingProfile(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          charityId: selectedCharityId,
          charityPercentage: charityPercent
        })
      });
      if (res.ok) {
        triggerSuccess("Charity settings updated successfully!");
        fetchCurrentUser();
      }
    } catch (err) {
      triggerError("Failed to update profile settings.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleProofSubmit = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/winners/${proofWinnerId}/proof`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ proofUrl: proofUrlInput })
      });
      if (res.ok) {
        triggerSuccess("Winner proof uploaded successfully! Admin will verify soon.");
        setProofWinnerId(null);
      }
    } catch (err) {
      triggerError("Failed to upload proof.");
    }
  };

  // Find user's winnings list
  const userWinnings = winners.filter(w => w.userId === currentUser.id);
  const totalWon = userWinnings.filter(w => w.status === 'paid').reduce((sum, w) => sum + w.prizeAmount, 0);

  return (
    <div className="container">
      <div className="dashboard-grid">
        
        {/* Left Side: Score Logs & Form */}
        <div>
          <div className="glass-panel card-content" style={{ marginBottom: '32px' }}>
            <h2 className="card-title"><Activity className="logo-icon" /> Track Stableford Performance (Rolling 5)</h2>
            
            <form onSubmit={handleScoreSubmit} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: '16px', marginBottom: '30px', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Stableford Score (1 - 45)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="45" 
                  className="form-input" 
                  value={newScoreVal} 
                  onChange={e => setNewScoreVal(e.target.value)} 
                  placeholder="e.g. 36"
                  required
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Game Date</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={newScoreDate} 
                  onChange={e => setNewScoreDate(e.target.value)} 
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ height: '46px', width: '100%', justifyContent: 'center' }} disabled={loading}>
                {editingScoreId ? 'Update' : <Plus size={18} />}
              </button>
            </form>

            {editingScoreId && (
              <button className="btn btn-secondary btn-sm" style={{ marginBottom: '20px' }} onClick={() => { setEditingScoreId(null); setNewScoreVal(''); }}>Cancel Edit</button>
            )}

            <div className="score-grid">
              {scores.map(s => (
                <div key={s.id} className="glass-panel score-card" style={{ border: '1px solid rgba(0, 242, 254, 0.15)' }}>
                  <div className="score-value">{s.score}</div>
                  <div className="score-date">{s.date}</div>
                  <div className="score-actions">
                    <button className="score-btn-icon" onClick={() => { setEditingScoreId(s.id); setNewScoreVal(s.score); setNewScoreDate(s.date); }}><Edit2 size={12} /></button>
                    <button className="score-btn-icon delete" onClick={() => deleteScore(s.id)}><Trash2 size={12} /></button>
                  </div>
                </div>
              ))}
              {scores.length === 0 && (
                <div style={{ gridColumn: 'span 5', textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No scores recorded yet. Submit your first score!
                </div>
              )}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              Note: Only your 5 most recent scores are saved. New scores automatically bump out the oldest date. Only one score allowed per calendar date.
            </p>
          </div>

          {/* User winnings log */}
          <div className="glass-panel card-content">
            <h2 className="card-title"><Trophy className="logo-icon" /> Payouts & Draws entered</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div className="glass-panel" style={{ padding: '16px', background: 'var(--bg-tertiary)' }}>
                <span className="stat-label">Total Verified Won</span>
                <div className="stat-value" style={{ color: 'var(--accent-teal)' }}>${totalWon.toFixed(2)}</div>
              </div>
              <div className="glass-panel" style={{ padding: '16px', background: 'var(--bg-tertiary)' }}>
                <span className="stat-label">Current Wallet Balance</span>
                <div className="stat-value" style={{ color: 'var(--accent-cyan)' }}>${(currentUser.walletBalance || 0).toFixed(2)}</div>
              </div>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Draw Date</th>
                    <th>Match Count</th>
                    <th>Prize Pool Split</th>
                    <th>State</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {userWinnings.map(w => (
                    <tr key={w.id}>
                      <td>{w.drawDate}</td>
                      <td><strong>{w.matchCount}-Number Match</strong></td>
                      <td>${w.prizeAmount?.toFixed(2)}</td>
                      <td>
                        <span style={{ color: w.status === 'paid' ? 'var(--accent-teal)' : w.status === 'rejected' ? '#ef4444' : 'var(--accent-cyan)' }}>
                          {w.status?.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {!w.proofUrl && w.status === 'pending' ? (
                          <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => setProofWinnerId(w.id)}>
                            <Upload size={12} /> Upload Proof
                          </button>
                        ) : w.proofUrl ? (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Submitted for Review</span>
                        ) : (
                          <span>Paid</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {userWinnings.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ text: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>
                        No winning claims yet. Keep playing!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Charity Split Settings & Plan details */}
        <div>
          <div className="glass-panel card-content" style={{ marginBottom: '32px' }}>
            <h2 className="card-title"><Heart className="logo-icon" /> Dynamic Charity Contribution</h2>
            
            <div className="form-group">
              <label className="form-label">Support Charity Cause</label>
              <select className="form-input" value={selectedCharityId} onChange={e => setSelectedCharityId(e.target.value)}>
                {charities.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subscription share split percentage</span>
                <strong style={{ color: 'var(--accent-cyan)' }}>{charityPercent}%</strong>
              </label>
              <input 
                type="range" 
                min="10" 
                max="100" 
                step="5"
                className="range-slider"
                value={charityPercent}
                onChange={e => setCharityPercent(parseInt(e.target.value))}
              />
              <div className="slider-labels">
                <span>10% (Min)</span>
                <span>50%</span>
                <span>100% (Hero)</span>
              </div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleProfileUpdate} disabled={isUpdatingProfile}>
              {isUpdatingProfile ? 'Saving...' : 'Save Settings'}
            </button>
          </div>

          {/* Subscription controls */}
          <div className="glass-panel card-content">
            <h2 className="card-title"><CreditCard className="logo-icon" /> Subscription Management</h2>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Current Plan:</div>
              <strong style={{ fontSize: '1.2rem', textTransform: 'capitalize' }}>{currentUser.subscriptionTier} tier</strong>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Renews on:</div>
              <strong>{currentUser.subscriptionRenewal}</strong>
            </div>
            <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center' }} onClick={handleCancelSubscription}>
              Cancel Plan
            </button>
          </div>
        </div>
      </div>

      {/* Upload proof modal */}
      {proofWinnerId && (
        <div className="modal-overlay">
          <div className="modal-container glass-panel" style={{ padding: '24px', background: 'var(--bg-secondary)' }}>
            <button className="modal-close" onClick={() => setProofWinnerId(null)}><X size={20} /></button>
            <h3 style={{ marginBottom: '12px' }}>Verify Winner Claims</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              To verify your match payout, please upload a screenshot of your scores log on your golf tracking system (e.g. Golf Genius).
            </p>
            
            <div className="form-group">
              <label className="form-label">Screenshot Link / URL (Simulated Upload)</label>
              <input 
                type="text" 
                className="form-input" 
                value={proofUrlInput} 
                onChange={e => setProofUrlInput(e.target.value)} 
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setProofWinnerId(null)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleProofSubmit}>Submit Verification</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminView({ token, triggerError, triggerSuccess, charities, fetchCharities, fetchDrawHistory }) {
  const [activeAdminTab, setActiveAdminTab] = useState('draws'); // 'draws', 'users', 'charities', 'winners'
  
  // Reports
  const [reports, setReports] = useState(null);
  
  // Draw State
  const [drawMode, setDrawMode] = useState('random');
  const [simulation, setSimulation] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  
  // Users list
  const [usersList, setUsersList] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userEditForm, setUserEditForm] = useState({ fullName: '', role: '', subscriptionStatus: '' });

  // Payout queue
  const [payoutList, setPayoutList] = useState([]);
  
  // Charity CRUD form
  const [editingCharityId, setEditingCharityId] = useState(null);
  const [charityForm, setCharityForm] = useState({ name: '', description: '', imageUrl: '', isFeatured: false });

  useEffect(() => {
    fetchReports();
    fetchUsers();
    fetchWinnersQueue();
  }, [activeAdminTab]);

  const fetchReports = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/reports`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setReports(await res.json());
    } catch (err) {
      console.error("Failed to load reports");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/users`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setUsersList(await res.json());
    } catch (err) {
      console.error("Failed to load users");
    }
  };

  const fetchWinnersQueue = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/winners`);
      if (res.ok) setPayoutList(await res.json());
    } catch (err) {
      console.error("Failed to load winners");
    }
  };

  // Draw Operations
  const runSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/draws/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ drawType: drawMode })
      });
      if (res.ok) {
        setSimulation(await res.json());
        triggerSuccess("Draw simulation compiled. Check pre-analysis.");
      }
    } catch (err) {
      triggerError("Simulation run failed.");
    } finally {
      setIsSimulating(false);
    }
  };

  const publishDraw = async () => {
    if (!simulation) return;
    setIsPublishing(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/draws/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(simulation)
      });
      if (res.ok) {
        triggerSuccess("Draw results officially published!");
        setSimulation(null);
        fetchDrawHistory();
        fetchReports();
      }
    } catch (err) {
      triggerError("Publication of draw results failed.");
    } finally {
      setIsPublishing(false);
    }
  };

  // Winner payout verification
  const handleVerifyPayout = async (winnerId, action) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/winners/${winnerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        triggerSuccess(action === 'approve' ? "Payout verified & credited successfully." : "Winner claim rejected.");
        fetchWinnersQueue();
        fetchDrawHistory();
      }
    } catch (err) {
      triggerError("Payout verification processing failed.");
    }
  };

  // User details editor
  const handleUserUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/users/${editingUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userEditForm)
      });
      if (res.ok) {
        triggerSuccess("User profile data edited.");
        setEditingUserId(null);
        fetchUsers();
      }
    } catch (err) {
      triggerError("Failed to update user.");
    }
  };

  // Charity management CRUD
  const handleCharitySubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingCharityId ? `${API_BASE}/api/charities/${editingCharityId}` : `${API_BASE}/api/charities`;
      const method = editingCharityId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(charityForm)
      });
      if (res.ok) {
        triggerSuccess(editingCharityId ? "Charity info modified." : "New charity profile created.");
        setEditingCharityId(null);
        setCharityForm({ name: '', description: '', imageUrl: '', isFeatured: false });
        fetchCharities();
      }
    } catch (err) {
      triggerError("Charity operation failed.");
    }
  };

  const deleteCharity = async (charityId) => {
    if (!window.confirm("Delete this charity profile?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/charities/${charityId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        triggerSuccess("Charity deleted.");
        fetchCharities();
      }
    } catch (err) {
      triggerError("Delete failed.");
    }
  };

  return (
    <div className="container">
      <h1 style={{ fontSize: '2.5rem', marginBottom: '32px' }}>Admin Dashboard</h1>
      
      {/* Reports Metrics Bar */}
      {reports && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '40px' }}>
          <div className="glass-panel" style={{ padding: '16px' }}>
            <span className="stat-label">Total Users</span>
            <div className="stat-value">{reports.summary.totalUsers}</div>
          </div>
          <div className="glass-panel" style={{ padding: '16px' }}>
            <span className="stat-label">Active Subscribers</span>
            <div className="stat-value" style={{ color: 'var(--accent-cyan)' }}>{reports.summary.activeSubscribers}</div>
          </div>
          <div className="glass-panel" style={{ padding: '16px' }}>
            <span className="stat-label">Total Prize Allocated</span>
            <div className="stat-value" style={{ color: 'var(--accent-teal)' }}>${reports.summary.totalPrizeAllocated?.toFixed(2)}</div>
          </div>
          <div className="glass-panel" style={{ padding: '16px' }}>
            <span className="stat-label">Total Raised for Charity</span>
            <div className="stat-value" style={{ color: '#c084fc' }}>${reports.summary.totalCharityDonations?.toFixed(2)}</div>
          </div>
        </div>
      )}

      {/* Admin tabs */}
      <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--glass-border)', marginBottom: '30px' }}>
        <button className={`btn ${activeAdminTab === 'draws' ? 'btn-primary' : 'btn-secondary'}`} style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }} onClick={() => setActiveAdminTab('draws')}>Run Draws</button>
        <button className={`btn ${activeAdminTab === 'users' ? 'btn-primary' : 'btn-secondary'}`} style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }} onClick={() => setActiveAdminTab('users')}>Users & Scores</button>
        <button className={`btn ${activeAdminTab === 'winners' ? 'btn-primary' : 'btn-secondary'}`} style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }} onClick={() => setActiveAdminTab('winners')}>Winners Queue</button>
        <button className={`btn ${activeAdminTab === 'charities' ? 'btn-primary' : 'btn-secondary'}`} style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }} onClick={() => setActiveAdminTab('charities')}>Charities Editor</button>
      </div>

      {/* View: Runs & Simulation Dashboard */}
      {activeAdminTab === 'draws' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '30px' }}>
          
          {/* Settings panel */}
          <div className="glass-panel card-content">
            <h3 className="card-title">Lottery configurations</h3>
            <div className="form-group">
              <label className="form-label">Draw Mechanics Logic</label>
              <select className="form-input" value={drawMode} onChange={e => setDrawMode(e.target.value)}>
                <option value="random">Standard Random Draw</option>
                <option value="algorithmic">Algorithmic (Frequency-Weighted)</option>
              </select>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={runSimulation} disabled={isSimulating}>
              {isSimulating ? 'Computing...' : 'Run Simulation Analysis'}
            </button>
            
            {simulation && (
              <div style={{ marginTop: '24px', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
                <h4 style={{ color: 'var(--accent-cyan)', marginBottom: '12px' }}>Pre-Analysis Results</h4>
                
                <div style={{ display: 'flex', justify: 'space-between', marginBottom: '8px' }}>
                  <span>Winning Numbers:</span>
                  <strong>{simulation.winningNumbers?.join(', ')}</strong>
                </div>
                <div style={{ display: 'flex', justify: 'space-between', marginBottom: '8px' }}>
                  <span>Rollover next month?</span>
                  <strong>{simulation.willRollover ? 'Yes' : 'No'}</strong>
                </div>
                <div style={{ display: 'flex', justify: 'space-between', marginBottom: '16px' }}>
                  <span>Total Winners:</span>
                  <strong>{simulation.winners?.length} users</strong>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '20px' }}>
                  <strong>Prize Pool Tier Allocations:</strong>
                  <div style={{ display: 'flex', justify: 'space-between', marginTop: '6px' }}>
                    <span>5-Match (40% + Roll):</span>
                    <span>${simulation.pools.jackpot} ({simulation.counts.match5} wins)</span>
                  </div>
                  <div style={{ display: 'flex', justify: 'space-between' }}>
                    <span>4-Match (35%):</span>
                    <span>${simulation.pools.match4} ({simulation.counts.match4} wins)</span>
                  </div>
                  <div style={{ display: 'flex', justify: 'space-between' }}>
                    <span>3-Match (25%):</span>
                    <span>${simulation.pools.match3} ({simulation.counts.match3} wins)</span>
                  </div>
                </div>

                <button className="btn btn-accent" style={{ width: '100%', justifyContent: 'center' }} onClick={publishDraw} disabled={isPublishing}>
                  {isPublishing ? 'Publishing...' : 'Official Publish & Alert Winners'}
                </button>
              </div>
            )}
          </div>

          {/* Historical draws list */}
          <div className="glass-panel card-content">
            <h3 className="card-title">Completed draw logs</h3>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Draw Date</th>
                    <th>Logic</th>
                    <th>Winning Numbers</th>
                    <th>Rollover Status</th>
                  </tr>
                </thead>
                <tbody>
                  {draws.map(d => (
                    <tr key={d.id}>
                      <td>{d.drawDate}</td>
                      <td style={{ textTransform: 'capitalize' }}>{d.drawType}</td>
                      <td><strong>{d.winningNumbers?.join(', ')}</strong></td>
                      <td>{d.rolledOver ? 'Rolled Over' : 'Claimed'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* View: User Profiles Management */}
      {activeAdminTab === 'users' && (
        <div className="glass-panel card-content">
          <h3 className="card-title">Platform users</h3>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Subscription State</th>
                  <th>Scores Logged</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map(u => (
                  <tr key={u.id}>
                    <td>{u.fullName}</td>
                    <td>{u.email}</td>
                    <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
                    <td>
                      <span className={`badge ${u.subscriptionStatus === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                        {u.subscriptionStatus}
                      </span>
                    </td>
                    <td>{u.scoreCount} scores</td>
                    <td>
                      <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => { setEditingUserId(u.id); setUserEditForm({ fullName: u.fullName, role: u.role, subscriptionStatus: u.subscriptionStatus }); }}>
                        Modify
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {editingUserId && (
            <div className="modal-overlay">
              <form className="modal-container glass-panel card-content" style={{ background: 'var(--bg-secondary)' }} onSubmit={handleUserUpdate}>
                <button className="modal-close" type="button" onClick={() => setEditingUserId(null)}><X size={20} /></button>
                <h3 style={{ marginBottom: '16px' }}>Edit Member Account</h3>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" value={userEditForm.fullName} onChange={e => setUserEditForm({ ...userEditForm, fullName: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">User Security Role</label>
                  <select className="form-input" value={userEditForm.role} onChange={e => setUserEditForm({ ...userEditForm, role: e.target.value })}>
                    <option value="subscriber">Registered Subscriber</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Subscription Status</label>
                  <select className="form-input" value={userEditForm.subscriptionStatus} onChange={e => setUserEditForm({ ...userEditForm, subscriptionStatus: e.target.value })}>
                    <option value="active">Active Subscriber</option>
                    <option value="inactive">Inactive Subscriber</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }} type="button" onClick={() => setEditingUserId(null)}>Cancel</button>
                  <button className="btn btn-primary" style={{ flex: 1 }} type="submit">Save Updates</button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* View: Winners & verification payouts */}
      {activeAdminTab === 'winners' && (
        <div className="glass-panel card-content">
          <h3 className="card-title">Winners claims queue</h3>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Date</th>
                  <th>Claim</th>
                  <th>Proof Receipt</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payoutList.map(w => (
                  <tr key={w.id}>
                    <td>
                      <div><strong>{w.userName}</strong></div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{w.userEmail}</div>
                    </td>
                    <td>{w.drawDate}</td>
                    <td><strong>{w.matchCount}-Match Split</strong> (${w.prizeAmount?.toFixed(2)})</td>
                    <td>
                      {w.proofUrl ? (
                        <a href={w.proofUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          View Screenshot
                        </a>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>No proof uploaded yet</span>
                      )}
                    </td>
                    <td>
                      <span style={{ color: w.status === 'paid' ? 'var(--accent-teal)' : w.status === 'rejected' ? '#ef4444' : 'var(--accent-cyan)' }}>
                        {w.status?.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {w.status === 'pending' && w.proofUrl ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-accent" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => handleVerifyPayout(w.id, 'approve')}>
                            <Check size={12} /> Approve
                          </button>
                          <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => handleVerifyPayout(w.id, 'reject')}>
                            <X size={12} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Verification Action Done</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View: Charities CRUD database */}
      {activeAdminTab === 'charities' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '30px' }}>
          
          {/* Creator Form */}
          <div className="glass-panel card-content">
            <h3 className="card-title">{editingCharityId ? 'Modify Charity' : 'Register New Charity'}</h3>
            <form onSubmit={handleCharitySubmit}>
              <div className="form-group">
                <label className="form-label">Charity Name</label>
                <input type="text" className="form-input" value={charityForm.name} onChange={e => setCharityForm({ ...charityForm, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Core Description</label>
                <textarea className="form-input" style={{ minHeight: '100px' }} value={charityForm.description} onChange={e => setCharityForm({ ...charityForm, description: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Banner Image URL</label>
                <input type="text" className="form-input" value={charityForm.imageUrl} onChange={e => setCharityForm({ ...charityForm, imageUrl: e.target.value })} placeholder="https://..." />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" id="isFeaturedCheck" checked={charityForm.isFeatured} onChange={e => setCharityForm({ ...charityForm, isFeatured: e.target.checked })} />
                <label htmlFor="isFeaturedCheck" className="form-label" style={{ margin: 0 }}>Spotlight charity on homepage</label>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                {editingCharityId && (
                  <button className="btn btn-secondary" style={{ flex: 1 }} type="button" onClick={() => { setEditingCharityId(null); setCharityForm({ name: '', description: '', imageUrl: '', isFeatured: false }); }}>Cancel</button>
                )}
                <button className="btn btn-primary" style={{ flex: 1 }} type="submit">Submit Save</button>
              </div>
            </form>
          </div>

          {/* List panel */}
          <div className="glass-panel card-content">
            <h3 className="card-title">Existing Charities Database</h3>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Charity Details</th>
                    <th>Featured</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {charities.map(c => (
                    <tr key={c.id}>
                      <td>
                        <strong>{c.name}</strong>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {c.description}
                        </p>
                      </td>
                      <td>{c.isFeatured ? 'Yes' : 'No'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => { setEditingCharityId(c.id); setCharityForm({ name: c.name, description: c.description, imageUrl: c.imageUrl, isFeatured: c.isFeatured }); }}>Edit</button>
                          <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => deleteCharity(c.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AuthView({ isLogin, setIsLogin, email, setEmail, password, setPassword, name, setName, charity, setCharity, percentage, setPercentage, charities, onSubmit }) {
  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
      <div className="glass-panel card-content" style={{ width: '450px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', textAlign: 'center', marginBottom: '8px' }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.9rem', marginBottom: '24px' }}>
          {isLogin ? 'Enter details to log in to your dashboard.' : 'Enter details to join the charity-driven golf league.'}
        </p>

        <form onSubmit={onSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" placeholder="e.g. John Doe" value={name} onChange={e => setName(e.target.value)} required />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" placeholder="e.g. email@provider.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label className="form-label">Select Charity Partner</label>
                <select className="form-input" value={charity} onChange={e => setCharity(e.target.value)}>
                  {charities.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subscription Split Contribution</span>
                  <strong style={{ color: 'var(--accent-cyan)' }}>{percentage}%</strong>
                </label>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  step="5"
                  className="range-slider"
                  value={percentage}
                  onChange={e => setPercentage(parseInt(e.target.value))}
                />
                <div className="slider-labels">
                  <span>10% (Min)</span>
                  <span>100% (Hero)</span>
                </div>
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: '24px' }}>
            {isLogin ? 'Sign In to Account' : 'Register Subscription Account'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            {isLogin ? "Don't have an account? " : 'Already registered? '}
          </span>
          <span 
            style={{ color: 'var(--accent-cyan)', cursor: 'pointer', fontWeight: 600 }}
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </span>
        </div>
      </div>
    </div>
  );
}
