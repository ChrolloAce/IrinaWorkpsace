'use client';

import React from 'react';
import DashboardLayout from './dashboard-layout';
import Link from 'next/link';
import { FiPlus, FiFileText, FiCheckSquare, FiUsers } from 'react-icons/fi';

// Stats Card Component
const StatsCard = ({ 
  title, 
  value, 
  percentage, 
  trend = 'up',
  color = 'blue'
}: { 
  title: string; 
  value: string; 
  percentage: string;
  trend?: 'up' | 'down';
  color?: 'blue' | 'green' | 'purple' | 'red';
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-500',
    green: 'bg-green-50 text-green-500',
    purple: 'bg-purple-50 text-purple-500',
    red: 'bg-red-50 text-red-500',
  };

  return (
    <div className="card flex-1">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-gray-500 text-sm">{title}</div>
          <div className="mt-1 text-2xl font-semibold">{value}</div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs ${colorClasses[color]}`}>
          {trend === 'up' ? '↑' : '↓'} {percentage}
        </div>
      </div>
    </div>
  );
};

// Quick Action Button Component
const ActionButton = ({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) => (
  <Link href={href} className="card flex items-center p-4 hover:bg-gray-50 transition-colors">
    <div className="mr-3 h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
      {icon}
    </div>
    <div className="font-medium">{label}</div>
  </Link>
);

// Recent Permit Card Component
const RecentPermitCard = ({ 
  client, 
  title, 
  date, 
  status 
}: { 
  client: string; 
  title: string; 
  date: string; 
  status: 'pending' | 'approved' | 'in-progress'; 
}) => {
  const statusClasses = {
    'pending': 'bg-yellow-50 text-yellow-700',
    'approved': 'bg-green-50 text-green-700',
    'in-progress': 'bg-blue-50 text-blue-700',
  };

  return (
    <div className="card flex justify-between items-center mb-3">
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-sm text-gray-500">{client} • {date}</div>
      </div>
      <div className={`px-3 py-1 rounded-full text-xs ${statusClasses[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <DashboardLayout title="Dashboard">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard title="Total Permits" value="34" percentage="10%" color="blue" />
        <StatsCard title="Pending Approval" value="12" percentage="5%" trend="down" color="purple" />
        <StatsCard title="Active Clients" value="28" percentage="15%" color="green" />
        <StatsCard title="Expired Permits" value="7" percentage="3%" trend="down" color="red" />
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActionButton 
            icon={<FiPlus size={20} />} 
            label="New Permit" 
            href="/permits/new" 
          />
          <ActionButton 
            icon={<FiUsers size={20} />} 
            label="Add Client" 
            href="/clients/new" 
          />
          <ActionButton 
            icon={<FiCheckSquare size={20} />} 
            label="Create Checklist" 
            href="/checklists/new" 
          />
        </div>
      </div>

      {/* Recent Permits */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Recent Permits</h2>
          <Link href="/permits" className="text-sm text-indigo-600">View All</Link>
        </div>
        <div>
          <RecentPermitCard 
            client="Bank of America" 
            title="Mall of Georgia Renovations" 
            date="Aug 3, 2023" 
            status="in-progress" 
          />
          <RecentPermitCard 
            client="Bank of America" 
            title="Ormond Beach Bollards" 
            date="Aug 21, 2023" 
            status="pending" 
          />
          <RecentPermitCard 
            client="First National Bank" 
            title="Parking Lot Resurfacing" 
            date="Jul 15, 2023" 
            status="approved" 
          />
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Upcoming Deadlines</h2>
          <Link href="/calendar" className="text-sm text-indigo-600">View Calendar</Link>
        </div>
        <div className="card">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b">
              <div>
                <div className="font-medium">Mall of Georgia - Permit Renewal</div>
                <div className="text-sm text-gray-500">Due in 5 days</div>
              </div>
              <Link href="/permits/1" className="text-sm text-indigo-600">View Permit</Link>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <div>
                <div className="font-medium">Ormond Beach - Document Submission</div>
                <div className="text-sm text-gray-500">Due in 10 days</div>
              </div>
              <Link href="/permits/2" className="text-sm text-indigo-600">View Permit</Link>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">Quarterly Compliance Review</div>
                <div className="text-sm text-gray-500">Due in 14 days</div>
              </div>
              <Link href="/calendar" className="text-sm text-indigo-600">View Details</Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 