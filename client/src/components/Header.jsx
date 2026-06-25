import React from 'react';
import { User, LogOut, ChevronDown, Menu } from 'lucide-react';

export default function Header({ 
  activeTab, 
  currentUser, 
  onLogout, 
  onSignInClick,
  onMenuToggle
}) {
  
  // Format page titles dynamically
  const getPageTitle = () => {
    switch(activeTab) {
      case 'home': return 'Platform Concept';
      case 'charities': return 'Charity Directory';
      case 'pricing': return 'Membership Plans & Calculator';
      case 'dashboard': return 'Subscriber Dashboard';
      case 'admin': return 'Administrator Control Room';
      case 'auth': return 'Authentication';
      default: return 'Digital Heroes';
    }
  };

  return (
    <header className="main-header">
      {/* Page Title display */}
      <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button className="mobile-menu-toggle" onClick={onMenuToggle} aria-label="Toggle Menu">
          <Menu size={20} />
        </button>
        <h1 className="header-page-title">{getPageTitle()}</h1>
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
