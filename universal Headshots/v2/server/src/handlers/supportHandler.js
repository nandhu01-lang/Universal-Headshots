import nodemailer from 'nodemailer';
import xssFilters from 'xss-filters';
import logger from '../utils/logger.js';

/**
 * Handle support requests from end users
 * Sends an email to the configured recipient without revealing it to the client
 */
export const handleSupportRequest = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    // Sanitize inputs for email injection safety
    const safeName = xssFilters.inHTMLData(name);
    const safeEmail = xssFilters.inHTMLData(email);
    const safeSubject = xssFilters.inHTMLData(subject || 'Universal Headshots Support');
    const safeMessage = xssFilters.inHTMLData(message);

    const recipient = process.env.SUPPORT_EMAIL_RECIPIENT || 'andkunch@gmail.com';

    // Configure transporter
    // Note: If SMTP credentials are not provided, we log the message for development
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"${safeName}" <${process.env.SMTP_USER || safeEmail}>`, 
      replyTo: safeEmail,
      to: recipient,
      subject: `[SUPPORT] ${safeSubject}`,
      text: `
Name: ${safeName}
Email: ${safeEmail}
Subject: ${safeSubject}

Message:
${message}
      `,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #8b5cf6;">New Support Message</h2>
          <p><strong>From:</strong> ${safeName} (&lt;${safeEmail}&gt;)</p>
          <p><strong>Subject:</strong> ${safeSubject}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="white-space: pre-wrap;">${safeMessage}</p>
        </div>
      `,
    };

    // If no credentials, just log it (Dev Mode)
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      logger.info({ recipient, subject: safeSubject }, '--- [DEV MODE] SUPPORT MESSAGE LOGGED ---');
      return res.status(200).json({ 
        success: true, 
        message: 'Support request received (Dev Mode - Logged to console). Set SMTP_USER and SMTP_PASS for real delivery.' 
      });
    }

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'Your message has been sent to our support team.' });
  } catch (error) {
    logger.error({ error: error.message }, 'Support Handler Error');
    res.status(500).json({ error: 'Failed to send support message. Please try again later.' });
  }
};
