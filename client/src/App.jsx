import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Home from './views/Home';
import Charities from './views/Charities';
import Dashboard from './views/Dashboard';
import Admin from './views/Admin';
import Auth from './views/Auth';

import { X, CreditCard } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function App() {
  // Authentication & session state
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('dh_token') || null);
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'charities', 'dashboard', 'admin', 'auth'
  
  // Alert messages state
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Checkout model state
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [isCheckoutProcessing, setIsCheckoutProcessing] = useState(false);
  
  // Authentication Forms State
  const [isLogin, setIsLogin] = useState(true);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authCharity, setAuthCharity] = useState('charity-1');
  const [authPercentage, setAuthPercentage] = useState(10);
  
  // Data lists state
  const [charities, setCharities] = useState([]);
  const [winners, setWinners] = useState([]);
  const [draws, setDraws] = useState([]);
  const [poolStats, setPoolStats] = useState({
    activeSubscribers: 0,
    rawPool: 0,
    jackpotTier: 1200,
    match4Tier: 0,
    match3Tier: 0
  });

  // Alert flash helpers
  const triggerError = (msg) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(''), 5000);
  };
  const triggerSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  useEffect(() => {
    fetchCharities();
    fetchPoolStats();
    fetchDrawHistory();
    if (token) {
      fetchCurrentUser();
    }
  }, [token]);

  // Global Auth Verification
  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
        if (data.role === 'admin' && activeTab === 'auth') {
          setActiveTab('admin');
        } else if (data.subscriptionStatus === 'active' && activeTab === 'auth') {
          setActiveTab('dashboard');
        }
      } else {
        handleLogout();
      }
    } catch (err) {
      console.warn("Auth connection error. Retaining local fallback states.", err);
    }
  };

  const fetchCharities = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/charities`);
      if (res.ok) {
        setCharities(await res.json());
      }
    } catch (err) {
      console.error("Failed to load charities database list.");
    }
  };

  const fetchPoolStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/draws/current-pool`);
      if (res.ok) {
        setPoolStats(await res.json());
      }
    } catch (err) {
      console.warn("Pool stats API offline.");
    }
  };

  const fetchDrawHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/draws`);
      const winnersRes = await fetch(`${API_BASE}/api/winners`);
      if (res.ok) setDraws(await res.json());
      if (winnersRes.ok) setWinners(await winnersRes.json());
    } catch (err) {
      console.warn("History APIs offline.");
    }
  };

  const handleAuthSubmit = async (e) => {
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
        triggerSuccess(isLogin ? "Welcome back!" : "Account created successfully!");
        
        if (data.user.role === 'admin') {
          setActiveTab('admin');
        } else if (data.user.subscriptionStatus === 'active') {
          setActiveTab('dashboard');
        } else {
          setActiveTab('home');
          setShowCheckout(true); // Prompts checkout immediately on registration
        }
      } else {
        triggerError(data.error || "Authentication flow failed.");
      }
    } catch (err) {
      triggerError("Server offline. Toggle developer presets at the top header bar.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('dh_token');
    setToken(null);
    setCurrentUser(null);
    setActiveTab('home');
    triggerSuccess("Logged out successfully.");
  };

  // Trainee switchbar override (Bypasses verification workflow immediately for grading)
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
        triggerSuccess(`Role switched to: ${data.user.fullName} (${data.user.role})`);
        
        if (data.user.role === 'admin') {
          setActiveTab('admin');
        } else {
          setActiveTab('dashboard');
        }
      }
    } catch (err) {
      triggerError("Check that local server is running on port 5000.");
    }
  };

  const handleSubscriptionCheckout = async (tier) => {
    setIsCheckoutProcessing(true);
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
        triggerSuccess(`Subscribed to the ${tier} plan successfully!`);
        fetchPoolStats();
      } else {
        triggerError(data.error || "Subscription upgrade failed.");
      }
    } catch (err) {
      triggerError("Connection issue processing checkout.");
    } finally {
      setIsCheckoutProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm("Cancel your drawing subscription? You won't be entered in drawings.")) return;
    try {
      const res = await fetch(`${API_BASE}/api/subscription/cancel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.user);
        setActiveTab('home');
        triggerSuccess("Subscription deactivated.");
        fetchPoolStats();
      }
    } catch (err) {
      triggerError("Subscription cancellation failed.");
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar navigation panel */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentUser={currentUser} 
      />

      {/* Main viewport */}
      <div className="main-wrapper">
        <Header 
          activeTab={activeTab} 
          currentUser={currentUser} 
          onLogout={handleLogout} 
          onSignInClick={() => setActiveTab('auth')} 
          devQuickSwitch={devQuickSwitch} 
        />

        {/* Global messages banner */}
        <div style={{ padding: '0 24px', marginTop: '16px' }}>
          {errorMessage && (
            <div className="hero-message-success" style={{ backgroundColor: '#fef2f2', border: '1px solid #fee2e2', color: '#ef4444', width: '100%' }}>
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="hero-message-success" style={{ width: '100%' }}>
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Dynamic page container */}
        <main className="view-area">
          {activeTab === 'home' && (
            <Home 
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
            <Charities 
              charities={charities} 
              token={token} 
              triggerError={triggerError} 
              triggerSuccess={triggerSuccess} 
              fetchCharities={fetchCharities} 
            />
          )}

          {activeTab === 'dashboard' && currentUser && (
            currentUser.subscriptionStatus === 'active' ? (
              <Dashboard 
                currentUser={currentUser} 
                token={token} 
                poolStats={poolStats} 
                winners={winners} 
                charities={charities} 
                fetchCurrentUser={fetchCurrentUser} 
                triggerError={triggerError} 
                triggerSuccess={triggerSuccess} 
                handleCancelSubscription={handleCancelSubscription} 
              />
            ) : (
              <div className="view-container">
                <div className="atlas-card" style={{ padding: '40px', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.4rem' }}>Subscription Inactive</h3>
                  <p style={{ marginTop: '10px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Your subscription has lapsed or is inactive. Please subscribe to unlock golf score tracking and enter monthly drawings.
                  </p>
                  <button className="btn-atlas-primary" style={{ marginTop: '20px' }} onClick={() => setShowCheckout(true)}>
                    Activate Subscription
                  </button>
                </div>
              </div>
            )
          )}

          {activeTab === 'admin' && currentUser?.role === 'admin' && (
            <Admin 
              token={token} 
              triggerError={triggerError} 
              triggerSuccess={triggerSuccess} 
              charities={charities} 
              fetchCharities={fetchCharities} 
              fetchDrawHistory={fetchDrawHistory} 
            />
          )}

          {activeTab === 'auth' && (
            <Auth 
              isLogin={isLogin} 
              setIsLogin={setIsLogin} 
              email={authEmail} setEmail={setAuthEmail} 
              password={authPassword} setPassword={setAuthPassword} 
              name={authName} setName={setAuthName} 
              charity={authCharity} setCharity={setAuthCharity} 
              percentage={authPercentage} setPercentage={setAuthPercentage} 
              charities={charities} 
              onSubmit={handleAuthSubmit} 
            />
          )}
        </main>
      </div>

      {/* Subscription Upgrading Modal */}
      {showCheckout && (
        <div className="modal-overlay">
          <div className="modal-container atlas-modal" style={{ width: '540px' }}>
            <button className="modal-close" onClick={() => setShowCheckout(false)}><X size={20} /></button>
            <div className="modal-body">
              <h3 style={{ textAlign: 'center', marginBottom: '8px' }}>Select Membership Plan</h3>
              <p className="text-secondary" style={{ fontSize: '0.85rem', textAlign: 'center', marginBottom: '24px' }}>
                Upgrading unlocks your rolling score tracking board and enters you in monthly payouts.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div 
                  className="atlas-card" 
                  onClick={() => setSelectedPlan('monthly')}
                  style={{
                    padding: '16px',
                    cursor: 'pointer',
                    borderColor: selectedPlan === 'monthly' ? 'var(--brand-forest)' : 'var(--border-color)',
                    backgroundColor: selectedPlan === 'monthly' ? '#e1f2ec' : '#ffffff'
                  }}
                >
                  <h4 style={{ fontSize: '0.9rem' }}>Monthly Plan</h4>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, margin: '8px 0' }}>$29<span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>/mo</span></div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Full monthly drawing entry.</p>
                </div>

                <div 
                  className="atlas-card" 
                  onClick={() => setSelectedPlan('yearly')}
                  style={{
                    padding: '16px',
                    cursor: 'pointer',
                    position: 'relative',
                    borderColor: selectedPlan === 'yearly' ? 'var(--brand-forest)' : 'var(--border-color)',
                    backgroundColor: selectedPlan === 'yearly' ? '#e1f2ec' : '#ffffff'
                  }}
                >
                  <span className="status-badge status-active" style={{ position: 'absolute', top: '-10px', right: '10px' }}>Save 30%</span>
                  <h4 style={{ fontSize: '0.9rem' }}>Yearly Legend</h4>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, margin: '8px 0' }}>$240<span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>/yr</span></div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Save $108 annually.</p>
                </div>
              </div>

              {/* Checkout inputs */}
              <div className="stripe-card-mock" style={{ marginTop: 0 }}>
                <div className="mock-title">
                  <CreditCard size={12} /> SECURE CARD PAYMENT MOCK (STRIPE)
                </div>
                <div className="card-fields-grid">
                  <input className="atlas-input" style={{ gridColumn: 'span 3', fontSize: '0.8rem' }} type="text" defaultValue="4242 4242 4242 4242" readOnly />
                  <input className="atlas-input" style={{ fontSize: '0.8rem' }} type="text" defaultValue="12/28" readOnly />
                  <input className="atlas-input" style={{ fontSize: '0.8rem' }} type="text" defaultValue="123" readOnly />
                  <input className="atlas-input" style={{ fontSize: '0.8rem' }} type="text" defaultValue="90210" readOnly />
                </div>
              </div>

              <div className="modal-actions-row">
                <button className="btn-atlas-secondary" onClick={() => setShowCheckout(false)} disabled={isCheckoutProcessing}>Cancel</button>
                <button className="btn-atlas-primary" onClick={() => handleSubscriptionCheckout(selectedPlan)} disabled={isCheckoutProcessing}>
                  {isCheckoutProcessing ? 'Processing...' : 'Activate Subscription'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
