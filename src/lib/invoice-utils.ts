'use server';

import nodemailer from 'nodemailer';
import { ChecklistItem, Client, Permit } from './types';
import path from 'path';
import fs from 'fs';
import 'server-only';

/**
 * Generates a PDF invoice using the Invoice Generator API
 * @param invoiceData - Invoice data to render in the PDF
 * @param fileName - Name to save the generated PDF file
 * @returns Promise with the file path and PDF data
 */
export async function generatePdfInvoice(
  invoiceData: Awaited<ReturnType<typeof createInvoiceData>>,
  fileName: string
): Promise<{ buffer: ArrayBuffer; base64: string; pdfData: string }> {
  try {
    // The temporary directory for storing PDFs
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const filePath = path.join(tempDir, fileName);
    
    // Format the data for the Invoice Generator API
    const apiData = {
      // Company Info
      from: `Irina Perez\nIRH Smart LLC\nPermit Expediter\nPhone: (305) 859-1549\nDirect: (786) 208-6889\nEmail: irina@irhsmart.com`,
      
      // Client Info
      to: `${invoiceData.client.name}\n${invoiceData.client.address}\n${invoiceData.client.city}, ${invoiceData.client.state} ${invoiceData.client.zipCode}`,
      
      // Invoice Details
      number: invoiceData.id,
      date: invoiceData.date,
      due_date: invoiceData.dueDate,
      
      // Add logo from public directory
      logo: "unnamed.jpg",
      
      // Custom fields for the permit details
      custom_fields: [
        {
          name: "Permit Number",
          value: invoiceData.permit.permitNumber || 'N/A'
        },
        {
          name: "Project",
          value: invoiceData.permit.title
        },
        {
          name: "Location",
          value: invoiceData.permit.location
        }
      ],
      
      // Line items from checklist items
      items: invoiceData.items.map(item => ({
        name: item.title,
        quantity: 1,
        unit_cost: item.price || 0,
        description: item.completed ? 'Completed' : 'In Progress'
      })),
      
      // Payment info
      amount_paid: invoiceData.completedCost,
      
      // Notes and terms
      notes: 'Thank you for your business!',
      terms: 'Payment due within 30 days.'
    };
    
    // API endpoint for Invoice Generator
    const apiUrl = 'https://invoice-generator.com';
    
    // Make the API call
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(apiData)
    });
    
    if (!response.ok) {
      throw new Error(`Invoice Generator API error: ${response.status} ${response.statusText}`);
    }
    
    // Get the PDF buffer directly from the response
    const pdfBuffer = await response.arrayBuffer();
    
    // Save the PDF to disk if needed
    fs.writeFileSync(filePath, Buffer.from(pdfBuffer));
    
    // Convert to base64 for browser viewing
    const base64 = `data:application/pdf;base64,${Buffer.from(pdfBuffer).toString('base64')}`;
    
    return { 
      buffer: pdfBuffer, 
      base64,
      pdfData: base64 
    };
  } catch (error) {
    console.error('Error generating PDF invoice:', error);
    throw error;
  }
}

/**
 * Creates an invoice object with all necessary data
 */
export async function createInvoiceData(
  permit: Permit,
  client: Client,
  checklistItems: ChecklistItem[]
) {
  const totalCost = checklistItems.reduce((sum, item) => sum + (item.price || 0), 0);
  const completedCost = checklistItems
    .filter(item => item.completed)
    .reduce((sum, item) => sum + (item.price || 0), 0);
  
  return {
    id: `INV-${permit.id.substring(0, 8).toUpperCase()}`,
    date: new Date().toLocaleDateString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    client,
    permit,
    items: checklistItems,
    totalCost,
    completedCost,
    balanceDue: totalCost - completedCost
  };
}

/**
 * Sends an invoice via email
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param text - Email plain text
 * @param html - Email HTML content
 * @param attachment - Either a path to the PDF file or an attachment object
 * @returns Promise with the email send result
 */
export async function sendInvoiceEmail(
  to: string,
  subject: string,
  text: string,
  html: string,
  attachment: string | { filename: string; content: string; encoding: string }
): Promise<any> {
  console.log(`Sending email to ${to} with subject: ${subject}`);
  
  // Double-check that we're using the correct SMTP host
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com'; // Default to gmail if not set
  
  // Set up Nodemailer
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Boolean(process.env.SMTP_SECURE === 'true'),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // Prepare attachment
  let attachmentConfig;
  if (typeof attachment === 'string') {
    // It's a file path
    attachmentConfig = {
      filename: attachment.split('/').pop(),
      path: attachment,
    };
  } else {
    // It's already an attachment object
    attachmentConfig = attachment;
  }

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
    attachments: [attachmentConfig],
  });

  return info;
} 