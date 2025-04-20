import jsPDF from 'jspdf';
import nodemailer from 'nodemailer';
import { ChecklistItem, Client, Permit } from './types';
import 'server-only';

// Server-side only imports
import path from 'path';
import fs from 'fs';

// Define professional green color scheme
const colors = {
  primary: [39, 174, 96], // Green
  secondary: [46, 204, 113], // Light Green
  accent: [26, 188, 156], // Teal
  text: [44, 62, 80], // Dark Gray
  lightGray: [236, 240, 241], // Light Gray
  white: [255, 255, 255], // White
};

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
    // Use a more professional page format
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    
    // Convert RGB to hex for jsPDF
    const toHex = (rgb: number[]): string => {
      return '#' + rgb.map(c => c.toString(16).padStart(2, '0')).join('');
    };
    
    // Create a professional header with green background
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Add decorative element
    doc.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.rect(0, 40, pageWidth, 5, 'F');
    
    // Add logo
    try {
      const logoPath = path.join(process.cwd(), 'unnamed.jpg');
      const logoDataUrl = await getLogoDataUrl(logoPath);
      doc.addImage(logoDataUrl, 'JPEG', margin, 5, 30, 30);
    } catch (error) {
      console.error('Error adding logo:', error);
    }
    
    // Add company info header - white text on green background
    doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('IRH Smart LLC', 50, 15);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Irina Perez, Permit Expediter', 50, 22);
    doc.text('Phone: (305) 859-1549 | Direct: (786) 208-6889', 50, 29);
    doc.text('Email: irina@irhsmart.com', 50, 36);
    
    // Set invoice title with right-aligned text
    doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', pageWidth - margin, 25, { align: 'right' });
    
    // Reset text color for rest of document
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    
    // Current Y position after the header
    let currentY = 55;
    
    // Add invoice details in a stylish info box
    doc.setFillColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
    doc.roundedRect(margin, currentY, pageWidth - (margin * 2), 25, 3, 3, 'F');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Number:', margin + 5, currentY + 8);
    doc.text('Date Issued:', margin + 5, currentY + 16);
    doc.text('Due Date:', margin + 5, currentY + 24);
    
    doc.setFont('helvetica', 'normal');
    doc.text(invoiceData.id, margin + 40, currentY + 8);
    doc.text(invoiceData.date, margin + 40, currentY + 16);
    doc.text(invoiceData.dueDate, margin + 40, currentY + 24);
    
    currentY += 35;
    
    // Client and Permit Information in two columns
    const colWidth = (pageWidth - (margin * 2)) / 2;
    
    // Client Info Box
    doc.setFillColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
    doc.roundedRect(margin, currentY, colWidth - 5, 40, 3, 3, 'F');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', margin + 5, currentY + 10);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(invoiceData.client.name, margin + 5, currentY + 18);
    doc.text(invoiceData.client.address, margin + 5, currentY + 26);
    if (invoiceData.client.city) {
      doc.text(`${invoiceData.client.city}, ${invoiceData.client.state} ${invoiceData.client.zipCode}`, margin + 5, currentY + 34);
    }
    doc.text(invoiceData.client.email, margin + 5, currentY + 42);
    
    // Permit Info Box
    doc.setFillColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
    doc.roundedRect(margin + colWidth + 5, currentY, colWidth - 5, 40, 3, 3, 'F');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Permit Details:', margin + colWidth + 10, currentY + 10);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Permit #: ${invoiceData.permit.permitNumber}`, margin + colWidth + 10, currentY + 18);
    doc.text(`Project: ${invoiceData.permit.title}`, margin + colWidth + 10, currentY + 26);
    doc.text(`Location: ${invoiceData.permit.location}`, margin + colWidth + 10, currentY + 34);
    doc.text(`Status: ${invoiceData.permit.status}`, margin + colWidth + 10, currentY + 42);
    
    currentY += 50;
    
    // Items Table Header
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(margin, currentY, pageWidth - (margin * 2), 10, 'F');
    
    doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Description', margin + 5, currentY + 7);
    doc.text('Status', margin + 100, currentY + 7);
    doc.text('Amount', pageWidth - margin - 5, currentY + 7, { align: 'right' });
    
    currentY += 10;
    
    // Reset text color for table content
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    
    // Items Table Rows
    doc.setFont('helvetica', 'normal');
    invoiceData.items.forEach((item, index) => {
      // Add new page if needed
      if (currentY > pageHeight - 60) {
        doc.addPage();
        currentY = 20;
        
        // Add header to new page
        doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        doc.rect(margin, currentY, pageWidth - (margin * 2), 10, 'F');
        
        doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Description', margin + 5, currentY + 7);
        doc.text('Status', margin + 100, currentY + 7);
        doc.text('Amount', pageWidth - margin - 5, currentY + 7, { align: 'right' });
        
        doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        doc.setFont('helvetica', 'normal');
        
        currentY += 10;
      }
      
      // Alternate row colors for better readability
      if (index % 2 === 0) {
        doc.setFillColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
        doc.rect(margin, currentY, pageWidth - (margin * 2), 8, 'F');
      }
      
      // Truncate long descriptions to fit on page
      let description = item.title;
      if (description.length > 50) {
        description = description.substring(0, 47) + '...';
      }
      
      doc.text(description, margin + 5, currentY + 5);
      
      // Status with color indicator
      if (item.completed) {
        doc.setTextColor(39, 174, 96); // Green for completed
        doc.text('Completed', margin + 100, currentY + 5);
      } else {
        doc.setTextColor(231, 76, 60); // Red for in progress
        doc.text('In Progress', margin + 100, currentY + 5);
      }
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]); // Reset text color
      
      doc.text(`$${(item.price || 0).toFixed(2)}`, pageWidth - margin - 5, currentY + 5, { align: 'right' });
      
      currentY += 8;
    });
    
    // Summary section
    currentY += 10;
    
    // Line separator
    doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY - 5, pageWidth - margin, currentY - 5);
    
    // Summary box
    const summaryWidth = 80;
    const summaryX = pageWidth - margin - summaryWidth;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    // Total amount
    doc.text('Total Amount:', summaryX, currentY + 5);
    doc.text(`$${invoiceData.totalCost.toFixed(2)}`, pageWidth - margin - 5, currentY + 5, { align: 'right' });
    
    currentY += 8;
    
    // Completed work
    doc.text('Completed Work:', summaryX, currentY + 5);
    doc.text(`$${invoiceData.completedCost.toFixed(2)}`, pageWidth - margin - 5, currentY + 5, { align: 'right' });
    
    currentY += 8;
    
    // Balance due with highlighted background
    doc.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.rect(summaryX - 5, currentY, summaryWidth + 5, 10, 'F');
    
    doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.setFontSize(12);
    doc.text('Balance Due:', summaryX, currentY + 7);
    doc.text(`$${invoiceData.balanceDue.toFixed(2)}`, pageWidth - margin - 5, currentY + 7, { align: 'right' });
    
    // Reset text color
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    
    currentY += 20;
    
    // Notes and payment terms
    doc.setFillColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
    doc.roundedRect(margin, currentY, pageWidth - (margin * 2), 25, 3, 3, 'F');
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Terms & Notes', margin + 5, currentY + 8);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Payment due within 30 days of invoice date. Please include invoice number with payment.', 
      margin + 5, currentY + 16);
    doc.text('Thank you for your business!', margin + 5, currentY + 24);
    
    // Footer with green stripe
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
    
    doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('IRH Smart LLC | Permit Expediting Services', pageWidth / 2, pageHeight - 8, { align: 'center' });
    doc.text('Generated: ' + new Date().toLocaleDateString(), pageWidth - margin, pageHeight - 8, { align: 'right' });
    
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