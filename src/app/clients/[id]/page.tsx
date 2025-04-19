'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '../../dashboard-layout';
import Link from 'next/link';
import { FiArrowLeft, FiEdit, FiTrash, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';
import { useAppContext } from '@/lib/context';
import { formatDate } from '@/lib/utils';
import { PermitStatus } from '@/lib/types';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { 
    clients, 
    permits,
    updateClient, 
    deleteClient,
    getClientPermits
  } = useAppContext();
  
  const clientId = params.id as string;
  const client = clients.find(c => c.id === clientId);
  const clientPermits = permits.filter(p => p.clientId === clientId);
  
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: client?.name || '',
    contactPerson: client?.contactPerson || '',
    email: client?.email || '',
    phone: client?.phone || '',
    address: client?.address || '',
    city: client?.city || '',
    state: client?.state || '',
    zipCode: client?.zipCode || '',
    notes: client?.notes || '',
  });
  
  if (!client) {
    return (
      <DashboardLayout title="Client Not Found">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Client Not Found</h2>
          <p className="text-gray-500 mb-6">The client you are looking for does not exist or has been deleted.</p>
          <Link href="/clients" className="btn-primary">
            Return to Clients
          </Link>
        </div>
      </DashboardLayout>
    );
  }
  
  // Handle input changes for the edit form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle saving client edits
  const handleSaveEdit = () => {
    try {
      if (!editForm.name || !editForm.email) {
        throw new Error('Please fill in all required fields');
      }
      
      updateClient(clientId, {
        name: editForm.name,
        contactPerson: editForm.contactPerson,
        email: editForm.email,
        phone: editForm.phone,
        address: editForm.address,
        city: editForm.city,
        state: editForm.state,
        zipCode: editForm.zipCode,
        notes: editForm.notes || undefined,
      });
      
      setIsEditing(false);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  // Handle deleting the client
  const handleDeleteClient = () => {
    try {
      if (clientPermits.length > 0) {
        throw new Error('Cannot delete client with associated permits. Please delete all permits first.');
      }
      
      deleteClient(clientId);
      router.push('/clients');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <DashboardLayout title={`Client: ${client.name}`}>
      <div className="mb-6">
        <Link
          href="/clients"
          className="flex items-center text-sm text-gray-500 hover:text-indigo-600 mb-4"
        >
          <FiArrowLeft className="mr-2" /> Back to Clients
        </Link>
        
        <div className="flex justify-between items-center">
          {!isEditing ? (
            <>
              <h1 className="text-2xl font-semibold">{client.name}</h1>
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-secondary flex items-center"
                >
                  <FiEdit className="mr-2" /> Edit Client
                </button>
                <button
                  onClick={handleDeleteClient}
                  className="btn-danger flex items-center"
                >
                  <FiTrash className="mr-2" /> Delete
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-semibold">Edit Client</h1>
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary flex items-center"
                >
                  <FiX className="mr-2" /> Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="btn-primary flex items-center"
                >
                  <FiCheck className="mr-2" /> Save Changes
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
          <FiAlertCircle className="mr-2" />
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Client details */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Client Details</h2>
            
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Client Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={editForm.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      id="contactPerson"
                      name="contactPerson"
                      value={editForm.contactPerson}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={editForm.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={editForm.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={editForm.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={editForm.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                        Zip Code
                      </label>
                      <input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        value={editForm.zipCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={editForm.notes}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  ></textarea>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Contact Person</p>
                    <p className="font-medium">{client.contactPerson || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{client.email}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{client.phone || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">
                      {client.address ? (
                        <>
                          {client.address}, {client.city}, {client.state} {client.zipCode}
                        </>
                      ) : (
                        'N/A'
                      )}
                    </p>
                  </div>
                </div>
                
                {client.notes && (
                  <div>
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="whitespace-pre-wrap">{client.notes}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium">{formatDate(client.createdAt)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Client permits */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Client Permits</h2>
              <Link href={`/permits/new?clientId=${clientId}`} className="text-sm text-indigo-600 hover:text-indigo-900">
                Add Permit
              </Link>
            </div>
            
            {clientPermits.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No permits found for this client</p>
            ) : (
              <div className="space-y-3">
                {clientPermits.map(permit => (
                  <Link 
                    key={permit.id} 
                    href={`/permits/${permit.id}`}
                    className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{permit.title}</h3>
                        <p className="text-xs text-gray-500">{permit.permitNumber}</p>
                      </div>
                      <div>
                        <span 
                          className={`inline-block px-2 py-1 text-xs font-medium rounded-full
                            ${permit.status === 'approved' ? 'bg-green-100 text-green-800' : 
                              permit.status === 'expired' ? 'bg-purple-100 text-purple-800' :
                              permit.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                              permit.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}
                        >
                          {permit.status.charAt(0).toUpperCase() + permit.status.slice(1).replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 