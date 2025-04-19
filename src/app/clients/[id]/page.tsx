'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '../../dashboard-layout';
import Link from 'next/link';
import { FiArrowLeft, FiEdit, FiTrash, FiCheck, FiX, FiAlertCircle, FiMapPin, FiPlus } from 'react-icons/fi';
import { useAppContext } from '@/lib/context';
import { formatDate } from '@/lib/utils';
import { ClientBranch } from '@/lib/types';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { 
    clients, 
    permits,
    clientBranches,
    updateClient, 
    deleteClient,
    getClientPermits,
    getClientBranches,
    addClientBranch,
    updateClientBranch,
    deleteClientBranch
  } = useAppContext();
  
  const clientId = params.id as string;
  const client = clients.find(c => c.id === clientId);
  const clientPermits = permits.filter(p => p.clientId === clientId);
  const branches = clientBranches.filter(b => b.clientId === clientId);
  
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [currentBranch, setCurrentBranch] = useState<ClientBranch | null>(null);
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
  
  const [branchForm, setBranchForm] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    contactPerson: '',
    phone: '',
    email: '',
    isMainLocation: false
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
  
  // Handle branch form input changes
  const handleBranchInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setBranchForm(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else {
      setBranchForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
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
  
  // Handle opening branch modal in add mode
  const handleAddBranch = () => {
    setCurrentBranch(null);
    setBranchForm({
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      contactPerson: '',
      phone: '',
      email: '',
      isMainLocation: branches.length === 0 // Make it main location if it's the first branch
    });
    setShowBranchModal(true);
  };
  
  // Handle opening branch modal in edit mode
  const handleEditBranch = (branch: ClientBranch) => {
    setCurrentBranch(branch);
    setBranchForm({
      name: branch.name,
      address: branch.address,
      city: branch.city,
      state: branch.state,
      zipCode: branch.zipCode,
      contactPerson: branch.contactPerson || '',
      phone: branch.phone || '',
      email: branch.email || '',
      isMainLocation: branch.isMainLocation
    });
    setShowBranchModal(true);
  };
  
  // Handle saving a branch
  const handleSaveBranch = () => {
    try {
      if (!branchForm.name || !branchForm.address || !branchForm.city || !branchForm.state || !branchForm.zipCode) {
        throw new Error('Please fill in all required fields');
      }
      
      if (currentBranch) {
        // Update existing branch
        updateClientBranch(currentBranch.id, {
          name: branchForm.name,
          address: branchForm.address,
          city: branchForm.city,
          state: branchForm.state,
          zipCode: branchForm.zipCode,
          contactPerson: branchForm.contactPerson || undefined,
          phone: branchForm.phone || undefined,
          email: branchForm.email || undefined,
          isMainLocation: branchForm.isMainLocation
        });
      } else {
        // Add new branch
        addClientBranch({
          clientId,
          name: branchForm.name,
          address: branchForm.address,
          city: branchForm.city,
          state: branchForm.state,
          zipCode: branchForm.zipCode,
          contactPerson: branchForm.contactPerson || undefined,
          phone: branchForm.phone || undefined,
          email: branchForm.email || undefined,
          isMainLocation: branchForm.isMainLocation
        });
      }
      
      setShowBranchModal(false);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  // Handle deleting a branch
  const handleDeleteBranch = (branchId: string) => {
    try {
      deleteClientBranch(branchId);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Find main branch
  const mainBranch = branches.find(branch => branch.isMainLocation);

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
                    <p className="text-sm text-gray-500">Main Address</p>
                    <p className="font-medium">
                      {mainBranch ? (
                        <>
                          {mainBranch.address}, {mainBranch.city}, {mainBranch.state} {mainBranch.zipCode}
                          <span className="ml-2 inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                            {mainBranch.name}
                          </span>
                        </>
                      ) : client.address ? (
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
          
          {/* Branch locations */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Branch Locations</h2>
              <button 
                onClick={handleAddBranch}
                className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100 flex items-center"
              >
                <FiPlus className="mr-1" /> Add Branch
              </button>
            </div>
            
            {branches.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No branch locations added yet</p>
            ) : (
              <div className="divide-y">
                {branches.map(branch => (
                  <div key={branch.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium flex items-center">
                          {branch.name}
                          {branch.isMainLocation && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                              Main Location
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {branch.address}, {branch.city}, {branch.state} {branch.zipCode}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditBranch(branch)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <FiEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteBranch(branch.id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={branch.isMainLocation && branches.length === 1}
                        >
                          <FiTrash size={16} />
                        </button>
                      </div>
                    </div>
                    
                    {(branch.contactPerson || branch.phone || branch.email) && (
                      <div className="mt-2 text-sm">
                        {branch.contactPerson && <p><strong>Contact:</strong> {branch.contactPerson}</p>}
                        {branch.phone && <p><strong>Phone:</strong> {branch.phone}</p>}
                        {branch.email && <p><strong>Email:</strong> {branch.email}</p>}
                      </div>
                    )}
                  </div>
                ))}
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
      
      {/* Branch Modal */}
      {showBranchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-xl font-medium mb-4">
              {currentBranch ? 'Edit Branch Location' : 'Add Branch Location'}
            </h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="branch-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Branch Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="branch-name"
                  name="name"
                  value={branchForm.name}
                  onChange={handleBranchInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g. Downtown Office, North Branch"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="branch-address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="branch-address"
                  name="address"
                  value={branchForm.address}
                  onChange={handleBranchInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label htmlFor="branch-city" className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="branch-city"
                    name="city"
                    value={branchForm.city}
                    onChange={handleBranchInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                
                <div className="col-span-1">
                  <label htmlFor="branch-state" className="block text-sm font-medium text-gray-700 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="branch-state"
                    name="state"
                    value={branchForm.state}
                    onChange={handleBranchInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                
                <div className="col-span-1">
                  <label htmlFor="branch-zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                    Zip Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="branch-zipCode"
                    name="zipCode"
                    value={branchForm.zipCode}
                    onChange={handleBranchInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="branch-contactPerson" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Person
                </label>
                <input
                  type="text"
                  id="branch-contactPerson"
                  name="contactPerson"
                  value={branchForm.contactPerson}
                  onChange={handleBranchInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="branch-phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="branch-phone"
                    name="phone"
                    value={branchForm.phone}
                    onChange={handleBranchInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="branch-email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="branch-email"
                    name="email"
                    value={branchForm.email}
                    onChange={handleBranchInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="branch-isMainLocation"
                  name="isMainLocation"
                  checked={branchForm.isMainLocation}
                  onChange={handleBranchInputChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="branch-isMainLocation" className="ml-2 block text-sm text-gray-700">
                  Set as main location
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowBranchModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBranch}
                className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
              >
                {currentBranch ? 'Update Branch' : 'Add Branch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 