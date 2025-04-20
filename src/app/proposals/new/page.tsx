'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  Title, 
  Text,
  Flex,
  Button,
  Badge
} from '@tremor/react';
import { useSearchParams } from 'next/navigation';
import { useAppContext } from '@/lib/context';
import ProposalForm from '../ProposalForm';
import { ArrowLeftIcon as ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewProposalPage() {
  const { clients } = useAppContext();
  const searchParams = useSearchParams();
  const permitId = searchParams.get('permitId') || undefined;
  
  // Check if there are clients before rendering the form
  const hasClients = clients.length > 0;
  
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
          <Title>Create New Proposal</Title>
          <Text>Create a detailed proposal to send to your client</Text>
        </div>
        
        {permitId && (
          <Badge color="emerald" size="lg">
            Linked to Permit
          </Badge>
        )}
      </Flex>
      
      {hasClients ? (
        <ProposalForm clients={clients} permitId={permitId} />
      ) : (
        <Card className="mt-4 p-6 text-center">
          <Title className="mb-2">No Clients Available</Title>
          <Text>
            You need to add a client before you can create a proposal.
          </Text>
          <Link href="/clients/new">
            <Button className="mt-4">Add Client</Button>
          </Link>
        </Card>
      )}
    </div>
  );
} 