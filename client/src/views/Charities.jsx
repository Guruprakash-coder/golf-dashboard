import React, { useState } from 'react';
import { Search, Heart, Calendar, X, CreditCard } from 'lucide-react';

const API_BASE = '';

export default function Charities({ charities, token, triggerError, triggerSuccess, fetchCharities }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFeatured, setFilterFeatured] = useState(false);
  const [showDonateModal, setShowDonateModal] = useState(null);
  const [donationAmount, setDonationAmount] = useState('25');
  const [isDonating, setIsDonating] = useState(false);

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
    
    setIsDonating(true);
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
        triggerSuccess(`Thank you! Your direct donation of $${val} was successfully received.`);
        setShowDonateModal(null);
        fetchCharities();
      } else {
        const errData = await res.json();
        triggerError(errData.error || "Failed to submit donation.");
      }
    } catch (err) {
      triggerError("Failed to process donation.");
    } finally {
      setIsDonating(false);
    }
  };

  return (
    <div className="view-container">
      {/* Filtering Header */}
      <div className="directory-header">
        <div className="directory-meta">
          <h2>Charity Directory</h2>
          <p>Support ecological conservation, youth sports, and cancer research initiatives.</p>
        </div>
        
        <div className="directory-controls">
          <div className="search-box-wrapper">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              className="atlas-input" 
              placeholder="Search charities..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            className={`btn-atlas-secondary ${filterFeatured ? 'active' : ''}`}
            onClick={() => setFilterFeatured(!filterFeatured)}
          >
            {filterFeatured ? 'Showing Featured' : 'Filter Featured'}
          </button>
        </div>
      </div>

      {/* Grid of Charities */}
      <div className="charity-directory-grid">
        {filtered.map(charity => (
          <div key={charity.id} className="charity-atlas-card">
            <img className="charity-card-img" src={charity.imageUrl} alt={charity.name} />
            <div className="charity-card-body">
              {charity.isFeatured && <span className="featured-card-badge">FEATURED</span>}
              <h3 className="charity-card-title">{charity.name}</h3>
              <p className="charity-card-desc">{charity.description}</p>
              
              <div className="charity-card-stats-box">
                <div className="charity-stat-item">
                  <span className="lbl">Total Donations Raised</span>
                  <strong className="val">${charity.totalDonations?.toLocaleString()}</strong>
                </div>
              </div>

              {charity.events && charity.events.map((ev, i) => (
                <div key={i} className="charity-card-event-badge">
                  <span className="event-date">
                    <Calendar size={12} /> {ev.date}
                  </span>
                  <span className="event-title">{ev.name}</span>
                </div>
              ))}

              <button 
                className="btn-atlas-primary full-width" 
                style={{ marginTop: 'auto' }}
                onClick={() => setShowDonateModal(charity)}
              >
                Donate Directly
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="empty-state">No charities match your search query.</div>
        )}
      </div>

      {/* Direct Donation Stripe Simulation modal */}
      {showDonateModal && (
        <div className="modal-overlay">
          <div className="modal-container atlas-modal">
            <button className="modal-close" onClick={() => setShowDonateModal(null)}><X size={20} /></button>
            
            <div className="modal-body">
              <h3>Donate to {showDonateModal.name}</h3>
              <p className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: '20px' }}>
                Your donation will go straight to the charity's fund. This is an independent transaction and doesn't affect drawing entry requirements.
              </p>
              
              <div className="form-group">
                <label className="form-label">Donation Amount ($ USD)</label>
                <input 
                  type="number" 
                  className="atlas-input" 
                  value={donationAmount} 
                  onChange={e => setDonationAmount(e.target.value)} 
                />
              </div>

              {/* Stripe fields mock */}
              <div className="stripe-card-mock">
                <div className="mock-title">
                  <CreditCard size={14} /> SECURE CARD PAYMENT DEMO
                </div>
                <div className="card-fields-grid">
                  <input className="atlas-input" style={{ gridColumn: 'span 3', fontSize: '0.8rem' }} type="text" defaultValue="4242 4242 4242 4242" readOnly />
                  <input className="atlas-input" style={{ fontSize: '0.8rem' }} type="text" defaultValue="12/28" readOnly />
                  <input className="atlas-input" style={{ fontSize: '0.8rem' }} type="text" defaultValue="123" readOnly />
                  <input className="atlas-input" style={{ fontSize: '0.8rem' }} type="text" defaultValue="90210" readOnly />
                </div>
              </div>

              <div className="modal-actions-row">
                <button className="btn-atlas-secondary" onClick={() => setShowDonateModal(null)} disabled={isDonating}>Cancel</button>
                <button className="btn-atlas-primary" onClick={() => handleIndependentDonation(showDonateModal.id)} disabled={isDonating}>
                  {isDonating ? 'Sending...' : 'Complete Donation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
