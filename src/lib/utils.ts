/**
 * Utility functions for the permit management dashboard
 */

/**
 * Formats a date string into a human-readable format
 * @param dateString - The date string to format
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string;
export function formatDate(date: Date): string;
export function formatDate(input: string | Date): string {
  if (!input) return '';
  
  const date = typeof input === 'string' ? new Date(input) : input;
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return typeof input === 'string' ? input : '';
  }
  
  // Format as MM/DD/YYYY
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Calculates the progress percentage based on completed items
 * @param items - Array of items with a completed property
 * @returns Progress percentage (0-100)
 */
export function calculateProgress<T extends { completed: boolean }>(items: T[]): number {
  if (!items.length) return 0;
  
  const completedCount = items.filter(item => item.completed).length;
  return Math.round((completedCount / items.length) * 100);
}

/**
 * Returns today's date in YYYY-MM-DD format
 */
export function getTodayFormatted(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Generates a random ID string
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
} 