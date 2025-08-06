 // src/services/emailService.ts

import { EmailRequest, EmailResponse } from '../types/email.types';

interface EmailSection {
  title: string;
  content: string;
}

interface EmailTemplateData {
  title: string;
  name: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  sections?: EmailSection[];
}

const API_SECRET = import.meta.env.VITE_RESEND_API_KEY;
const API_URL = import.meta.env.VITE_RESEND_API;

const styles = `
  .email-container {
    max-width: 600px;
    margin: auto;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #333;
    background-color: #f8f9fa;
  }
  .header {
    background: linear-gradient(135deg, #338B85, #5DC1B9);
    padding: 25px;
    text-align: center;
    color: white;
    border-radius: 8px 8px 0 0;
  }
  .header h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 600;
  }
  .content {
    background: white;
    padding: 30px;
    border-radius: 0 0 8px 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  .content h2 {
    color: #2c3e50;
    font-size: 24px;
    margin-top: 0;
    margin-bottom: 20px;
  }
  .section {
    margin: 25px 0;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
  }
  .section-title {
    color: #338B85;
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 2px solid #e9ecef;
  }
  .detail-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #e9ecef;
  }
  .detail-row:last-child {
    border-bottom: none;
  }
  .detail-label {
    color: #6c757d;
    font-weight: 500;
    flex: 0 0 40%;
  }
  .detail-value {
    color: #2c3e50;
    font-weight: 400;
    flex: 0 0 60%;
    text-align: right;
  }
  .button {
    display: inline-block;
    padding: 12px 24px;
    background: linear-gradient(135deg, #338B85, #5DC1B9);
    color: white;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 600;
    margin: 20px 0;
    text-align: center;
    transition: all 0.3s ease;
  }
  .button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
  .footer-note {
    color: #6c757d;
    font-size: 13px;
    margin-top: 30px;
    text-align: center;
    padding-top: 20px;
    border-top: 1px solid #e9ecef;
  }
`;

export const sendEmail = async (to: string, subject: string, templateData: EmailTemplateData): Promise<EmailResponse> => {
  const html = `
  <div style="max-width: 600px; margin: auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #333; background-color: #f8f9fa;">
    <div style="background: linear-gradient(135deg, #338B85, #5DC1B9); padding: 25px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
      <h1 style="margin: 0; font-size: 28px; font-weight: 600;">Axendar</h1>
    </div>
    <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <h2 style="color: #2c3e50; font-size: 24px; margin-top: 0; margin-bottom: 20px;">${templateData.title}</h2>
      <p style="color: #2c3e50; margin-bottom: 15px;">Hola ${templateData.name},</p>
      <p style="color: #2c3e50; margin-bottom: 20px;">${templateData.message}</p>
      ${templateData.actionUrl ? `
        <div style="text-align: center; margin: 25px 0;">
          <a href="${templateData.actionUrl}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #338B85, #5DC1B9); color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">${templateData.actionText}</a>
        </div>
      ` : ''}
      ${templateData.sections?.map(section => `
        <div style="margin: 25px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; border: 1px solid #e9ecef;">
          <h3 style="color: #338B85; font-size: 18px; font-weight: 600; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #e9ecef;">${section.title}</h3>
          ${section.content}
        </div>
      `).join('') || ''}
      <p style="color: #6c757d; font-size: 13px; margin-top: 30px; text-align: center; padding-top: 20px; border-top: 1px solid #e9ecef;">Este es un correo automático, por favor no responder.</p>
    </div>
  </div>
  `;

  const emailRequest: EmailRequest = {
    token: API_SECRET,
    to,
    subject,
    html,
    css: styles
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailRequest)
    });

    const data: EmailResponse = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al enviar el correo');
    }

    return data;
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};