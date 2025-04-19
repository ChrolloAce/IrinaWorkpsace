'use client';

import React, { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '../../dashboard-layout';
import Link from 'next/link';
import { FiArrowLeft, FiEdit, FiTrash, FiCheck, FiX, FiAlertCircle, FiPlusCircle, FiFileText, FiMail, FiDownload } from 'react-icons/fi';
import { useAppContext } from '@/lib/context';
import { formatDate } from '@/lib/utils';
import PermitChecklist from '@/components/permits/PermitChecklist';
import { generateInvoiceAction, sendInvoiceEmailAction } from '@/app/actions/invoice-actions';

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
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);
  const [generatedPdfId, setGeneratedPdfId] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadData, setDownloadData] = useState<string | null>(null);
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
  
  // State for invoice preview iframe
  const [invoicePreviewUrl, setInvoicePreviewUrl] = useState<string | null>(null);
  
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
  const handleAddChecklistItem = (item: Omit<typeof checklistItems[0], 'id' | 'permitId' | 'createdAt'>) => {
    addChecklistItem({
      permitId,
      title: item.title,
      completed: item.completed,
      price: item.price,
    });
  };
  
  // Handle updating checklist item notes
  const handleUpdateNotes = (itemId: string, notes: string) => {
    updateChecklistItem(itemId, { notes });
  };
  
  // Handle updating checklist item price
  const handleUpdatePrice = (itemId: string, price: number) => {
    updateChecklistItem(itemId, { price });
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
  
  // Generate invoice
  const handleGenerateInvoice = async () => {
    try {
      if (!client) {
        throw new Error('Client information is required for invoice generation');
      }
      
      setError('Generating invoice, please wait...');
      
      // Call the server action to generate the invoice
      const result = await generateInvoiceAction(permit, client, permitChecklists);
      
      if (result.success) {
        setInvoiceGenerated(true);
        setGeneratedPdfId(result.pdfId || null);
        setDownloadUrl(result.downloadUrl || null);
        setDownloadData(result.pdfData || null);
        
        // Set the preview URL using the base64 data
        setInvoicePreviewUrl(result.pdfData || null);
        
        setError(null);
      } else {
        throw new Error(result.error || 'Failed to generate invoice');
      }
      
    } catch (error: any) {
      console.error('Error generating invoice:', error);
      setError(error.message || 'Failed to generate invoice. Please try again.');
    }
  };
  
  // Handle download invoice
  const handleDownloadInvoice = () => {
    if (downloadData) {
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = downloadData;
      link.download = `invoice-${permitId.substring(0, 8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    } else {
      setError('Download URL not available. Please regenerate the invoice.');
    }
  };
  
  // Send invoice email
  const handleSendInvoice = async () => {
    try {
      if (!client?.email) {
        throw new Error('Client email is required to send the invoice');
      }
      
      if (!generatedPdfId) {
        throw new Error('Invoice must be generated before sending');
      }
      
      // Show loading indicator
      setError('Sending email, please wait...');
      
      // Generate email content
      const subject = `Invoice for ${permit.title} - ${permit.permitNumber}`;
      const text = `Please find attached the invoice for permit ${permit.permitNumber}.`;
      const html = `
        <h1>Invoice for ${permit.title}</h1>
        <p>Dear ${client.name},</p>
        <p>Please find attached the invoice for permit ${permit.permitNumber}.</p>
        <p>Total amount: $${totalCost.toFixed(2)}</p>
        <p>Balance due: $${(totalCost - completedCost).toFixed(2)}</p>
        <p>Thank you for your business!</p>
      `;
      
      // Call the server action to send the email
      const result = await sendInvoiceEmailAction(
        client.email, 
        subject, 
        text, 
        html, 
        generatedPdfId
      );
      
      if (result.success) {
        // Show success message
        setError('Email sent successfully!');
        
        // Close modal after 2 seconds
        setTimeout(() => {
          setShowInvoiceModal(false);
          setInvoiceGenerated(false);
          setGeneratedPdfId(null);
          setError(null);
        }, 2000);
      } else {
        throw new Error(result.error || 'Failed to send email');
      }
      
    } catch (error: any) {
      console.error('Error sending invoice email:', error);
      setError(error.message || 'Failed to send invoice email');
    }
  };
  
  // Calculate total cost of all items
  const totalCost = permitChecklists.reduce((sum, item) => sum + (item.price || 0), 0);
  
  // Calculate cost of completed items
  const completedCost = permitChecklists
    .filter(item => item.completed)
    .reduce((sum, item) => sum + (item.price || 0), 0);
  
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
      <div className="max-w-6xl mx-auto w-full overflow-hidden">
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
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowInvoiceModal(true)}
                    className="btn-primary flex items-center"
                  >
                    <FiFileText className="mr-2" /> Generate Invoice
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-secondary flex items-center"
                  >
                    <FiEdit className="mr-2" /> Edit Permit
                  </button>
                </div>
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
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 w-full">
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
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 w-full">
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
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <PermitChecklist
              items={permitChecklists}
              onItemToggle={handleToggleChecklistItem}
              onAddItem={handleAddChecklistItem}
              onDeleteItem={handleDeleteChecklistItem}
              onUpdateNotes={handleUpdateNotes}
              onUpdatePrice={handleUpdatePrice}
              showPrices={true}
            />
          </div>
        </div>
        
        {/* Invoice Modal */}
        {showInvoiceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-medium">Invoice Preview</h3>
                <button 
                  onClick={() => setShowInvoiceModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX size={24} />
                </button>
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
                  <FiAlertCircle className="mr-2" />
                  {error}
                </div>
              )}
              
              {!invoiceGenerated ? (
                <div className="flex flex-col items-center justify-center space-y-4 py-8">
                  <div className="text-center mb-4">
                    <h4 className="text-lg font-medium mb-2">Generate Professional Invoice</h4>
                    <p className="text-gray-500">
                      Create a professional invoice for {client?.name} for permit {permit.permitNumber}.
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateInvoice}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center text-lg"
                  >
                    <FiFileText className="mr-2" /> Generate Invoice
                  </button>
                </div>
              ) : (
                <div className="flex flex-col flex-grow overflow-hidden">
                  {/* Invoice Preview */}
                  <div className="flex-grow overflow-hidden mb-4 border rounded-lg">
                    {invoicePreviewUrl ? (
                      <iframe 
                        src={invoicePreviewUrl} 
                        className="w-full h-full" 
                        title="Invoice Preview"
                      ></iframe>
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">
                        Loading preview...
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={handleDownloadInvoice}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center"
                    >
                      <FiDownload className="mr-2" /> Download PDF
                    </button>
                    <button
                      onClick={handleSendInvoice}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center"
                    >
                      <FiMail className="mr-2" /> Send via Email
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 