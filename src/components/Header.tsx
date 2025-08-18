import React from 'react';
import { Search, Menu, Bell } from 'lucide-react';
import { DarkModeToggle } from './DarkModeToggle';

export const Header: React.FC = () => {
  return (
    <header className="shadow-sm border-b transition-colors" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--purple-light)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and App Title */}
          <div className="flex items-center space-x-3 pl-4">
            <img 
              src="/cornr_logo_orig_bg_removed_name_removed.png" 
              alt="CORNR" 
              className="h-8"
            />
            <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>CORNR</h1>
          </div>
          
          {/* Right side icons */}
          <div className="flex items-center space-x-2">
            <DarkModeToggle />
            <button 
              className="p-2 rounded-full transition-colors"
              style={{ 
                color: 'var(--purple-primary)',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--purple-light)';
                e.currentTarget.style.color = 'var(--purple-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--purple-primary)';
              }}
              title="Notifications"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
            </button>
            <button 
              className="p-2 rounded-full transition-colors"
              style={{ 
                color: 'var(--purple-primary)',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--purple-light)';
                e.currentTarget.style.color = 'var(--purple-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--purple-primary)';
              }}
              title="Menu"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="pb-4">
          <div className="relative max-w-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--purple-primary)' }} />
            <input
              type="text"
              placeholder="Search for connections..."
              className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:border-transparent transition-colors"
              style={{
                borderColor: 'var(--purple-light)',
                backgroundColor: 'var(--purple-lighter)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
};