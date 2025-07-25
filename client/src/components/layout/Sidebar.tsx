import React from 'react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, onClose }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'products', label: 'Products', icon: '📦' },
    { id: 'categories', label: 'Categories', icon: '📂' },
    { id: 'lines', label: 'Product Lines', icon: '📋' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'search', label: 'Search', icon: '🔍' }
  ];

  const handleMenuItemClick = (viewId: string) => {
    onViewChange(viewId);
    onClose?.(); // Close sidebar on mobile after navigation
  };

  return (
    <aside className="w-64 bg-sidebar border-r border-default flex flex-col">
      <div className="p-6 border-b border-light">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">P</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-primary">ProductForge</h2>
              <p className="text-muted text-xs">Product Management</p>
            </div>
          </div>
          {/* Mobile close button */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg text-muted hover-bg-soft"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleMenuItemClick(item.id)}
                className={`w-full flex items-center px-3 py-2.5 text-sm rounded-lg transition-colors ${
                  activeView === item.id
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'text-secondary hover-bg-soft'
                }`}
              >
                <span className="mr-3 text-base">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-light">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <p className="text-muted text-xs font-medium">ProductForge</p>
          <p className="text-muted text-xs mt-1">Version 2.0</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;