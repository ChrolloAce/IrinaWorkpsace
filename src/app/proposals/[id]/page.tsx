'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import DashboardLayout from '../../dashboard-layout';
import { useAppContext } from '@/lib/context';
import Link from 'next/link';
import { useToast } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import { generateProposalAction, sendProposalEmailAction } from '@/app/actions/proposal-actions';
import { ProposalStatus } from '@/lib/types';
import EmailEditorModal from '@/components/EmailEditorModal';
import { 
  FiArrowLeft, 
  FiFileText, 
  FiSend,
  FiCheck,
  FiX,
  FiEdit,
  FiTrash,
  FiCopy,
  FiAlertCircle
} from 'react-icons/fi';

// Status badge color mapping
const statusColors: Record<ProposalStatus, string> = {
  'draft': 'bg-gray-100 text-gray-800',
  'sent': 'bg-blue-100 text-blue-800',
  'accepted': 'bg-green-100 text-green-800',
  'declined': 'bg-red-100 text-red-800'
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
  const [showEmailEditor, setShowEmailEditor] = useState(false);
  
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
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-center items-center h-40">
            <div className="text-center">
              <h1 className="text-xl font-semibold mb-2">Proposal Not Found</h1>
              <p className="text-gray-500">The proposal you are looking for does not exist or has been deleted.</p>
              <Link href="/proposals">
                <button className="mt-4 btn-primary">Back to Proposals</button>
              </Link>
            </div>
          </div>
        </div>
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
    setShowEmailEditor(true);
  };
  
  const handleSendEmailWithCustomContent = async (subject: string, text: string, html: string) => {
    if (!client) return;
    
    setIsLoading(prev => ({ ...prev, email: true }));
    
    try {
      // First generate the PDF
      const pdfResult = await generateProposalAction(proposal, client, permit || null);
      
      if (!pdfResult.success) {
        throw new Error(pdfResult.error || 'Failed to generate PDF');
      }
      
      // Then send the email with custom content
      const emailResult = await sendProposalEmailAction(
        proposal,
        client,
        pdfResult.pdfData as string,
        pdfResult.fileName || 'proposal.pdf',
        subject,
        text,
        html
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
            <button
              className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
            >
              <FiArrowLeft className="mr-2" size={16} />
              Back to Proposals
            </button>
          </Link>
          <h1 className="text-2xl font-semibold">Proposal Details</h1>
          <div className="flex items-center mt-1">
            <span className="text-gray-500">Proposal #{proposal.id.slice(0, 8)}</span>
            <span className={`ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[proposal.status]}`}>
              {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
            </span>
            
            {proposal.permitId && (
              <Link href={`/permits/${proposal.permitId}`} className="ml-4">
                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Linked to Permit #{permit?.permitNumber}
                </span>
              </Link>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
            onClick={handleGeneratePdf}
            disabled={isLoading.pdf}
          >
            <FiFileText className="mr-2" size={16} />
            View PDF
            {isLoading.pdf && <span className="ml-2 animate-spin">↻</span>}
          </button>
          
          {proposal.status !== 'accepted' && proposal.status !== 'declined' && (
            <button
              className="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors"
              onClick={handleSendEmail}
              disabled={isLoading.email}
            >
              <FiSend className="mr-2" size={16} />
              Email Client
              {isLoading.email && <span className="ml-2 animate-spin">↻</span>}
            </button>
          )}
          
          <Link href={`/proposals/${id}/edit`}>
            <button
              className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded transition-colors"
            >
              <FiEdit className="mr-2" size={16} />
              Edit
            </button>
          </Link>
          
          <button
            className="flex items-center bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded transition-colors"
            onClick={handleDelete}
          >
            <FiTrash className="mr-2" size={16} />
            Delete
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - 2/3 width */}
        <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">{proposal.title}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Client</p>
              <p className="font-medium">{client?.name || 'Unknown Client'}</p>
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
                  <p className="text-sm text-gray-500 mb-1">Date</p>
                  <p className="font-medium">{proposal.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Valid Until</p>
                  <p className="font-medium">{proposal.validUntil}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                <p className="font-medium text-xl text-green-600">
                  {formatCurrency(proposal.totalAmount)}
                </p>
              </div>
            </div>
          </div>
          
          <hr className="my-6 border-t border-gray-200" />
          
          <div className="my-6">
            <p className="font-medium mb-2">Scope of Work</p>
            <div className="bg-gray-50 p-4 rounded whitespace-pre-line">
              {proposal.scope}
            </div>
          </div>
          
          <div className="my-6">
            <p className="font-medium mb-2">Terms & Conditions</p>
            <div className="bg-gray-50 p-4 rounded whitespace-pre-line">
              {proposal.terms}
            </div>
          </div>
          
          {proposal.notes && (
            <div className="my-6">
              <p className="font-medium mb-2">Notes</p>
              <div className="bg-gray-50 p-4 rounded whitespace-pre-line">
                {proposal.notes}
              </div>
            </div>
          )}
          
          {/* Items Table */}
          <div className="my-6">
            <h3 className="font-medium mb-3">Items</h3>
            <div className="bg-gray-50 rounded overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Description
                    </th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Quantity
                    </th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Unit Price
                    </th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {proposal.items.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.description}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100">
                    <td colSpan={3} className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                      Total Amount:
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                      {formatCurrency(proposal.totalAmount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Sidebar - 1/3 width */}
        <div className="space-y-4">
          {/* Status Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-medium mb-3">Proposal Status</h3>
            
            {(proposal.status === 'draft' || proposal.status === 'sent') && (
              <div className="space-y-2">
                <button
                  className="flex items-center justify-center w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
                  onClick={() => handleStatusChange('accepted')}
                  disabled={isLoading.status}
                >
                  <FiCheck className="mr-2" size={16} />
                  Mark as Accepted
                  {isLoading.status && <span className="ml-2 animate-spin">↻</span>}
                </button>
                
                <button
                  className="flex items-center justify-center w-full bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded transition-colors"
                  onClick={() => handleStatusChange('declined')}
                  disabled={isLoading.status}
                >
                  <FiX className="mr-2" size={16} />
                  Mark as Declined
                  {isLoading.status && <span className="ml-2 animate-spin">↻</span>}
                </button>
              </div>
            )}
            
            {proposal.status === 'accepted' && (
              <div>
                {proposal.permitId ? (
                  <Link href={`/permits/${proposal.permitId}`}>
                    <button className="flex items-center justify-center w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors mb-2">
                      View Permit
                    </button>
                  </Link>
                ) : (
                  <button
                    className="flex items-center justify-center w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
                    onClick={() => setShowConvertConfirm(true)}
                    disabled={isLoading.convert}
                  >
                    <FiCopy className="mr-2" size={16} />
                    Convert to Permit
                    {isLoading.convert && <span className="ml-2 animate-spin">↻</span>}
                  </button>
                )}
                
                <p className="text-xs text-gray-500 mt-2">
                  {proposal.permitId 
                    ? `This proposal has been converted to permit #${permit?.permitNumber}.` 
                    : "Converting to a permit will create a new permit with all the items from this proposal."}
                </p>
              </div>
            )}
          </div>
          
          {/* Client Information */}
          {client && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-medium mb-3">Client Information</h3>
              <div className="text-sm mb-4">
                <div className="font-medium">{client.name}</div>
                <div className="text-gray-500 mt-1">{client.email}</div>
                <div className="text-gray-500">{client.phone}</div>
                <div className="mt-2">{client.address}</div>
                {client.city && (
                  <div>{client.city}, {client.state} {client.zipCode}</div>
                )}
              </div>
              
              <Link href={`/clients/${client.id}`}>
                <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors mt-2">
                  View Client Details
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Conversion Confirmation Modal */}
      {showConvertConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center bg-green-100 rounded-full p-3 mb-4">
                <FiCopy className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium">Convert to Permit</h3>
              <p className="text-gray-500 mt-2">
                Are you sure you want to convert this proposal to a permit? This will create a new permit with all the items from this proposal.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={() => setShowConvertConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                onClick={handleConvertToPermit}
                disabled={isLoading.convert}
              >
                {isLoading.convert ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2">↻</span> Converting...
                  </span>
                ) : "Convert to Permit"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-2">Delete Proposal</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this proposal? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Email Editor Modal */}
      {showEmailEditor && client && proposal && (
        <EmailEditorModal
          isOpen={showEmailEditor}
          onClose={() => setShowEmailEditor(false)}
          onSend={handleSendEmailWithCustomContent}
          type="proposal"
          client={client}
          item={proposal}
          amount={proposal.totalAmount}
        />
      )}
    </DashboardLayout>
  );
} 