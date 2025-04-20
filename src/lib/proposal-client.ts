import { Proposal } from './types';

/**
 * Creates a new proposal with default values
 * Note: This can be used from client components
 */
export function createNewProposal(clientId: string, permitId?: string): Proposal {
  const now = new Date();
  const validUntil = new Date();
  validUntil.setDate(now.getDate() + 30); // Valid for 30 days
  
  return {
    id: `PROP-${Date.now().toString().substring(7, 13)}`,
    title: 'Permit Expediting Services',
    clientId,
    permitId,
    status: 'draft',
    date: now.toLocaleDateString(),
    validUntil: validUntil.toLocaleDateString(),
    scope: 'This proposal outlines permit expediting services to be provided by IRH Smart LLC.',
    terms: 'Payment Terms: 50% deposit required to begin work, with remaining balance due upon completion.\n\n' +
           'Cancellation Policy: Cancellations must be made in writing. Deposit is non-refundable if work has commenced.',
    totalAmount: 0,
    items: [],
    createdAt: now.toISOString()
  };
} 