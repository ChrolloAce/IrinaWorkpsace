'use client';

import React from 'react';
import DashboardLayout from '../dashboard-layout';
import Link from 'next/link';
import { FiPlus, FiMoreVertical, FiEdit2, FiTrash2 } from 'react-icons/fi';

// Client type definition
type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  permits: number;
};

// Sample clients data
const clients: Client[] = [
  {
    id: '1',
    name: 'Bank of America',
    email: 'contact@bankofamerica.com',
    phone: '(123) 456-7890',
    address: '123 Main St, Atlanta, GA',
    permits: 3,
  },
  {
    id: '2',
    name: 'Wells Fargo',
    email: 'contact@wellsfargo.com',
    phone: '(234) 567-8901',
    address: '456 Oak St, Miami, FL',
    permits: 2,
  },
  {
    id: '3',
    name: 'First National Bank',
    email: 'contact@fnb.com',
    phone: '(345) 678-9012',
    address: '789 Pine St, Tampa, FL',
    permits: 1,
  },
  {
    id: '4',
    name: 'Chase Bank',
    email: 'contact@chase.com',
    phone: '(456) 789-0123',
    address: '159 Cedar St, Orlando, FL',
    permits: 0,
  },
];

export default function ClientsPage() {
  return (
    <DashboardLayout title="Clients">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Clients</h1>
        <Link 
          href="/clients/new" 
          className="btn-primary flex items-center"
        >
          <FiPlus className="mr-2" /> Add New Client
        </Link>
      </div>

      {/* Search and filter */}
      <div className="mb-6 flex justify-between">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search clients..."
            className="w-full bg-white px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-3">
          <select className="bg-white px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
            <option value="">All Clients</option>
            <option value="active">With Active Permits</option>
            <option value="none">No Permits</option>
          </select>
        </div>
      </div>

      {/* Clients table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Permits
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    <Link href={`/clients/${client.id}`} className="hover:text-indigo-600">
                      {client.name}
                    </Link>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{client.email}</div>
                  <div className="text-sm text-gray-500">{client.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {client.address}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    client.permits > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {client.permits} {client.permits === 1 ? 'Permit' : 'Permits'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Link href={`/clients/${client.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
                      <FiEdit2 />
                    </Link>
                    <button className="text-red-600 hover:text-red-900">
                      <FiTrash2 />
                    </button>
                    <Link href={`/clients/${client.id}`} className="text-gray-400 hover:text-gray-600">
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