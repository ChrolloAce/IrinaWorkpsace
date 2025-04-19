'use client';

import React from 'react';
import { FiBell, FiSearch, FiUser } from 'react-icons/fi';

type HeaderProps = {
  title: string;
};

export default function Header({ title }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-100 py-4 px-6 flex items-center justify-between">
      <h1 className="text-xl font-semibold">{title}</h1>
      
      <div className="flex items-center space-x-4">
        {/* Search bar */}
        <div className="relative">
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
        <button className="p-2 rounded-full hover:bg-gray-100">
          <FiBell className="h-5 w-5 text-gray-500" />
        </button>
        
        {/* Profile dropdown */}
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
            <FiUser className="h-4 w-4 text-gray-600" />
          </div>
        </div>
      </div>
    </header>
  );
} 