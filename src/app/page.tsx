'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from './dashboard-layout';
import Link from 'next/link';
import { FiPlus, FiFileText, FiCheckSquare, FiUsers, FiClock, FiChevronRight } from 'react-icons/fi';
import { useAppContext } from '@/lib/context';
import { formatDate } from '@/lib/utils';
import { Card, Flex, Text } from '@/components/ui';

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
  status,
  permitNumber,
  permitId
}: { 
  client: string; 
  title: string; 
  date: string; 
  status: string;
  permitNumber: string;
  permitId: string;
}) => {
  const statusClasses: Record<string, string> = {
    'draft': 'bg-gray-50 text-gray-700',
    'submitted': 'bg-blue-50 text-blue-700',
    'in-progress': 'bg-yellow-50 text-yellow-700',
    'approved': 'bg-green-50 text-green-700',
    'expired': 'bg-purple-50 text-purple-700',
  };

  return (
    <div className="card flex justify-between items-center mb-3 p-4 hover:bg-gray-50 transition-colors">
      <div className="flex-1">
        <Link href={`/permits/${permitId}`} className="flex justify-between items-center">
          <div>
            <div className="font-medium">{title}</div>
            <div className="text-sm text-gray-500">{client} • {date}</div>
          </div>
          <div className="flex items-center">
            <div className={`px-3 py-1 rounded-full text-xs ${statusClasses[status] || 'bg-gray-50 text-gray-700'} mr-3`}>
              {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
            </div>
            <div className="text-indigo-700 font-medium text-sm">{permitNumber}</div>
            <FiChevronRight className="ml-2 text-gray-400" />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default function Home() {
  const { permits, clients, getOpenPermits } = useAppContext();
  const [openPermits, setOpenPermits] = useState<
    Array<{ permit: typeof permits[0]; client: typeof clients[0] | undefined }>
  >([]);
  
  // Fetch open permits on load
  useEffect(() => {
    const open = getOpenPermits().slice(0, 5); // Get top 5 open permits
    
    // Get client info for each permit
    const withClients = open.map(permit => ({
      permit,
      client: clients.find(c => c.id === permit.clientId)
    }));
    
    setOpenPermits(withClients);
  }, [getOpenPermits, clients]);
  
  // Count stats
  const totalPermits = permits.length;
  const pendingPermits = permits.filter(p => p.status === 'submitted' || p.status === 'draft').length;
  const activeClients = clients.length;
  const expiredPermits = permits.filter(p => p.status === 'expired').length;

  return (
    <DashboardLayout title="Dashboard">
      {/* Stats Overview */}
      <div className="dashboard-grid mb-6">
        <StatsCard title="Total Permits" value={totalPermits.toString()} percentage="10%" color="blue" />
        <StatsCard title="Pending Approval" value={pendingPermits.toString()} percentage="5%" trend="down" color="purple" />
        <StatsCard title="Active Clients" value={activeClients.toString()} percentage="15%" color="green" />
        <StatsCard title="Expired Permits" value={expiredPermits.toString()} percentage="3%" trend="down" color="red" />
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            icon={<FiClock size={20} />} 
            label="View All Permits" 
            href="/permits" 
          />
        </div>
      </div>

      {/* Dashboard content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Open Permits - takes up 2/3 on larger screens */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Open Permits</h2>
              <Link href="/permits" className="text-sm text-indigo-600">View All</Link>
            </div>
            <div>
              {openPermits.length === 0 ? (
                <div className="card p-6 text-center text-gray-500">
                  No open permits found. Create a new permit to get started.
                </div>
              ) : (
                openPermits.map(({ permit, client }) => (
                  <RecentPermitCard 
                    key={permit.id}
                    client={client?.name || 'Unknown Client'} 
                    title={permit.title} 
                    date={formatDate(permit.createdAt)} 
                    status={permit.status} 
                    permitNumber={permit.permitNumber}
                    permitId={permit.id}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines - takes up 1/3 on larger screens */}
        <div>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Upcoming Deadlines</h2>
              <Link href="/permits" className="text-sm text-indigo-600">View All</Link>
            </div>
            <div className="card">
              <div className="space-y-4">
                {permits
                  .filter(p => p.expiresAt)
                  .sort((a, b) => {
                    const dateA = a.expiresAt ? new Date(a.expiresAt).getTime() : Infinity;
                    const dateB = b.expiresAt ? new Date(b.expiresAt).getTime() : Infinity;
                    return dateA - dateB;
                  })
                  .slice(0, 3)
                  .map(permit => {
                    const client = clients.find(c => c.id === permit.clientId);
                    const today = new Date();
                    const expireDate = permit.expiresAt ? new Date(permit.expiresAt) : null;
                    const daysLeft = expireDate 
                      ? Math.ceil((expireDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                      : null;
                    
                    return (
                      <div key={permit.id} className="flex justify-between items-center pb-3 border-b">
                        <div>
                          <div className="font-medium">{permit.title}</div>
                          <div className="text-sm text-gray-500">
                            {client?.name || 'Unknown Client'} • {daysLeft !== null ? `Due in ${daysLeft} days` : 'No deadline'}
                          </div>
                        </div>
                        <Link href={`/permits/${permit.id}`} className="text-sm text-indigo-600">View Permit</Link>
                      </div>
                    );
                  })
                }
                {permits.filter(p => p.expiresAt).length === 0 && (
                  <div className="py-4 text-center text-gray-500">
                    No upcoming deadlines found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Links */}
      <div className="mt-6">
        <h2 className="text-lg font-medium mb-4">Additional Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/permits" className="w-full">
            <Card className="p-4 hover:bg-gray-50 transition-colors">
              <Flex justifyContent="start" className="gap-3">
                <FiFileText size={24} className="text-blue-500" />
                <div>
                  <Text className="font-medium">Manage Permits</Text>
                  <Text className="text-gray-500 text-sm">View and manage all permits</Text>
                </div>
              </Flex>
            </Card>
          </Link>
          
          <Link href="/proposals" className="w-full">
            <Card className="p-4 hover:bg-gray-50 transition-colors">
              <Flex justifyContent="start" className="gap-3">
                <FiFileText size={24} className="text-green-500" />
                <div>
                  <Text className="font-medium">Proposals</Text>
                  <Text className="text-gray-500 text-sm">Create and send client proposals</Text>
                </div>
              </Flex>
            </Card>
          </Link>
          
          <Link href="/clients" className="w-full">
            <Card className="p-4 hover:bg-gray-50 transition-colors">
              <Flex justifyContent="start" className="gap-3">
                <FiUsers size={24} className="text-violet-500" />
                <div>
                  <Text className="font-medium">Clients</Text>
                  <Text className="text-gray-500 text-sm">Manage your client database</Text>
                </div>
              </Flex>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
} 