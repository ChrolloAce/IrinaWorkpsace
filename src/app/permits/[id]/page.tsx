'use client';

import React from 'react';
import DashboardLayout from '../../dashboard-layout';
import Link from 'next/link';
import { 
  FiEdit2, 
  FiTrash2, 
  FiFileText, 
  FiCalendar, 
  FiUser, 
  FiCheckSquare,
  FiClock,
  FiArrowLeft 
} from 'react-icons/fi';
import PermitChecklist from '@/components/permits/PermitChecklist';

type PermitDetailPageProps = {
  params: {
    id: string;
  };
};

// Sample checklist items
const checklistItems = [
  { id: '1', title: 'Application form completed', completed: true },
  { id: '2', title: 'Payment processed', completed: true },
  { id: '3', title: 'Site plans submitted', completed: true },
  { id: '4', title: 'Environmental review passed', completed: false, notes: 'Waiting for inspector report' },
  { id: '5', title: 'Zoning compliance checked', completed: false },
  { id: '6', title: 'Final approval', completed: false },
];

// Sample permit data - in a real app, this would be fetched from the database
const getPermitData = (id: string) => {
  return {
    id,
    title: id === '1' ? 'Mall of Georgia Renovations' : 'Ormond Beach Bollards',
    client: 'Bank of America',
    clientId: '1',
    status: id === '1' ? 'in-progress' : 'submitted',
    createdAt: id === '1' ? '2023-07-30' : '2023-08-21',
    expiresAt: id === '1' ? '2024-07-30' : '2024-08-21',
    progress: id === '1' ? 65 : 30,
    description: id === '1' 
      ? 'Renovation permit for the Bank of America branch at Mall of Georgia. Includes interior redesign and exterior facade updates.'
      : 'Installation of security bollards at the Bank of America branch in Ormond Beach, FL.',
    permitNumber: id === '1' ? 'PERM-2023-0730' : 'PERM-2023-0821',
    location: id === '1' ? 'Mall of Georgia, Buford, GA' : 'Ormond Beach, FL',
    permitType: id === '1' ? 'Renovation' : 'Construction',
    assignedTo: 'John Smith',
  };
};

const getStatusBadgeClass = (status: string) => {
  const classes = {
    'draft': 'bg-gray-100 text-gray-800',
    'submitted': 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-green-100 text-green-800',
    'expired': 'bg-red-100 text-red-800',
  };
  return classes[status as keyof typeof classes] || classes['draft'];
};

export default function PermitDetailPage({ params }: PermitDetailPageProps) {
  const permit = getPermitData(params.id);
  
  // In a real app, these would modify state or call API endpoints
  const handleToggleItem = (id: string, completed: boolean) => {
    console.log(`Toggle item ${id} to ${completed}`);
  };
  
  const handleUpdateNotes = (id: string, notes: string) => {
    console.log(`Update notes for item ${id}:`, notes);
  };

  return (
    <DashboardLayout title="Permit Details">
      <div className="mb-6">
        <Link 
          href="/permits" 
          className="flex items-center text-sm text-gray-500 hover:text-indigo-600 mb-4"
        >
          <FiArrowLeft className="mr-2" /> Back to Permits
        </Link>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold">{permit.title}</h1>
            <div className="flex items-center mt-2">
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(permit.status)}`}>
                {permit.status.charAt(0).toUpperCase() + permit.status.slice(1).replace('-', ' ')}
              </span>
              <span className="ml-3 text-sm text-gray-500">Permit #{permit.permitNumber}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Link 
              href={`/permits/${params.id}/edit`} 
              className="btn-secondary flex items-center"
            >
              <FiEdit2 className="mr-2" /> Edit
            </Link>
            <button className="btn-secondary flex items-center text-red-600 hover:text-red-700">
              <FiTrash2 className="mr-2" /> Delete
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="card flex items-center">
          <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-3">
            <FiUser />
          </div>
          <div>
            <div className="text-sm text-gray-500">Client</div>
            <Link href={`/clients/1`} className="font-medium hover:text-indigo-600">
              {permit.client}
            </Link>
          </div>
        </div>
        
        <div className="card flex items-center">
          <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 mr-3">
            <FiFileText />
          </div>
          <div>
            <div className="text-sm text-gray-500">Permit Type</div>
            <div className="font-medium">{permit.permitType}</div>
          </div>
        </div>
        
        <div className="card flex items-center">
          <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 mr-3">
            <FiClock />
          </div>
          <div>
            <div className="text-sm text-gray-500">Expiration Date</div>
            <div className="font-medium">{new Date(permit.expiresAt).toLocaleDateString()}</div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="col-span-2">
          <div className="card">
            <h2 className="text-lg font-medium mb-4">Permit Information</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm text-gray-500">Description</h3>
                <p className="mt-1">{permit.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm text-gray-500">Location</h3>
                  <p className="mt-1 font-medium">{permit.location}</p>
                </div>
                
                <div>
                  <h3 className="text-sm text-gray-500">Assigned To</h3>
                  <p className="mt-1 font-medium">{permit.assignedTo}</p>
                </div>
                
                <div>
                  <h3 className="text-sm text-gray-500">Created Date</h3>
                  <p className="mt-1 font-medium">{new Date(permit.createdAt).toLocaleDateString()}</p>
                </div>
                
                <div>
                  <h3 className="text-sm text-gray-500">Progress</h3>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-indigo-600 h-2.5 rounded-full" 
                        style={{ width: `${permit.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {permit.progress}% Complete
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="card">
            <h2 className="text-lg font-medium mb-4">Actions</h2>
            
            <div className="space-y-3">
              <Link 
                href={`/permits/${params.id}/documents`} 
                className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mr-3">
                  <FiFileText />
                </div>
                <div className="font-medium">View Documents</div>
              </Link>
              
              <Link 
                href={`/permits/${params.id}/checklist`} 
                className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-3">
                  <FiCheckSquare />
                </div>
                <div className="font-medium">Manage Checklist</div>
              </Link>
              
              <Link 
                href={`/permits/${params.id}/timeline`} 
                className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 mr-3">
                  <FiCalendar />
                </div>
                <div className="font-medium">View Timeline</div>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <PermitChecklist 
        items={checklistItems} 
        onItemToggle={handleToggleItem}
        onUpdateNotes={handleUpdateNotes}
      />
    </DashboardLayout>
  );
} 