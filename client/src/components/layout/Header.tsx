import React from 'react';
import type { User } from '../../types';
import Button from '../common/Button';
import ThemeToggle from '../common/ThemeToggle';

interface HeaderProps {
  user?: User;
  onLogout: () => void;
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onMenuClick }) => {
  return (
    <header className="bg-header border-b border-default">
      <div className="flex items-center justify-between px-4 lg:px-6 py-4">
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-primary hover-bg"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <h1 className="text-lg lg:text-xl font-bold text-primary">ProductForge</h1>
          <div className="hidden sm:flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-secondary text-sm font-medium">Online</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          {user && (
            <>
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-primary">{user.name}</p>
                  <p className="text-xs text-secondary">{user.role}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onLogout}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;