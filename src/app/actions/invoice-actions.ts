'use server';

import { generatePdfInvoice, sendInvoiceEmail, createInvoiceData } from '@/lib/invoice-utils';
import { ChecklistItem, Client, Permit } from '@/lib/types';
import { storePdfData, getPdfData } from '@/lib/server-state';

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
    const invoiceData = await createInvoiceData(permit, client, checklistItems);
    
    // Generate PDF with the invoice data
    const fileName = `invoice-${permit.id.substring(0, 8)}.pdf`;
    
    // Generate the PDF using the API
    const pdfData = await generatePdfInvoice(invoiceData, fileName);
    
    // Generate a unique ID for this PDF
    const pdfId = `pdf_${Date.now()}_${permit.id.substring(0, 8)}`;
    
    // Store PDF data temporarily (can be accessed via API route)
    try {
      // Using URL since we can't use the filesystem
      const downloadUrl = `/api/download?id=${pdfId}`;
      
      // Store PDF in our server-state cache
      await storePdfData(pdfId, {
        fileName,
        contentType: 'application/pdf',
        data: pdfData.base64,
        createdAt: new Date().toISOString()
      });
      
      console.log(`Stored PDF in cache with ID: ${pdfId}`);
      
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
    const pdfData = await getPdfData(pdfId);
    
    if (!pdfData) {
      console.error(`PDF not found in cache: ${pdfId}`);
      return { success: false, error: 'PDF not found or expired' };
    }
    
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