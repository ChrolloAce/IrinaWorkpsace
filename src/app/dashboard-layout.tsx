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
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      <Sidebar />
      <div className="flex flex-col flex-1 w-full">
        <Header title={title} />
        <main className="flex-1 p-4 md:p-8 overflow-auto max-w-full">
          <div className="max-w-screen-2xl mx-auto">
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