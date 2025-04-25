import { Proposal } from './types';

/**
 * Creates a new proposal with default values
 * Note: This can be used from client components
 */
export function createNewProposal(clientId: string, permitId?: string): Proposal {
  const now = new Date();
  const validUntil = new Date();
  validUntil.setDate(now.getDate() + 30); // Valid for 30 days
  
  // Get proposal number in format YY-XXX (e.g., 25-001)
  const currentYear = now.getFullYear().toString().slice(-2);
  let counter = 1;
  
  // Try to get counter from localStorage
  if (typeof window !== 'undefined') {
    const storedYear = localStorage.getItem('proposalYear');
    const storedCounter = localStorage.getItem('proposalCounter');
    
    // If the year changed, reset counter
    if (storedYear !== currentYear) {
      counter = 1;
      localStorage.setItem('proposalYear', currentYear);
    } else if (storedCounter) {
      // Otherwise use the stored counter + 1
      counter = parseInt(storedCounter, 10) + 1;
    } else {
      counter = 1;
    }
    
    // Store the updated counter
    localStorage.setItem('proposalCounter', counter.toString());
  }
  
  // Format counter as 3-digit number with leading zeros
  const counterFormatted = counter.toString().padStart(3, '0');
  
  // Generate proposal number in format YY-XXX
  const proposalNumber = `${currentYear}-${counterFormatted}`;
  
  return {
    id: generateId(),
    title: proposalNumber,
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

// Helper function to generate ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
} 