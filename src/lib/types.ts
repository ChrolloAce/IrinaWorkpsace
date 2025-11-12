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

// Proposal status type
export type ProposalStatus = 'draft' | 'sent' | 'accepted' | 'declined';

// Proposal type definition
export type Proposal = {
  id: string;
  title: string;
  clientId: string;
  permitId?: string;
  status: ProposalStatus;
  date: string;
  validUntil: string;
  scope: string;
  terms: string;
  totalAmount: number;
  items: ProposalItem[];
  notes?: string;
  createdAt: string;
};

// Proposal item type
export type ProposalItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

// Invoice status type
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

// Invoice type definition
export type Invoice = {
  id: string;
  proposalId?: string;
  permitId?: string;
  clientId: string;
  status: InvoiceStatus;
  date: string;
  dueDate: string;
  items: ProposalItem[];
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  notes?: string;
  createdAt: string;
}; 