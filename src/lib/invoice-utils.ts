import jsPDF from 'jspdf';
import nodemailer from 'nodemailer';
import { ChecklistItem, Client, Permit } from './types';
import 'server-only';

// Server-side only imports
import path from 'path';
import fs from 'fs';

/**
 * Generates a PDF invoice directly using jsPDF
 * @param invoiceData - Invoice data to render in the PDF
 * @param fileName - Name of the generated PDF file
 * @returns Promise with the file path
 */
export async function generatePdfInvoice(
  invoiceData: ReturnType<typeof createInvoiceData>,
  fileName: string
): Promise<{ buffer: ArrayBuffer; base64: string }> {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Add logo
    try {
      const logoPath = path.join(process.cwd(), 'unnamed.jpg');
      const logoDataUrl = await getLogoDataUrl(logoPath);
      doc.addImage(logoDataUrl, 'JPEG', 15, 10, 30, 30);
    } catch (error) {
      console.error('Error adding logo:', error);
    }
    
    // Add company info header
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Irina Perez', 50, 15);
    doc.text('IRH Smart LLC', 50, 22);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Permit Expediter', 50, 29);
    doc.text('Phone: (305) 859-1549', 50, 36);
    doc.text('Direct: (786) 208-6889', 50, 43);
    doc.text('Email: irina@irhsmart.com', 50, 50);
    
    // Add invoice title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', pageWidth - 15, 30, { align: 'right' });
    
    // Add invoice details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice #: ${invoiceData.id}`, pageWidth - 15, 40, { align: 'right' });
    doc.text(`Date: ${invoiceData.date}`, pageWidth - 15, 47, { align: 'right' });
    doc.text(`Due Date: ${invoiceData.dueDate}`, pageWidth - 15, 54, { align: 'right' });
    
    // Add client info box
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(15, 60, pageWidth - 30, 40, 3, 3, 'FD');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 20, 70);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`${invoiceData.client.name}`, 20, 78);
    doc.text(`${invoiceData.client.address}`, 20, 85);
    doc.text(`${invoiceData.client.email}`, 20, 92);
    
    // Add permit details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Permit Details:', pageWidth - 90, 70);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Permit #: ${invoiceData.permit.permitNumber}`, pageWidth - 90, 78);
    doc.text(`Project: ${invoiceData.permit.title}`, pageWidth - 90, 85);
    doc.text(`Location: ${invoiceData.permit.location}`, pageWidth - 90, 92);
    
    // Add table headers
    let startY = 110;
    doc.setFillColor(240, 240, 240);
    doc.rect(15, startY, pageWidth - 30, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Description', 20, startY + 7);
    doc.text('Status', 120, startY + 7);
    doc.text('Amount', pageWidth - 25, startY + 7, { align: 'right' });
    
    // Add table rows
    doc.setFont('helvetica', 'normal');
    
    invoiceData.items.forEach((item, index) => {
      // Add new page if needed
      if (startY > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage();
        startY = 20;
      }
      
      // Alternate row background for better readability
      if (index % 2 === 0) {
        doc.setFillColor(248, 248, 248);
        doc.rect(15, startY, pageWidth - 30, 10, 'F');
      }
      
      // Add item data
      doc.text(item.title, 20, startY + 7);
      doc.text(item.completed ? 'Completed' : 'In Progress', 120, startY + 7);
      doc.text(`$${(item.price || 0).toFixed(2)}`, pageWidth - 25, startY + 7, { align: 'right' });
      startY += 10;
    });
    
    // Add table footer with totals
    startY += 5;
    doc.line(15, startY, pageWidth - 25, startY);
    startY += 5;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Total Amount:', 120, startY);
    doc.text(`$${invoiceData.totalCost.toFixed(2)}`, pageWidth - 25, startY, { align: 'right' });
    startY += 5;
    
    doc.text('Completed Work:', 120, startY);
    doc.text(`$${invoiceData.completedCost.toFixed(2)}`, pageWidth - 25, startY, { align: 'right' });
    startY += 5;
    
    doc.setFillColor(230, 230, 250);
    doc.rect(120, startY - 5, pageWidth - 25 - 120, 5, 'F');
    doc.text('Balance Due:', 120, startY);
    doc.text(`$${invoiceData.balanceDue.toFixed(2)}`, pageWidth - 25, startY, { align: 'right' });
    startY += 5;
    
    // Add notes
    doc.setFillColor(240, 240, 240);
    doc.rect(15, startY, pageWidth - 30, 10, 'F');
    doc.text('Notes:', 20, startY + 5);
    doc.setFont('helvetica', 'normal');
    doc.text('Payment due within 30 days. Thank you for your business!', 20, startY + 7);
    
    // Get PDF as buffer and base64
    const pdfOutput = doc.output('arraybuffer');
    const base64 = doc.output('datauristring');
    
    return { 
      buffer: pdfOutput,
      base64: base64
    };
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

/**
 * Creates an invoice object with all necessary data
 */
export function createInvoiceData(
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

// Helper function to get logo as data URL
async function getLogoDataUrl(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      const base64 = data.toString('base64');
      resolve(`data:image/jpeg;base64,${base64}`);
    });
  });
} 