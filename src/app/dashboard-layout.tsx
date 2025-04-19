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
    <>
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title={title} />
        <div className="flex-1 p-6 overflow-auto bg-gray-50">
          {children}
        </div>
      </div>
    </>
  );
} 