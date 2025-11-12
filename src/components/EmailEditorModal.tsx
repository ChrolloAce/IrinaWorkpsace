import React, { useState, useEffect } from 'react';
import { FiX, FiSend, FiMessageSquare, FiUser, FiCalendar, FiDollarSign, FiClipboard } from 'react-icons/fi';
import { Client, Permit, Proposal } from '@/lib/types';

// Define email template types
interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  text: string;
  html: string;
}

// Define available dynamic variables
interface DynamicVariables {
  [key: string]: string;
}

interface EmailEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (subject: string, text: string, html: string) => Promise<void>;
  type: 'proposal' | 'invoice';
  client: Client;
  item: Proposal | Permit;
  amount?: number;
  balanceDue?: number;
}

const EmailEditorModal: React.FC<EmailEditorModalProps> = ({
  isOpen,
  onClose,
  onSend,
  type,
  client,
  item,
  amount = 0,
  balanceDue = 0
}) => {
  const [subject, setSubject] = useState('');
  const [emailHtml, setEmailHtml] = useState('');
  const [emailText, setEmailText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('default');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get dynamic variables based on props
  const getDynamicVariables = (): DynamicVariables => {
    const contactPerson = client.contactPerson || client.name;
    
    // Check if item is a Proposal or Permit
    const isProposal = 'validUntil' in item;
    const isPermit = 'permitNumber' in item;
    
    let title = '';
    let id = '';
    let validUntil = '';
    
    if (isProposal) {
      const proposal = item as Proposal;
      title = proposal.title;
      id = proposal.id;
      validUntil = proposal.validUntil;
    } else if (isPermit) {
      const permit = item as Permit;
      title = permit.title;
      id = permit.permitNumber;
      validUntil = permit.expiresAt || new Date().toLocaleDateString();
    }
    
    const date = new Date().toLocaleDateString();
    
    return {
      '{CLIENT_NAME}': client.name,
      '{CONTACT_NAME}': contactPerson,
      '{TITLE}': title,
      '{ID}': id,
      '{DATE}': date,
      '{VALID_UNTIL}': validUntil,
      '{AMOUNT}': `$${amount.toFixed(2)}`,
      '{BALANCE_DUE}': `$${balanceDue.toFixed(2)}`,
      '{EMAIL}': client.email,
      '{PHONE}': client.phone,
    };
  };

  // Email templates
  const getAvailableTemplates = (): EmailTemplate[] => {
    const variables = getDynamicVariables();
    
    if (type === 'proposal') {
      return [
        {
          id: 'default',
          name: 'Standard Proposal',
          subject: `Proposal: ${variables['{TITLE}']} - ${variables['{ID}']}`,
          text: `
Dear ${variables['{CONTACT_NAME}']},

Please find attached our proposal for ${variables['{TITLE}']}.

Proposal Number: ${variables['{ID}']}
Date: ${variables['{DATE}']}
Valid Until: ${variables['{VALID_UNTIL}']}
Total Amount: ${variables['{AMOUNT}']}

To accept this proposal, please reply to this email or sign the document and return it to us.

Thank you for considering IRH Smart LLC for your permit expediting needs. We look forward to working with you.

Best regards,
Irina Perez
IRH Smart LLC
(305) 859-1549
irina@irhsmart.com`,
          html: `
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
            <p>Dear ${variables['{CONTACT_NAME}']},</p>
            
            <p>Please find attached our proposal for <strong>${variables['{TITLE}']}</strong>.</p>
            
            <table>
                <tr>
                    <th>Proposal Number</th>
                    <td>${variables['{ID}']}</td>
                </tr>
                <tr>
                    <th>Date</th>
                    <td>${variables['{DATE}']}</td>
                </tr>
                <tr>
                    <th>Valid Until</th>
                    <td>${variables['{VALID_UNTIL}']}</td>
                </tr>
                <tr>
                    <th>Total Amount</th>
                    <td class="highlight">${variables['{AMOUNT}']}</td>
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
</html>`
        },
        {
          id: 'followup',
          name: 'Proposal Follow-Up',
          subject: `Follow-Up: Proposal ${variables['{ID}']} for ${variables['{CLIENT_NAME}']}`,
          text: `
Dear ${variables['{CONTACT_NAME}']},

I hope this message finds you well. I'm writing to follow up on the proposal (${variables['{ID}']}) we sent on ${variables['{DATE}']} for ${variables['{TITLE}']}.

We would love to hear your thoughts and answer any questions you may have about our services.

The proposal is valid until ${variables['{VALID_UNTIL}']}, and we're ready to begin work as soon as you give us the green light.

Please don't hesitate to reach out if you need any clarification or have any concerns.

Best regards,
Irina Perez
IRH Smart LLC
(305) 859-1549
irina@irhsmart.com`,
          html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background-color: #27ae60; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
        .highlight { font-weight: bold; color: #27ae60; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>IRH Smart LLC - Permit Expediting Services</h2>
        </div>
        <div class="content">
            <p>Dear ${variables['{CONTACT_NAME}']},</p>
            
            <p>I hope this message finds you well. I'm writing to follow up on the proposal (<span class="highlight">${variables['{ID}']}</span>) we sent on ${variables['{DATE}']} for ${variables['{TITLE}']}.</p>
            
            <p>We would love to hear your thoughts and answer any questions you may have about our services.</p>
            
            <p>The proposal is valid until <strong>${variables['{VALID_UNTIL}']}</strong>, and we're ready to begin work as soon as you give us the green light.</p>
            
            <p>Please don't hesitate to reach out if you need any clarification or have any concerns.</p>
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
</html>`
        }
      ];
    } else {
      // Invoice templates
      return [
        {
          id: 'default',
          name: 'Standard Invoice',
          subject: `Invoice for ${variables['{TITLE}']} - ${variables['{ID}']}`,
          text: `
Dear ${variables['{CONTACT_NAME}']},

Please find attached the invoice for ${variables['{TITLE}']} (${variables['{ID}']}). 

Invoice Details:
Date: ${variables['{DATE}']}
Total Amount: ${variables['{AMOUNT}']}
Balance Due: ${variables['{BALANCE_DUE}']}

Payment is due within 30 days of the invoice date. Please include the invoice number with your payment.

Thank you for your business!

Best regards,
Irina Perez
IRH Smart LLC
(305) 859-1549
irina@irhsmart.com`,
          html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background-color: #27ae60; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
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
            <h2>IRH Smart LLC - Invoice</h2>
        </div>
        <div class="content">
            <p>Dear ${variables['{CONTACT_NAME}']},</p>
            
            <p>Please find attached the invoice for <strong>${variables['{TITLE}']}</strong> (${variables['{ID}']}). </p>
            
            <table>
                <tr>
                    <th>Date</th>
                    <td>${variables['{DATE}']}</td>
                </tr>
                <tr>
                    <th>Total Amount</th>
                    <td>${variables['{AMOUNT}']}</td>
                </tr>
                <tr>
                    <th>Balance Due</th>
                    <td class="highlight">${variables['{BALANCE_DUE}']}</td>
                </tr>
            </table>
            
            <p>Payment is due within 30 days of the invoice date. Please include the invoice number with your payment.</p>
            
            <p>Thank you for your business!</p>
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
</html>`
        },
        {
          id: 'reminder',
          name: 'Payment Reminder',
          subject: `Payment Reminder: Invoice for ${variables['{TITLE}']}`,
          text: `
Dear ${variables['{CONTACT_NAME}']},

This is a friendly reminder about the outstanding invoice for ${variables['{TITLE}']} (${variables['{ID}']}). 

Invoice Details:
Date: ${variables['{DATE}']}
Total Amount: ${variables['{AMOUNT}']}
Balance Due: ${variables['{BALANCE_DUE}']}

If you've already made the payment, please disregard this message. If not, we kindly ask that you process the payment at your earliest convenience.

If you have any questions or concerns regarding this invoice, please don't hesitate to contact us.

Thank you for your prompt attention to this matter.

Best regards,
Irina Perez
IRH Smart LLC
(305) 859-1549
irina@irhsmart.com`,
          html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background-color: #27ae60; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
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
            <h2>IRH Smart LLC - Payment Reminder</h2>
        </div>
        <div class="content">
            <p>Dear ${variables['{CONTACT_NAME}']},</p>
            
            <p>This is a friendly reminder about the outstanding invoice for <strong>${variables['{TITLE}']}</strong> (${variables['{ID}']}). </p>
            
            <table>
                <tr>
                    <th>Date</th>
                    <td>${variables['{DATE}']}</td>
                </tr>
                <tr>
                    <th>Total Amount</th>
                    <td>${variables['{AMOUNT}']}</td>
                </tr>
                <tr>
                    <th>Balance Due</th>
                    <td class="highlight">${variables['{BALANCE_DUE}']}</td>
                </tr>
            </table>
            
            <p>If you've already made the payment, please disregard this message. If not, we kindly ask that you process the payment at your earliest convenience.</p>
            
            <p>If you have any questions or concerns regarding this invoice, please don't hesitate to contact us.</p>
            
            <p>Thank you for your prompt attention to this matter.</p>
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
</html>`
        }
      ];
    }
  };

  // Dynamic variable buttons to insert into editor
  const variableButtons = [
    { label: 'Client Name', value: '{CLIENT_NAME}', icon: <FiUser /> },
    { label: 'Contact Name', value: '{CONTACT_NAME}', icon: <FiUser /> },
    { label: 'Title', value: '{TITLE}', icon: <FiClipboard /> },
    { label: 'ID', value: '{ID}', icon: <FiClipboard /> },
    { label: 'Date', value: '{DATE}', icon: <FiCalendar /> },
    { label: 'Valid Until', value: '{VALID_UNTIL}', icon: <FiCalendar /> },
    { label: 'Amount', value: '{AMOUNT}', icon: <FiDollarSign /> },
    { label: 'Balance Due', value: '{BALANCE_DUE}', icon: <FiDollarSign /> },
  ];

  // Load template when selected
  useEffect(() => {
    const templates = getAvailableTemplates();
    const selected = templates.find(t => t.id === selectedTemplate);
    
    if (selected) {
      setSubject(selected.subject);
      setEmailText(selected.text);
      setEmailHtml(selected.html);
    }
  }, [selectedTemplate, type, client, item, amount, balanceDue]);

  // Insert a dynamic variable at cursor position
  const insertVariable = (variable: string) => {
    const textArea = document.getElementById('email-content') as HTMLTextAreaElement;
    
    if (textArea) {
      const start = textArea.selectionStart;
      const end = textArea.selectionEnd;
      const text = textArea.value;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      
      const newText = before + variable + after;
      setEmailText(newText);
      
      // Set cursor position after the inserted variable
      setTimeout(() => {
        textArea.focus();
        textArea.selectionStart = start + variable.length;
        textArea.selectionEnd = start + variable.length;
      }, 10);
    }
  };

  // Replace dynamic variables in content
  const replaceDynamicVariables = (content: string): string => {
    const variables = getDynamicVariables();
    let result = content;
    
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(key, 'g'), value);
    });
    
    return result;
  };

  // Handle send button click
  const handleSend = async () => {
    try {
      setSending(true);
      setError(null);
      
      // Replace any remaining dynamic variables before sending
      const processedSubject = replaceDynamicVariables(subject);
      const processedText = replaceDynamicVariables(emailText);
      const processedHtml = replaceDynamicVariables(emailHtml);
      
      await onSend(processedSubject, processedText, processedHtml);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium">Customize Email Before Sending</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={24} />
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          {/* Template selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Template
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            >
              {getAvailableTemplates().map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Subject line */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject Line
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Email subject"
            />
          </div>
          
          {/* Dynamic variables */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Insert Dynamic Content
            </label>
            <div className="flex flex-wrap gap-2">
              {variableButtons.map((variable) => (
                <button
                  key={variable.value}
                  onClick={() => insertVariable(variable.value)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {variable.icon && <span className="mr-2">{variable.icon}</span>}
                  {variable.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Email content editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Content
            </label>
            <textarea
              id="email-content"
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              rows={12}
              placeholder="Enter email content here..."
            />
          </div>
          
          {/* Preview section */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Email Preview (HTML)
              </label>
              <button
                onClick={() => {
                  const variables = getDynamicVariables();
                  const htmlWithVariablesReplaced = Object.entries(variables).reduce(
                    (html, [key, value]) => html.replace(new RegExp(key, 'g'), value),
                    emailHtml
                  );
                  setEmailHtml(htmlWithVariablesReplaced);
                }}
                className="text-xs text-indigo-600 hover:text-indigo-800"
              >
                Replace Variables
              </button>
            </div>
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 h-48 overflow-auto">
              <div dangerouslySetInnerHTML={{ __html: emailHtml }} />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
            >
              {sending ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  Sending...
                </>
              ) : (
                <>
                  <FiSend className="mr-2" /> Send Email
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailEditorModal; 