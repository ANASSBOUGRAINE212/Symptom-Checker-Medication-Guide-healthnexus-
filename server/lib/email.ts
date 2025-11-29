import nodemailer from 'nodemailer';
import { logger } from './logger';

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Generate 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send verification email
export async function sendVerificationEmail(
  email: string,
  code: string,
  firstName?: string
): Promise<boolean> {
  try {
    const mailOptions = {
      from: `"HealthNexus" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Verify Your Email - HealthNexus',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                     color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .code-box { background: white; border: 2px dashed #667eea; padding: 20px; 
                       text-align: center; font-size: 32px; font-weight: bold; 
                       letter-spacing: 5px; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>HealthNexus</h1>
              <p>Email Verification</p>
            </div>
            <div class="content">
              <h2>Hello ${firstName || 'there'}!</h2>
              <p>Thank you for registering with HealthNexus. To complete your registration, 
                 please verify your email address using the code below:</p>
              
              <div class="code-box">${code}</div>
              
              <p><strong>This code will expire in 10 minutes.</strong></p>
              
              <p>If you didn't create an account with HealthNexus, please ignore this email.</p>
              
              <div class="footer">
                <p>© 2025 HealthNexus. All rights reserved.</p>
                <p>This is an automated message, please do not reply.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info({ email }, 'Verification email sent');
    return true;
  } catch (error) {
    logger.error({ error, email }, 'Failed to send verification email');
    return false;
  }
}

// Send password reset email
export async function sendPasswordResetEmail(
  email: string,
  code: string,
  firstName?: string
): Promise<boolean> {
  try {
    const mailOptions = {
      from: `"HealthNexus" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Password Reset Code - HealthNexus',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); 
                     color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .code-box { background: white; border: 2px solid #f5576c; padding: 20px; 
                       text-align: center; font-size: 32px; font-weight: bold; 
                       letter-spacing: 5px; margin: 20px 0; border-radius: 5px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; 
                      padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 Password Reset</h1>
            </div>
            <div class="content">
              <h2>Hello ${firstName || 'there'}!</h2>
              <p>We received a request to reset your password. Use the code below to proceed:</p>
              
              <div class="code-box">${code}</div>
              
              <p><strong>This code will expire in 15 minutes.</strong></p>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong><br>
                If you didn't request a password reset, please ignore this email and 
                consider changing your password immediately.
              </div>
              
              <div class="footer">
                <p>© 2025 HealthNexus. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info({ email }, 'Password reset email sent');
    return true;
  } catch (error) {
    logger.error({ error, email }, 'Failed to send password reset email');
    return false;
  }
}

// Send login alert email
export async function sendLoginAlertEmail(
  email: string,
  ipAddress: string,
  userAgent: string,
  location?: string
): Promise<boolean> {
  try {
    const mailOptions = {
      from: `"HealthNexus Security" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'New Login Detected - HealthNexus',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>🔐 New Login Detected</h2>
            <p>A new login to your HealthNexus account was detected:</p>
            <ul>
              <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
              <li><strong>IP Address:</strong> ${ipAddress}</li>
              <li><strong>Device:</strong> ${userAgent}</li>
              ${location ? `<li><strong>Location:</strong> ${location}</li>` : ''}
            </ul>
            <p>If this was you, no action is needed. If you don't recognize this activity, 
               please change your password immediately.</p>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    logger.error({ error }, 'Failed to send login alert');
    return false;
  }
}
