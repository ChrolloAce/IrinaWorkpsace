'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../dashboard-layout';
import Link from 'next/link';
import { FiArrowLeft, FiSave, FiPlus, FiTrash, FiAlertCircle, FiCheckSquare, FiMapPin } from 'react-icons/fi';
import { useAppContext } from '@/lib/context';
import { PermitStatus, ChecklistTemplate, ClientBranch } from '@/lib/types';

type FormState = {
  title: string;
  clientId: string;
  branchId: string;
  permitType: string;
  status: PermitStatus;
  description: string;
  assignedTo: string;
  expiresAt: string;
  checklistItems: string[];
};

export default function NewPermitPage() {
  const router = useRouter();
  const { clients, addPermit, addChecklistItem, checklistTemplates, clientBranches, getClientBranches } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [filteredTemplates, setFilteredTemplates] = useState<ChecklistTemplate[]>([]);
  const [availableBranches, setAvailableBranches] = useState<ClientBranch[]>([]);
  
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
    branchId: '',
    permitType: '',
    status: 'draft',
    description: '',
    assignedTo: '',
    expiresAt: getDefaultExpirationDate(),
    checklistItems: [],
  });
  
  // New checklist item input
  const [newChecklistItem, setNewChecklistItem] = useState('');

  // Update branches when client changes
  useEffect(() => {
    if (formState.clientId) {
      const branches = getClientBranches(formState.clientId);
      setAvailableBranches(branches);
      
      // If there's only one branch or there's a main location, select it automatically
      const mainBranch = branches.find(branch => branch.isMainLocation);
      if (branches.length === 1) {
        setFormState(prev => ({ ...prev, branchId: branches[0].id }));
      } else if (mainBranch) {
        setFormState(prev => ({ ...prev, branchId: mainBranch.id }));
      } else {
        // Reset branch selection if client changes and no default branch is available
        setFormState(prev => ({ ...prev, branchId: '' }));
      }
    } else {
      setAvailableBranches([]);
      setFormState(prev => ({ ...prev, branchId: '' }));
    }
  }, [formState.clientId, getClientBranches]);

  // Filter templates based on selected permit type
  useEffect(() => {
    if (formState.permitType) {
      const filtered = checklistTemplates.filter(
        template => template.permitType === formState.permitType
      );
      setFilteredTemplates(filtered);
      
      // Clear selected template if it doesn't match the current permit type
      if (selectedTemplateId) {
        const template = checklistTemplates.find(t => t.id === selectedTemplateId);
        if (template && template.permitType !== formState.permitType) {
          setSelectedTemplateId('');
        }
      }
    } else {
      setFilteredTemplates([]);
      setSelectedTemplateId('');
    }
  }, [formState.permitType, checklistTemplates, selectedTemplateId]);

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
  
  // Handle selecting a template
  const handleSelectTemplate = (templateId: string) => {
    const template = checklistTemplates.find(t => t.id === templateId);
    if (!template) return;
    
    setSelectedTemplateId(templateId);
    
    // Update checklist items with template items
    const templateItems = template.items.map(item => item.title);
    setFormState(prev => ({
      ...prev,
      checklistItems: templateItems
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Validate required fields
      if (!formState.title || !formState.clientId || !formState.branchId || !formState.permitType || 
          !formState.description) {
        throw new Error("Please fill in all required fields");
      }
      
      // Get location from selected branch
      const selectedBranch = availableBranches.find(b => b.id === formState.branchId);
      if (!selectedBranch) {
        throw new Error("Please select a valid branch location");
      }
      
      // Create location string from branch data
      const location = `${selectedBranch.name}, ${selectedBranch.address}, ${selectedBranch.city}, ${selectedBranch.state} ${selectedBranch.zipCode}`;
      
      // Create the permit
      const permitId = addPermit({
        title: formState.title,
        clientId: formState.clientId,
        permitType: formState.permitType,
        status: formState.status,
        location,
        description: formState.description,
        assignedTo: formState.assignedTo || undefined,
        expiresAt: formState.expiresAt || null,
      });
      
      // Add checklist items
      if (selectedTemplateId) {
        // If a template is selected, use its items with their prices
        const template = checklistTemplates.find(t => t.id === selectedTemplateId);
        if (template) {
          for (const item of template.items) {
            addChecklistItem({
              permitId,
              title: item.title,
              completed: false,
              price: item.price,
            });
          }
        }
      } else {
        // Use the manually added checklist items without prices
        for (const item of formState.checklistItems) {
          addChecklistItem({
            permitId,
            title: item,
            completed: false,
          });
        }
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
                  title="Add New Client"
                >
                  <FiPlus size={18} />
                </Link>
              </div>
            </div>
            
            <div>
              <label htmlFor="branchId" className="block text-sm font-medium text-gray-700 mb-1">
                Branch Location <span className="text-red-500">*</span>
              </label>
              <select
                id="branchId"
                name="branchId"
                value={formState.branchId}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                required
                disabled={!formState.clientId || availableBranches.length === 0}
              >
                <option value="">Select branch</option>
                {availableBranches.map(branch => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name} {branch.isMainLocation ? '(Main)' : ''}
                  </option>
                ))}
              </select>
              {formState.clientId && availableBranches.length === 0 && (
                <p className="text-sm text-amber-600 mt-1 flex items-center">
                  <FiAlertCircle className="mr-1" size={14} />
                  No branches available for this client. Please add a branch first.
                </p>
              )}
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
            
            <div>
              <div className="flex justify-between">
                <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned To
                </label>
                <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 mb-1">
                  Expiration Date
                </label>
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  id="assignedTo"
                  name="assignedTo"
                  value={formState.assignedTo}
                  onChange={handleInputChange}
                  className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Person responsible"
                />
                <input
                  type="date"
                  id="expiresAt"
                  name="expiresAt"
                  value={formState.expiresAt}
                  onChange={handleInputChange}
                  className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
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
            
            {/* Template Selection */}
            {formState.permitType && filteredTemplates.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select a Template (Optional)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTemplates.map(template => (
                    <div 
                      key={template.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedTemplateId === template.id 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                      }`}
                      onClick={() => handleSelectTemplate(template.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{template.name}</h4>
                        {selectedTemplateId === template.id && (
                          <FiCheckSquare className="text-indigo-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-2 line-clamp-2">{template.description}</p>
                      <div className="text-sm">
                        <span className="font-medium">{template.items.length} items</span>
                        <span className="text-gray-500 mx-1">•</span>
                        <span>${template.items.reduce((sum, item) => sum + (item.price || 0), 0).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedTemplateId && (
                  <div className="mt-2 text-sm">
                    <button 
                      type="button" 
                      className="text-indigo-600 hover:text-indigo-800"
                      onClick={() => {
                        setSelectedTemplateId('');
                        setFormState(prev => ({ ...prev, checklistItems: [] }));
                      }}
                    >
                      Clear selection
                    </button>
                  </div>
                )}
              </div>
            )}
            
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
              
              {formState.checklistItems.length === 0 && !selectedTemplateId && (
                <div className="p-4 border border-dashed rounded-md text-gray-500 text-center">
                  No checklist items yet. Add items manually or select a template above.
                </div>
              )}
            </div>
            
            {/* Only show add item input if no template is selected */}
            {!selectedTemplateId && (
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
            )}
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