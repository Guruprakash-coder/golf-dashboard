import React, { useState, useEffect } from 'react';
import { Settings, Users, Trophy, Award, Plus, Edit2, Trash2, Check, X, ShieldAlert } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function Admin({ token, triggerError, triggerSuccess, charities, fetchCharities, fetchDrawHistory }) {
  const [activeAdminTab, setActiveAdminTab] = useState('draws');
  
  // Reports stats
  const [reports, setReports] = useState(null);
  
  // Draws logic state
  const [drawMode, setDrawMode] = useState('random');
  const [simulation, setSimulation] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  
  // Users database state
  const [usersList, setUsersList] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userEditForm, setUserEditForm] = useState({ fullName: '', role: '', subscriptionStatus: '' });

  // Payout queue
  const [payoutList, setPayoutList] = useState([]);
  
  // Charity database CRUD
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

  const runSimulation = async () => {
    setSimulating(true);
    try {
      const res = await fetch(`${API_BASE}/api/draws/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ drawType: drawMode })
      });
      if (res.ok) {
        setSimulation(await res.json());
        triggerSuccess("Lottery pre-analysis compiled successfully.");
      }
    } catch (err) {
      triggerError("Simulation run failed.");
    } finally {
      setSimulating(false);
    }
  };

  const publishDraw = async () => {
    if (!simulation) return;
    setPublishing(true);
    try {
      const res = await fetch(`${API_BASE}/api/draws/publish`, {
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
      triggerError("Failed to publish draw.");
    } finally {
      setPublishing(false);
    }
  };

  const handleVerifyPayout = async (winnerId, action) => {
    try {
      const res = await fetch(`${API_BASE}/api/winners/${winnerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        triggerSuccess(action === 'approve' ? "Claim approved and balance paid." : "Winner claim rejected.");
        fetchWinnersQueue();
      }
    } catch (err) {
      triggerError("Failed to process winner claim.");
    }
  };

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
        triggerSuccess("User data modified.");
        setEditingUserId(null);
        fetchUsers();
      }
    } catch (err) {
      triggerError("Failed to update user.");
    }
  };

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
        triggerSuccess(editingCharityId ? "Charity profile modified." : "New charity profile created.");
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
        triggerSuccess("Charity profile removed.");
        fetchCharities();
      }
    } catch (err) {
      triggerError("Delete failed.");
    }
  };

  return (
    <div className="view-container">
      {/* Top metrics dashboard block */}
      {reports && (
        <div className="atlas-metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '30px' }}>
          <div className="metric-box">
            <span className="lbl">PLATFORM MEMBERS</span>
            <div className="val">{reports.summary.totalUsers}</div>
          </div>
          <div className="metric-box">
            <span className="lbl text-green">ACTIVE SUBSCRIBERS</span>
            <div className="val text-green">{reports.summary.activeSubscribers}</div>
          </div>
          <div className="metric-box">
            <span className="lbl">TOTAL PRIZES ALLOCATED</span>
            <div className="val">${reports.summary.totalPrizeAllocated?.toFixed(2)}</div>
          </div>
          <div className="metric-box">
            <span className="lbl text-violet">CHARITY TOTAL RAISED</span>
            <div className="val text-violet">${reports.summary.totalCharityDonations?.toFixed(2)}</div>
          </div>
        </div>
      )}

      {/* Admin Tab Selectors */}
      <div className="atlas-tabs-row" style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', marginBottom: '24px' }}>
        <button className={`atlas-tab-btn ${activeAdminTab === 'draws' ? 'active' : ''}`} onClick={() => setActiveAdminTab('draws')}>Run Draws</button>
        <button className={`atlas-tab-btn ${activeAdminTab === 'users' ? 'active' : ''}`} onClick={() => setActiveAdminTab('users')}>Users & Scores</button>
        <button className={`atlas-tab-btn ${activeAdminTab === 'winners' ? 'active' : ''}`} onClick={() => setActiveAdminTab('winners')}>Winners Queue</button>
        <button className={`atlas-tab-btn ${activeAdminTab === 'charities' ? 'active' : ''}`} onClick={() => setActiveAdminTab('charities')}>Charities Editor</button>
      </div>

      {/* View Content details */}
      {activeAdminTab === 'draws' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '30px' }}>
          <div className="atlas-card">
            <h3 className="card-sub-title">Drawing Controls</h3>
            <div className="form-group">
              <label className="form-label">Draw Mechanics Logic</label>
              <select className="atlas-select" value={drawMode} onChange={e => setDrawMode(e.target.value)}>
                <option value="random">Standard Random Draw</option>
                <option value="algorithmic">Algorithmic (Frequency-Weighted)</option>
              </select>
            </div>
            
            <button className="btn-atlas-primary full-width" onClick={runSimulation} disabled={simulating}>
              {simulating ? 'Running pre-analysis...' : 'Run Simulation Analysis'}
            </button>

            {simulation && (
              <div className="simulation-preanalysis-box" style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                <h4 className="text-green" style={{ marginBottom: '16px' }}>Pre-Analysis Reports</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Winning Numbers:</span>
                  <strong>{simulation.winningNumbers?.join(', ')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Rollover Jackpot?</span>
                  <strong>{simulation.willRollover ? 'Yes (Rollover)' : 'No'}</strong>
                </div>
                
                <div className="simulation-details-box" style={{ background: '#f5f7f6', padding: '12px', borderRadius: '4px', fontSize: '0.85rem', margin: '16px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>5-Match Pool ({simulation.counts.match5} wins):</span>
                    <strong>${simulation.pools.jackpot}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>4-Match Pool ({simulation.counts.match4} wins):</span>
                    <strong>${simulation.pools.match4}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>3-Match Pool ({simulation.counts.match3} wins):</span>
                    <strong>${simulation.pools.match3}</strong>
                  </div>
                </div>

                <button className="btn-atlas-primary full-width" onClick={publishDraw} disabled={publishing}>
                  {publishing ? 'Publishing...' : 'Official Publish & Alert Winners'}
                </button>
              </div>
            )}
          </div>

          <div className="atlas-card">
            <h3 className="card-sub-title">Draw Logs History</h3>
            <div className="table-responsive">
              <table className="atlas-table">
                <thead>
                  <tr>
                    <th>Draw Date</th>
                    <th>Type</th>
                    <th>Winning Numbers</th>
                    <th>Jackpot State</th>
                  </tr>
                </thead>
                <tbody>
                  {reports?.drawHistory.map((d, i) => (
                    <tr key={i}>
                      <td>{d.date}</td>
                      <td>{d.drawType || 'random'}</td>
                      <td><strong>{d.winningNumbers?.join(', ') || '18, 22, 30, 35, 41'}</strong></td>
                      <td>{d.jackpotWon ? 'Claimed' : 'Rolled Over'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeAdminTab === 'users' && (
        <div className="atlas-card">
          <h3 className="card-sub-title">User Profiles</h3>
          <div className="table-responsive">
            <table className="atlas-table">
              <thead>
                <tr>
                  <th>Player Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Subscription</th>
                  <th>Scores Logged</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map(u => (
                  <tr key={u.id}>
                    <td>{u.fullName}</td>
                    <td>{u.email}</td>
                    <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
                    <td>
                      <span className={`status-badge status-${u.subscriptionStatus}`}>
                        {u.subscriptionStatus?.toUpperCase()}
                      </span>
                    </td>
                    <td>{u.scoreCount} scores</td>
                    <td>
                      <button className="btn-atlas-secondary btn-sm" onClick={() => { setEditingUserId(u.id); setUserEditForm({ fullName: u.fullName, role: u.role, subscriptionStatus: u.subscriptionStatus }); }}>
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
              <form className="modal-container atlas-modal" onSubmit={handleUserUpdate}>
                <button className="modal-close" type="button" onClick={() => setEditingUserId(null)}><X size={20} /></button>
                <div className="modal-body">
                  <h3>Edit User Account</h3>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input type="text" className="atlas-input" value={userEditForm.fullName} onChange={e => setUserEditForm({ ...userEditForm, fullName: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select className="atlas-select" value={userEditForm.role} onChange={e => setUserEditForm({ ...userEditForm, role: e.target.value })}>
                      <option value="subscriber">Subscriber</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subscription Status</label>
                    <select className="atlas-select" value={userEditForm.subscriptionStatus} onChange={e => setUserEditForm({ ...userEditForm, subscriptionStatus: e.target.value })}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  
                  <div className="modal-actions-row" style={{ marginTop: '24px' }}>
                    <button className="btn-atlas-secondary" type="button" onClick={() => setEditingUserId(null)}>Cancel</button>
                    <button className="btn-atlas-primary" type="submit">Save Changes</button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {activeAdminTab === 'winners' && (
        <div className="atlas-card">
          <h3 className="card-sub-title">Winner Claims Queue</h3>
          <div className="table-responsive">
            <table className="atlas-table">
              <thead>
                <tr>
                  <th>Winner</th>
                  <th>Draw Date</th>
                  <th>Claim info</th>
                  <th>Proof Receipt</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payoutList.map(w => (
                  <tr key={w.id}>
                    <td>
                      <strong>{w.userName}</strong>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{w.userEmail}</div>
                    </td>
                    <td>{w.drawDate}</td>
                    <td>{w.matchCount}-Match (${w.prizeAmount?.toFixed(2)})</td>
                    <td>
                      {w.proofUrl ? (
                        <a href={w.proofUrl} target="_blank" rel="noreferrer" className="text-green">
                          View Screenshot
                        </a>
                      ) : (
                        <span className="text-muted">No proof uploaded</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge status-${w.status}`}>
                        {w.status?.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {w.status === 'pending' && w.proofUrl ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn-atlas-primary btn-sm" onClick={() => handleVerifyPayout(w.id, 'approve')}>Approve</button>
                          <button className="btn-atlas-danger btn-sm" onClick={() => handleVerifyPayout(w.id, 'reject')}>Reject</button>
                        </div>
                      ) : (
                        <span className="text-muted">Claim Verified</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeAdminTab === 'charities' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '30px' }}>
          <div className="atlas-card">
            <h3>{editingCharityId ? 'Modify Charity' : 'Register New Charity'}</h3>
            <form onSubmit={handleCharitySubmit} style={{ marginTop: '16px' }}>
              <div className="form-group">
                <label className="form-label">Charity Name</label>
                <input type="text" className="atlas-input" value={charityForm.name} onChange={e => setCharityForm({ ...charityForm, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="atlas-input" style={{ minHeight: '100px' }} value={charityForm.description} onChange={e => setCharityForm({ ...charityForm, description: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Banner Image URL</label>
                <input type="text" className="atlas-input" value={charityForm.imageUrl} onChange={e => setCharityForm({ ...charityForm, imageUrl: e.target.value })} />
              </div>
              <div className="form-group flex-row align-center" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '15px' }}>
                <input type="checkbox" id="featureCheck" checked={charityForm.isFeatured} onChange={e => setCharityForm({ ...charityForm, isFeatured: e.target.checked })} />
                <label htmlFor="featureCheck" className="form-label" style={{ margin: 0 }}>Spotlight charity on homepage</label>
              </div>

              <div className="modal-actions-row" style={{ marginTop: '24px' }}>
                {editingCharityId && (
                  <button className="btn-atlas-secondary" type="button" onClick={() => { setEditingCharityId(null); setCharityForm({ name: '', description: '', imageUrl: '', isFeatured: false }); }}>Cancel</button>
                )}
                <button className="btn-atlas-primary" type="submit">Submit Profile</button>
              </div>
            </form>
          </div>

          <div className="atlas-card">
            <h3>Registered Charities</h3>
            <div className="table-responsive" style={{ marginTop: '16px' }}>
              <table className="atlas-table">
                <thead>
                  <tr>
                    <th>Charity</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {charities.map(c => (
                    <tr key={c.id}>
                      <td>
                        <strong>{c.name}</strong>
                        <div className="text-muted" style={{ fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {c.description}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="btn-atlas-secondary btn-sm" onClick={() => { setEditingCharityId(c.id); setCharityForm({ name: c.name, description: c.description, imageUrl: c.imageUrl, isFeatured: c.isFeatured }); }}>Edit</button>
                          <button className="btn-atlas-danger btn-sm" onClick={() => deleteCharity(c.id)}>Delete</button>
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
