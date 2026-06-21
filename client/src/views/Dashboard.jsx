import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Upload, AlertCircle, RefreshCw, X } from 'lucide-react';

const API_BASE = '';

export default function Dashboard({ 
  currentUser, 
  token, 
  poolStats, 
  winners, 
  charities, 
  fetchCurrentUser, 
  triggerError, 
  triggerSuccess,
  handleCancelSubscription
}) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Score form
  const [scoreVal, setScoreVal] = useState('');
  const [scoreDate, setScoreDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingId, setEditingId] = useState(null);

  // Charity split controls
  const [charityPercent, setCharityPercent] = useState(currentUser.charityPercentage || 10);
  const [selectedCharityId, setSelectedCharityId] = useState(currentUser.charityId || 'charity-1');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Verification modal
  const [proofWinnerId, setProofWinnerId] = useState(null);
  const [proofUrl, setProofUrl] = useState('https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=400');

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
    const val = parseInt(scoreVal);
    if (isNaN(val) || val < 1 || val > 45) {
      triggerError("Stableford scores must be between 1 and 45.");
      return;
    }

    setLoading(true);
    try {
      const url = editingId ? `${API_BASE}/api/scores/${editingId}` : `${API_BASE}/api/scores`;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ score: val, date: scoreDate })
      });
      const data = await res.json();
      
      if (res.ok) {
        triggerSuccess(editingId ? "Golf score updated." : "New score added successfully.");
        setScoreVal('');
        setEditingId(null);
        fetchScores();
      } else {
        triggerError(data.error || "Failed to submit score.");
      }
    } catch (err) {
      triggerError("API connection error.");
    } finally {
      setLoading(false);
    }
  };

  const deleteScore = async (scoreId) => {
    if (!window.confirm("Remove this score entry?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/scores/${scoreId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        triggerSuccess("Score entry removed.");
        fetchScores();
      }
    } catch (err) {
      triggerError("Failed to delete score.");
    }
  };

  const handleProfileUpdate = async () => {
    setUpdatingProfile(true);
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
      setUpdatingProfile(false);
    }
  };

  const handleProofSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/winners/${proofWinnerId}/proof`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ proofUrl })
      });
      if (res.ok) {
        triggerSuccess("Screenshot proof uploaded. Admin will review the claim shortly.");
        setProofWinnerId(null);
      } else {
        const errData = await res.json();
        triggerError(errData.error || "Upload failed.");
      }
    } catch (err) {
      triggerError("Network error uploading proof.");
    }
  };

  const userWinnings = winners.filter(w => w.userId === currentUser.id);
  const totalWon = userWinnings.filter(w => w.status === 'paid').reduce((sum, w) => sum + w.prizeAmount, 0);

  return (
    <div className="view-container dashboard-layout">
      {/* Left panel: Score Tracker + Winnings Claims */}
      <div className="layout-main">
        <div className="atlas-card">
          <div className="card-header-line">
            <h3>Track Performance (Rolling 5 Scores)</h3>
            <span className="info-txt">Enter Stableford values. A new score automatically replaces the oldest stored entry.</span>
          </div>

          <form className="score-form-inline" onSubmit={handleScoreSubmit}>
            <div className="form-group inline-group">
              <label className="form-label">Stableford Score</label>
              <input 
                type="number" 
                className="atlas-input" 
                min="1" 
                max="45" 
                placeholder="Value (1-45)" 
                value={scoreVal}
                onChange={e => setScoreVal(e.target.value)}
                required
              />
            </div>
            <div className="form-group inline-group">
              <label className="form-label">Game Date</label>
              <input 
                type="date" 
                className="atlas-input" 
                value={scoreDate}
                onChange={e => setScoreDate(e.target.value)}
                required
              />
            </div>
            <button className="btn-atlas-primary" type="submit" disabled={loading} style={{ height: '40px' }}>
              {editingId ? 'Update Score' : <><Plus size={16} /> Add Score</>}
            </button>
          </form>

          {editingId && (
            <button className="btn-atlas-secondary" onClick={() => { setEditingId(null); setScoreVal(''); }} style={{ marginBottom: '20px' }}>
              Cancel Edit
            </button>
          )}

          <div className="dashboard-scores-row">
            {scores.map(s => (
              <div key={s.id} className="score-badge-card">
                <div className="badge-val">{s.score}</div>
                <div className="badge-date">{s.date}</div>
                <div className="badge-actions">
                  <button className="action-btn" onClick={() => { setEditingId(s.id); setScoreVal(s.score); setScoreDate(s.date); }}><Edit2 size={12} /></button>
                  <button className="action-btn delete" onClick={() => deleteScore(s.id)}><Trash2 size={12} /></button>
                </div>
              </div>
            ))}
            {scores.length === 0 && (
              <div className="empty-scores">
                <AlertCircle size={20} className="muted-icon" />
                <span>No scores recorded yet. Log your first Stableford round to prepare for the draw!</span>
              </div>
            )}
          </div>
        </div>

        {/* Winnings Table card */}
        <div className="atlas-card" style={{ marginTop: '30px' }}>
          <div className="card-header-line">
            <h3>Draw Participation & Payout Log</h3>
          </div>
          <div className="table-responsive">
            <table className="atlas-table">
              <thead>
                <tr>
                  <th>Draw Date</th>
                  <th>Claim Details</th>
                  <th>Prize share</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {userWinnings.map(w => (
                  <tr key={w.id}>
                    <td>{w.drawDate}</td>
                    <td><strong>{w.matchCount}-Number Match</strong></td>
                    <td className="text-green">${w.prizeAmount?.toFixed(2)}</td>
                    <td>
                      <span className={`status-badge status-${w.status}`}>
                        {w.status?.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {!w.proofUrl && w.status === 'pending' ? (
                        <button className="btn-atlas-secondary btn-sm" onClick={() => setProofWinnerId(w.id)}>
                          <Upload size={12} /> Upload Screenshot
                        </button>
                      ) : w.proofUrl ? (
                        <span className="text-muted">Awaiting Verification</span>
                      ) : (
                        <span className="text-green">Disbursed</span>
                      )}
                    </td>
                  </tr>
                ))}
                {userWinnings.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-muted" style={{ padding: '20px' }}>
                      No drawings won yet. Make sure you maintain 5 scores.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right panel: Charity split config */}
      <div className="layout-side">
        <div className="atlas-card">
          <div className="card-header-line">
            <h3>Charity Allocation Settings</h3>
          </div>
          
          <div className="form-group">
            <label className="form-label">Designated Charity</label>
            <select className="atlas-select" value={selectedCharityId} onChange={e => setSelectedCharityId(e.target.value)}>
              {charities.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginTop: '20px' }}>
            <div className="flex-row justify-between" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label className="form-label">Subscription split percentage</label>
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
            <div className="slider-meta-txt" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>10% (Min)</span>
              <span>50%</span>
              <span>100% (Hero)</span>
            </div>
          </div>

          <button className="btn-atlas-primary full-width" style={{ marginTop: '24px' }} onClick={handleProfileUpdate} disabled={updatingProfile}>
            {updatingProfile ? 'Saving Settings...' : 'Save Settings'}
          </button>
        </div>

        {/* Subscription details */}
        <div className="atlas-card" style={{ marginTop: '30px' }}>
          <div className="card-header-line">
            <h3>Subscription Plan</h3>
          </div>
          <div className="sub-detail-row" style={{ marginBottom: '12px' }}>
            <span className="lbl text-muted" style={{ fontSize: '0.8rem' }}>Tier:</span>
            <strong style={{ textTransform: 'uppercase' }}>{currentUser.subscriptionTier} plan</strong>
          </div>
          <div className="sub-detail-row" style={{ marginBottom: '24px' }}>
            <span className="lbl text-muted" style={{ fontSize: '0.8rem' }}>Renewal Date:</span>
            <strong>{currentUser.subscriptionRenewal}</strong>
          </div>
          <button className="btn-atlas-danger full-width" onClick={handleCancelSubscription}>
            Cancel Subscription
          </button>
        </div>
      </div>

      {/* Proof upload modal */}
      {proofWinnerId && (
        <div className="modal-overlay">
          <form className="modal-container atlas-modal" onSubmit={handleProofSubmit}>
            <button className="modal-close" type="button" onClick={() => setProofWinnerId(null)}><X size={20} /></button>
            <div className="modal-body">
              <h3>Upload Verification Proof</h3>
              <p className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: '20px' }}>
                Please provide a link to the screenshot of your Stableford scores history from your golf platform.
              </p>
              
              <div className="form-group">
                <label className="form-label">Screenshot URL / Reference Link</label>
                <input 
                  type="text" 
                  className="atlas-input" 
                  value={proofUrl} 
                  onChange={e => setProofUrl(e.target.value)} 
                  required
                />
              </div>

              <div className="modal-actions-row">
                <button className="btn-atlas-secondary" type="button" onClick={() => setProofWinnerId(null)}>Cancel</button>
                <button className="btn-atlas-primary" type="submit">Submit Link</button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
