require('dotenv').config({ path: '../.env' });
const { sendPasswordResetEmail } = require('../utils/emailService');

async function testBrevoAPI() {
  try {
    console.log('Testing Brevo API with key:', process.env.BREVO_API_KEY.substring(0, 10) + '...');
    console.log('Sender:', process.env.SENDER_EMAIL);
    
    const testEmail = 'ankit.coolvick.sharma@gmail.com';
    const testToken = 'test-token-123';
    const role = 'referral';

    await sendPasswordResetEmail(testEmail, testToken, role);
    console.log('Test email triggered successfully via Brevo API');
  } catch (error) {
    console.error('Brevo API test failed:', error);
  }
}

testBrevoAPI();
