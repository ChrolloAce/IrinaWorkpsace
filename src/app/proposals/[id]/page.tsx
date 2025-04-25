'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '../../dashboard-layout';
import { useAppContext } from '@/lib/context';
import { 
  Card, 
  Title, 
  Text, 
  Flex, 
  Button, 
  Badge, 
  Divider 
} from '@/components/ui';
import { 
  ArrowLeftIcon as ArrowLeft, 
  FileTextIcon as FileText, 
  SendIcon as Send,
  CheckIcon as Check,
  XIcon as X,
  EditIcon as Edit,
  TrashIcon as Trash,
  CopyIcon as Copy,
  AlertCircleIcon as AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import { generateProposalAction, sendProposalEmailAction } from '@/app/actions/proposal-actions';
import { ProposalStatus } from '@/lib/types';

// Status badge color mapping
const statusColors: Record<ProposalStatus, string> = {
  'draft': 'gray',
  'sent': 'blue',
  'accepted': 'green',
  'declined': 'red'
};

export default function ProposalDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { 
    getProposalById, 
    getClientById, 
    getPermitById,
    updateProposal,
    deleteProposal,
    convertProposalToPermit
  } = useAppContext();
  
  const [isLoading, setIsLoading] = useState<{[key: string]: boolean}>({});
  const [showConvertConfirm, setShowConvertConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const proposal = getProposalById(id);
  
  // Check if there's an action parameter to trigger PDF view or email
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'preview' && proposal) {
      handleGeneratePdf();
    } else if (action === 'email' && proposal) {
      handleSendEmail();
    } else if (action === 'convert' && proposal) {
      setShowConvertConfirm(true);
    }
  }, [searchParams]);
  
  if (!proposal) {
    return (
      <DashboardLayout title="Proposal Not Found">
        <Card className="p-6">
          <Flex justifyContent="center" className="h-40">
            <div className="text-center">
              <Title className="mb-2">Proposal Not Found</Title>
              <Text>The proposal you are looking for does not exist or has been deleted.</Text>
              <Link href="/proposals">
                <Button className="mt-4">Back to Proposals</Button>
              </Link>
            </div>
          </Flex>
        </Card>
      </DashboardLayout>
    );
  }
  
  const client = getClientById(proposal.clientId);
  const permit = proposal.permitId ? getPermitById(proposal.permitId) : null;
  
  const handleStatusChange = async (status: ProposalStatus) => {
    setIsLoading(prev => ({ ...prev, status: true }));
    
    try {
      updateProposal(id, { status });
      
      // If accepted, show a message about converting to permit
      if (status === 'accepted') {
        setShowConvertConfirm(true);
        toast({
          title: 'Proposal Accepted',
          description: 'The proposal has been accepted. Do you want to convert it to a permit?',
          variant: 'success'
        });
      } else if (status === 'declined') {
        toast({
          title: 'Proposal Declined',
          description: 'The proposal has been marked as declined.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Status Updated',
          description: `The proposal status has been updated to ${status}.`
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update proposal status.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(prev => ({ ...prev, status: false }));
    }
  };
  
  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };
  
  const confirmDelete = () => {
    deleteProposal(id);
    router.push('/proposals');
    toast({
      title: 'Proposal Deleted',
      description: 'The proposal has been permanently deleted.'
    });
  };
  
  const handleGeneratePdf = async () => {
    if (!client) return;
    
    setIsLoading(prev => ({ ...prev, pdf: true }));
    
    try {
      const result = await generateProposalAction(proposal, client, permit || null);
      
      if (result.success) {
        // Open the PDF in a new tab
        window.open(result.downloadUrl, '_blank');
        toast({
          title: 'PDF Generated',
          description: 'The proposal PDF has been generated successfully.'
        });
      } else {
        throw new Error(result.error || 'Failed to generate PDF');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate proposal PDF.',
        variant: 'destructive'
      });
      console.error('PDF generation error:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, pdf: false }));
    }
  };
  
  const handleSendEmail = async () => {
    if (!client) return;
    
    setIsLoading(prev => ({ ...prev, email: true }));
    
    try {
      // First generate the PDF
      const pdfResult = await generateProposalAction(proposal, client, permit || null);
      
      if (!pdfResult.success) {
        throw new Error(pdfResult.error || 'Failed to generate PDF');
      }
      
      // Then send the email
      const emailResult = await sendProposalEmailAction(
        proposal,
        client,
        pdfResult.pdfData as string,
        pdfResult.fileName || 'proposal.pdf'
      );
      
      if (emailResult.success) {
        // Update status to sent if it's in draft
        if (proposal.status === 'draft') {
          updateProposal(id, { status: 'sent' });
        }
        
        toast({
          title: 'Email Sent',
          description: `The proposal has been sent to ${client.email}.`
        });
      } else {
        throw new Error(emailResult.error || 'Failed to send email');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send proposal email.',
        variant: 'destructive'
      });
      console.error('Email sending error:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, email: false }));
    }
  };
  
  const handleConvertToPermit = () => {
    setIsLoading(prev => ({ ...prev, convert: true }));
    
    try {
      // If already has a permit, just navigate to it
      if (proposal.permitId) {
        router.push(`/permits/${proposal.permitId}`);
        return;
      }
      
      // Convert proposal to permit
      const permitId = convertProposalToPermit(id);
      if (permitId) {
        toast({
          title: 'Permit Created',
          description: 'A new permit has been created from this proposal.',
          variant: 'success'
        });
        
        // Redirect to the new permit
        router.push(`/permits/${permitId}`);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to convert proposal to permit.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred during conversion.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(prev => ({ ...prev, convert: false }));
      setShowConvertConfirm(false);
    }
  };
  
  return (
    <DashboardLayout title="Proposal Details">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <Link href="/proposals">
            <Button
              icon={ArrowLeft}
              variant="light"
              color="gray"
              className="mb-2"
            >
              Back to Proposals
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">Proposal Details</h1>
          <Flex alignItems="center" className="mt-1">
            <Text>Proposal #{proposal.id}</Text>
            <Badge color={statusColors[proposal.status]} className="ml-2">
              {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
            </Badge>
            
            {proposal.permitId && (
              <Link href={`/permits/${proposal.permitId}`} className="ml-4">
                <Badge color="emerald">
                  Linked to Permit #{permit?.permitNumber}
                </Badge>
              </Link>
            )}
          </Flex>
        </div>
        
        <Flex className="gap-2">
          <Button
            icon={FileText}
            color="blue"
            onClick={handleGeneratePdf}
            loading={isLoading.pdf}
          >
            View PDF
          </Button>
          
          {proposal.status !== 'accepted' && proposal.status !== 'declined' && (
            <Button
              icon={Send}
              color="purple"
              onClick={handleSendEmail}
              loading={isLoading.email}
            >
              Email Client
            </Button>
          )}
          
          <Link href={`/proposals/${id}/edit`}>
            <Button
              icon={Edit}
              variant="light"
              color="gray"
            >
              Edit
            </Button>
          </Link>
          
          <Button
            icon={Trash}
            variant="light"
            color="red"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Flex>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - 2/3 width */}
        <Card className="p-6 lg:col-span-2">
          <Title className="mb-4">{proposal.title}</Title>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Text className="text-sm text-gray-500 mb-1">Client</Text>
              <Text className="font-medium">{client?.name || 'Unknown Client'}</Text>
              {client && (
                <div className="mt-2 text-sm">
                  <div>{client.address}</div>
                  {client.city && (
                    <div>{client.city}, {client.state} {client.zipCode}</div>
                  )}
                  <div className="mt-1">{client.email}</div>
                  <div>{client.phone}</div>
                </div>
              )}
            </div>
            
            <div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Text className="text-sm text-gray-500 mb-1">Date</Text>
                  <Text className="font-medium">{proposal.date}</Text>
                </div>
                <div>
                  <Text className="text-sm text-gray-500 mb-1">Valid Until</Text>
                  <Text className="font-medium">{proposal.validUntil}</Text>
                </div>
              </div>
              
              <div className="mt-4">
                <Text className="text-sm text-gray-500 mb-1">Total Amount</Text>
                <Text className="font-medium text-xl text-green-600">
                  {formatCurrency(proposal.totalAmount)}
                </Text>
              </div>
            </div>
          </div>
          
          <Divider />
          
          <div className="my-6">
            <Text className="font-medium mb-2">Scope of Work</Text>
            <div className="bg-gray-50 p-4 rounded whitespace-pre-line">
              {proposal.scope}
            </div>
          </div>
          
          <div className="my-6">
            <Text className="font-medium mb-2">Terms & Conditions</Text>
            <div className="bg-gray-50 p-4 rounded whitespace-pre-line">
              {proposal.terms}
            </div>
          </div>
          
          {proposal.notes && (
            <div className="my-6">
              <Text className="font-medium mb-2">Notes</Text>
              <div className="bg-gray-50 p-4 rounded whitespace-pre-line">
                {proposal.notes}
              </div>
            </div>
          )}
          
          <Divider />
          
          <div className="mt-6">
            <Text className="font-medium mb-4">Line Items</Text>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {proposal.items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-4 text-center text-sm text-gray-500">
                        No items added to this proposal.
                      </td>
                    </tr>
                  ) : (
                    proposal.items.map((item, index) => (
                      <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {item.description}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 text-right">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 text-right">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-900 text-right">
                          {formatCurrency(item.total)}
                        </td>
                      </tr>
                    ))
                  )}
                  
                  <tr className="bg-gray-50">
                    <td colSpan={3} className="px-4 py-3 text-right text-sm font-bold">
                      Total Amount:
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-green-600">
                      {formatCurrency(proposal.totalAmount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Card>
        
        {/* Sidebar - 1/3 width */}
        <div className="space-y-6">
          {/* Actions Card */}
          <Card className="p-6">
            <Title className="text-lg mb-4">Proposal Status</Title>
            
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <div className={`w-3 h-3 rounded-full mr-2 bg-${statusColors[proposal.status]}-500`}></div>
                <Text className="font-medium">Current Status: {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}</Text>
              </div>
              
              <Text className="text-sm text-gray-500 mb-4">
                {proposal.status === 'draft' && 'This proposal is in draft mode and has not been sent to the client yet.'}
                {proposal.status === 'sent' && 'This proposal has been sent to the client and is awaiting their response.'}
                {proposal.status === 'accepted' && 'This proposal has been accepted by the client.'}
                {proposal.status === 'declined' && 'This proposal has been declined by the client.'}
              </Text>
            </div>
            
            <Divider className="my-4" />
            
            <Title className="text-lg mb-4">Actions</Title>
            
            {proposal.status === 'draft' && (
              <div className="mb-4">
                <Button
                  icon={Send}
                  color="blue"
                  className="w-full mb-2"
                  onClick={() => handleStatusChange('sent')}
                  loading={isLoading.status}
                >
                  Mark as Sent
                </Button>
                
                <Button
                  icon={Send}
                  color="purple"
                  className="w-full"
                  onClick={handleSendEmail}
                  loading={isLoading.email}
                >
                  Send to Client
                </Button>
              </div>
            )}
            
            {(proposal.status === 'draft' || proposal.status === 'sent') && (
              <div className="space-y-2">
                <Button
                  icon={Check}
                  color="green"
                  className="w-full"
                  onClick={() => handleStatusChange('accepted')}
                  loading={isLoading.status}
                >
                  Mark as Accepted
                </Button>
                
                <Button
                  icon={X}
                  color="red"
                  className="w-full"
                  variant="light"
                  onClick={() => handleStatusChange('declined')}
                  loading={isLoading.status}
                >
                  Mark as Declined
                </Button>
              </div>
            )}
            
            {proposal.status === 'accepted' && (
              <div>
                {proposal.permitId ? (
                  <Link href={`/permits/${proposal.permitId}`}>
                    <Button color="green" className="w-full mb-2">
                      View Permit
                    </Button>
                  </Link>
                ) : (
                  <Button
                    icon={Copy}
                    color="green"
                    className="w-full"
                    onClick={() => setShowConvertConfirm(true)}
                    loading={isLoading.convert}
                  >
                    Convert to Permit
                  </Button>
                )}
                
                <Text className="text-xs text-gray-500 mt-2">
                  {proposal.permitId 
                    ? `This proposal has been converted to permit #${permit?.permitNumber}.` 
                    : "Converting to a permit will create a new permit with all the items from this proposal."}
                </Text>
              </div>
            )}
            
            {proposal.status === 'declined' && (
              <div>
                <Button
                  icon={Edit}
                  color="blue"
                  className="w-full"
                  onClick={() => router.push(`/proposals/${id}/edit`)}
                >
                  Edit & Revise
                </Button>
                
                <Text className="text-xs text-gray-500 mt-2">
                  You can edit this proposal and send a revised version to the client.
                </Text>
              </div>
            )}
          </Card>
          
          {/* Client Card */}
          {client && (
            <Card className="p-6">
              <Title className="text-lg mb-4">Client Information</Title>
              
              <div className="space-y-3">
                <div>
                  <Text className="text-sm text-gray-500">Name</Text>
                  <Text className="font-medium">{client.name}</Text>
                </div>
                
                {client.contactPerson && (
                  <div>
                    <Text className="text-sm text-gray-500">Contact Person</Text>
                    <Text className="font-medium">{client.contactPerson}</Text>
                  </div>
                )}
                
                <div>
                  <Text className="text-sm text-gray-500">Email</Text>
                  <Text className="font-medium">{client.email}</Text>
                </div>
                
                <div>
                  <Text className="text-sm text-gray-500">Phone</Text>
                  <Text className="font-medium">{client.phone}</Text>
                </div>
                
                <div>
                  <Text className="text-sm text-gray-500">Address</Text>
                  <Text className="font-medium">
                    {client.address}<br />
                    {client.city}, {client.state} {client.zipCode}
                  </Text>
                </div>
                
                <Link href={`/clients/${client.id}`}>
                  <Button 
                    variant="light" 
                    color="gray" 
                    className="w-full mt-2"
                  >
                    View Client Details
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      </div>
      
      {/* Conversion Confirmation Modal */}
      {showConvertConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center bg-green-100 rounded-full p-3 mb-4">
                <Copy className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium">Convert to Permit</h3>
              <p className="text-gray-500 mt-2">
                Are you sure you want to convert this proposal to a permit? This will create a new permit with all the items from this proposal.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="light"
                color="gray"
                onClick={() => setShowConvertConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                color="green"
                onClick={handleConvertToPermit}
                loading={isLoading.convert}
              >
                Convert to Permit
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center bg-red-100 rounded-full p-3 mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium">Delete Proposal</h3>
              <p className="text-gray-500 mt-2">
                Are you sure you want to delete this proposal? This action cannot be undone.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="light"
                color="gray"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                color="red"
                onClick={confirmDelete}
              >
                Delete Proposal
              </Button>
            </div>
          </div>
        </div>
      )}
      
    </DashboardLayout>
  );
} 