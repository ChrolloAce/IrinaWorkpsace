import jsPDF from 'jspdf';
import nodemailer from 'nodemailer';
import { Client, Permit, Proposal, ProposalItem } from './types';
import 'server-only';

// Server-side only imports
import path from 'path';
import fs from 'fs';

// Define professional green color scheme (same as invoice-utils)
const colors = {
  primary: [39, 174, 96], // Green
  secondary: [46, 204, 113], // Light Green
  accent: [26, 188, 156], // Teal
  text: [44, 62, 80], // Dark Gray
  lightGray: [236, 240, 241], // Light Gray
  white: [255, 255, 255], // White
};

/**
 * Generates a PDF proposal directly using jsPDF
 * @param proposalData - Proposal data to render in the PDF
 * @param fileName - Name of the generated PDF file
 * @returns Promise with the file data
 */
export async function generatePdfProposal(
  proposalData: Proposal,
  client: Client,
  permit: Permit | null,
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
    
    // Set proposal title with right-aligned text
    doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('PROPOSAL', pageWidth - margin, 25, { align: 'right' });
    
    // Reset text color for rest of document
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    
    // Current Y position after the header
    let currentY = 55;
    
    // Add proposal details in a stylish info box
    doc.setFillColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
    doc.roundedRect(margin, currentY, pageWidth - (margin * 2), 25, 3, 3, 'F');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Proposal Number:', margin + 5, currentY + 8);
    doc.text('Date Issued:', margin + 5, currentY + 16);
    doc.text('Valid Until:', margin + 5, currentY + 24);
    
    doc.setFont('helvetica', 'normal');
    doc.text(proposalData.id, margin + 40, currentY + 8);
    doc.text(proposalData.date, margin + 40, currentY + 16);
    doc.text(proposalData.validUntil, margin + 40, currentY + 24);
    
    currentY += 35;
    
    // Client and Project Information in two columns
    const colWidth = (pageWidth - (margin * 2)) / 2;
    
    // Client Info Box
    doc.setFillColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
    doc.roundedRect(margin, currentY, colWidth - 5, 40, 3, 3, 'F');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Prepared For:', margin + 5, currentY + 10);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(client.name, margin + 5, currentY + 18);
    doc.text(client.address, margin + 5, currentY + 26);
    if (client.city) {
      doc.text(`${client.city}, ${client.state} ${client.zipCode}`, margin + 5, currentY + 34);
    }
    doc.text(client.email, margin + 5, currentY + 42);
    
    // Project Info Box
    doc.setFillColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
    doc.roundedRect(margin + colWidth + 5, currentY, colWidth - 5, 40, 3, 3, 'F');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Project Details:', margin + colWidth + 10, currentY + 10);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Title: ${proposalData.title}`, margin + colWidth + 10, currentY + 18);
    if (permit) {
      doc.text(`Permit Type: ${permit.permitType}`, margin + colWidth + 10, currentY + 26);
      doc.text(`Location: ${permit.location}`, margin + colWidth + 10, currentY + 34);
    } else {
      doc.text(`Location: To be determined`, margin + colWidth + 10, currentY + 26);
    }
    doc.text(`Status: ${proposalData.status}`, margin + colWidth + 10, currentY + 42);
    
    currentY += 50;
    
    // Scope of Work Section
    doc.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.rect(margin, currentY, pageWidth - (margin * 2), 10, 'F');
    
    doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Scope of Work', margin + 5, currentY + 7);
    
    currentY += 15;
    
    // Reset text color for content
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Handle multi-line text for scope
    const scopeLines = doc.splitTextToSize(proposalData.scope, pageWidth - (margin * 2));
    doc.text(scopeLines, margin, currentY);
    
    currentY += (scopeLines.length * 5) + 10; // Update Y position based on text height
    
    // Items Table Header
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(margin, currentY, pageWidth - (margin * 2), 10, 'F');
    
    doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Description', margin + 5, currentY + 7);
    doc.text('Quantity', pageWidth - margin - 75, currentY + 7, { align: 'center' });
    doc.text('Unit Price', pageWidth - margin - 45, currentY + 7, { align: 'center' });
    doc.text('Total', pageWidth - margin - 5, currentY + 7, { align: 'right' });
    
    currentY += 10;
    
    // Reset text color for table content
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    
    // Items Table Rows
    doc.setFont('helvetica', 'normal');
    proposalData.items.forEach((item, index) => {
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
        doc.text('Quantity', pageWidth - margin - 75, currentY + 7, { align: 'center' });
        doc.text('Unit Price', pageWidth - margin - 45, currentY + 7, { align: 'center' });
        doc.text('Total', pageWidth - margin - 5, currentY + 7, { align: 'right' });
        
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
      let description = item.description;
      if (description.length > 50) {
        description = description.substring(0, 47) + '...';
      }
      
      doc.text(description, margin + 5, currentY + 5);
      doc.text(item.quantity.toString(), pageWidth - margin - 75, currentY + 5, { align: 'center' });
      doc.text(`$${item.unitPrice.toFixed(2)}`, pageWidth - margin - 45, currentY + 5, { align: 'center' });
      doc.text(`$${item.total.toFixed(2)}`, pageWidth - margin - 5, currentY + 5, { align: 'right' });
      
      currentY += 8;
    });
    
    // Summary section
    currentY += 10;
    
    // Line separator
    doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY - 5, pageWidth - margin, currentY - 5);
    
    // Total amount with highlighted background
    const summaryWidth = 80;
    const summaryX = pageWidth - margin - summaryWidth;
    
    doc.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.rect(summaryX - 5, currentY, summaryWidth + 5, 10, 'F');
    
    doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.setFontSize(12);
    doc.text('Total Amount:', summaryX, currentY + 7);
    doc.text(`$${proposalData.totalAmount.toFixed(2)}`, pageWidth - margin - 5, currentY + 7, { align: 'right' });
    
    // Reset text color
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    
    currentY += 20;
    
    // Terms and Conditions Section
    doc.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.rect(margin, currentY, pageWidth - (margin * 2), 10, 'F');
    
    doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Terms & Conditions', margin + 5, currentY + 7);
    
    currentY += 15;
    
    // Reset text color for content
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Handle multi-line text for terms
    const termsLines = doc.splitTextToSize(proposalData.terms, pageWidth - (margin * 2));
    doc.text(termsLines, margin, currentY);
    
    currentY += (termsLines.length * 5) + 15;
    
    // Add notes if provided
    if (proposalData.notes) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Notes:', margin, currentY);
      
      currentY += 5;
      
      doc.setFont('helvetica', 'normal');
      const notesLines = doc.splitTextToSize(proposalData.notes, pageWidth - (margin * 2));
      doc.text(notesLines, margin, currentY);
      
      currentY += (notesLines.length * 5) + 10;
    }
    
    // Acceptance section
    if (currentY > pageHeight - 60) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setFillColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
    doc.roundedRect(margin, currentY, pageWidth - (margin * 2), 40, 3, 3, 'F');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Acceptance', margin + 5, currentY + 10);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('To accept this proposal, please sign below or respond via email confirmation.', margin + 5, currentY + 20);
    
    doc.setDrawColor(0, 0, 0);
    doc.line(margin + 5, currentY + 30, margin + 100, currentY + 30);
    doc.text('Signature', margin + 5, currentY + 38);
    
    doc.line(pageWidth - margin - 100, currentY + 30, pageWidth - margin - 5, currentY + 30);
    doc.text('Date', pageWidth - margin - 30, currentY + 38);
    
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
 * Creates a new proposal with default values
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

/**
 * Sends a proposal via email
 */
export async function sendProposalEmail(
  to: string,
  subject: string,
  text: string,
  html: string,
  attachment: string | { filename: string; content: string; encoding: string }
): Promise<any> {
  console.log(`Sending proposal email to ${to} with subject: ${subject}`);
  
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

// Helper function to get logo as data URL (same as in invoice-utils)
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