'use client';

import React from 'react';
import DashboardLayout from '../dashboard-layout';
import Link from 'next/link';
import { FiPlus, FiMoreVertical, FiEdit2, FiTrash2, FiCheckSquare, FiCalendar } from 'react-icons/fi';

// Permit type definition
type Permit = {
  id: string;
  title: string;
  client: string;
  clientId: string;
  status: 'draft' | 'submitted' | 'in-progress' | 'approved' | 'expired';
  createdAt: string;
  expiresAt: string | null;
  progress: number;
};

// Sample permits data
const permits: Permit[] = [
  {
    id: '1',
    title: 'Mall of Georgia Renovations',
    client: 'Bank of America',
    clientId: '1',
    status: 'in-progress',
    createdAt: '2023-07-30',
    expiresAt: '2024-07-30',
    progress: 65,
  },
  {
    id: '2',
    title: 'Ormond Beach Bollards',
    client: 'Bank of America',
    clientId: '1',
    status: 'submitted',
    createdAt: '2023-08-21',
    expiresAt: '2024-08-21',
    progress: 30,
  },
  {
    id: '3',
    title: 'Parking Lot Resurfacing',
    client: 'First National Bank',
    clientId: '3',
    status: 'approved',
    createdAt: '2023-07-15',
    expiresAt: '2024-07-15',
    progress: 100,
  },
  {
    id: '4',
    title: 'ATM Installation',
    client: 'Wells Fargo',
    clientId: '2',
    status: 'expired',
    createdAt: '2022-05-10',
    expiresAt: '2023-05-10',
    progress: 100,
  },
  {
    id: '5',
    title: 'New Branch Construction',
    client: 'Bank of America',
    clientId: '1',
    status: 'draft',
    createdAt: '2023-09-05',
    expiresAt: null,
    progress: 10,
  },
];

const getStatusBadgeClass = (status: Permit['status']) => {
  const classes = {
    'draft': 'bg-gray-100 text-gray-800',
    'submitted': 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-green-100 text-green-800',
    'expired': 'bg-red-100 text-red-800',
  };
  return classes[status];
};

export default function PermitsPage() {
  return (
    <DashboardLayout title="Permits">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Permits</h1>
        <Link 
          href="/permits/new" 
          className="btn-primary flex items-center"
        >
          <FiPlus className="mr-2" /> Create New Permit
        </Link>
      </div>

      {/* Search and filter */}
      <div className="mb-6 flex justify-between">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search permits..."
            className="w-full bg-white px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-3">
          <select className="bg-white px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="in-progress">In Progress</option>
            <option value="approved">Approved</option>
            <option value="expired">Expired</option>
          </select>
          <select className="bg-white px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
            <option value="">All Clients</option>
            <option value="1">Bank of America</option>
            <option value="2">Wells Fargo</option>
            <option value="3">First National Bank</option>
          </select>
        </div>
      </div>

      {/* Permits table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Permit Title
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {permits.map((permit) => (
              <tr key={permit.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    <Link href={`/permits/${permit.id}`} className="hover:text-indigo-600">
                      {permit.title}
                    </Link>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <Link href={`/clients/${permit.clientId}`} className="hover:text-indigo-600">
                      {permit.client}
                    </Link>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(permit.status)}`}>
                    {permit.status.charAt(0).toUpperCase() + permit.status.slice(1).replace('-', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(permit.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full" 
                      style={{ width: `${permit.progress}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {permit.progress}% Complete
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Link href={`/permits/${permit.id}/checklist`} className="text-blue-600 hover:text-blue-900" title="Checklist">
                      <FiCheckSquare />
                    </Link>
                    <Link href={`/permits/${permit.id}/edit`} className="text-indigo-600 hover:text-indigo-900" title="Edit">
                      <FiEdit2 />
                    </Link>
                    <button className="text-red-600 hover:text-red-900" title="Delete">
                      <FiTrash2 />
                    </button>
                    <Link href={`/permits/${permit.id}`} className="text-gray-400 hover:text-gray-600" title="More">
                      <FiMoreVertical />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
} 