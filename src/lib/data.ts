import { Client, Permit, ChecklistItem, PermitStatus } from './types';
import { formatDate, generateId, getTodayFormatted, calculateProgress } from './utils';

// Get date X months from now
export const getDateMonthsFromNow = (months: number): string => {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return formatDate(date);
};

// Generate permit number
export const generatePermitNumber = (): string => {
  const prefix = 'PERM';
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${year}-${randomNum}`;
};

// Sample clients data
export const sampleClients: Client[] = [
  {
    id: '1',
    name: 'Bank of America',
    contactPerson: 'John Smith',
    email: 'john.smith@bankofamerica.com',
    phone: '(123) 456-7890',
    address: '123 Main St',
    city: 'Atlanta',
    state: 'GA',
    zipCode: '30303',
    notes: 'Major national client with multiple locations',
    createdAt: '2023-01-15',
  },
  {
    id: '2',
    name: 'Wells Fargo',
    contactPerson: 'Sarah Johnson',
    email: 'sarah.j@wellsfargo.com',
    phone: '(234) 567-8901',
    address: '456 Oak St',
    city: 'Miami',
    state: 'FL',
    zipCode: '33101',
    createdAt: '2023-03-22',
  },
  {
    id: '3',
    name: 'First National Bank',
    contactPerson: 'Michael Brown',
    email: 'mbrown@fnb.com',
    phone: '(345) 678-9012',
    address: '789 Pine St',
    city: 'Tampa',
    state: 'FL',
    zipCode: '33602',
    notes: 'Regional bank with 25 locations',
    createdAt: '2023-05-10',
  },
  {
    id: '4',
    name: 'Chase Bank',
    contactPerson: 'Lisa Davis',
    email: 'ldavis@chase.com',
    phone: '(456) 789-0123',
    address: '159 Cedar St',
    city: 'Orlando',
    state: 'FL',
    zipCode: '32801',
    createdAt: '2023-07-05',
  },
];

// Sample permits data
export const samplePermits: Permit[] = [
  {
    id: '1',
    title: 'Mall of Georgia Renovations',
    clientId: '1',
    permitType: 'Renovation',
    status: 'in-progress',
    location: 'Mall of Georgia, Buford, GA',
    description: 'Renovation permit for the Bank of America branch at Mall of Georgia. Includes interior redesign and exterior facade updates.',
    assignedTo: 'John Smith',
    progress: 65,
    createdAt: '2023-07-30',
    expiresAt: '2024-07-30',
    permitNumber: 'PERM-2023-0730',
  },
  {
    id: '2',
    title: 'Ormond Beach Bollards',
    clientId: '1',
    permitType: 'Construction',
    status: 'submitted',
    location: 'Ormond Beach, FL',
    description: 'Installation of security bollards at the Bank of America branch in Ormond Beach, FL.',
    assignedTo: 'Mike Johnson',
    progress: 30,
    createdAt: '2023-08-21',
    expiresAt: '2024-08-21',
    permitNumber: 'PERM-2023-0821',
  },
  {
    id: '3',
    title: 'Parking Lot Resurfacing',
    clientId: '3',
    permitType: 'Construction',
    status: 'approved',
    location: 'First National Bank, Tampa, FL',
    description: 'Resurfacing of the parking lot at First National Bank headquarters.',
    assignedTo: 'Sarah Parker',
    progress: 100,
    createdAt: '2023-07-15',
    expiresAt: '2024-07-15',
    permitNumber: 'PERM-2023-7150',
  },
  {
    id: '4',
    title: 'ATM Installation',
    clientId: '2',
    permitType: 'Installation',
    status: 'expired',
    location: 'Wells Fargo, Miami, FL',
    description: 'Installation of a new drive-thru ATM at the Wells Fargo branch.',
    assignedTo: 'David Wilson',
    progress: 100,
    createdAt: '2022-05-10',
    expiresAt: '2023-05-10',
    permitNumber: 'PERM-2022-5101',
  },
  {
    id: '5',
    title: 'New Branch Construction',
    clientId: '1',
    permitType: 'Construction',
    status: 'draft',
    location: 'Bank of America, Jacksonville, FL',
    description: 'Construction of a new Bank of America branch in the downtown area.',
    assignedTo: 'Emily Roberts',
    progress: 10,
    createdAt: '2023-09-05',
    expiresAt: null,
    permitNumber: 'PERM-2023-9050',
  },
];

// Sample checklist items data
export const sampleChecklistItems: ChecklistItem[] = [
  {
    id: '1',
    permitId: '1',
    title: 'Application form completed',
    completed: true,
    createdAt: '2023-07-30',
  },
  {
    id: '2',
    permitId: '1',
    title: 'Payment processed',
    completed: true,
    createdAt: '2023-08-02',
  },
  {
    id: '3',
    permitId: '1',
    title: 'Site plans submitted',
    completed: true,
    createdAt: '2023-08-05',
  },
  {
    id: '4',
    permitId: '1',
    title: 'Environmental review passed',
    completed: false,
    notes: 'Waiting for inspector report',
    createdAt: '2023-08-10',
  },
  {
    id: '5',
    permitId: '1',
    title: 'Zoning compliance checked',
    completed: false,
    createdAt: '2023-08-15',
  },
  {
    id: '6',
    permitId: '1',
    title: 'Final approval',
    completed: false,
    createdAt: '2023-08-20',
  },
  {
    id: '7',
    permitId: '2',
    title: 'Application form completed',
    completed: true,
    createdAt: '2023-08-21',
  },
  {
    id: '8',
    permitId: '2',
    title: 'Payment processed',
    completed: true,
    createdAt: '2023-08-23',
  },
  {
    id: '9',
    permitId: '2',
    title: 'Site plans submitted',
    completed: false,
    createdAt: '2023-08-25',
  },
  {
    id: '10',
    permitId: '2',
    title: 'Safety review',
    completed: false,
    createdAt: '2023-08-27',
  },
]; 