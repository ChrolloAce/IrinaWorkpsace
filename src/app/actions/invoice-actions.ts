'use server';

import { generatePdfInvoice, sendInvoiceEmail, createInvoiceData } from '@/lib/invoice-utils';
import { ChecklistItem, Client, Permit } from '@/lib/types';

/**
 * Server action to generate an invoice PDF
 */
export async function generateInvoiceAction(
  permit: Permit,
  client: Client,
  checklistItems: ChecklistItem[]
) {
  try {
    // Create invoice data
    const invoiceData = createInvoiceData(permit, client, checklistItems);
    
    // Generate PDF with the invoice data
    const fileName = `invoice-${permit.id.substring(0, 8)}.pdf`;
    const filePath = await generatePdfInvoice(invoiceData, fileName);
    
    return { success: true, fileName, filePath };
  } catch (error) {
    console.error('Error generating invoice:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Server action to send an invoice email
 */
export async function sendInvoiceEmailAction(
  clientEmail: string,
  subject: string,
  text: string,
  html: string,
  pdfPath: string
) {
  try {
    // Log debug information
    console.log(`Attempting to send email with SMTP config:
      Host: ${process.env.SMTP_HOST}
      Port: ${process.env.SMTP_PORT}
      User: ${process.env.SMTP_USER}
    `);
    
    const result = await sendInvoiceEmail(clientEmail, subject, text, html, pdfPath);
    return { success: true, result };
  } catch (error) {
    console.error('Error sending invoice email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
} 