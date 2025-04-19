// Client branch/location type
export type ClientBranch = {
  id: string;
  clientId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  isMainLocation: boolean;
  createdAt: string;
};

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
  branches?: ClientBranch[];
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

// Template checklist item type
export type TemplateItem = {
  id: string;
  title: string;
  price?: number;
  order: number;
};

// Checklist template type
export type ChecklistTemplate = {
  id: string;
  name: string;
  description: string;
  permitType: string;
  items: TemplateItem[];
  createdAt: string;
}; 