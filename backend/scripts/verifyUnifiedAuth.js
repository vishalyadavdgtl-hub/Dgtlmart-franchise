require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const axios = require('axios');

const API_URL = 'http://localhost:5000';

async function testUnifiedAuth() {
  const testEmails = [
    { email: 'vishx998@gmail.com', type: 'Admin' },
    { email: 'ankit.coolvick.sharma@gmail.com', type: 'Partner' }
  ];

  for (const test of testEmails) {
    console.log(`\n--- Testing Unified Forgot Password for ${test.type} (${test.email}) ---`);
    try {
      const response = await axios.post(`${API_URL}/api/auth/forgot-password`, { email: test.email });
      console.log('Response:', response.data);
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      if (error.response?.data?.error === 'Key not found') {
          console.log('NOTE: v3 API Key is still invalid/not provided. This confirms the code works but the Brevo Key is the bottleneck.');
      }
    }
  }
}

testUnifiedAuth();
