const zeptoSend = async (to, subject, htmlContent) => {
  const https = require('https');
  const token = process.env.ZEPTO_TOKEN;
  const url = process.env.ZEPTO_URL || 'https://api.zeptomail.com/v1.1/email';
  const senderEmail = process.env.ZEPTO_EMAIL || 'support@dgtldigicard.com';

  const payload = JSON.stringify({
    from: { address: senderEmail, name: "DGTLmart Support" },
    to: [{ email_address: { address: to } }],
    subject: subject,
    htmlbody: htmlContent
  });

  const parsedUrl = new URL(url);
  const options = {
    hostname: parsedUrl.hostname,
    path: parsedUrl.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          console.error('ZeptoMail Error:', data);
          reject(new Error('Failed to send email via ZeptoMail'));
        }
      });
    });

    req.on('error', (e) => {
      console.error('Request error:', e);
      reject(e);
    });

    req.write(payload);
    req.end();
  });
};

const sendPasswordResetEmail = async (email, resetToken, role) => {
  const frontendUrl = process.env.FRONTEND_URL || 'https://partner.dgtlmart.com';
  const resetUrl = `${frontendUrl}/reset-password/${resetToken}?role=${role}`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #2563eb; text-align: center;">Password Reset Request</h2>
      <p>Hello,</p>
      <p>You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p>
      <p>Please click on the button below to complete the process within the next hour:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
      </div>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #666; text-align: center;">&copy; 2025 DGTLmart. All rights reserved.</p>
    </div>
  `;

  await zeptoSend(email, 'Password Reset Request - DGTLmart', htmlContent);
};

const sendAgreementEmail = async (email, recipientName, agreementTitle, documentUrl) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #2563eb; text-align: center;">Franchise Agreement for Signature</h2>
      <p>Dear ${recipientName},</p>
      <p>Congratulations! We are excited to provide you with the franchise agreement for your application.</p>
      <p><strong>Agreement Title:</strong> ${agreementTitle}</p>
      <p>Please review the attached agreement carefully. You will need to sign and return it to proceed with your franchise application.</p>
      <div style="text-align: center; margin: 30px 0;">
        ${documentUrl ? `<a href="${documentUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Agreement</a>` : '<p>Agreement details will be available in your dashboard.</p>'}
      </div>
      <p>If you have any questions about the agreement, please don't hesitate to contact us.</p>
      <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #666; text-align: center;">&copy; 2025 DGTLmart. All rights reserved.</p>
    </div>
  `;

  await zeptoSend(email, `Franchise Agreement - ${agreementTitle}`, htmlContent);
};

const sendApprovalEmail = async (email, recipientName) => {
  const frontendUrl = process.env.FRONTEND_URL || 'https://partner.dgtlmart.com';
  const dashboardUrl = `${frontendUrl}/partner/dashboard`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background: #f0fdf4;">
      <div style="text-align:center; margin-bottom:20px;">
        <div style="display:inline-block; background:#16a34a; border-radius:50%; width:60px; height:60px; line-height:60px; text-align:center;">
          <span style="color:white; font-size:28px;">✓</span>
        </div>
      </div>
      <h2 style="color: #16a34a; text-align: center;">🎉 Your Account is Approved!</h2>
      <p>Dear ${recipientName},</p>
      <p>Great news! Your DGTLmart franchise application has been <strong>approved</strong>. You now have full access to your franchise dashboard.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${dashboardUrl}" style="background-color: #16a34a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Access Your Dashboard</a>
      </div>
      <ul style="font-size:14px; color:#374151; line-height:2;">
        <li>✅ Full franchise dashboard access</li>
        <li>✅ Training modules available</li>
        <li>✅ Lead assignments active</li>
        <li>✅ Branding & CRM tools unlocked</li>
      </ul>
      <p>Welcome to the DGTLmart family!</p>
      <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #666; text-align: center;">&copy; 2025 DGTLmart. All rights reserved.</p>
    </div>
  `;

  await zeptoSend(email, '🎉 Your DGTLmart Franchise Account is Approved!', htmlContent);
};

const sendRejectionEmail = async (email, recipientName, reason) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background: #fff7f7;">
      <h2 style="color: #dc2626; text-align: center;">Application Status Update</h2>
      <p>Dear ${recipientName},</p>
      <p>We regret to inform you that your DGTLmart franchise application has not been approved at this time.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <p>If you believe this is an error or would like to discuss further, please contact our support team.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="mailto:support@dgtlmart.com" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Contact Support</a>
      </div>
      <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #666; text-align: center;">&copy; 2025 DGTLmart. All rights reserved.</p>
    </div>
  `;

  await zeptoSend(email, 'DGTLmart Franchise Application Update', htmlContent);
};

const sendOTPEmail = async (email, otp) => {
  const https = require('https');
  const token = process.env.ZEPTO_TOKEN;
  const url = process.env.ZEPTO_URL || 'https://api.zeptomail.com/v1.1/email';
  const senderEmail = process.env.ZEPTO_EMAIL || 'support@dgtldigicard.com';

  const payload = JSON.stringify({
    from: { address: senderEmail, name: "DGTLmart Support" },
    to: [{ email_address: { address: email } }],
    subject: "Your Registration OTP - DGTLmart",
    htmlbody: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #2563eb; text-align: center;">Verification Code</h2>
        <p>Hello,</p>
        <p>Please use the following One Time Password (OTP) to complete your registration:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333; padding: 15px 30px; background-color: #f3f4f6; border-radius: 8px;">${otp}</span>
        </div>
        <p>This code is valid for 10 minutes. Do not share it with anyone.</p>
        <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #666; text-align: center;">&copy; 2025 DGTLmart. All rights reserved.</p>
      </div>
    `
  });

  const parsedUrl = new URL(url);
  const options = {
    hostname: parsedUrl.hostname,
    path: parsedUrl.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          console.error('ZeptoMail Error:', data);
          reject(new Error('Failed to send OTP via ZeptoMail'));
        }
      });
    });

    req.on('error', (e) => {
      console.error('Request error:', e);
      reject(e);
    });

    req.write(payload);
    req.end();
  });
};

const sendContactNotificationEmail = async (contactData) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'info@dgtlmart.com';
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #2563eb; text-align: center;">New Contact Inquiry</h2>
      <p>Hello Admin,</p>
      <p>A new contact inquiry has been submitted on the website. Here are the details:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;"><strong>Name:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${contactData.name}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;"><strong>Email:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${contactData.email}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;"><strong>Phone:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${contactData.phone}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;"><strong>Service:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${contactData.service}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;"><strong>Message:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${contactData.message}</td>
        </tr>
      </table>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL || 'https://partner.dgtlmart.com'}/admin/contacts" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">View in Admin Panel</a>
      </div>
      <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #666; text-align: center;">&copy; 2025 DGTLmart. All rights reserved.</p>
    </div>
  `;

  await zeptoSend(adminEmail, 'New Contact Inquiry - DGTLmart', htmlContent);
};

module.exports = {
  sendPasswordResetEmail,
  sendAgreementEmail,
  sendApprovalEmail,
  sendRejectionEmail,
  sendOTPEmail,
  sendContactNotificationEmail
};
