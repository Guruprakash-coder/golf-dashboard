import React from 'react';
import { User, LogOut, ChevronDown } from 'lucide-react';

export default function Header({ 
  activeTab, 
  currentUser, 
  onLogout, 
  onSignInClick, 
  devQuickSwitch 
}) {
  
  // Format page titles dynamically
  const getPageTitle = () => {
    switch(activeTab) {
      case 'home': return 'Platform Concept';
      case 'charities': return 'Charity Directory';
      case 'dashboard': return 'Subscriber Dashboard';
      case 'admin': return 'Administrator Control Room';
      case 'auth': return 'Authentication';
      default: return 'Digital Heroes';
    }
  };

  return (
    <header className="main-header">
      {/* Page Title display */}
      <div className="header-left">
        <h1 className="header-page-title">{getPageTitle()}</h1>
      </div>

      {/* Role Switcher Evaluation Helper */}
      <div className="evaluation-switchbar">
        <span className="switchbar-lbl">🔬 Trainee Switcher:</span>
        <button 
          className={`switchbar-btn ${currentUser?.role === 'admin' ? 'active' : ''}`}
          onClick={() => devQuickSwitch('admin')}
        >
          Admin
        </button>
        <button 
          className={`switchbar-btn ${currentUser?.role === 'subscriber' && currentUser?.subscriptionStatus === 'active' ? 'active' : ''}`}
          onClick={() => devQuickSwitch('subscriber_active')}
        >
          Active Sub
        </button>
        <button 
          className={`switchbar-btn ${currentUser?.role === 'subscriber' && currentUser?.subscriptionStatus === 'inactive' ? 'active' : ''}`}
          onClick={() => devQuickSwitch('subscriber_inactive')}
        >
          Inactive Sub
        </button>
      </div>

      {/* Auth action section */}
      <div className="header-right">
        {currentUser ? (
          <div className="user-profile-widget">
            <div className="profile-details">
              <span className="profile-name">{currentUser.fullName}</span>
              <span className={`profile-status-badge ${currentUser.subscriptionStatus === 'active' ? 'active' : 'inactive'}`}>
                {currentUser.subscriptionStatus === 'active' ? 'SUBSCRIBED' : 'FREE ACCOUNT'}
              </span>
            </div>
            <button className="logout-btn-icon" onClick={onLogout} title="Log Out">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button className="btn-atlas-primary" onClick={onSignInClick}>
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
