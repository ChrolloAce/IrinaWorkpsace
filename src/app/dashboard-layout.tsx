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
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:content-area">
        <Header title={title} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
        <footer className="py-3 px-6 text-center text-sm text-gray-500 border-t border-gray-100 bg-white">
          <p>&copy; {new Date().getFullYear()} Permit Management Dashboard. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
} 