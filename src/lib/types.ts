// Client type definition
export type Client = {
  id: string;
  name: string;
  contactPerson?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  notes?: string;
  createdAt: string;
};

// Permit status type
export type PermitStatus = 'draft' | 'submitted' | 'in-progress' | 'approved' | 'expired';

// Permit type definition
export type Permit = {
  id: string;
  title: string;
  clientId: string;
  permitType: string;
  status: PermitStatus;
  location: string;
  description: string;
  assignedTo?: string;
  progress: number;
  createdAt: string;
  expiresAt?: string | null;
  permitNumber: string;
};

// Checklist item type
export type ChecklistItem = {
  id: string;
  permitId: string;
  title: string;
  completed: boolean;
  notes?: string;
  price?: number; // Price for this checklist item
  createdAt: string;
}; 