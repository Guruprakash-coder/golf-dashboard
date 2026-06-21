import React from 'react';

export default function Auth({ 
  isLogin, 
  setIsLogin,
  email, setEmail,
  password, setPassword,
  name, setName,
  charity, setCharity,
  percentage, setPercentage,
  charities,
  onSubmit 
}) {
  return (
    <div className="view-container auth-layout">
      <div className="atlas-card auth-card">
        <h2 className="auth-title">{isLogin ? 'Sign In' : 'Create Account'}</h2>
        <p className="auth-subtitle">
          {isLogin 
            ? 'Sign in to access score performance tracking and drawings.' 
            : 'Register to start tracking Stableford scores and supporting local charities.'
          }
        </p>

        <form onSubmit={onSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="atlas-input" 
                placeholder="e.g. Marcus Vance" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="atlas-input" 
              placeholder="e.g. player@provider.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="atlas-input" 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label className="form-label">Select Charity Partner</label>
                <select className="atlas-select" value={charity} onChange={e => setCharity(e.target.value)}>
                  {charities.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label className="form-label">Subscription split percentage</label>
                  <strong className="text-green">{percentage}%</strong>
                </div>
                <input 
                  type="range" 
                  className="atlas-range-slider"
                  min="10" 
                  max="100" 
                  step="5"
                  value={percentage}
                  onChange={e => setPercentage(parseInt(e.target.value))}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>10% (Min)</span>
                  <span>100% (Hero)</span>
                </div>
              </div>
            </>
          )}

          <button type="submit" className="btn-atlas-primary full-width" style={{ marginTop: '24px', padding: '12px' }}>
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-switcher-link">
          <span>{isLogin ? "Don't have an account? " : 'Already registered? '}</span>
          <button className="link-btn" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>
      </div>
    </div>
  );
}
