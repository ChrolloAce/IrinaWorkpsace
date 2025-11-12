'use server';

import { generatePdfProposal, sendProposalEmail } from '@/lib/proposal-utils';
import { Client, Permit, Proposal, ProposalItem } from '@/lib/types';
import { storePdfData } from '@/lib/server-state';

/**
 * Server action to generate a proposal PDF
 */
export async function generateProposalAction(
  proposal: Proposal,
  client: Client,
  permit: Permit | null
) {
  try {
    console.log("Starting proposal generation for client:", client.name);
    
    // Generate PDF with the proposal data
    const fileName = `proposal-${proposal.id.substring(5)}.pdf`;
    
    // Generate the PDF in memory
    const pdfData = await generatePdfProposal(proposal, client, permit, fileName);
    
    // Generate a unique ID for this PDF
    const pdfId = `pdf_${Date.now()}_${proposal.id.substring(5)}`;
    
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
      
      console.log(`Stored proposal PDF in cache with ID: ${pdfId}`);
      
      return { 
        success: true, 
        fileName,
        pdfId,
        downloadUrl,
        pdfData: pdfData.base64 // Return the PDF data directly
      };
    } catch (err) {
      console.error("Error storing proposal PDF data:", err);
      throw err;
    }
  } catch (error) {
    console.error('Error generating proposal:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Server action to send a proposal via email
 */
export async function sendProposalEmailAction(
  proposal: Proposal,
  client: Client,
  pdfData: string,
  fileName: string,
  customSubject?: string,
  customText?: string,
  customHtml?: string
) {
  try {
    // Prepare email content
    const subject = customSubject || `Proposal: ${proposal.title} - ${proposal.id}`;
    
    // Simple plain text version
    const textContent = customText || `
Dear ${client.contactPerson || client.name},

Please find attached our proposal for ${proposal.title}.

Proposal Number: ${proposal.id}
Date: ${proposal.date}
Valid Until: ${proposal.validUntil}
Total Amount: $${proposal.totalAmount.toFixed(2)}

To accept this proposal, please reply to this email or sign the document and return it to us.

Thank you for considering IRH Smart LLC for your permit expediting needs. We look forward to working with you.

Best regards,
Irina Perez
IRH Smart LLC
(305) 859-1549
irina@irhsmart.com
    `;
    
    // HTML version
    const htmlContent = customHtml || `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background-color: #27ae60; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
        .button { display: inline-block; background-color: #27ae60; color: white; padding: 10px 20px; 
                 text-decoration: none; border-radius: 4px; margin-top: 20px; }
        .highlight { font-weight: bold; color: #27ae60; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        table, th, td { border: 1px solid #ddd; }
        th, td { padding: 10px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>IRH Smart LLC - Permit Expediting Services</h2>
        </div>
        <div class="content">
            <p>Dear ${client.contactPerson || client.name},</p>
            
            <p>Please find attached our proposal for <strong>${proposal.title}</strong>.</p>
            
            <table>
                <tr>
                    <th>Proposal Number</th>
                    <td>${proposal.id}</td>
                </tr>
                <tr>
                    <th>Date</th>
                    <td>${proposal.date}</td>
                </tr>
                <tr>
                    <th>Valid Until</th>
                    <td>${proposal.validUntil}</td>
                </tr>
                <tr>
                    <th>Total Amount</th>
                    <td class="highlight">$${proposal.totalAmount.toFixed(2)}</td>
                </tr>
            </table>
            
            <p>To accept this proposal, please reply to this email or sign the document and return it to us.</p>
            
            <p>Thank you for considering IRH Smart LLC for your permit expediting needs. We look forward to working with you.</p>
        </div>
        <div class="footer">
            <p>
                <strong>Irina Perez</strong><br>
                IRH Smart LLC<br>
                Phone: (305) 859-1549<br>
                Email: irina@irhsmart.com
            </p>
        </div>
    </div>
</body>
</html>
    `;
    
    // Prepare PDF attachment
    const attachment = {
      filename: fileName,
      content: pdfData.split('base64,')[1] || pdfData, // Handle both with and without data URL prefix
      encoding: 'base64'
    };
    
    // Send email
    const emailResult = await sendProposalEmail(
      client.email,
      subject,
      textContent,
      htmlContent,
      attachment
    );
    
    console.log('Proposal email sent successfully:', emailResult.messageId);
    
    return { 
      success: true, 
      messageId: emailResult.messageId
    };
  } catch (error) {
    console.error('Error sending proposal email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
} 