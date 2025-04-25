'use client';

import { useState } from 'react';
import DashboardLayout from '../dashboard-layout';
import Link from 'next/link';
import { 
  FiPlus,
  FiTrash2, 
  FiEdit2,
  FiAlertCircle
} from 'react-icons/fi';
import { useAppContext } from '@/lib/context';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Proposal, ProposalStatus } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui';

// Status badge color mapping
const statusColors: Record<ProposalStatus, string> = {
  'draft': 'bg-gray-100 text-gray-800',
  'sent': 'bg-blue-100 text-blue-800',
  'accepted': 'bg-green-100 text-green-800',
  'declined': 'bg-red-100 text-red-800'
};

export default function ProposalsPage() {
  const { proposals, clients, getClientById, deleteProposal } = useAppContext();
  const router = useRouter();
  const { toast } = useToast();
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [proposalToDelete, setProposalToDelete] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Confirm delete
  const confirmDelete = (proposalId: string) => {
    setProposalToDelete(proposalId);
    setShowDeleteModal(true);
  };

  // Handle proposal deletion
  const handleDeleteProposal = () => {
    if (!proposalToDelete) return;
    
    try {
      deleteProposal(proposalToDelete);
      setProposalToDelete(null);
      setShowDeleteModal(false);
      setDeleteError(null);
      
      toast({
        title: 'Proposal Deleted',
        description: 'The proposal has been permanently deleted.'
      });
    } catch (error: any) {
      setDeleteError(error.message);
    }
  };
  
  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle filter changes
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };
  
  const handleClientFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setClientFilter(e.target.value);
  };
  
  // Filter proposals based on search and filters
  const filteredProposals = proposals.filter(proposal => {
    // Text search (case insensitive)
    const matchesSearch = searchTerm === '' || 
      proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter;
    
    // Client filter
    const matchesClient = clientFilter === 'all' || proposal.clientId === clientFilter;
    
    return matchesSearch && matchesStatus && matchesClient;
  }).sort((a, b) => {
    // Sort by creation date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  // Navigate to new proposal page
  const handleNewProposal = () => {
    router.push('/proposals/new');
  };
  
  // Get client name by ID
  const getClientName = (clientId: string) => {
    const client = getClientById(clientId);
    return client ? client.name : 'Unknown Client';
  };
  
  // Handle preview PDF
  const handlePreviewPdf = (proposalId: string) => {
    router.push(`/proposals/${proposalId}`);
  };
  
  // Handle send email
  const handleSendEmail = (proposalId: string) => {
    router.push(`/proposals/${proposalId}`);
  };
  
  // Handle convert to permit
  const handleConvertToPermit = (proposalId: string) => {
    router.push(`/proposals/${proposalId}`);
  };
  
  // Cancel deletion modal
  const cancelDelete = () => {
    setProposalToDelete(null);
    setShowDeleteModal(false);
  };

  return (
    <DashboardLayout title="Proposals">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Proposals</h1>
          <p className="text-gray-500 mt-1">Create and manage client proposals</p>
        </div>
        <button 
          onClick={handleNewProposal}
          className="btn-primary flex items-center"
        >
          <FiPlus className="mr-2" size={16} /> Create New Proposal
        </button>
      </div>
      
      {/* Error message if deletion fails */}
      {deleteError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
          <FiAlertCircle className="mr-2" size={16} />
          {deleteError}
        </div>
      )}
      
      {/* Search and filter */}
      <div className="mb-6 flex flex-col md:flex-row justify-between gap-4">
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search proposals..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full bg-white px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <select 
            className="bg-white px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={statusFilter}
            onChange={handleStatusFilterChange}
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="accepted">Accepted</option>
            <option value="declined">Declined</option>
          </select>
          <select 
            className="bg-white px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={clientFilter}
            onChange={handleClientFilterChange}
          >
            <option value="all">All Clients</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Proposals Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {filteredProposals.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm || statusFilter !== 'all' || clientFilter !== 'all' 
              ? "No proposals match your search criteria" 
              : "No proposals yet. Click 'Create New Proposal' to get started."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proposal #
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProposals.map((proposal) => (
                  <tr key={proposal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        <Link 
                          href={`/proposals/${proposal.id}`}
                          className="hover:text-indigo-600"
                        >
                          {proposal.id.slice(0, 8)}
                        </Link>
                      </div>
                      {proposal.permitId && (
                        <div className="text-xs text-green-600">
                          <Link href={`/permits/${proposal.permitId}`} className="hover:underline">
                            Has Permit
                          </Link>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{proposal.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <Link href={`/clients/${proposal.clientId}`} className="hover:text-indigo-600">
                          {getClientName(proposal.clientId)}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{proposal.date}</div>
                      <div className="text-xs text-gray-500">Valid until: {proposal.validUntil}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(proposal.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[proposal.status]}`}>
                        {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link href={`/proposals/${proposal.id}`} className="text-indigo-600 hover:text-blue-600">
                          <FiEdit2 size={18} title="Edit" />
                        </Link>
                        <button 
                          onClick={() => confirmDelete(proposal.id)} 
                          className="text-red-600 hover:text-red-600"
                        >
                          <FiTrash2 size={18} title="Delete" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-2">Delete Proposal</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this proposal? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteProposal}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 