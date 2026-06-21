import React from 'react';
import { 
  Trophy, Home, Heart, Activity, Settings, 
  Users, Award, FolderHeart, HelpCircle, ChevronRight, ChevronsUpDown
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, currentUser }) {
  const isAdmin = currentUser?.role === 'admin';
  const isActiveSubscriber = currentUser?.subscriptionStatus === 'active';

  return (
    <aside className="sidebar">
      {/* Sidebar Top: Logo / App Name */}
      <div className="sidebar-brand-wrapper">
        <div className="sidebar-brand">
          <div className="logo-icon-box">
            <Trophy size={18} />
          </div>
          <div className="brand-text-details">
            <span className="brand-name">Digital Heroes</span>
            <span className="brand-badge">March 2026 PRD</span>
          </div>
        </div>
      </div>

      {/* Project selector dropdown (Atlas style) */}
      <div className="project-selector">
        <div className="project-selector-meta">
          <span className="project-label">PROJECT</span>
          <span className="project-active-name">Trainee Evaluation</span>
        </div>
        <ChevronsUpDown size={14} className="muted-arrow" />
      </div>

      {/* Navigation Sections */}
      <nav className="sidebar-nav">
        {/* SECTION: GETTING STARTED */}
        <div className="nav-section">
          <span className="nav-section-title">GETTING STARTED</span>
          <ul className="nav-list">
            <li 
              className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => setActiveTab('home')}
            >
              <Home size={16} />
              <span>Platform Concept</span>
            </li>
            <li 
              className={`nav-item ${activeTab === 'charities' ? 'active' : ''}`}
              onClick={() => setActiveTab('charities')}
            >
              <Heart size={16} />
              <span>Charity Directory</span>
            </li>
          </ul>
        </div>

        {/* SECTION: PLAYER DASHBOARD */}
        {currentUser && (
          <div className="nav-section">
            <span className="nav-section-title">SUBSCRIBER PORTAL</span>
            <ul className="nav-list">
              {isActiveSubscriber ? (
                <li 
                  className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  <Activity size={16} />
                  <span>Performance Logs</span>
                </li>
              ) : (
                <li 
                  className="nav-item disabled"
                  style={{ opacity: 0.5, cursor: 'not-allowed' }}
                  title="Subscribe to access score tracking"
                >
                  <Activity size={16} />
                  <span>Performance Logs (Locked)</span>
                </li>
              )}
            </ul>
          </div>
        )}

        {/* SECTION: ADMIN ACTIONS */}
        {isAdmin && (
          <div className="nav-section">
            <span className="nav-section-title">ADMINISTRATION</span>
            <ul className="nav-list">
              <li 
                className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => setActiveTab('admin')}
              >
                <Settings size={16} />
                <span>Control Panel</span>
              </li>
            </ul>
          </div>
        )}
      </nav>

      {/* Sidebar bottom user info */}
      <div className="sidebar-footer">
        <div className="sidebar-footer-info">
          <HelpCircle size={16} style={{ color: 'var(--text-muted)' }} />
          <span>Evaluation Docs</span>
        </div>
      </div>
    </aside>
  );
}
