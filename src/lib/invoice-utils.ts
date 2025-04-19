import jsPDF from 'jspdf';
import nodemailer from 'nodemailer';
import { ChecklistItem, Client, Permit } from './types';

/**
 * Generates a PDF invoice directly using jsPDF
 * @param invoiceData - Invoice data to render in the PDF
 * @param fileName - Name of the generated PDF file
 * @returns Promise with the file path
 */
export async function generatePdfInvoice(
  invoiceData: ReturnType<typeof createInvoiceData>,
  fileName: string
): Promise<string> {
  try {
    // Create a new PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Set initial position and line height
    let y = 20;
    const lineHeight = 7;
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - 2 * margin;
    
    // Add company header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Permit Management System', margin, y);
    y += lineHeight * 1.5;
    
    // Add invoice info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice #: ${invoiceData.id}`, margin, y);
    y += lineHeight;
    doc.text(`Date: ${invoiceData.date}`, margin, y);
    y += lineHeight;
    doc.text(`Due Date: ${invoiceData.dueDate}`, margin, y);
    y += lineHeight * 1.5;
    
    // Add client info
    doc.setFont('helvetica', 'bold');
    doc.text('Billed To:', margin, y);
    y += lineHeight;
    doc.setFont('helvetica', 'normal');
    doc.text(invoiceData.client.name, margin, y);
    y += lineHeight;
    if (invoiceData.client.email) {
      doc.text(invoiceData.client.email, margin, y);
      y += lineHeight;
    }
    if (invoiceData.client.address) {
      doc.text(`${invoiceData.client.address}, ${invoiceData.client.city}, ${invoiceData.client.state} ${invoiceData.client.zipCode}`, margin, y);
      y += lineHeight;
    }
    y += lineHeight;
    
    // Add permit info
    doc.setFont('helvetica', 'bold');
    doc.text(`Permit: ${invoiceData.permit.title}`, margin, y);
    y += lineHeight;
    doc.setFont('helvetica', 'normal');
    doc.text(`Permit Number: ${invoiceData.permit.permitNumber}`, margin, y);
    y += lineHeight;
    doc.text(`Location: ${invoiceData.permit.location}`, margin, y);
    y += lineHeight * 1.5;
    
    // Add table header
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y, contentWidth, lineHeight, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Description', margin + 2, y + lineHeight - 2);
    doc.text('Status', margin + contentWidth * 0.6, y + lineHeight - 2);
    doc.text('Amount', margin + contentWidth * 0.85, y + lineHeight - 2);
    y += lineHeight;
    
    // Add table rows
    doc.setFont('helvetica', 'normal');
    
    invoiceData.items.forEach((item, index) => {
      // Add new page if needed
      if (y > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage();
        y = 20;
      }
      
      // Alternate row background for better readability
      if (index % 2 === 0) {
        doc.setFillColor(248, 248, 248);
        doc.rect(margin, y, contentWidth, lineHeight, 'F');
      }
      
      // Add item data
      doc.text(item.title, margin + 2, y + lineHeight - 2);
      doc.text(item.completed ? 'Completed' : 'In Progress', margin + contentWidth * 0.6, y + lineHeight - 2);
      doc.text(`$${(item.price || 0).toFixed(2)}`, margin + contentWidth * 0.85, y + lineHeight - 2);
      y += lineHeight;
    });
    
    // Add table footer with totals
    y += lineHeight / 2;
    doc.line(margin, y, margin + contentWidth, y);
    y += lineHeight;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Total Amount:', margin + contentWidth * 0.6, y);
    doc.text(`$${invoiceData.totalCost.toFixed(2)}`, margin + contentWidth * 0.85, y);
    y += lineHeight;
    
    doc.text('Completed Work:', margin + contentWidth * 0.6, y);
    doc.text(`$${invoiceData.completedCost.toFixed(2)}`, margin + contentWidth * 0.85, y);
    y += lineHeight;
    
    doc.setFillColor(230, 230, 250);
    doc.rect(margin + contentWidth * 0.6 - 2, y - lineHeight + 2, contentWidth * 0.4, lineHeight, 'F');
    doc.text('Balance Due:', margin + contentWidth * 0.6, y);
    doc.text(`$${invoiceData.balanceDue.toFixed(2)}`, margin + contentWidth * 0.85, y);
    y += lineHeight * 2;
    
    // Add notes
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y, contentWidth, lineHeight * 4, 'F');
    doc.text('Notes:', margin + 2, y + lineHeight - 2);
    doc.setFont('helvetica', 'normal');
    doc.text('Payment due within 30 days. Thank you for your business!', margin + 2, y + lineHeight * 2 - 2);
    
    // Save the PDF
    doc.save(fileName);
    return fileName;
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
 * @param pdfPath - Path to the PDF attachment
 * @returns Promise with the email send result
 */
export async function sendInvoiceEmail(
  to: string,
  subject: string,
  text: string,
  html: string,
  pdfPath: string
): Promise<any> {
  console.log(`Sending email to ${to} with subject: ${subject}`);
  console.log(`Attaching PDF: ${pdfPath}`);
  
  // Set up Nodemailer
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Boolean(process.env.SMTP_SECURE),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
    attachments: [
      {
        filename: pdfPath.split('/').pop(),
        path: pdfPath,
      },
    ],
  });

  return info;
} 