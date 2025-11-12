'use client';

import { useState, useEffect } from 'react';
import { 
  FiSave, 
  FiPlus, 
  FiTrash2, 
  FiFileText, 
  FiSend,
  FiAlertCircle,
  FiEdit2,
  FiCheck,
  FiX,
  FiChevronUp,
  FiChevronDown,
  FiDollarSign
} from 'react-icons/fi';
import { useToast } from '@/components/ui';
import { generateProposalAction, sendProposalEmailAction } from '@/app/actions/proposal-actions';
import type { Client, Permit, Proposal, ProposalItem, ProposalStatus } from '@/lib/types';
import { createNewProposal } from '@/lib/proposal-client';
import { generateId } from '@/lib/utils';
import { useAppContext } from '@/lib/context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import EmailEditorModal from '@/components/EmailEditorModal';

type ProposalFormProps = {
  clients: Client[];
  permitId?: string;
  initialProposal?: Proposal;
  isEditing?: boolean;
};

export default function ProposalForm({
  clients,
  permitId,
  initialProposal,
  isEditing = false
}: ProposalFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { addProposal, updateProposal, permits, getClientById, getClientBranches, convertProposalToInvoice, getProposalInvoices } = useAppContext();
  
  // Initialize with either the provided proposal or a new one
  const [proposal, setProposal] = useState<Proposal>(() => {
    if (initialProposal) return initialProposal;
    
    // If permitId is provided, create a proposal linked to that permit
    if (permitId) {
      return createNewProposal(clients[0]?.id || '', permitId);
    }
    
    // Default new proposal
    return createNewProposal(clients[0]?.id || '');
  });
  
  // State for new item being added
  const [newItem, setNewItem] = useState<Partial<ProposalItem>>({
    description: '',
    quantity: 1,
    unitPrice: 0,
    total: 0
  });
  
  // Error state
  const [error, setError] = useState<string | null>(null);
  
  // Fetch the client and permit based on IDs
  const selectedClient = getClientById(proposal.clientId) || clients[0];
  const selectedPermit = proposal.permitId ? permits.find(p => p.id === proposal.permitId) : null;
  
  // Get available branches for selected client
  const availableBranches = selectedClient 
    ? getClientBranches(selectedClient.id) 
    : [];
  
  // Calculate total when items change
  useEffect(() => {
    const calculatedTotal = proposal.items.reduce((sum, item) => sum + item.total, 0);
    setProposal(prev => ({
      ...prev,
      totalAmount: calculatedTotal
    }));
  }, [proposal.items]);

  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProposal(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle client selection
  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setProposal(prev => ({
      ...prev,
      clientId: value
    }));
  };

  // Handle permit selection
  const handlePermitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setProposal(prev => ({
      ...prev,
      permitId: value || undefined
    }));
  };

  // Handle status change
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setProposal(prev => ({
      ...prev,
      status: value as ProposalStatus
    }));
  };

  // State for editing an existing item
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<ProposalItem | null>(null);

  // Handle new item input changes
  const handleNewItemChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // Calculate total when quantity or unitPrice changes
    if (name === 'quantity' || name === 'unitPrice') {
      const numValue = parseFloat(value) || 0;
      
      if (name === 'quantity') {
        const total = numValue * (newItem.unitPrice || 0);
        setNewItem(prev => ({
          ...prev,
          quantity: numValue,
          total
        }));
      } else {
        const total = (newItem.quantity || 1) * numValue;
        setNewItem(prev => ({
          ...prev,
          unitPrice: numValue,
          total
        }));
      }
    } else {
      setNewItem(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle Enter key press to add item
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem();
    }
  };

  // Add new item to proposal
  const handleAddItem = () => {
    if (!newItem.description || newItem.description.trim() === '') {
      setError('Please provide a description for the item');
      return;
    }
    
    const item: ProposalItem = {
      id: generateId(),
      description: newItem.description!,
      quantity: newItem.quantity || 1,
      unitPrice: newItem.unitPrice || 0,
      total: newItem.total || 0
    };
    
    setProposal(prev => ({
      ...prev,
      items: [...prev.items, item]
    }));
    
    // Reset new item form
    setNewItem({
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    });
    
    setError(null);
  };

  // Delete an item from the proposal
  const handleDeleteItem = (id: string) => {
    setProposal(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  // Start editing an item
  const handleEditItem = (item: ProposalItem) => {
    setEditingItemId(item.id);
    setEditingItem({ ...item });
  };

  // Handle editing item changes
  const handleEditingItemChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof ProposalItem
  ) => {
    if (!editingItem) return;
    
    const value = e.target.value;
    
    if (field === 'quantity' || field === 'unitPrice') {
      const numValue = parseFloat(value) || 0;
      const quantity = field === 'quantity' ? numValue : editingItem.quantity;
      const unitPrice = field === 'unitPrice' ? numValue : editingItem.unitPrice;
      const total = quantity * unitPrice;
      
      setEditingItem({
        ...editingItem,
        [field]: numValue,
        total
      });
    } else {
      setEditingItem({
        ...editingItem,
        [field]: value
      });
    }
  };

  // Save edited item
  const handleSaveEdit = () => {
    if (!editingItem) return;
    
    setProposal(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === editingItem.id ? editingItem : item
      )
    }));
    
    setEditingItemId(null);
    setEditingItem(null);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditingItem(null);
  };

  // Move item up in the list
  const handleMoveItemUp = (index: number) => {
    if (index === 0) return;
    
    setProposal(prev => {
      const newItems = [...prev.items];
      [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
      return {
        ...prev,
        items: newItems
      };
    });
  };

  // Move item down in the list
  const handleMoveItemDown = (index: number) => {
    if (index === proposal.items.length - 1) return;
    
    setProposal(prev => {
      const newItems = [...prev.items];
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
      return {
        ...prev,
        items: newItems
      };
    });
  };

  // Save the proposal
  const handleSave = () => {
    try {
      if (!proposal.clientId) {
        throw new Error('Please select a client');
      }
      
      if (proposal.items.length === 0) {
        toast({
          title: 'Warning',
          description: 'The proposal has no items. Are you sure you want to continue?',
        });
      }
      
      if (isEditing) {
        updateProposal(proposal.id, proposal);
        toast({
          title: 'Success',
          description: 'Proposal updated successfully'
        });
      } else {
        addProposal(proposal);
        toast({
          title: 'Success',
          description: 'Proposal created successfully'
        });
      }
      
      // Navigate back to proposals list
      router.push('/proposals');
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Generate PDF document and open for preview
  const handleGeneratePdf = async () => {
    if (!selectedClient) {
      const errorMsg = 'Client information is missing';
      setError(errorMsg);
      toast({
        title: 'Error',
        description: errorMsg
      });
      return null;
    }
    
    if (proposal.items.length === 0) {
      const errorMsg = 'Please add at least one item to the proposal';
      setError(errorMsg);
      toast({
        title: 'Error',
        description: errorMsg
      });
      return null;
    }
    
    try {
      // First save the proposal if it's new
      if (!isEditing) {
        addProposal(proposal);
      } else {
        // Update existing proposal
        updateProposal(proposal.id, proposal);
      }
      
      // Generate PDF - ensure selectedPermit is not undefined
      const result = await generateProposalAction(
        proposal, 
        selectedClient, 
        selectedPermit || null
      );
      
      if (result.success) {
        // Open the PDF in a new tab
        const pdfWindow = window.open(result.downloadUrl, '_blank');
        if (!pdfWindow) {
          toast({
            title: 'Warning',
            description: 'Please allow popups to view the PDF'
          });
        }
        
        toast({
          title: 'Success',
          description: 'Proposal PDF generated successfully'
        });
        
        setError(null); // Clear any previous errors
        
        // Return the PDF data for potential email sending
        return result;
      } else {
        throw new Error(result.error || 'Failed to generate PDF');
      }
    } catch (error: any) {
      console.error('Error generating proposal PDF:', error);
      const errorMsg = error?.message || 'Failed to generate proposal PDF. Please check the console for details.';
      setError(errorMsg);
      toast({
        title: 'Error',
        description: errorMsg
      });
      return null;
    }
  };

  // Add state for email editor modal
  const [showEmailEditor, setShowEmailEditor] = useState(false);

  // Create invoice from proposal
  const handleCreateInvoice = () => {
    if (!proposal.id) {
      const errorMsg = 'Please save the proposal first before creating an invoice';
      setError(errorMsg);
      toast({
        title: 'Error',
        description: errorMsg
      });
      return;
    }

    if (proposal.items.length === 0) {
      const errorMsg = 'Cannot create invoice from proposal with no items';
      setError(errorMsg);
      toast({
        title: 'Error',
        description: errorMsg
      });
      return;
    }

    try {
      // Check if invoice already exists
      const existingInvoices = getProposalInvoices(proposal.id);
      if (existingInvoices.length > 0) {
        toast({
          title: 'Info',
          description: `Invoice ${existingInvoices[0].id} already exists for this proposal`
        });
        return;
      }

      // Save proposal first if editing
      if (isEditing) {
        updateProposal(proposal.id, proposal);
      } else {
        addProposal(proposal);
      }

      // Convert proposal to invoice
      const invoiceId = convertProposalToInvoice(proposal.id);

      if (invoiceId) {
        toast({
          title: 'Success',
          description: `Invoice ${invoiceId} created successfully`
        });
        setError(null);
      } else {
        throw new Error('Failed to create invoice');
      }
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      const errorMsg = error?.message || 'Failed to create invoice from proposal';
      setError(errorMsg);
      toast({
        title: 'Error',
        description: errorMsg
      });
    }
  };

  // Send proposal via email
  const handleSendEmail = async () => {
    if (!selectedClient) {
      const errorMsg = 'Client information is missing';
      setError(errorMsg);
      toast({
        title: 'Error',
        description: errorMsg
      });
      return;
    }
    
    if (!selectedClient.email) {
      const errorMsg = 'Client email address is missing';
      setError(errorMsg);
      toast({
        title: 'Error',
        description: errorMsg
      });
      return;
    }
    
    if (proposal.items.length === 0) {
      const errorMsg = 'Please add at least one item to the proposal';
      setError(errorMsg);
      toast({
        title: 'Error',
        description: errorMsg
      });
      return;
    }
    
    try {
      // Generate PDF first
      const pdfResult = await handleGeneratePdf();
      
      if (!pdfResult) {
        // Error already handled in handleGeneratePdf
        return;
      }
      
      // Show email editor modal instead of sending immediately
      setShowEmailEditor(true);
      setError(null); // Clear any previous errors
      
    } catch (error: any) {
      console.error('Error preparing email:', error);
      const errorMsg = error?.message || 'Failed to prepare proposal email';
      setError(errorMsg);
      toast({
        title: 'Error',
        description: errorMsg
      });
    }
  };
  
  // New function to handle sending email after editing
  const handleSendEmailWithCustomContent = async (subject: string, text: string, html: string) => {
    if (!selectedClient) {
      const errorMsg = 'Client information is missing';
      setError(errorMsg);
      toast({
        title: 'Error',
        description: errorMsg
      });
      return;
    }
    
    try {
      // Get PDF data from saved result
      const pdfResult = await handleGeneratePdf();
      
      if (!pdfResult || !pdfResult.pdfData) {
        throw new Error('Failed to generate PDF for email');
      }
      
      // Then send email with the PDF and custom content
      const emailResult = await sendProposalEmailAction(
        proposal, 
        selectedClient, 
        pdfResult.pdfData, 
        pdfResult.fileName || `proposal-${proposal.id}.pdf`,
        subject,
        text,
        html
      );
      
      if (emailResult.success) {
        // Update proposal status to 'sent'
        const updatedProposal = {
          ...proposal,
          status: 'sent' as ProposalStatus
        };
        
        updateProposal(proposal.id, updatedProposal);
        setProposal(updatedProposal);
        
        // Close the email editor modal
        setShowEmailEditor(false);
        
        toast({
          title: 'Success',
          description: 'Proposal sent via email successfully'
        });
        
        setError(null); // Clear any previous errors
      } else {
        throw new Error(emailResult.error || 'Failed to send email');
      }
    } catch (error: any) {
      console.error('Error sending proposal email:', error);
      const errorMsg = error?.message || 'Failed to send proposal email. Please check your email settings.';
      setError(errorMsg);
      toast({
        title: 'Error',
        description: errorMsg
      });
      setShowEmailEditor(false); // Close modal on error too
    }
  };

  return (
    <div>
      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
          <FiAlertCircle className="mr-2" />
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {isEditing ? 'Edit Proposal' : 'Create New Proposal'}
          </h2>
          <div className="flex gap-2">
            <button 
              type="button"
              onClick={handleSave}
              className="btn-primary bg-green-600 hover:bg-green-700 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white"
            >
              <FiSave className="mr-2" /> Save
            </button>
            <button 
              type="button"
              onClick={handleGeneratePdf}
              className="btn-primary bg-blue-600 hover:bg-blue-700 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white"
            >
              <FiFileText className="mr-2" /> Preview PDF
            </button>
            <button 
              type="button"
              onClick={handleSendEmail}
              className="btn-primary bg-purple-600 hover:bg-purple-700 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white"
            >
              <FiSend className="mr-2" /> Send Email
            </button>
            {isEditing && (
              <button 
                type="button"
                onClick={handleCreateInvoice}
                className="btn-primary bg-orange-600 hover:bg-orange-700 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white"
                title="Create an invoice from this proposal"
              >
                <FiDollarSign className="mr-2" /> Create Invoice
              </button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Client and Branch */}
          <div>
            <div className="mb-4">
              <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-1">
                Client <span className="text-red-500">*</span>
              </label>
              <select
                id="clientId"
                name="clientId"
                value={proposal.clientId}
                onChange={handleClientChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={proposal.status}
                onChange={handleStatusChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date Issued <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="date"
                name="date"
                value={proposal.date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="MM/DD/YYYY"
                required
              />
            </div>
          </div>
          
          {/* Permit and Validity */}
          <div>
            <div className="mb-4">
              <label htmlFor="permitId" className="block text-sm font-medium text-gray-700 mb-1">
                Related Permit (Optional)
              </label>
              <select
                id="permitId"
                name="permitId"
                value={proposal.permitId || ''}
                onChange={handlePermitChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">None</option>
                {permits.map(permit => (
                  <option key={permit.id} value={permit.id}>
                    {permit.permitNumber} - {permit.permitType}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label htmlFor="validUntil" className="block text-sm font-medium text-gray-700 mb-1">
                Valid Until <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="validUntil"
                name="validUntil"
                value={proposal.validUntil}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="MM/DD/YYYY"
                required
              />
            </div>
          </div>
        </div>

        {/* Scope of Work */}
        <div className="mb-4">
          <label htmlFor="scope" className="block text-sm font-medium text-gray-700 mb-1">
            Scope of Work <span className="text-red-500">*</span>
          </label>
          <textarea
            id="scope"
            name="scope"
            rows={4}
            value={proposal.scope}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Describe the scope of work for this proposal"
            required
          ></textarea>
        </div>
        
        {/* Terms & Conditions */}
        <div className="mb-4">
          <label htmlFor="terms" className="block text-sm font-medium text-gray-700 mb-1">
            Terms & Conditions <span className="text-red-500">*</span>
          </label>
          <textarea
            id="terms"
            name="terms"
            rows={4}
            value={proposal.terms}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Specify payment terms, deadlines, etc."
            required
          ></textarea>
        </div>
        
        {/* Notes */}
        <div className="mb-4">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes (Optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={2}
            value={proposal.notes || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Any additional notes or comments"
          ></textarea>
        </div>
      </div>
      
      {/* Line Items Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-medium mb-4">Line Items</h3>
        
        {/* Add new item form */}
        <div className="grid grid-cols-12 gap-2 mb-4">
          <div className="col-span-5">
            <input
              type="text"
              name="description"
              value={newItem.description || ''}
              onChange={handleNewItemChange}
              onKeyDown={handleKeyDown}
              placeholder="Item description"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="col-span-2">
            <input
              type="number"
              name="quantity"
              value={newItem.quantity?.toString() || '1'}
              onChange={handleNewItemChange}
              onKeyDown={handleKeyDown}
              placeholder="Qty"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                type="number"
                name="unitPrice"
                value={newItem.unitPrice?.toString() || '0'}
                onChange={handleNewItemChange}
                onKeyDown={handleKeyDown}
                placeholder="Price"
                className="w-full pl-7 px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                type="text"
                value={(newItem.total || 0).toFixed(2)}
                readOnly
                placeholder="Total"
                className="w-full pl-7 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
          </div>
          <div className="col-span-1">
            <button
              type="button"
              onClick={handleAddItem}
              className="w-full h-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white rounded-lg"
              title="Add item (or press Enter)"
            >
              <FiPlus size={18} />
            </button>
          </div>
        </div>
        
        {/* List of items */}
        <div className="mt-4">
          {proposal.items.length === 0 ? (
            <p className="italic text-gray-500">No items added yet</p>
          ) : (
            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 font-medium text-sm text-gray-600 pb-2 border-b">
                <div className="col-span-5">Description</div>
                <div className="col-span-2">Quantity</div>
                <div className="col-span-2">Unit Price</div>
                <div className="col-span-2">Total</div>
                <div className="col-span-1">Actions</div>
              </div>
              
              {/* Items */}
              {proposal.items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 py-2 border-b items-center">
                  {editingItemId === item.id ? (
                    // Editing mode
                    <>
                      <div className="col-span-5">
                        <input
                          type="text"
                          value={editingItem?.description || ''}
                          onChange={(e) => handleEditingItemChange(e, 'description')}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={editingItem?.quantity || 1}
                          onChange={(e) => handleEditingItemChange(e, 'quantity')}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                            <span className="text-gray-500 text-sm">$</span>
                          </div>
                          <input
                            type="number"
                            value={editingItem?.unitPrice || 0}
                            onChange={(e) => handleEditingItemChange(e, 'unitPrice')}
                            className="w-full pl-6 px-2 py-1 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                      <div className="col-span-2 font-medium">${(editingItem?.total || 0).toFixed(2)}</div>
                      <div className="col-span-1 flex gap-1">
                        <button
                          type="button"
                          onClick={handleSaveEdit}
                          className="text-green-600 hover:text-green-800"
                          title="Save"
                        >
                          <FiCheck size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="text-gray-600 hover:text-gray-800"
                          title="Cancel"
                        >
                          <FiX size={18} />
                        </button>
                      </div>
                    </>
                  ) : (
                    // View mode
                    <>
                      <div className="col-span-5">{item.description}</div>
                      <div className="col-span-2">{item.quantity}</div>
                      <div className="col-span-2">${item.unitPrice.toFixed(2)}</div>
                      <div className="col-span-2 font-medium">${item.total.toFixed(2)}</div>
                      <div className="col-span-1 flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveItemUp(index)}
                          disabled={index === 0}
                          className={`${index === 0 ? 'text-gray-300' : 'text-blue-600 hover:text-blue-800'}`}
                          title="Move up"
                        >
                          <FiChevronUp size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveItemDown(index)}
                          disabled={index === proposal.items.length - 1}
                          className={`${index === proposal.items.length - 1 ? 'text-gray-300' : 'text-blue-600 hover:text-blue-800'}`}
                          title="Move down"
                        >
                          <FiChevronDown size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditItem(item)}
                          className="text-indigo-600 hover:text-indigo-800"
                          title="Edit"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              
              {/* Total */}
              <div className="grid grid-cols-12 gap-2 py-2 pt-4 font-bold">
                <div className="col-span-9 text-right">Total Amount:</div>
                <div className="col-span-2">${proposal.totalAmount.toFixed(2)}</div>
                <div className="col-span-1"></div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-end gap-2 mb-8">
        <Link 
          href="/proposals"
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </Link>
        <button 
          type="button"
          onClick={handleSave}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <FiSave className="mr-2" />
          {isEditing ? 'Update Proposal' : 'Create Proposal'}
        </button>
      </div>
      
      {/* Email Editor Modal */}
      {showEmailEditor && selectedClient && (
        <EmailEditorModal
          isOpen={showEmailEditor}
          onClose={() => setShowEmailEditor(false)}
          onSend={handleSendEmailWithCustomContent}
          type="proposal"
          client={selectedClient}
          item={proposal}
          amount={proposal.totalAmount}
        />
      )}
    </div>
  );
} 