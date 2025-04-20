'use client';

import { useState } from 'react';
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
  const { proposals, clients, getClientById } = useAppContext();
  const router = useRouter();
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  
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
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <Flex justifyContent="between" alignItems="center" className="mb-6">
        <div>
          <Title>Proposals</Title>
          <Text>Create and manage client proposals</Text>
        </div>
        <Button 
          icon={PlusCircle} 
          onClick={handleNewProposal}
          color="green"
        >
          New Proposal
        </Button>
      </Flex>
      
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
      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Proposal #</TableHeaderCell>
              <TableHeaderCell>Title</TableHeaderCell>
              <TableHeaderCell>Client</TableHeaderCell>
              <TableHeaderCell>Date</TableHeaderCell>
              <TableHeaderCell>Amount</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProposals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  <Text>No proposals found. Create your first proposal to get started.</Text>
                </TableCell>
              </TableRow>
            ) : (
              filteredProposals.map((proposal) => (
                <TableRow key={proposal.id}>
                  <TableCell>
                    <Link 
                      href={`/proposals/${proposal.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {proposal.id}
                    </Link>
                  </TableCell>
                  <TableCell>{proposal.title}</TableCell>
                  <TableCell>{getClientName(proposal.clientId)}</TableCell>
                  <TableCell>{proposal.date}</TableCell>
                  <TableCell>{formatCurrency(proposal.totalAmount)}</TableCell>
                  <TableCell>
                    <Badge color={statusColors[proposal.status] as any}>
                      {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Flex justifyContent="start" className="gap-2">
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
                      />
                      <Button
                        icon={Send}
                        variant="light"
                        color="purple"
                        tooltip="Send Email"
                        size="xs"
                      />
                      <Button
                        icon={Trash2}
                        variant="light"
                        color="red"
                        tooltip="Delete"
                        size="xs"
                      />
                    </Flex>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
} 