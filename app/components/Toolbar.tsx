import React from 'react';
import { Settings, HelpCircle, Bell, Upload } from 'lucide-react';
import Link from 'next/link';

interface ToolbarProps {
  userName?: string;
  notifications?: number;
}

export const Toolbar: React.FC<ToolbarProps> = ({ userName = 'User', notifications = 0 }) => {
  return (
    <div className="flex items-center gap-2">
      {/* Upload link */}
      <Link href="/upload" className="p-1.5 text-white/80 hover:text-white hover:bg-blue-700 rounded-md transition-colors" title="Upload Documents">
        <Upload size={18} />
      </Link>

      {/* Help */}
      <button 
        className="p-1.5 text-white/80 hover:text-white hover:bg-blue-700 rounded-md transition-colors"
        title="Help"
      >
        <HelpCircle size={18} />
      </button>

      {/* Settings */}
      <button 
        className="p-1.5 text-white/80 hover:text-white hover:bg-blue-700 rounded-md transition-colors"
        title="Settings"
      >
        <Settings size={18} />
      </button>

      {/* Notifications */}
      <button 
        className="p-1.5 text-white/80 hover:text-white hover:bg-blue-700 rounded-md transition-colors relative"
        title="Notifications"
      >
        <Bell size={18} />
        {notifications > 0 && (
          <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
            {notifications > 9 ? '9+' : notifications}
          </span>
        )}
      </button>

      {/* User */}
      <div className="flex items-center gap-2 pl-2 ml-1 border-l border-blue-500">
        <div className="w-6 h-6 rounded-full bg-blue-800 flex items-center justify-center text-xs text-white font-medium">
          {userName.charAt(0).toUpperCase()}
        </div>
        <span className="text-white text-sm hidden sm:block">{userName}</span>
      </div>
    </div>
  );
};