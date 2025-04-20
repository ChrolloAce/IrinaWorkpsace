'use client';

import { useState } from 'react';
import DashboardLayout from '../dashboard-layout';
import { 
  Card, 
  Title, 
  Text, 
  Flex,
  Button, 
  Table,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  Badge,
  Select,
  SelectItem,
  TextInput
} from '@/components/ui';
import { useAppContext } from '@/lib/context';
import { 
  PlusCircleIcon as PlusCircle, 
  SearchIcon as Search, 
  FileTextIcon as FileText, 
  SendIcon as Send, 
  EyeIcon as Eye, 
  Trash2Icon as Trash2, 
  EditIcon as Edit 
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { Proposal, ProposalStatus } from '@/lib/types';

// Status badge color mapping
const statusColors: Record<ProposalStatus, string> = {
  'draft': 'gray',
  'sent': 'blue',
  'accepted': 'green',
  'declined': 'red'
};

export default function ProposalsPage() {
  const { proposals, clients, getClientById, deleteProposal } = useAppContext();
  const router = useRouter();
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [proposalToDelete, setProposalToDelete] = useState<string | null>(null);

  // Confirm delete
  const confirmDelete = (proposalId: string) => {
    setProposalToDelete(proposalId);
    setShowDeleteModal(true);
  };

  // Handle proposal deletion
  const handleDeleteProposal = () => {
    if (!proposalToDelete) return;
    
    deleteProposal(proposalToDelete);
    setProposalToDelete(null);
    setShowDeleteModal(false);
  };
  
  // Filter proposals based on search and filters
  const filteredProposals = proposals.filter(proposal => {
    // Text search (case insensitive)
    const matchesSearch = searchQuery === '' || 
      proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proposal.id.toLowerCase().includes(searchQuery.toLowerCase());
    
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
    router.push(`/proposals/${proposalId}?action=preview`);
  };
  
  // Handle send email
  const handleSendEmail = (proposalId: string) => {
    router.push(`/proposals/${proposalId}?action=email`);
  };
  
  return (
    <DashboardLayout title="Proposals">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Proposals</h1>
          <Text>Create and manage client proposals</Text>
        </div>
        <Button 
          icon={PlusCircle} 
          onClick={handleNewProposal}
          color="green"
        >
          New Proposal
        </Button>
      </div>
      
      {/* Filters */}
      <Card className="mb-6 p-4">
        <Flex justifyContent="start" alignItems="center" className="gap-4 flex-wrap">
          <div className="w-full md:w-auto flex-grow md:max-w-xs">
            <TextInput
              icon={Search}
              placeholder="Search proposals..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="w-full md:w-auto md:max-w-xs">
            <Select 
              placeholder="Filter by status" 
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
            </Select>
          </div>
          
          <div className="w-full md:w-auto md:max-w-xs">
            <Select 
              placeholder="Filter by client" 
              value={clientFilter}
              onValueChange={setClientFilter}
            >
              <SelectItem value="all">All Clients</SelectItem>
              {clients.map(client => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </Select>
          </div>
        </Flex>
      </Card>
      
      {/* Proposals Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {filteredProposals.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchQuery || statusFilter !== 'all' || clientFilter !== 'all' 
              ? "No proposals match your search criteria" 
              : "No proposals yet. Click 'New Proposal' to get started."}
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
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {proposal.id.slice(0, 8)}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{proposal.title}</div>
                      {proposal.permitId && (
                        <div className="text-xs text-gray-500">
                          <Link href={`/permits/${proposal.permitId}`} className="hover:text-blue-600">
                            Linked to Permit
                          </Link>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <Link href={`/clients/${proposal.clientId}`} className="hover:text-blue-600">
                          {getClientName(proposal.clientId)}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {proposal.date}
                      <div className="text-xs text-gray-400">
                        Valid until: {proposal.validUntil}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(proposal.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge color={statusColors[proposal.status] as any}>
                        {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link href={`/proposals/${proposal.id}`}>
                          <Button
                            icon={Eye}
                            variant="light"
                            color="gray"
                            tooltip="View"
                            size="xs"
                          />
                        </Link>
                        <Link href={`/proposals/${proposal.id}/edit`}>
                          <Button
                            icon={Edit}
                            variant="light"
                            color="blue"
                            tooltip="Edit"
                            size="xs"
                          />
                        </Link>
                        <Button
                          icon={FileText}
                          variant="light"
                          color="green"
                          tooltip="Preview PDF"
                          size="xs"
                          onClick={() => handlePreviewPdf(proposal.id)}
                        />
                        <Button
                          icon={Send}
                          variant="light"
                          color="purple"
                          tooltip="Send Email"
                          size="xs"
                          onClick={() => handleSendEmail(proposal.id)}
                        />
                        <Button
                          icon={Trash2}
                          variant="light"
                          color="red"
                          tooltip="Delete"
                          size="xs"
                          onClick={() => confirmDelete(proposal.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Confirm Deletion</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this proposal? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setProposalToDelete(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProposal}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg"
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