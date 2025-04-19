import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import nodemailer from 'nodemailer';
import { ChecklistItem, Client, Permit } from './types';

/**
 * Generates a PDF invoice from a DOM element
 * @param elementId - ID of the DOM element to convert to PDF
 * @param fileName - Name of the generated PDF file
 * @returns Promise with the file path
 */
export async function generatePdfInvoice(elementId: string, fileName: string): Promise<string> {
  try {
    const element = document.getElementById(elementId);
    if (!element) throw new Error('Element not found');

    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
    });

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(fileName);
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
  // This is a mock implementation that would be replaced with actual Nodemailer setup
  console.log(`Sending email to ${to} with subject: ${subject}`);
  console.log(`Attaching PDF: ${pdfPath}`);
  
  // In a real implementation, you'd set up Nodemailer like this:
  /*
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
  */
  
  // Mock response for demo purposes
  return {
    messageId: `mock-${Math.random().toString(36).substring(2, 11)}`,
    success: true,
  };
} 