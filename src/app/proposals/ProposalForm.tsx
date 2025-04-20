'use client';

import { useState, useEffect } from 'react';
import { 
  Button,
  Card,
  TextInput as Input,
  Select,
  SelectItem,
  Textarea,
  Divider,
  Text
} from '@tremor/react';
import { 
  PlusIcon as Plus, 
  Trash2Icon as Trash2, 
  SaveIcon as Save, 
  FileTextIcon as FileText, 
  SendIcon as Send 
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { generateProposalAction, sendProposalEmailAction } from '@/app/actions/proposal-actions';
import type { Client, Permit, Proposal, ProposalItem, ProposalStatus } from '@/lib/types';
import { createNewProposal } from '@/lib/proposal-utils';
import { generateId } from '@/lib/utils';
import { useAppContext } from '@/lib/context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  const { addProposal, updateProposal, permits, getClientById } = useAppContext();
  
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
  
  // Fetch the client and permit based on IDs
  const selectedClient = getClientById(proposal.clientId) || clients[0];
  const selectedPermit = proposal.permitId ? permits.find(p => p.id === proposal.permitId) : null;
  
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
  const handleClientChange = (value: string) => {
    setProposal(prev => ({
      ...prev,
      clientId: value
    }));
  };

  // Handle permit selection
  const handlePermitChange = (value: string) => {
    setProposal(prev => ({
      ...prev,
      permitId: value || undefined
    }));
  };

  // Handle status change
  const handleStatusChange = (value: string) => {
    setProposal(prev => ({
      ...prev,
      status: value as ProposalStatus
    }));
  };

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

  // Add new item to proposal
  const handleAddItem = () => {
    if (!newItem.description || newItem.description.trim() === '') {
      toast({
        title: 'Error',
        description: 'Please provide a description for the item',
        variant: 'destructive'
      });
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
  };

  // Delete an item from the proposal
  const handleDeleteItem = (id: string) => {
    setProposal(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  // Save the proposal
  const handleSave = () => {
    if (!proposal.clientId) {
      toast({
        title: 'Error',
        description: 'Please select a client',
        variant: 'destructive'
      });
      return;
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
  };

  // Generate PDF document and open for preview
  const handleGeneratePdf = async () => {
    if (!selectedClient) {
      toast({
        title: 'Error',
        description: 'Client information is missing',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      // First save the proposal if it's new
      if (!isEditing) {
        addProposal(proposal);
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
          description: 'Proposal PDF generated'
        });
        
        // Return the PDF data for potential email sending
        return result;
      } else {
        throw new Error(result.error || 'Failed to generate PDF');
      }
    } catch (error) {
      console.error('Error generating proposal PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate proposal PDF',
        variant: 'destructive'
      });
      return null;
    }
  };

  // Send proposal via email
  const handleSendEmail = async () => {
    if (!selectedClient) {
      toast({
        title: 'Error',
        description: 'Client information is missing',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      // Generate PDF first
      const pdfResult = await handleGeneratePdf();
      
      if (!pdfResult) {
        throw new Error('Failed to generate PDF');
      }
      
      // Then send email with the PDF
      const emailResult = await sendProposalEmailAction(
        proposal, 
        selectedClient, 
        pdfResult.pdfData, 
        pdfResult.fileName
      );
      
      if (emailResult.success) {
        // Update proposal status to 'sent'
        const updatedProposal = {
          ...proposal,
          status: 'sent' as ProposalStatus
        };
        
        updateProposal(proposal.id, updatedProposal);
        setProposal(updatedProposal);
        
        toast({
          title: 'Success',
          description: 'Proposal sent via email'
        });
      } else {
        throw new Error(emailResult.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending proposal email:', error);
      toast({
        title: 'Error',
        description: 'Failed to send proposal email',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {isEditing ? 'Edit Proposal' : 'Create New Proposal'}
          </h2>
          <div className="flex gap-2">
            <Button 
              size="xs" 
              onClick={handleSave}
              icon={Save}
              color="green"
            >
              Save
            </Button>
            <Button 
              size="xs"
              onClick={handleGeneratePdf}
              icon={FileText}
              color="blue"
            >
              Preview PDF
            </Button>
            <Button 
              size="xs"
              onClick={handleSendEmail}
              icon={Send}
              color="purple"
            >
              Send Email
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Basic Details */}
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Proposal Title
              </label>
              <Input
                name="title"
                value={proposal.title}
                onChange={handleChange}
                placeholder="Enter proposal title"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Client
              </label>
              <Select 
                value={proposal.clientId} 
                onValueChange={handleClientChange}
              >
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Status
              </label>
              <Select 
                value={proposal.status} 
                onValueChange={handleStatusChange}
              >
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
              </Select>
            </div>
          </div>
          
          {/* Dates and Permit */}
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Related Permit (Optional)
              </label>
              <Select 
                value={proposal.permitId || ''} 
                onValueChange={handlePermitChange}
              >
                <SelectItem value="">None</SelectItem>
                {permits.map(permit => (
                  <SelectItem key={permit.id} value={permit.id}>
                    {permit.title} ({permit.permitNumber})
                  </SelectItem>
                ))}
              </Select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Date Issued
              </label>
              <Input
                name="date"
                type="text"
                value={proposal.date}
                onChange={handleChange}
                placeholder="MM/DD/YYYY"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Valid Until
              </label>
              <Input
                name="validUntil"
                type="text"
                value={proposal.validUntil}
                onChange={handleChange}
                placeholder="MM/DD/YYYY"
              />
            </div>
          </div>
        </div>

        {/* Scope of Work */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Scope of Work
          </label>
          <Textarea
            name="scope"
            value={proposal.scope}
            onChange={handleChange}
            placeholder="Describe the scope of work for this proposal"
            rows={4}
          />
        </div>
        
        {/* Terms & Conditions */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Terms & Conditions
          </label>
          <Textarea
            name="terms"
            value={proposal.terms}
            onChange={handleChange}
            placeholder="Specify payment terms, deadlines, etc."
            rows={4}
          />
        </div>
        
        {/* Notes */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Additional Notes (Optional)
          </label>
          <Textarea
            name="notes"
            value={proposal.notes || ''}
            onChange={handleChange}
            placeholder="Any additional notes or comments"
            rows={2}
          />
        </div>
      </Card>
      
      {/* Line Items Section */}
      <Card className="p-4">
        <h3 className="text-lg font-bold mb-4">Line Items</h3>
        
        {/* Add new item form */}
        <div className="grid grid-cols-12 gap-2 mb-4">
          <div className="col-span-5">
            <Input
              name="description"
              value={newItem.description || ''}
              onChange={handleNewItemChange}
              placeholder="Item description"
            />
          </div>
          <div className="col-span-2">
            <Input
              name="quantity"
              type="number"
              value={newItem.quantity?.toString() || '1'}
              onChange={handleNewItemChange}
              placeholder="Qty"
            />
          </div>
          <div className="col-span-2">
            <Input
              name="unitPrice"
              type="number"
              value={newItem.unitPrice?.toString() || '0'}
              onChange={handleNewItemChange}
              placeholder="Price"
              prefix="$"
            />
          </div>
          <div className="col-span-2">
            <Input
              value={`$${(newItem.total || 0).toFixed(2)}`}
              readOnly
              placeholder="Total"
            />
          </div>
          <div className="col-span-1">
            <Button
              icon={Plus}
              variant="secondary"
              color="green"
              onClick={handleAddItem}
              className="w-full"
            />
          </div>
        </div>
        
        {/* List of items */}
        <div className="mt-4">
          {proposal.items.length === 0 ? (
            <Text className="italic text-gray-500">No items added yet</Text>
          ) : (
            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 font-medium text-sm text-gray-600">
                <div className="col-span-5">Description</div>
                <div className="col-span-2">Quantity</div>
                <div className="col-span-2">Unit Price</div>
                <div className="col-span-2">Total</div>
                <div className="col-span-1"></div>
              </div>
              
              {/* Items */}
              {proposal.items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 py-2 border-b">
                  <div className="col-span-5">{item.description}</div>
                  <div className="col-span-2">{item.quantity}</div>
                  <div className="col-span-2">${item.unitPrice.toFixed(2)}</div>
                  <div className="col-span-2 font-medium">${item.total.toFixed(2)}</div>
                  <div className="col-span-1">
                    <Button
                      icon={Trash2}
                      variant="light"
                      color="red"
                      onClick={() => handleDeleteItem(item.id)}
                      size="xs"
                    />
                  </div>
                </div>
              ))}
              
              {/* Total */}
              <div className="grid grid-cols-12 gap-2 py-2 font-bold">
                <div className="col-span-9 text-right">Total Amount:</div>
                <div className="col-span-2">${proposal.totalAmount.toFixed(2)}</div>
                <div className="col-span-1"></div>
              </div>
            </div>
          )}
        </div>
      </Card>
      
      {/* Action buttons */}
      <div className="flex justify-end gap-2">
        <Link href="/proposals">
          <Button variant="secondary">Cancel</Button>
        </Link>
        <Button 
          onClick={handleSave}
          icon={Save}
          color="green"
        >
          {isEditing ? 'Update Proposal' : 'Create Proposal'}
        </Button>
      </div>
    </div>
  );
} 