'use client';

import React, { useState } from 'react';
import DashboardLayout from '../dashboard-layout';
import { useAppContext } from '@/lib/context';
import { ChecklistTemplate, TemplateItem } from '@/lib/types';
import { FiEdit, FiTrash, FiPlus, FiSave, FiX, FiClipboard } from 'react-icons/fi';
import { generateId } from '@/lib/utils';

export default function ChecklistsPage() {
  const { checklistTemplates, addChecklistTemplate, updateChecklistTemplate, deleteChecklistTemplate } = useAppContext();

  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [newTemplate, setNewTemplate] = useState<Omit<ChecklistTemplate, 'id' | 'createdAt'>>({
    name: '',
    description: '',
    permitType: '',
    items: [],
  });
  const [editingTemplate, setEditingTemplate] = useState<ChecklistTemplate | null>(null);
  const [newItem, setNewItem] = useState<Omit<TemplateItem, 'id'>>({
    title: '',
    price: 0,
    order: 0,
  });
  const [error, setError] = useState<string | null>(null);

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

  // Handle adding a new template
  const handleAddTemplate = () => {
    try {
      if (!newTemplate.name) {
        throw new Error('Template name is required');
      }
      if (!newTemplate.permitType) {
        throw new Error('Permit type is required');
      }
      if (newTemplate.items.length === 0) {
        throw new Error('At least one checklist item is required');
      }

      addChecklistTemplate(newTemplate);
      setNewTemplate({
        name: '',
        description: '',
        permitType: '',
        items: [],
      });
      setIsCreating(false);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handle updating a template
  const handleUpdateTemplate = () => {
    try {
      if (!editingTemplate) return;
      
      if (!editingTemplate.name) {
        throw new Error('Template name is required');
      }
      if (!editingTemplate.permitType) {
        throw new Error('Permit type is required');
      }
      if (editingTemplate.items.length === 0) {
        throw new Error('At least one checklist item is required');
      }

      updateChecklistTemplate(editingTemplate.id, editingTemplate);
      setIsEditing(null);
      setEditingTemplate(null);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handle deleting a template
  const handleDeleteTemplate = (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      deleteChecklistTemplate(id);
    }
  };

  // Handle adding an item to new template
  const handleAddItem = () => {
    if (!newItem.title) {
      setError('Item title is required');
      return;
    }

    const itemId = generateId();
    const item: TemplateItem = {
      id: itemId,
      title: newItem.title,
      price: newItem.price,
      order: newTemplate.items.length + 1,
    };

    setNewTemplate({
      ...newTemplate,
      items: [...newTemplate.items, item],
    });

    setNewItem({
      title: '',
      price: 0,
      order: 0,
    });
    setError(null);
  };

  // Handle adding an item to editing template
  const handleAddItemToEditing = () => {
    if (!editingTemplate) return;
    
    if (!newItem.title) {
      setError('Item title is required');
      return;
    }

    const itemId = generateId();
    const item: TemplateItem = {
      id: itemId,
      title: newItem.title,
      price: newItem.price,
      order: editingTemplate.items.length + 1,
    };

    setEditingTemplate({
      ...editingTemplate,
      items: [...editingTemplate.items, item],
    });

    setNewItem({
      title: '',
      price: 0,
      order: 0,
    });
    setError(null);
  };

  // Handle removing an item from new template
  const handleRemoveItem = (id: string) => {
    setNewTemplate({
      ...newTemplate,
      items: newTemplate.items.filter(item => item.id !== id),
    });
  };

  // Handle removing an item from editing template
  const handleRemoveItemFromEditing = (id: string) => {
    if (!editingTemplate) return;
    
    setEditingTemplate({
      ...editingTemplate,
      items: editingTemplate.items.filter(item => item.id !== id),
    });
  };

  // Start editing a template
  const handleEdit = (template: ChecklistTemplate) => {
    setIsEditing(template.id);
    setEditingTemplate({ ...template });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(null);
    setEditingTemplate(null);
    setError(null);
  };

  // Cancel creating new template
  const handleCancelCreate = () => {
    setIsCreating(false);
    setNewTemplate({
      name: '',
      description: '',
      permitType: '',
      items: [],
    });
    setError(null);
  };

  return (
    <DashboardLayout title="Checklist Templates">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Checklist Templates</h1>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="btn-primary flex items-center"
          >
            <FiPlus className="mr-2" /> New Template
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Create new template form */}
      {isCreating && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">New Checklist Template</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., Standard Construction Permit"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Permit Type <span className="text-red-500">*</span>
              </label>
              <select
                value={newTemplate.permitType}
                onChange={(e) => setNewTemplate({ ...newTemplate, permitType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select a type</option>
                {permitTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={newTemplate.description}
              onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
              placeholder="Describe the purpose or usage of this template"
            />
          </div>
          
          <div className="mb-4">
            <h3 className="text-md font-medium mb-2">Checklist Items</h3>
            
            <div className="mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="col-span-2">
                  <input
                    type="text"
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter item title"
                  />
                </div>
                <div className="flex">
                  <div className="flex items-center bg-gray-100 px-2 rounded-l-md">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="number"
                    value={newItem.price || ''}
                    onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300"
                    placeholder="Price"
                  />
                  <button
                    onClick={handleAddItem}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700"
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>
            </div>
            
            {newTemplate.items.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {newTemplate.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          ${(item.price || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FiTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 border border-dashed rounded-md text-gray-500 text-center">
                No items added yet. Add at least one item to create the template.
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancelCreate}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddTemplate}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Create Template
            </button>
          </div>
        </div>
      )}

      {/* Edit template form */}
      {isEditing && editingTemplate && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Edit Template: {editingTemplate.name}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editingTemplate.name}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Permit Type <span className="text-red-500">*</span>
              </label>
              <select
                value={editingTemplate.permitType}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, permitType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select a type</option>
                {permitTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={editingTemplate.description}
              onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>
          
          <div className="mb-4">
            <h3 className="text-md font-medium mb-2">Checklist Items</h3>
            
            <div className="mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="col-span-2">
                  <input
                    type="text"
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter item title"
                  />
                </div>
                <div className="flex">
                  <div className="flex items-center bg-gray-100 px-2 rounded-l-md">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="number"
                    value={newItem.price || ''}
                    onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300"
                    placeholder="Price"
                  />
                  <button
                    onClick={handleAddItemToEditing}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700"
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>
            </div>
            
            {editingTemplate.items.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {editingTemplate.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          ${(item.price || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleRemoveItemFromEditing(item.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FiTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 border border-dashed rounded-md text-gray-500 text-center">
                No items added yet. Add at least one item to save the template.
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancelEdit}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateTemplate}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* List of templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {checklistTemplates.map((template) => (
          <div key={template.id} className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex justify-between mb-2">
              <h3 className="text-lg font-medium">{template.name}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(template)}
                  className="text-gray-500 hover:text-indigo-600"
                >
                  <FiEdit />
                </button>
                <button
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="text-gray-500 hover:text-red-600"
                >
                  <FiTrash />
                </button>
              </div>
            </div>
            
            <div className="mb-3">
              <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                {template.permitType}
              </span>
            </div>
            
            <p className="text-sm text-gray-500 mb-3">
              {template.description || 'No description provided'}
            </p>
            
            <div className="border-t pt-3">
              <p className="text-sm font-medium">Items: {template.items.length}</p>
              <p className="text-sm">
                Total Value: ${template.items.reduce((sum, item) => sum + (item.price || 0), 0).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
} 