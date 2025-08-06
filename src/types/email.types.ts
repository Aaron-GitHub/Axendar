// src/types/email.types.ts
export interface EmailRequest {
    token: string;
    to: string;
    subject: string;
    html: string;
    css: string;
  }
  
  export interface EmailResponse {
    success?: boolean;
    error?: string;
    message?: string;
    details?: string;
  }