import { Client, Permit, ChecklistItem, PermitStatus, ClientBranch } from './types';
import { formatDate, generateId, getTodayFormatted, calculateProgress } from './utils';

// Get date X months from now
export const getDateMonthsFromNow = (months: number): string => {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return formatDate(date);
};

// Track the current year and permit counter
let currentPermitYear: number | null = null;
let permitCounter: number = 0;

// Generate permit number in format YY-XXX (e.g., 25-001)
export const generatePermitNumber = (): string => {
  const currentYear = new Date().getFullYear();
  // Get last 2 digits of year
  const yearSuffix = currentYear.toString().slice(-2);
  
  let counter = 0;
  // Try to get counter from localStorage
  if (typeof window !== 'undefined') {
    const storedYear = localStorage.getItem('permitYear');
    const storedCounter = localStorage.getItem('permitCounter');
    
    // If the year changed, reset counter
    if (storedYear !== yearSuffix) {
      counter = 1;
      localStorage.setItem('permitYear', yearSuffix);
    } else if (storedCounter) {
      // Otherwise use the stored counter + 1
      counter = parseInt(storedCounter, 10) + 1;
    } else {
      counter = 1;
    }
    
    // Store the updated counter
    localStorage.setItem('permitCounter', counter.toString());
  } else {
    // Fallback for SSR
    if (currentPermitYear !== currentYear) {
      currentPermitYear = currentYear;
      permitCounter = 0;
    }
    counter = ++permitCounter;
  }
  
  // Format counter as 3-digit number with leading zeros
  const counterFormatted = counter.toString().padStart(3, '0');
  
  // Return in format YY-XXX
  return `${yearSuffix}-${counterFormatted}`;
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
    permitNumber: '23-001',
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
    permitNumber: '23-002',
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
    permitNumber: '23-003',
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
    permitNumber: '22-001',
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
    permitNumber: '23-004',
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

// Sample client branches data
export const sampleClientBranches: ClientBranch[] = [
  {
    id: '1',
    clientId: '1',
    name: 'Bank of America - Downtown HQ',
    address: '123 Main St',
    city: 'Atlanta',
    state: 'GA',
    zipCode: '30303',
    contactPerson: 'John Smith',
    phone: '(123) 456-7890',
    email: 'john.smith@bankofamerica.com',
    isMainLocation: true,
    createdAt: '2023-01-15',
  },
  {
    id: '2',
    clientId: '1',
    name: 'Bank of America - Midtown Branch',
    address: '456 Peachtree St',
    city: 'Atlanta',
    state: 'GA',
    zipCode: '30308',
    contactPerson: 'Emily Johnson',
    phone: '(123) 456-7891',
    email: 'emily.johnson@bankofamerica.com',
    isMainLocation: false,
    createdAt: '2023-02-20',
  },
  {
    id: '3',
    clientId: '1',
    name: 'Bank of America - Buckhead Branch',
    address: '789 Piedmont Rd',
    city: 'Atlanta',
    state: 'GA',
    zipCode: '30305',
    contactPerson: 'Michael Brown',
    phone: '(123) 456-7892',
    email: 'michael.brown@bankofamerica.com',
    isMainLocation: false,
    createdAt: '2023-03-15',
  },
  {
    id: '4',
    clientId: '2',
    name: 'Wells Fargo - Miami Main Branch',
    address: '456 Oak St',
    city: 'Miami',
    state: 'FL',
    zipCode: '33101',
    contactPerson: 'Sarah Johnson',
    phone: '(234) 567-8901',
    email: 'sarah.j@wellsfargo.com',
    isMainLocation: true,
    createdAt: '2023-03-22',
  },
  {
    id: '5',
    clientId: '2',
    name: 'Wells Fargo - South Beach Branch',
    address: '789 Collins Ave',
    city: 'Miami Beach',
    state: 'FL',
    zipCode: '33139',
    contactPerson: 'David Wilson',
    phone: '(234) 567-8902',
    email: 'david.w@wellsfargo.com',
    isMainLocation: false,
    createdAt: '2023-04-10',
  },
  {
    id: '6',
    clientId: '3',
    name: 'First National Bank - Tampa HQ',
    address: '789 Pine St',
    city: 'Tampa',
    state: 'FL',
    zipCode: '33602',
    contactPerson: 'Michael Brown',
    phone: '(345) 678-9012',
    email: 'mbrown@fnb.com',
    isMainLocation: true,
    createdAt: '2023-05-10',
  },
];

// Add sample checklist templates
export const sampleChecklistTemplates = [
  {
    id: 'template1',
    name: 'Standard Construction Permit',
    description: 'Basic checklist for construction permits',
    permitType: 'Construction',
    items: [
      {
        id: 'titem1',
        title: 'Building Permit Application Form',
        price: 200,
        order: 1
      },
      {
        id: 'titem2',
        title: 'Site Plan Submission',
        price: 350,
        order: 2
      },
      {
        id: 'titem3',
        title: 'Architectural Drawings Review',
        price: 500,
        order: 3
      }
    ],
    createdAt: '2023-11-01'
  },
  {
    id: 'template2',
    name: 'Electrical Permit Checklist',
    description: 'Complete checklist for electrical permits',
    permitType: 'Electrical',
    items: [
      {
        id: 'titem4',
        title: 'Electrical Permit Application',
        price: 150,
        order: 1
      },
      {
        id: 'titem5',
        title: 'Electrical Load Calculations',
        price: 200,
        order: 2
      },
      {
        id: 'titem6',
        title: 'Electrical Plans Review',
        price: 300,
        order: 3
      },
      {
        id: 'titem7',
        title: 'On-site Inspection',
        price: 250,
        order: 4
      }
    ],
    createdAt: '2023-11-15'
  },
  {
    id: 'template3',
    name: 'Renovation Permit Checklist',
    description: 'Checklist for renovation projects',
    permitType: 'Renovation',
    items: [
      {
        id: 'titem8',
        title: 'Renovation Permit Application',
        price: 175,
        order: 1
      },
      {
        id: 'titem9',
        title: 'Scope of Work Documentation',
        price: 200,
        order: 2
      },
      {
        id: 'titem10',
        title: 'Contractor Information Submission',
        price: 100,
        order: 3
      },
      {
        id: 'titem11',
        title: 'Final Inspection',
        price: 225,
        order: 4
      }
    ],
    createdAt: '2023-12-01'
  }
]; 