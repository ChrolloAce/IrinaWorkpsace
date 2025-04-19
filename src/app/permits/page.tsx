'use client';

import React, { useState } from 'react';
import DashboardLayout from '../dashboard-layout';
import Link from 'next/link';
import { FiPlus, FiMoreVertical, FiEdit2, FiTrash2, FiCheckSquare, FiAlertCircle } from 'react-icons/fi';
import { useAppContext } from '@/lib/context';
import { PermitStatus } from '@/lib/types';

export default function PermitsPage() {
  const { permits, clients, deletePermit } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [permitToDelete, setPermitToDelete] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle filter changes
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const handleClientFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setClientFilter(e.target.value);
  };

  // Confirm delete
  const confirmDelete = (permitId: string) => {
    setPermitToDelete(permitId);
    setShowDeleteModal(true);
  };

  // Handle permit deletion
  const handleDeletePermit = () => {
    if (!permitToDelete) return;
    
    try {
      deletePermit(permitToDelete);
      setPermitToDelete(null);
      setShowDeleteModal(false);
      setDeleteError(null);
    } catch (error: any) {
      setDeleteError(error.message);
    }
  };

  // Get client name by ID
  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Unknown Client';
  };

  // Filter permits
  const filteredPermits = permits.filter(permit => {
    // First apply search filter
    const matchesSearch = permit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          permit.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          permit.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    // Apply status filter
    if (statusFilter !== 'all' && permit.status !== statusFilter) return false;
    
    // Apply client filter
    if (clientFilter !== 'all' && permit.clientId !== clientFilter) return false;
    
    return true;
  });

  // Status badge helper
  const getStatusBadgeClass = (status: PermitStatus) => {
    const classes = {
      'draft': 'bg-gray-100 text-gray-800',
      'submitted': 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'expired': 'bg-red-100 text-red-800',
    };
    return classes[status];
  };

  return (
    <DashboardLayout title="Permits">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Permits</h1>
        <Link 
          href="/permits/new" 
          className="btn-primary flex items-center"
        >
          <FiPlus className="mr-2" size={16} /> Create New Permit
        </Link>
      </div>

      {/* Error message if deletion fails */}
      {deleteError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
          <FiAlertCircle className="mr-2" size={16} />
          {deleteError}
        </div>
      )}

      {/* Search and filter */}
      <div className="mb-6 flex flex-col md:flex-row justify-between gap-4">
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search permits..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full bg-white px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <select 
            className="bg-white px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={statusFilter}
            onChange={handleStatusFilterChange}
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="in-progress">In Progress</option>
            <option value="approved">Approved</option>
            <option value="expired">Expired</option>
          </select>
          <select 
            className="bg-white px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={clientFilter}
            onChange={handleClientFilterChange}
          >
            <option value="all">All Clients</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Permits table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {filteredPermits.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm || statusFilter !== 'all' || clientFilter !== 'all' 
              ? "No permits match your search criteria" 
              : "No permits yet. Click 'Create New Permit' to get started."}
          </div>
        ) : (
          <div className="overflow-x-auto">
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
                {filteredPermits.map((permit) => (
                  <tr key={permit.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        <Link href={`/permits/${permit.id}`} className="hover:text-indigo-600">
                          {permit.title}
                        </Link>
                      </div>
                      <div className="text-xs text-gray-500">{permit.permitNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <Link href={`/clients/${permit.clientId}`} className="hover:text-indigo-600">
                          {getClientName(permit.clientId)}
                        </Link>
                      </div>
                      <div className="text-xs text-gray-500">{permit.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(permit.status)}`}>
                        {permit.status.charAt(0).toUpperCase() + permit.status.slice(1).replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(permit.createdAt).toLocaleDateString()}
                      {permit.expiresAt && (
                        <div className="text-xs text-gray-400">
                          Expires: {new Date(permit.expiresAt).toLocaleDateString()}
                        </div>
                      )}
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
                          <FiCheckSquare size={16} />
                        </Link>
                        <Link href={`/permits/${permit.id}/edit`} className="text-indigo-600 hover:text-indigo-900" title="Edit">
                          <FiEdit2 size={16} />
                        </Link>
                        <button 
                          className="text-red-600 hover:text-red-900" 
                          title="Delete"
                          onClick={() => confirmDelete(permit.id)}
                        >
                          <FiTrash2 size={16} />
                        </button>
                        <Link href={`/permits/${permit.id}`} className="text-gray-400 hover:text-gray-600" title="More">
                          <FiMoreVertical size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Confirm Deletion</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this permit? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setPermitToDelete(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePermit}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 