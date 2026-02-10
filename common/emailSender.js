const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

const sendEmail = async (to, subject, text) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

const sendOTPEmail = async (to, name, otp) => {
    try {
        const templatePath = path.join(__dirname, '../templates/email/otp.ejs');
        const html = await ejs.renderFile(templatePath, { name, otp });
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject: 'Password Reset OTP - The Hestia Hotel & Restaurent',
            html,
        };
        
        await transporter.sendMail(mailOptions);
        console.log('OTP email sent successfully');
        return true;
    } catch (error) {
        console.error('Error sending OTP email:', error);
        return false;
    }
};

const sendHotelOTPEmail = async (to, name, otp) => {
    try {
        const templatePath = path.join(__dirname, '../templates/email/hotel-otp.ejs');
        const html = await ejs.renderFile(templatePath, { name, otp });
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject: 'Email Verification - The Hestia Platform',
            html,
        };
        
        await transporter.sendMail(mailOptions);
        console.log('Hotel OTP email sent successfully');
        return true;
    } catch (error) {
        console.error('Error sending hotel OTP email:', error);
        return false;
    }
};

const sendHotelWelcomeEmail = async (to, name) => {
    try {
        const templatePath = path.join(__dirname, '../templates/email/hotel-welcome.ejs');
        const html = await ejs.renderFile(templatePath, { name });
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject: 'Email Verified Successfully - The Hestia Platform',
            html,
        };
        
        await transporter.sendMail(mailOptions);
        console.log('Hotel welcome email sent successfully');
        return true;
    } catch (error) {
        console.error('Error sending hotel welcome email:', error);
        return false;
    }
};

const sendHotelApprovalEmail = async (to, name) => {
    try {
        const templatePath = path.join(__dirname, '../templates/email/hotel-approved.ejs');
        const html = await ejs.renderFile(templatePath, { name });
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject: 'Hotel Approved - Welcome to The Hestia Platform!',
            html,
        };
        
        await transporter.sendMail(mailOptions);
        console.log('Hotel approval email sent successfully');
        return true;
    } catch (error) {
        console.error('Error sending hotel approval email:', error);
        return false;
    }
};

module.exports = { sendEmail, sendOTPEmail, sendHotelOTPEmail, sendHotelWelcomeEmail, sendHotelApprovalEmail };