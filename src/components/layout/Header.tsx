'use client';

import React, { useState } from 'react';
import { FiBell, FiSearch, FiUser, FiSettings, FiLogOut, FiChevronDown } from 'react-icons/fi';

type HeaderProps = {
  title: string;
};

export default function Header({ title }: HeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  return (
    <header className="bg-white border-b border-gray-100 py-4 px-6 flex items-center justify-between sticky top-0 z-10">
      <h1 className="text-xl font-semibold">{title}</h1>
      
      <div className="flex items-center space-x-4">
        {/* Search bar - hide on small screens */}
        <div className="relative hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search"
            className="bg-gray-50 pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        
        {/* Notification icon */}
        <button className="p-2 rounded-full hover:bg-gray-100 relative">
          <FiBell className="h-5 w-5 text-gray-500" />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>
        
        {/* Profile dropdown */}
        <div className="relative">
          <button 
            onClick={toggleProfileMenu}
            className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 focus:outline-none"
          >
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
              <FiUser className="h-4 w-4" />
            </div>
            <FiChevronDown className="h-4 w-4 text-gray-500 hidden sm:block" />
          </button>
          
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-gray-500 truncate">admin@example.com</p>
              </div>
              <a href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <FiUser className="mr-3 h-4 w-4" />
                <span>Your Profile</span>
              </a>
              <a href="/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <FiSettings className="mr-3 h-4 w-4" />
                <span>Settings</span>
              </a>
              <div className="border-t border-gray-100"></div>
              <a href="/logout" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <FiLogOut className="mr-3 h-4 w-4" />
                <span>Sign out</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 