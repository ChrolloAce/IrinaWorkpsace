'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../dashboard-layout';
import Link from 'next/link';
import { FiArrowLeft, FiSave, FiPlus, FiTrash, FiAlertCircle } from 'react-icons/fi';
import { useAppContext } from '@/lib/context';
import { PermitStatus } from '@/lib/types';

type FormState = {
  title: string;
  clientId: string;
  permitType: string;
  status: PermitStatus;
  location: string;
  description: string;
  assignedTo: string;
  expiresAt: string;
  checklistItems: string[];
};

export default function NewPermitPage() {
  const router = useRouter();
  const { clients, addPermit, addChecklistItem } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Default expiration date (12 months from today)
  const getDefaultExpirationDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 12);
    return date.toISOString().split('T')[0];
  };
  
  // Form state
  const [formState, setFormState] = useState<FormState>({
    title: '',
    clientId: '',
    permitType: '',
    status: 'draft',
    location: '',
    description: '',
    assignedTo: '',
    expiresAt: getDefaultExpirationDate(),
    checklistItems: [
      'Application form completed',
      'Payment processed',
      'Site plans submitted',
    ],
  });
  
  // New checklist item input
  const [newChecklistItem, setNewChecklistItem] = useState('');

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle adding a new checklist item
  const handleAddChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    
    setFormState(prev => ({
      ...prev,
      checklistItems: [...prev.checklistItems, newChecklistItem.trim()]
    }));
    
    setNewChecklistItem('');
  };
  
  // Handle checklist item deletion
  const handleDeleteChecklistItem = (index: number) => {
    setFormState(prev => ({
      ...prev,
      checklistItems: prev.checklistItems.filter((_, i) => i !== index)
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Validate required fields
      if (!formState.title || !formState.clientId || !formState.permitType || 
          !formState.location || !formState.description) {
        throw new Error("Please fill in all required fields");
      }
      
      // Create the permit
      const permitId = addPermit({
        title: formState.title,
        clientId: formState.clientId,
        permitType: formState.permitType,
        status: formState.status,
        location: formState.location,
        description: formState.description,
        assignedTo: formState.assignedTo || undefined,
        expiresAt: formState.expiresAt || null,
      });
      
      // Add checklist items
      for (const item of formState.checklistItems) {
        addChecklistItem({
          permitId,
          title: item,
          completed: false,
        });
      }
      
      // Redirect to the permit detail page
      router.push(`/permits/${permitId}`);
      
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
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
    <DashboardLayout title="Create New Permit">
      <div className="mb-6">
        <Link 
          href="/permits" 
          className="flex items-center text-sm text-gray-500 hover:text-indigo-600 mb-4"
        >
          <FiArrowLeft className="mr-2" /> Back to Permits
        </Link>
        
        <h1 className="text-2xl font-semibold">Create New Permit</h1>
        <p className="text-gray-500 mt-1">Fill out the permit details below</p>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
          <FiAlertCircle className="mr-2" />
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-sm p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Permit Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formState.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter permit title"
                required
              />
            </div>
            
            <div>
              <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-1">
                Client <span className="text-red-500">*</span>
              </label>
              <div className="flex">
                <select
                  id="clientId"
                  name="clientId"
                  value={formState.clientId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Select client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
                <Link 
                  href="/clients/new"
                  className="flex items-center justify-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-lg bg-gray-50 hover:bg-gray-100"
                >
                  <FiPlus size={18} />
                </Link>
              </div>
            </div>
            
            <div>
              <label htmlFor="permitType" className="block text-sm font-medium text-gray-700 mb-1">
                Permit Type <span className="text-red-500">*</span>
              </label>
              <select
                id="permitType"
                name="permitType"
                value={formState.permitType}
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
                value={formState.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="in-progress">In Progress</option>
                <option value="approved">Approved</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formState.location}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Project location"
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
                value={formState.assignedTo}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Person responsible for this permit"
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
                value={formState.expiresAt}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formState.description}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Detailed description of the permit"
              required
            ></textarea>
          </div>
          
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-lg font-medium mb-4">Checklist Items</h3>
            
            <div className="space-y-3 mb-4">
              {formState.checklistItems.map((item, index) => (
                <div key={index} className="flex items-center p-3 border border-gray-200 rounded-lg group">
                  <div className="flex-1">{item}</div>
                  <button
                    type="button"
                    onClick={() => handleDeleteChecklistItem(index)}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiTrash size={16} />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex items-center mb-6">
              <input
                type="text"
                id="newChecklistItem"
                name="newChecklistItem"
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddChecklistItem())}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Add new checklist item..."
              />
              <button
                type="button"
                onClick={handleAddChecklistItem}
                className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-700"
              >
                <FiPlus />
              </button>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4">
            <Link 
              href="/permits" 
              className="btn-secondary"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="btn-primary flex items-center"
              disabled={isSubmitting}
            >
              <FiSave className="mr-2" /> {isSubmitting ? 'Creating...' : 'Create Permit'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
} 