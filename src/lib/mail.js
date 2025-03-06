import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

console.log('Resend API Key configured:', !!process.env.RESEND_API_KEY);

const EMAIL_TEMPLATES = {
  INVESTMENT_CONFIRMATION: {
    subject: 'Investment Confirmation',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a365d; text-align: center;">Investment Confirmation</h1>
        <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>Dear Investor,</p>
          <p>Your investment has been successfully confirmed:</p>
          <ul style="list-style: none; padding: 0;">
            <li>Amount: $${data.amount}</li>
            <li>Plan: ${data.planName}</li>
            <li>Transaction ID: ${data.transactionId}</li>
            <li>Date: ${new Date().toLocaleDateString()}</li>
          </ul>
          <p>Expected Return: ${data.expectedReturn}% in ${data.duration}</p>
        </div>
        <p style="color: #718096; text-align: center;">Thank you for choosing our platform.</p>
      </div>
    `
  },
  WITHDRAWAL_NOTIFICATION: {
    subject: 'Withdrawal Request Update',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a365d; text-align: center;">Withdrawal ${data.status}</h1>
        <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>Dear User,</p>
          <p>Your withdrawal request has been ${data.status}:</p>
          <ul style="list-style: none; padding: 0;">
            <li>Amount: $${data.amount}</li>
            <li>Transaction ID: ${data.transactionId}</li>
            <li>Status: ${data.status}</li>
          </ul>
          ${data.status === 'completed' ? 
            `<p>The funds have been sent to your wallet: ${data.walletAddress}</p>` : 
            data.status === 'rejected' ? 
            `<p>Reason: ${data.reason}</p>` : ''
          }
        </div>
      </div>
    `
  },
  SUPPORT_UPDATE: {
    subject: 'Support Ticket Update',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a365d; text-align: center;">Support Update</h1>
        <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>Dear User,</p>
          <p>There has been an update to your support ticket:</p>
          <div style="background-color: white; padding: 15px; border-radius: 4px;">
            <p><strong>Ticket ID:</strong> ${data.ticketId}</p>
            <p><strong>Status:</strong> ${data.status}</p>
            <p><strong>Message:</strong> ${data.message}</p>
          </div>
        </div>
      </div>
    `
  },
  SECURITY_ALERT: {
    subject: 'Security Alert - Account Activity',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ff4444; text-align: center;">Security Alert</h1>
        <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>Dear User,</p>
          <p>${data.message}</p>
          <p>If this wasn't you, please:</p>
          <ol>
            <li>Change your password immediately</li>
            <li>Enable two-factor authentication</li>
            <li>Contact support if you need assistance</li>
          </ol>
        </div>
        <p style="color: #718096; text-align: center;">Security Notice from Crypto Investment Platform</p>
      </div>
    `
  },
  TRANSACTION_APPROVAL: {
    subject: 'Transaction Approved',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a365d; text-align: center;">Transaction Approved</h1>
        <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>Dear User,</p>
          <p>Your ${data.type} transaction has been approved:</p>
          <ul style="list-style: none; padding: 0;">
            <li>Amount: $${data.amount}</li>
            <li>Transaction ID: ${data.transactionId}</li>
            <li>Date: ${data.date}</li>
          </ul>
          <p>The amount has been added to your account balance.</p>
        </div>
        <p style="color: #718096; text-align: center;">Thank you for using our platform.</p>
      </div>
    `
  },
  WITHDRAWAL_REQUEST: {
    subject: 'Withdrawal Request Received',
    html: (data) => `...`
  },
  DEPOSIT_CONFIRMATION: {
    subject: 'Deposit Confirmation',
    html: (data) => `...`
  },
  ACCOUNT_VERIFICATION: {
    subject: 'Verify Your Account',
    html: (data) => `...`
  },
  PASSWORD_RESET: {
    subject: 'Reset Your Password',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a365d; text-align: center;">Password Reset Request</h1>
        <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>You requested to reset your password. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.resetUrl}" 
               style="background-color: #2b6cb0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              Reset Password
            </a>
          </div>
          <p style="color: #718096; font-size: 14px;">
            If you didn't request this, please ignore this email. The link will expire in 1 hour.
          </p>
        </div>
      </div>
    `
  },
  PASSWORD_CHANGED: {
    subject: 'Password Changed Successfully',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a365d; text-align: center;">Password Changed</h1>
        <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>Your password was changed successfully at ${data.time}.</p>
          <p>If you didn't make this change, please contact support immediately.</p>
        </div>
      </div>
    `
  },
  EMAIL_VERIFICATION: {
    subject: 'Verify Your Email Address',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a365d; text-align: center;">Verify Your Email</h1>
        <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>Thank you for registering! Please click the button below to verify your email address:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.verificationUrl}" 
               style="background-color: #2b6cb0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              Verify Email
            </a>
          </div>
          <p style="color: #718096; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:
            <br>
            <a href="${data.verificationUrl}" style="color: #2b6cb0; word-break: break-all;">
              ${data.verificationUrl}
            </a>
          </p>
          <p style="color: #718096; font-size: 14px;">
            This link will expire in 24 hours.
          </p>
        </div>
      </div>
    `
  },
  MEET_LINK: {
    subject: 'Your Support Call is Starting Soon',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a365d; text-align: center;">Support Call Starting Soon</h1>
        <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>Your support call about <strong>${data.topic}</strong> is starting in 5 minutes.</p>
          <p>Click the link below to join the meeting:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${data.meetLink}" 
               style="background-color: #2b6cb0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              Join Meeting
            </a>
          </div>
          <p style="color: #718096; font-size: 14px;">
            If you can't click the button, copy and paste this link into your browser:<br>
            ${data.meetLink}
          </p>
        </div>
      </div>
    `
  }
};

export async function sendEmail({ to, subject, text, template, data }) {
  try {
    console.log('Sending email:', { to, subject, template });

    let html = text;
    if (template && EMAIL_TEMPLATES[template]) {
      html = EMAIL_TEMPLATES[template].html(data);
      subject = EMAIL_TEMPLATES[template].subject;
    }

    const { data: emailData, error } = await resend.emails.send({
      from: 'noreply@hivestin.com',
      to,
      subject,
      html: html || text, // Fallback to text if html is not provided
    });

    if (error) {
      console.error('Email sending failed:', error);
      throw error;
    }

    console.log('Email sent successfully:', emailData);
    return emailData;
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw the error, just log it
    return { error: error.message };
  }
}

export async function sendVerificationCode(email, code) {
  try {
    console.log('Attempting to send verification code to:', email); // Debug log
    console.log('Using Resend API Key:', process.env.RESEND_API_KEY ? 'Present' : 'Missing');

    const { data, error } = await resend.emails.send({
      from: 'noreply@hivestin.com',
      to: email,
      subject: 'Your Login Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a365d; text-align: center;">Login Verification Code</h1>
          <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 18px; text-align: center;">Your verification code is:</p>
            <p style="font-size: 32px; font-weight: bold; text-align: center; color: #2b6cb0;">${code}</p>
          </div>
          <p style="color: #4a5568; text-align: center;">This code will expire in 5 minutes.</p>
          <p style="color: #718096; text-align: center; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend API error:', error);
      throw error;
    }

    console.log('Email sent successfully:', data); // Debug log
    return data;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
}

export async function sendWaitlistNotification(email, availableSlots) {
  try {
    await resend.emails.send({
      from: 'noreply@hivestin.com',
      to: email,
      subject: 'Registration Slots Available!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a365d; text-align: center;">Slots Available!</h1>
          <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 18px; text-align: center;">
              Good news! There are now ${availableSlots} slots available for registration.
            </p>
            <div style="text-align: center; margin-top: 20px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/register" 
                 style="background-color: #2b6cb0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Register Now
              </a>
            </div>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending waitlist notification:', error);
    throw new Error('Failed to send waitlist notification');
  }
} 