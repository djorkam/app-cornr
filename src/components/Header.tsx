import React from 'react';
import { Search, Menu, Bell } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and App Title */}
          <div className="flex items-center space-x-3 pl-4">
            <img 
              src="/cornr_logo_orig_bg_removed_name_removed.png" 
              alt="CORNR" 
              className="h-8"
            />
            <h1 className="text-2xl font-semibold text-gray-800">CORNR</h1>
          </div>
          
          {/* Right side icons */}
          <div className="flex items-center space-x-2">
            <button 
              className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-full transition-colors"
              title="Notifications"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
            </button>
            <button 
              className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-full transition-colors"
              title="Menu"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="pb-4">
          <div className="relative max-w-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search for connections..."
              className="w-full pl-10 pr-4 py-2 border border-purple-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent bg-purple-50/50"
            />
          </div>
        </div>
      </div>
    </header>
  );
};