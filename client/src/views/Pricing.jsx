import React, { useState } from 'react';
import { CreditCard, Award, HelpCircle, Check, Sparkles, ShieldCheck, X } from 'lucide-react';

export default function Pricing({ currentUser, token, charities, triggerSuccess, triggerError, handleSubscriptionCheckout, onSignInClick }) {
  const [billingPeriod, setBillingPeriod] = useState('monthly'); // 'monthly', 'quarterly', 'yearly'
  const [basePrice, setBasePrice] = useState(29); // base price for monthly tier
  
  // Custom Slider Settings
  const [extraDonation, setExtraDonation] = useState(0); // extra direct donation added to subscription
  const [charityPercent, setCharityPercent] = useState(20); // split percentage (10% to 100%)
  const [selectedCharityId, setSelectedCharityId] = useState('charity-1');
  const [subscribingTier, setSubscribingTier] = useState(null); // track current loading action

  // Calculate prices based on billing period
  const getBillingPeriodMultiplier = () => {
    if (billingPeriod === 'quarterly') return 3;
    if (billingPeriod === 'yearly') return 12;
    return 1;
  };

  const getBillingPeriodDiscount = () => {
    if (billingPeriod === 'quarterly') return 0.15; // 15% off
    if (billingPeriod === 'yearly') return 0.30; // 30% off
    return 0;
  };

  const getPeriodLabel = () => {
    if (billingPeriod === 'quarterly') return 'quarter';
    if (billingPeriod === 'yearly') return 'year';
    return 'month';
  };

  // Base subscription cost after discounts
  const rawBasePrice = billingPeriod === 'monthly' ? 29 
                    : billingPeriod === 'quarterly' ? 24.65  // 15% discount ($73.95/quarter)
                    : 20; // 30% discount ($240/year)

  const totalPeriodBase = rawBasePrice * getBillingPeriodMultiplier();
  const totalPeriodExtra = extraDonation * getBillingPeriodMultiplier();
  const grandTotal = totalPeriodBase + totalPeriodExtra;

  // Breakdown calculations (monthly equivalent)
  const monthlyEquivalentTotal = rawBasePrice + extraDonation;
  const charityShare = (monthlyEquivalentTotal * (charityPercent / 100)).toFixed(2);
  const prizePoolShare = (monthlyEquivalentTotal * 0.40).toFixed(2);
  const platformShare = (monthlyEquivalentTotal - parseFloat(charityShare) - parseFloat(prizePoolShare)).toFixed(2);

  // Unlocked draw entries / multiplier
  const getDrawEntries = () => {
    const totalSpent = monthlyEquivalentTotal;
    if (totalSpent >= 100) return 4;
    if (totalSpent >= 60) return 2;
    return 1;
  };

  // Profile badge determination
  const getHeroLevel = () => {
    const totalSpent = monthlyEquivalentTotal;
    if (totalSpent >= 100) return { title: 'Legendary Hero', color: '#8b5cf6', bg: '#f5f3ff' };
    if (totalSpent >= 60) return { title: 'Active Advocate', color: '#10b981', bg: '#ecfdf5' };
    return { title: 'Standard Member', color: '#3b82f6', bg: '#eff6ff' };
  };

  const selectedCharity = charities.find(c => c.id === selectedCharityId) || charities[0] || { name: 'Your Selected Charity' };
  const badge = getHeroLevel();

  const handleSubscribeSubmit = async (tierName) => {
    if (!token) {
      triggerError("Please sign in to upgrade your subscription.");
      onSignInClick();
      return;
    }
    setSubscribingTier(tierName);
    try {
      await handleSubscriptionCheckout(tierName, {
        billingPeriod,
        extraDonation,
        charityId: selectedCharityId,
        charityPercentage: charityPercent,
        amount: grandTotal
      });
    } catch (err) {
      triggerError("Subscription flow interrupted.");
    } finally {
      setSubscribingTier(null);
    }
  };

  return (
    <div className="view-container pricing-layout" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>
      
      {/* Page Header */}
      <div className="directory-header" style={{ marginBottom: '40px', textAlign: 'center' }}>
        <div className="directory-meta" style={{ width: '100%' }}>
          <h2>Flexible Membership & Impact Plans</h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '8px auto 0 auto' }}>
            Choose a plan that fits your goals. Track Stableford round records, enter monthly drawings, and direct automated donations to environmental, athletic, and healthcare initiatives.
          </p>
        </div>
      </div>

      {/* Grid of Tiers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
        
        {/* Tier 1: Free account */}
        <div className="atlas-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', borderColor: 'var(--border-color)' }}>
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '20px' }}>
            <h4 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: '600' }}>Trainee / Free</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Test the waters and explore the platform.</p>
            <div style={{ fontSize: '2rem', fontWeight: '800', marginTop: '16px', color: 'var(--text-primary)' }}>$0</div>
          </div>
          
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 30px 0', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
            <li style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-secondary)' }}>
              <Check size={14} className="text-green" /> View Charities & Draws History
            </li>
            <li style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-secondary)' }}>
              <Check size={14} className="text-green" /> Explore platform concepts
            </li>
            <li style={{ style: 'none', display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
              <X size={14} style={{ color: '#ef4444' }} /> Log Stableford scores
            </li>
            <li style={{ style: 'none', display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
              <X size={14} style={{ color: '#ef4444' }} /> Enter monthly draws
            </li>
          </ul>

          <button 
            className="btn-atlas-secondary full-width" 
            style={{ marginTop: 'auto' }}
            disabled
          >
            Current Baseline
          </button>
        </div>

        {/* Tier 2: Interactive / Custom Hero Tier (Spotlight) */}
        <div className="atlas-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', borderColor: 'var(--brand-forest)', borderWidth: '2px', position: 'relative', transform: 'scale(1.02)' }}>
          <div className="status-badge status-active" style={{ position: 'absolute', top: '-12px', right: '20px', backgroundColor: 'var(--brand-forest)', color: '#ffffff' }}>POPULAR / CUSTOMIZABLE</div>
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '20px' }}>
            <h4 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} className="text-green" /> Hero Core Plan
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Customize your monthly support and direct charity share.</p>
            <div style={{ fontSize: '2rem', fontWeight: '800', marginTop: '16px', color: 'var(--text-primary)' }}>
              ${monthlyEquivalentTotal}<span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>/mo eq.</span>
            </div>
          </div>
          
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 30px 0', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
            <li style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-primary)' }}>
              <Check size={14} className="text-green" /> <strong>Track 5 scores</strong> (Rolling round logs)
            </li>
            <li style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-primary)' }}>
              <Check size={14} className="text-green" /> <strong>{getDrawEntries()} Draw entries</strong> per cycle
            </li>
            <li style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-primary)' }}>
              <Check size={14} className="text-green" /> Custom charity allocation percentages
            </li>
            <li style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-primary)' }}>
              <Check size={14} className="text-green" /> Unlock Profile Badge: <strong style={{ color: badge.color, backgroundColor: badge.bg, padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', marginLeft: '4px' }}>{badge.title}</strong>
            </li>
          </ul>

          <button 
            className="btn-atlas-primary full-width" 
            style={{ marginTop: 'auto', backgroundColor: 'var(--brand-forest)' }}
            onClick={() => handleSubscribeSubmit('hero_core')}
            disabled={subscribingTier !== null}
          >
            {subscribingTier === 'hero_core' ? 'Launching Payment Simulator...' : 'Upgrade Now / Adjust Below'}
          </button>
        </div>

        {/* Tier 3: Yearly Legend */}
        <div className="atlas-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', borderColor: 'var(--border-color)' }}>
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '20px' }}>
            <h4 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: '600' }}>Yearly Legend</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Get a year of drawing entry with a huge discount.</p>
            <div style={{ fontSize: '2rem', fontWeight: '800', marginTop: '16px', color: 'var(--text-primary)' }}>
              $20<span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>/mo eq.</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'block', marginTop: '6px', fontWeight: '600' }}>Billed annually ($240/yr) - Save 30%</span>
          </div>
          
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 30px 0', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
            <li style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-secondary)' }}>
              <Check size={14} className="text-green" /> 12 full drawings (all year round)
            </li>
            <li style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-secondary)' }}>
              <Check size={14} className="text-green" /> Log 5 rounds at any time
            </li>
            <li style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-secondary)' }}>
              <Check size={14} className="text-green" /> Standard charity allocation
            </li>
            <li style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-secondary)' }}>
              <Check size={14} className="text-green" /> Priority winner payout reviews
            </li>
          </ul>

          <button 
            className="btn-atlas-secondary full-width" 
            style={{ marginTop: 'auto' }}
            onClick={() => handleSubscribeSubmit('yearly_legend')}
            disabled={subscribingTier !== null}
          >
            {subscribingTier === 'yearly_legend' ? 'Launching Payment Simulator...' : 'Choose Yearly Legend'}
          </button>
        </div>

      </div>

      {/* Calculator Section */}
      <div className="atlas-card" style={{ padding: '30px', marginTop: '30px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px' }}>Interactive Plan & Impact Calculator</h3>
        <p className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: '30px' }}>
          Select your billing cycle, designate a custom charity addition, and slide the charity allocation percentage to see where your money goes.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px' }}>
          
          {/* Controls Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Control 1: Billing Period Switcher */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '600', marginBottom: '8px', display: 'block' }}>Billing Cycle Period</label>
              <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden', maxWidth: '400px' }}>
                <button 
                  type="button" 
                  style={{ flex: 1, padding: '10px', fontSize: '0.8rem', border: 'none', background: billingPeriod === 'monthly' ? 'var(--brand-forest)' : '#f5f7f6', color: billingPeriod === 'monthly' ? '#ffffff' : 'var(--text-primary)', cursor: 'pointer', fontWeight: '600' }}
                  onClick={() => setBillingPeriod('monthly')}
                >
                  Monthly
                </button>
                <button 
                  type="button" 
                  style={{ flex: 1, padding: '10px', fontSize: '0.8rem', border: 'none', background: billingPeriod === 'quarterly' ? 'var(--brand-forest)' : '#f5f7f6', color: billingPeriod === 'quarterly' ? '#ffffff' : 'var(--text-primary)', cursor: 'pointer', fontWeight: '600', position: 'relative' }}
                  onClick={() => setBillingPeriod('quarterly')}
                >
                  Quarterly <span style={{ fontSize: '0.65rem', display: 'block', color: billingPeriod === 'quarterly' ? '#ffffff' : '#10b981' }}>Save 15%</span>
                </button>
                <button 
                  type="button" 
                  style={{ flex: 1, padding: '10px', fontSize: '0.8rem', border: 'none', background: billingPeriod === 'yearly' ? 'var(--brand-forest)' : '#f5f7f6', color: billingPeriod === 'yearly' ? '#ffffff' : 'var(--text-primary)', cursor: 'pointer', fontWeight: '600' }}
                  onClick={() => setBillingPeriod('yearly')}
                >
                  Yearly <span style={{ fontSize: '0.65rem', display: 'block', color: billingPeriod === 'yearly' ? '#ffffff' : '#10b981' }}>Save 30%</span>
                </button>
              </div>
            </div>

            {/* Control 2: Custom Donation Addition */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label className="form-label" style={{ fontWeight: '600' }}>Extra Direct Support Addition</label>
                <strong className="text-green">+${extraDonation}/mo</strong>
              </div>
              <input 
                type="range" 
                className="atlas-range-slider"
                min="0" 
                max="100" 
                step="5"
                value={extraDonation}
                onChange={e => setExtraDonation(parseInt(e.target.value))}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Add more support to unlock higher profile badges and additional draw tickets!
              </span>
            </div>

            {/* Control 3: Designated Charity */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '600', marginBottom: '8px', display: 'block' }}>Designated Charity Recipient</label>
              <select className="atlas-select" value={selectedCharityId} onChange={e => setSelectedCharityId(e.target.value)}>
                {charities.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Control 4: Charity Split Slider */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label className="form-label" style={{ fontWeight: '600' }}>Charity Split Percentage</label>
                <strong className="text-green">{charityPercent}%</strong>
              </div>
              <input 
                type="range" 
                className="atlas-range-slider"
                min="10" 
                max="100" 
                step="5"
                value={charityPercent}
                onChange={e => setCharityPercent(parseInt(e.target.value))}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>10% (Min)</span>
                <span>50%</span>
                <span>100% (Hero Mode)</span>
              </div>
            </div>

          </div>

          {/* Impact Breakdown Column */}
          <div className="atlas-card" style={{ background: '#f5f7f6', border: 'none', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: '600', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Impact & Billing Summary</h4>
            
            {/* Total Billing */}
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Billed Amount</span>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '4px' }}>
                ${grandTotal.toFixed(2)}
                <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: 'var(--text-secondary)', marginLeft: '4px' }}>
                  per {getPeriodLabel()}
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                Billed cycle equivalent to ${(grandTotal / getBillingPeriodMultiplier()).toFixed(2)}/month.
              </span>
            </div>

            {/* Split Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Charity Contribution:</span>
                <strong className="text-green">${charityShare}/mo</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Drawing Prize Pool:</span>
                <strong>${prizePoolShare}/mo</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Platform Maintenance:</span>
                <strong style={{ color: 'var(--text-muted)' }}>${platformShare}/mo</strong>
              </div>
            </div>

            {/* Impact Text */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', fontSize: '0.85rem' }}>
              <p style={{ lineHeight: '1.4' }}>
                🌱 Billed yearly, you will generate **${(parseFloat(charityShare) * 12).toFixed(2)}** in direct donations supporting **{selectedCharity.name}**!
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '15px', color: badge.color, backgroundColor: badge.bg, padding: '10px', borderRadius: '4px' }}>
                <Award size={16} />
                <span>Unlocked Member Badge: <strong>{badge.title}</strong></span>
              </div>
            </div>

            {/* Action button */}
            <button 
              className="btn-atlas-primary full-width" 
              style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              onClick={() => handleSubscribeSubmit('custom_hero')}
              disabled={subscribingTier !== null}
            >
              <CreditCard size={16} /> 
              {subscribingTier === 'custom_hero' ? 'Launching Payment Simulator...' : `Subscribe Custom Hero - $${grandTotal.toFixed(2)}`}
            </button>
          </div>

        </div>
      </div>
      
      {/* Platform Security/Transparency Trust Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px' }}>
        <div style={{ display: 'flex', gap: '12px', background: '#fcfcfc', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '6px' }}>
          <ShieldCheck size={36} className="text-green" style={{ flexShrink: 0 }} />
          <div>
            <h5 style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-primary)' }}>Secure Transaction Simulator</h5>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
              All transaction simulation flows are powered by simulated Stripe keys. No real funds are transferred during this project evaluation.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', background: '#fcfcfc', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '6px' }}>
          <Award size={36} className="text-green" style={{ flexShrink: 0 }} />
          <div>
            <h5 style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-primary)' }}>Direct Charity Receipts</h5>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
              Your selected split goes directly to the designated charity's wallet balance. Platform reports immediately capture the donation distribution in real-time.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
