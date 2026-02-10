const nodemailer = require('nodemailer');

// Create transporter
let transporter;

// Initialize transporter
const initTransporter = async () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // Use real Gmail if credentials provided
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // Use Ethereal for testing (fake email)
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('📧 Using Ethereal test email');
  }
};

// Send booking confirmation email
const sendBookingConfirmation = async (booking, user) => {
  if (!transporter) await initTransporter();

  const mailOptions = {
    from: process.env.EMAIL_USER || 'smartparking@test.com',
    to: user.email,
    subject: '🎉 Parking Booking Confirmed - Smart Parking',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🅿️ Smart Parking</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #333;">Booking Confirmed!</h2>
          <p style="color: #666; font-size: 16px;">Hi ${user.name},</p>
          <p style="color: #666; font-size: 16px;">Your parking spot has been successfully reserved.</p>
          
          <div style="background: white; border: 2px solid #667eea; border-radius: 10px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #667eea; margin-top: 0;">Booking Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Booking ID:</td>
                <td style="padding: 8px 0; color: #333; font-weight: bold;">${booking._id}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Parking Spot:</td>
                <td style="padding: 8px 0; color: #333; font-weight: bold;">${booking.spot?.spotNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Floor:</td>
                <td style="padding: 8px 0; color: #333; font-weight: bold;">${booking.spot?.floor}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Vehicle:</td>
                <td style="padding: 8px 0; color: #333; font-weight: bold;">${booking.vehicleNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Start Time:</td>
                <td style="padding: 8px 0; color: #333; font-weight: bold;">${new Date(booking.startTime).toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">End Time:</td>
                <td style="padding: 8px 0; color: #333; font-weight: bold;">${new Date(booking.endTime).toLocaleString()}</td>
              </tr>
              <tr style="border-top: 2px solid #e5e7eb;">
                <td style="padding: 12px 0; color: #666; font-size: 18px;">Total Amount:</td>
                <td style="padding: 12px 0; color: #667eea; font-weight: bold; font-size: 20px;">₹${booking.totalAmount}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
            <h4 style="color: #1e40af; margin: 0 0 10px 0;">📌 Important Instructions:</h4>
            <ul style="color: #1e40af; margin: 0; padding-left: 20px;">
              <li>Present your QR code at the parking entrance</li>
              <li>Arrive within 15 minutes of your start time</li>
              <li>Keep this email for reference</li>
            </ul>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Need help? Contact us at support@smartparking.com
          </p>
        </div>
        
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            © 2024 Smart Parking System. All rights reserved.
          </p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Booking confirmation email sent to:', user.email);
    
    // If using Ethereal, show preview URL
    if (nodemailer.getTestMessageUrl(info)) {
      console.log('📧 Preview email:', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
  }
};

// Send cancellation email
const sendCancellationEmail = async (booking, user) => {
  if (!transporter) await initTransporter();

  const mailOptions = {
    from: process.env.EMAIL_USER || 'smartparking@test.com',
    to: user.email,
    subject: 'Booking Cancelled - Smart Parking',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #ef4444; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🅿️ Smart Parking</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #333;">Booking Cancelled</h2>
          <p style="color: #666; font-size: 16px;">Hi ${user.name},</p>
          <p style="color: #666; font-size: 16px;">Your parking booking has been cancelled.</p>
          
          <div style="background: white; border: 2px solid #ef4444; border-radius: 10px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #ef4444; margin-top: 0;">Cancelled Booking</h3>
            <p style="color: #666;">Booking ID: <strong>${booking._id}</strong></p>
            <p style="color: #666;">Spot: <strong>${booking.spot?.spotNumber}</strong></p>
            <p style="color: #666;">Vehicle: <strong>${booking.vehicleNumber}</strong></p>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            If you didn't cancel this booking, please contact us immediately.
          </p>
        </div>
        
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            © 2024 Smart Parking System. All rights reserved.
          </p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Cancellation email sent to:', user.email);
    
    // If using Ethereal, show preview URL
    if (nodemailer.getTestMessageUrl(info)) {
      console.log('📧 Preview email:', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
  }
};

module.exports = {
  sendBookingConfirmation,
  sendCancellationEmail,
};