'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../../dashboard-layout';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAppContext } from '@/lib/context';
import ProposalForm from '../ProposalForm';
import { FiArrowLeft } from 'react-icons/fi';

export default function NewProposalPage() {
  const { clients } = useAppContext();
  const searchParams = useSearchParams();
  const permitId = searchParams.get('permitId') || undefined;
  
  // Check if there are clients before rendering the form
  const hasClients = clients.length > 0;
  
  return (
    <DashboardLayout title="Create New Proposal">
      <div className="mb-6">
        <Link 
          href="/proposals" 
          className="flex items-center text-sm text-gray-500 hover:text-indigo-600 mb-4"
        >
          <FiArrowLeft className="mr-2" /> Back to Proposals
        </Link>
        
        <h1 className="text-2xl font-semibold">Create New Proposal</h1>
        <p className="text-gray-500 mt-1">Create a detailed proposal to send to your client</p>
        
        {permitId && (
          <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
            Linked to Permit
          </div>
        )}
      </div>
      
      {hasClients ? (
        <ProposalForm clients={clients} permitId={permitId} />
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-6 mt-4 text-center">
          <h2 className="text-xl font-semibold mb-2">No Clients Available</h2>
          <p className="text-gray-500 mb-4">
            You need to add a client before you can create a proposal.
          </p>
          <Link 
            href="/clients/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Client
          </Link>
        </div>
      )}
    </DashboardLayout>
  );
} 