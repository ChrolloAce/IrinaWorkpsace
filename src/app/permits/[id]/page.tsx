'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '../../dashboard-layout';
import Link from 'next/link';
import { FiArrowLeft, FiEdit, FiTrash, FiCheck, FiX, FiAlertCircle, FiPlusCircle } from 'react-icons/fi';
import { useAppContext } from '@/lib/context';
import { formatDate } from '@/lib/utils';

export default function PermitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { 
    permits, 
    clients, 
    checklistItems, 
    updatePermit, 
    updateChecklistItem, 
    addChecklistItem, 
    deleteChecklistItem 
  } = useAppContext();
  
  const permitId = params.id as string;
  const permit = permits.find(p => p.id === permitId);
  const client = permit ? clients.find(c => c.id === permit.clientId) : null;
  const permitChecklists = checklistItems.filter(item => item.permitId === permitId);
  
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newItemText, setNewItemText] = useState('');
  const [editForm, setEditForm] = useState({
    title: permit?.title || '',
    permitType: permit?.permitType || '',
    status: permit?.status || 'draft',
    location: permit?.location || '',
    description: permit?.description || '',
    assignedTo: permit?.assignedTo || '',
    expiresAt: permit?.expiresAt || '',
  });
  
  // Progress percentage based on checklist items
  const progress = permitChecklists.length > 0
    ? Math.round((permitChecklists.filter(item => item.completed).length / permitChecklists.length) * 100)
    : 0;
  
  if (!permit) {
    return (
      <DashboardLayout title="Permit Not Found">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Permit Not Found</h2>
          <p className="text-gray-500 mb-6">The permit you are looking for does not exist or has been deleted.</p>
          <Link href="/permits" className="btn-primary">
            Return to Permits
          </Link>
        </div>
      </DashboardLayout>
    );
  }
  
  // Handle toggling a checklist item
  const handleToggleChecklistItem = (itemId: string, completed: boolean) => {
    updateChecklistItem(itemId, { completed });
  };
  
  // Handle deleting a checklist item
  const handleDeleteChecklistItem = (itemId: string) => {
    deleteChecklistItem(itemId);
  };
  
  // Handle adding a new checklist item
  const handleAddChecklistItem = () => {
    if (!newItemText.trim()) return;
    
    addChecklistItem({
      permitId,
      title: newItemText.trim(),
      completed: false,
    });
    
    setNewItemText('');
  };
  
  // Handle input changes for the edit form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle saving permit edits
  const handleSaveEdit = () => {
    try {
      if (!editForm.title || !editForm.permitType || !editForm.location) {
        throw new Error('Please fill in all required fields');
      }
      
      updatePermit(permitId, {
        title: editForm.title,
        permitType: editForm.permitType,
        status: editForm.status,
        location: editForm.location,
        description: editForm.description,
        assignedTo: editForm.assignedTo || undefined,
        expiresAt: editForm.expiresAt || null,
      });
      
      setIsEditing(false);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  // Permit status styling
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Permit type options
  const permitTypes = [
    { value: 'Construction', label: 'Construction' },
    { value: 'Renovation', label: 'Renovation' },
    { value: 'Electrical', label: 'Electrical' },
    { value: 'Plumbing', label: 'Plumbing' },
    { value: 'Mechanical', label: 'Mechanical' },
    { value: 'Demolition', label: 'Demolition' },
    { value: 'Signage', label: 'Signage' },
    { value: 'Installation', label: 'Installation' },
    { value: 'Other', label: 'Other' },
  ];

  return (
    <DashboardLayout title={`Permit: ${permit.title}`}>
      <div className="mb-6">
        <Link
          href="/permits"
          className="flex items-center text-sm text-gray-500 hover:text-indigo-600 mb-4"
        >
          <FiArrowLeft className="mr-2" /> Back to Permits
        </Link>
        
        <div className="flex justify-between items-center">
          {!isEditing ? (
            <>
              <h1 className="text-2xl font-semibold">{permit.title}</h1>
              <button
                onClick={() => setIsEditing(true)}
                className="btn-secondary flex items-center"
              >
                <FiEdit className="mr-2" /> Edit Permit
              </button>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-semibold">Edit Permit</h1>
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
      
      {/* Progress bar */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">Permit Progress</h3>
          <span className="text-sm font-medium">{progress}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-indigo-600 h-2.5 rounded-full" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          {/* Permit details */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Permit Details</h2>
            
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Permit Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={editForm.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="permitType" className="block text-sm font-medium text-gray-700 mb-1">
                      Permit Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="permitType"
                      name="permitType"
                      value={editForm.permitType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="">Select type</option>
                      {permitTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={editForm.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="draft">Draft</option>
                      <option value="submitted">Submitted</option>
                      <option value="in-progress">In Progress</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={editForm.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned To
                    </label>
                    <input
                      type="text"
                      id="assignedTo"
                      name="assignedTo"
                      value={editForm.assignedTo}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 mb-1">
                      Expiration Date
                    </label>
                    <input
                      type="date"
                      id="expiresAt"
                      name="expiresAt"
                      value={editForm.expiresAt}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={editForm.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  ></textarea>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Permit Type</p>
                    <p className="font-medium">{permit.permitType}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusStyles(permit.status)}`}>
                      {permit.status.charAt(0).toUpperCase() + permit.status.slice(1)}
                    </span>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{permit.location}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Client</p>
                    <p className="font-medium">{client?.name || 'Unknown Client'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Assigned To</p>
                    <p className="font-medium">{permit.assignedTo || 'Unassigned'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Expiration Date</p>
                    <p className="font-medium">
                      {permit.expiresAt ? formatDate(permit.expiresAt) : 'No expiration date'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="whitespace-pre-wrap">{permit.description}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Checklist items */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Checklist</h2>
            
            <div className="space-y-3 mb-4">
              {permitChecklists.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No checklist items yet</p>
              ) : (
                permitChecklists.map(item => (
                  <div key={item.id} className="flex items-center p-3 border border-gray-200 rounded-lg group">
                    <input
                      type="checkbox"
                      id={`check-${item.id}`}
                      checked={item.completed}
                      onChange={() => handleToggleChecklistItem(item.id, !item.completed)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor={`check-${item.id}`}
                      className={`flex-1 ml-3 text-sm ${item.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}
                    >
                      {item.title}
                    </label>
                    <button
                      onClick={() => handleDeleteChecklistItem(item.id)}
                      className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiTrash size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
            
            <div className="flex items-center">
              <input
                type="text"
                id="newItemText"
                name="newItemText"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddChecklistItem())}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Add new checklist item..."
              />
              <button
                onClick={handleAddChecklistItem}
                className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-700"
              >
                <FiPlusCircle />
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 