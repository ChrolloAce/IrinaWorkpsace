'use server';

import { generatePdfInvoice, sendInvoiceEmail, createInvoiceData } from '@/lib/invoice-utils';
import { ChecklistItem, Client, Permit } from '@/lib/types';
import fs from 'fs';
import path from 'path';

/**
 * Server action to generate an invoice PDF
 */
export async function generateInvoiceAction(
  permit: Permit,
  client: Client,
  checklistItems: ChecklistItem[]
) {
  try {
    console.log("Starting invoice generation for permit:", permit.id);
    
    // Create invoice data
    const invoiceData = createInvoiceData(permit, client, checklistItems);
    
    // Generate PDF with the invoice data
    const fileName = `invoice-${permit.id.substring(0, 8)}.pdf`;
    const tempDir = path.join(process.cwd(), 'temp');
    
    // Create temp directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
      console.log("Creating temporary directory:", tempDir);
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const filePath = path.join(tempDir, fileName);
    console.log("Generating PDF at path:", filePath);
    
    // Generate the PDF
    await generatePdfInvoice(invoiceData, filePath);
    
    // Create a download URL for the client
    const downloadUrl = `/api/download?file=${fileName}`;
    
    return { 
      success: true, 
      fileName, 
      filePath,
      downloadUrl
    };
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
    
    // Get the full path to the PDF
    const fullPath = path.join(process.cwd(), 'temp', pdfPath);
    console.log(`Looking for PDF at: ${fullPath}`);
    
    if (!fs.existsSync(fullPath)) {
      console.error(`PDF file not found at ${fullPath}`);
      return { success: false, error: 'PDF file not found' };
    }
    
    const result = await sendInvoiceEmail(clientEmail, subject, text, html, fullPath);
    return { success: true, result };
  } catch (error) {
    console.error('Error sending invoice email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
} 