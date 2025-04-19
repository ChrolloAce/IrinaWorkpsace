'use client';

import React, { useState } from 'react';
import DashboardLayout from '../dashboard-layout';
import Link from 'next/link';
import { FiPlus, FiMoreVertical, FiEdit2, FiTrash2, FiAlertCircle } from 'react-icons/fi';
import { useAppContext } from '@/lib/context';
import { Client } from '@/lib/types';

export default function ClientsPage() {
  const { clients, permits, deleteClient } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle filter change
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value);
  };

  // Confirm delete
  const confirmDelete = (clientId: string) => {
    setClientToDelete(clientId);
    setShowDeleteModal(true);
  };

  // Handle client deletion
  const handleDeleteClient = () => {
    if (!clientToDelete) return;
    
    try {
      deleteClient(clientToDelete);
      setClientToDelete(null);
      setShowDeleteModal(false);
      setDeleteError(null);
    } catch (error: any) {
      setDeleteError(error.message);
    }
  };

  // Filter and search clients
  const filteredClients = clients.filter(client => {
    // First apply search filter
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    // Then apply permit filter
    if (filter === 'all') return true;
    
    const clientPermits = permits.filter(permit => permit.clientId === client.id);
    if (filter === 'active' && clientPermits.length > 0) return true;
    if (filter === 'none' && clientPermits.length === 0) return true;
    
    return false;
  });

  // Get client permit count
  const getClientPermitCount = (clientId: string) => {
    return permits.filter(permit => permit.clientId === clientId).length;
  };

  return (
    <DashboardLayout title="Clients">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Clients</h1>
        <Link 
          href="/clients/new" 
          className="btn-primary flex items-center"
        >
          <FiPlus className="mr-2" size={16} /> Add New Client
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
            placeholder="Search clients..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full bg-white px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-3">
          <select 
            className="bg-white px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={filter}
            onChange={handleFilterChange}
          >
            <option value="all">All Clients</option>
            <option value="active">With Active Permits</option>
            <option value="none">No Permits</option>
          </select>
        </div>
      </div>

      {/* Clients table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {filteredClients.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm || filter !== 'all' 
              ? "No clients match your search criteria" 
              : "No clients yet. Click 'Add New Client' to get started."}
          </div>
        ) : (
          <div className="overflow-x-auto">
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
                {filteredClients.map((client) => {
                  const permitCount = getClientPermitCount(client.id);
                  return (
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
                        {client.address}, {client.city}, {client.state} {client.zipCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          permitCount > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {permitCount} {permitCount === 1 ? 'Permit' : 'Permits'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link href={`/clients/${client.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
                            <FiEdit2 size={16} />
                          </Link>
                          <button 
                            className="text-red-600 hover:text-red-900"
                            onClick={() => confirmDelete(client.id)}
                          >
                            <FiTrash2 size={16} />
                          </button>
                          <Link href={`/clients/${client.id}`} className="text-gray-400 hover:text-gray-600">
                            <FiMoreVertical size={16} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
              Are you sure you want to delete this client? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setClientToDelete(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteClient}
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