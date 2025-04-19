'use server';

import { generatePdfInvoice, sendInvoiceEmail, createInvoiceData } from '@/lib/invoice-utils';
import { ChecklistItem, Client, Permit } from '@/lib/types';

// Force Edge runtime to maintain consistent global state
export const runtime = 'edge';

// Define the cache structure
declare global {
  var __PDF_CACHE: {
    [key: string]: {
      fileName: string;
      contentType: string;
      data: string;
      createdAt: string;
    }
  };
}

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
    
    // Generate the PDF in memory
    const pdfData = await generatePdfInvoice(invoiceData, fileName);
    
    // Generate a unique ID for this PDF
    const pdfId = `pdf_${Date.now()}_${permit.id.substring(0, 8)}`;
    
    // Store PDF data temporarily (can be accessed via API route)
    try {
      // Using URL since we can't use the filesystem
      const downloadUrl = `/api/download?id=${pdfId}`;
      
      // Initialize the cache if not exists
      if (typeof global.__PDF_CACHE === 'undefined') {
        global.__PDF_CACHE = {};
      }
      
      // Store PDF in a global variable for short-term access from API route
      global.__PDF_CACHE[pdfId] = {
        fileName,
        contentType: 'application/pdf',
        data: pdfData.base64,
        createdAt: new Date().toISOString()
      };
      
      console.log(`Stored PDF in cache with ID: ${pdfId}`);
      console.log(`Cache now contains ${Object.keys(global.__PDF_CACHE).length} PDFs`);
      
      // Clean up old PDFs (keeping only last 10)
      const pdfIds = Object.keys(global.__PDF_CACHE);
      if (pdfIds.length > 10) {
        const oldestIds = pdfIds
          .sort((a, b) => global.__PDF_CACHE[a].createdAt.localeCompare(global.__PDF_CACHE[b].createdAt))
          .slice(0, pdfIds.length - 10);
        
        oldestIds.forEach(id => {
          delete global.__PDF_CACHE[id];
        });
      }
      
      return { 
        success: true, 
        fileName,
        pdfId,
        downloadUrl,
        pdfData: pdfData.base64 // Return the PDF data directly
      };
    } catch (err) {
      console.error("Error storing PDF data:", err);
      throw err;
    }
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
  pdfId: string
) {
  try {
    // Log debug information
    console.log(`Attempting to send email with SMTP config:
      Host: ${process.env.SMTP_HOST}
      Port: ${process.env.SMTP_PORT}
      User: ${process.env.SMTP_USER}
    `);
    
    // Get the PDF data from cache
    if (!global.__PDF_CACHE || !global.__PDF_CACHE[pdfId]) {
      console.error(`PDF not found in cache: ${pdfId}`);
      return { success: false, error: 'PDF not found or expired' };
    }
    
    const pdfData = global.__PDF_CACHE[pdfId];
    
    // Create a temporary data URI for nodemailer
    const attachment = {
      filename: pdfData.fileName,
      content: pdfData.data.split('base64,')[1],
      encoding: 'base64'
    };
    
    const result = await sendInvoiceEmail(clientEmail, subject, text, html, attachment);
    return { success: true, result };
  } catch (error) {
    console.error('Error sending invoice email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
} 