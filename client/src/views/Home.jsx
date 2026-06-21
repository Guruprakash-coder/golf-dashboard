import React from 'react';
import { Trophy, Heart, Calendar, Sliders, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Home({ poolStats, charities, currentUser, onSubscribeClick }) {
  const featuredCharity = charities.find(c => c.isFeatured) || charities[0];

  return (
    <div className="view-container">
      {/* MongoDB Atlas inspired banner */}
      <section className="atlas-hero">
        <div className="hero-badge">🧬 TRAINEE SELECTION PROCESS ASSIGNMENT</div>
        <h1 className="hero-main-title">
          Track Performance. Fund Causes. <span>Win Prize Drawings.</span>
        </h1>
        <p className="hero-subtitle">
          An emotion-driven golf tracking league. We donate a minimum of 10% of every membership directly to a charity of your choice, and enter you into monthly Stableford draw engines.
        </p>
        
        {currentUser?.subscriptionStatus === 'active' ? (
          <div className="hero-message-success">
            <CheckCircle2 size={16} />
            <span>You have an active subscription. Navigate to <strong>Performance Logs</strong> to submit scores.</span>
          </div>
        ) : (
          <button className="btn-atlas-primary btn-lg" onClick={onSubscribeClick}>
            Subscribe & Enter Drawing <ArrowRight size={16} />
          </button>
        )}
      </section>

      {/* Stats Cards Section */}
      <div className="atlas-stats-row">
        <div className="atlas-stat-card border-cyan">
          <div className="stat-header">
            <span className="stat-label">ROLLOVER JACKPOT (5-MATCH)</span>
            <Trophy size={16} className="text-cyan" />
          </div>
          <div className="stat-value-large">${poolStats.jackpotTier?.toLocaleString()}</div>
          <span className="stat-subtext">Accumulates monthly until claimed</span>
        </div>

        <div className="atlas-stat-card border-green">
          <div className="stat-header">
            <span className="stat-label">SUBSCRIBERS ENROLLED</span>
            <Sliders size={16} className="text-green" />
          </div>
          <div className="stat-value-large">{poolStats.activeSubscribers}</div>
          <span className="stat-subtext">Active drawing tickets this month</span>
        </div>

        <div className="atlas-stat-card border-violet">
          <div className="stat-header">
            <span className="stat-label">CURRENT POOL VALUE</span>
            <Heart size={16} className="text-violet" />
          </div>
          <div className="stat-value-large">${poolStats.rawPool?.toLocaleString()}</div>
          <span className="stat-subtext">Split among 3-match and 4-match tiers</span>
        </div>
      </div>

      {/* Spotlight Charity */}
      {featuredCharity && (
        <section className="spotlight-section">
          <h2 className="section-title">Spotlight Charity Partner</h2>
          <div className="spotlight-card">
            <img src={featuredCharity.imageUrl} alt={featuredCharity.name} className="spotlight-img" />
            <div className="spotlight-info">
              <span className="featured-badge">SPOTLIGHT PARTNER</span>
              <h3>{featuredCharity.name}</h3>
              <p>{featuredCharity.description}</p>
              
              <div className="upcoming-events-box">
                <span className="box-title">
                  <Calendar size={14} /> Upcoming Golf Day Event:
                </span>
                {featuredCharity.events && featuredCharity.events[0] ? (
                  <div className="event-info">
                    <strong>{featuredCharity.events[0].name}</strong> — {featuredCharity.events[0].date}
                    <p>{featuredCharity.events[0].description}</p>
                  </div>
                ) : (
                  <span className="no-events text-muted">No upcoming golf days scheduled</span>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Step by step mechanics description */}
      <section className="mechanics-section">
        <h2 className="section-title text-center">How the Engine Operates</h2>
        <div className="mechanics-grid">
          <div className="mechanics-card">
            <div className="card-number">1</div>
            <h4>Input Golf Scores</h4>
            <p>Enter your 5 most recent golf scores in Stableford format (1 - 45). Entering a new score automatically replaces the oldest.</p>
          </div>
          <div className="mechanics-card">
            <div className="card-number">2</div>
            <h4>Monthly Drawings</h4>
            <p>Each month the admin draws 5 winning numbers in range 1-45 (using standard random logic or weighted frequency algorithmic calculations).</p>
          </div>
          <div className="mechanics-card">
            <div className="card-number">3</div>
            <h4>Support Charity</h4>
            <p>A minimum of 10% of your membership goes straight to your designated charity. Plus, match 3, 4, or 5 numbers to win pool splits!</p>
          </div>
        </div>
      </section>
    </div>
  );
}
