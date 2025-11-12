'use client';

import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

type DashboardLayoutProps = {
  children: React.ReactNode;
  title?: string;
};

export default function DashboardLayout({ 
  children, 
  title = 'Dashboard' 
}: DashboardLayoutProps) {
  return (
    <div className="flex h-full min-h-screen w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col w-full min-w-0 overflow-hidden">
        <Header title={title} />
        <main className="flex-1 py-6 px-4 md:px-6 lg:px-8 overflow-auto relative bg-white">
          <div className="w-full">
            {children}
          </div>
        </main>
        <footer className="py-3 px-6 text-center text-sm text-gray-500 border-t border-gray-100 bg-white">
          <p>&copy; {new Date().getFullYear()} Permit Management Dashboard. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
} 