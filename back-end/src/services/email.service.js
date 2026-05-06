const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        // Better configuration for Gmail
        const smtpConfig = {
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            tls: {
                // Do not fail on invalid certs
                rejectUnauthorized: false
            },
            // Add connection timeout
            connectionTimeout: 10000,
            // Add socket timeout
            socketTimeout: 10000
        };
        
        // Additional TLS options for port 587
        if (process.env.SMTP_PORT === '587' && process.env.SMTP_SECURE !== 'true') {
            smtpConfig.tls = {
                ...smtpConfig.tls,
                ciphers: 'SSLv3'
            };
            smtpConfig.requireTLS = true;
        }
        
        this.transporter = nodemailer.createTransport(smtpConfig);
        
        // Verify connection configuration
        this.verifyConnection();
    }
    
    async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log('Email service is ready to send messages');
        } catch (error) {
            console.error('Email service verification failed:', error);
        }
    }
    
    async sendEmail({ to, subject, html }) {
        try {
            const mailOptions = {
                from: `"School Management System" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
                to,
                subject,
                html
            };
            
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent:', info.messageId);
            return info;
        } catch (error) {
            console.error('Email sending failed:', error);
            throw error;
        }
    }
    
    async sendWelcomeEmail(email, data) {
        const subject = `Welcome to School Management System - ${data.schoolName}`;
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background-color: #f9f9f9; }
                    .button { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }
                    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome ${data.adminName}!</h1>
                    </div>
                    <div class="content">
                        <p>Your school "<strong>${data.schoolName}</strong>" has been successfully registered.</p>
                        <p><strong>Login URL:</strong> <a href="${data.loginUrl}">${data.loginUrl}</a></p>
                        <p><strong>Trial Period:</strong> Your 15-day free trial ends on ${new Date(data.trialEndDate).toLocaleDateString()}</p>
                        <p>Get started by:</p>
                        <ol>
                            <li>Logging into your dashboard</li>
                            <li>Adding your teachers</li>
                            <li>Setting up classes and students</li>
                            <li>Start tracking attendance</li>
                        </ol>
                        <p>If you need any assistance, please don't hesitate to contact our support team.</p>
                    </div>
                    <div class="footer">
                        <p>Best regards,<br>School Management Team</p>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        return this.sendEmail({ to: email, subject, html });
    }
    
    async sendSubscriptionReminder(email, data) {
        const subject = `Subscription Expiring Soon - ${data.schoolName}`;
        const html = `
            <h2>Subscription Expiration Notice</h2>
            <p>Dear ${data.adminName},</p>
            <p>Your subscription for ${data.schoolName} will expire on ${new Date(data.expiryDate).toLocaleDateString()}.</p>
            <p>To avoid service interruption, please renew your subscription.</p>
            <p><a href="${data.renewalUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Renew Now</a></p>
            <p>Thank you for using our service!</p>
        `;
        
        return this.sendEmail({ to: email, subject, html });
    }
    
    async sendSchoolStatusUpdate(email, data) {
        const subject = `Account ${data.status} - ${data.schoolName}`;
        const html = `
            <h2>Account Status Update</h2>
            <p>Your school account "${data.schoolName}" has been ${data.status}.</p>
            <p>If you have any questions, please contact support.</p>
        `;
        
        return this.sendEmail({ to: email, subject, html });
    }
    
    async sendSubscriptionUpdate(email, data) {
        const subject = `Subscription Updated - ${data.schoolName}`;
        const html = `
            <h2>Subscription Update</h2>
            <p>Your subscription details have been updated:</p>
            <ul>
                <li>Plan: ${data.plan}</li>
                <li>Status: ${data.status}</li>
                <li>Valid until: ${new Date(data.endDate).toLocaleDateString()}</li>
            </ul>
            <p>Thank you for choosing our service!</p>
        `;
        
        return this.sendEmail({ to: email, subject, html });
    }
}

module.exports = new EmailService();