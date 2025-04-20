'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  TrashIcon as Trash
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
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
  
  const proposal = getProposalById(id);
  
  if (!proposal) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-6xl">
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
      </div>
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
        toast({
          title: 'Proposal Accepted',
          description: 'The proposal has been accepted and converted to a permit.',
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
    if (confirm('Are you sure you want to delete this proposal? This action cannot be undone.')) {
      deleteProposal(id);
      router.push('/proposals');
      toast({
        title: 'Proposal Deleted',
        description: 'The proposal has been permanently deleted.'
      });
    }
  };
  
  const handleGeneratePdf = async () => {
    if (!client) return;
    
    setIsLoading(prev => ({ ...prev, pdf: true }));
    
    try {
      const result = await generateProposalAction(proposal, client, permit || null);
      
      if (result.success) {
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
        pdfResult.pdfData,
        pdfResult.fileName ? pdfResult.fileName : 'proposal.pdf'
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
    } finally {
      setIsLoading(prev => ({ ...prev, email: false }));
    }
  };
  
  const handleConvertToPermit = () => {
    if (proposal.status !== 'accepted') {
      // First change status to accepted
      updateProposal(id, { status: 'accepted' });
      // The conversion should happen automatically due to the status change trigger
      toast({
        title: 'Proposal Accepted',
        description: 'The proposal has been accepted and is being converted to a permit.',
        variant: 'success'
      });
    } else if (!proposal.permitId) {
      // If already accepted but no permit yet, manually convert
      const permitId = convertProposalToPermit(id);
      if (permitId) {
        toast({
          title: 'Permit Created',
          description: 'A new permit has been created from this proposal.',
          variant: 'success'
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to convert proposal to permit.',
          variant: 'destructive'
        });
      }
    } else {
      toast({
        title: 'Already Converted',
        description: 'This proposal has already been converted to a permit.',
        variant: 'info'
      });
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <Flex justifyContent="between" alignItems="center" className="mb-6">
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
          <Title>Proposal Details</Title>
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
      </Flex>
      
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
            <Title className="text-lg mb-4">Actions</Title>
            
            {proposal.status === 'draft' && (
              <div className="mb-4">
                <Button
                  icon={Send}
                  color="blue"
                  className="w-full"
                  onClick={() => handleStatusChange('sent')}
                >
                  Mark as Sent
                </Button>
              </div>
            )}
            
            {(proposal.status === 'draft' || proposal.status === 'sent') && (
              <div className="space-y-2">
                <Button
                  icon={Check}
                  color="green"
                  className="w-full"
                  onClick={handleConvertToPermit}
                >
                  Accept & Convert to Permit
                </Button>
                
                <Button
                  icon={X}
                  color="red"
                  className="w-full"
                  variant="light"
                  onClick={() => handleStatusChange('declined')}
                >
                  Decline Proposal
                </Button>
              </div>
            )}
            
            {proposal.status === 'accepted' && !proposal.permitId && (
              <div>
                <Button
                  icon={Check}
                  color="green"
                  className="w-full"
                  onClick={handleConvertToPermit}
                >
                  Convert to Permit
                </Button>
                <Text className="text-xs text-gray-500 mt-2">
                  This proposal is accepted but hasn't been converted to a permit yet.
                </Text>
              </div>
            )}
            
            {proposal.status === 'accepted' && proposal.permitId && (
              <div>
                <Link href={`/permits/${proposal.permitId}`}>
                  <Button color="green" className="w-full">
                    View Permit
                  </Button>
                </Link>
                <Text className="text-xs text-gray-500 mt-2">
                  This proposal has been converted to a permit.
                </Text>
              </div>
            )}
            
            {proposal.status === 'declined' && (
              <Text className="text-red-500">
                This proposal has been declined.
              </Text>
            )}
          </Card>
          
          {/* Status History Card - for future use */}
          <Card className="p-6">
            <Title className="text-lg mb-4">Status</Title>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className={`h-4 w-4 rounded-full ${proposal.status === 'draft' ? 'bg-gray-500' : 'bg-gray-200'} mr-3`}></div>
                <div>
                  <Text className="font-medium">Draft</Text>
                  <Text className="text-xs text-gray-500">Created on {proposal.createdAt.split('T')[0]}</Text>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className={`h-4 w-4 rounded-full ${proposal.status === 'sent' ? 'bg-blue-500' : (proposal.status === 'accepted' || proposal.status === 'declined') ? 'bg-gray-200' : 'bg-gray-100'} mr-3`}></div>
                <div>
                  <Text className="font-medium">Sent</Text>
                  <Text className="text-xs text-gray-500">
                    {proposal.status === 'draft' ? 'Not sent yet' : 'Sent to client'}
                  </Text>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className={`h-4 w-4 rounded-full ${proposal.status === 'accepted' ? 'bg-green-500' : proposal.status === 'declined' ? 'bg-gray-200' : 'bg-gray-100'} mr-3`}></div>
                <div>
                  <Text className="font-medium">Accepted</Text>
                  <Text className="text-xs text-gray-500">
                    {proposal.status === 'accepted' ? 'Converted to permit' : 'Pending client approval'}
                  </Text>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className={`h-4 w-4 rounded-full ${proposal.status === 'declined' ? 'bg-red-500' : 'bg-gray-100'} mr-3`}></div>
                <div>
                  <Text className="font-medium">Declined</Text>
                  <Text className="text-xs text-gray-500">
                    {proposal.status === 'declined' ? 'Client declined' : 'Not applicable'}
                  </Text>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 