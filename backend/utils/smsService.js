const axios = require('axios');

const getMessageCentralToken = async () => {
    try {
        const customerId = (process.env.MESSAGE_CENTRAL_CUSTOMER_ID || '').trim();
        const key = (process.env.MESSAGE_CENTRAL_KEY || '').trim();
        const email = (process.env.MESSAGE_CENTRAL_EMAIL || '').trim();
        const baseUrl = (process.env.MESSAGE_CENTRAL_BASE_URL || '').trim();
        const countryCode = (process.env.MESSAGE_CENTRAL_COUNTRY_CODE || '91').trim();

        if (!customerId || !key || !email || !baseUrl) {
            throw new Error('Message Central credentials are not fully configured in .env');
        }

        const authUrl = `${baseUrl}/auth/v1/authentication/token`;
        const params = {
            customerId,
            key,
            scope: 'NEW',
            country: countryCode,
            email
        };

        const response = await axios.get(authUrl, {
            params,
            headers: { accept: '*/*' }
        });

        const token = response.data.token || response.data.authToken;
        if (token) {
            return token;
        }
        throw new Error('Failed to retrieve token from Message Central');
    } catch (error) {
        console.error('Error getting Message Central token:', error.response?.data || error.message);
        throw new Error('Failed to authenticate with Message Central');
    }
};

const sendOTPSMS = async (phone) => {
    try {
        const baseUrl = (process.env.MESSAGE_CENTRAL_BASE_URL || '').trim();
        const customerId = (process.env.MESSAGE_CENTRAL_CUSTOMER_ID || '').trim();
        let countryCode = (process.env.MESSAGE_CENTRAL_COUNTRY_CODE || '91').trim();
        const token = await getMessageCentralToken();

        // Clean phone number
        let cleanPhone = phone.replace(/^\+91/, '').replace(/^91/, '').replace(/\s+/g, '');

        const sendUrl = `${baseUrl}/verification/v3/send`;
        const response = await axios.post(sendUrl, null, {
            params: {
                countryCode,
                customerId,
                flowType: 'SMS',
                mobileNumber: cleanPhone,
                otpLength: 6
            },
            headers: {
                'authToken': token,
                'accept': '*/*'
            }
        });

        if (response.data && response.data.data && response.data.data.verificationId) {
            return response.data.data.verificationId; // Return verificationId to store in DB
        }
        throw new Error('Failed to send OTP via Message Central');
    } catch (error) {
        console.error('Error sending OTP SMS:', error.response?.data || error.message);
        throw new Error('Failed to send OTP SMS');
    }
};

const validateOTPSMS = async (phone, verificationId, code) => {
    try {
        const baseUrl = (process.env.MESSAGE_CENTRAL_BASE_URL || '').trim();
        const customerId = (process.env.MESSAGE_CENTRAL_CUSTOMER_ID || '').trim();
        let countryCode = (process.env.MESSAGE_CENTRAL_COUNTRY_CODE || '91').trim();
        const token = await getMessageCentralToken();

        let cleanPhone = phone.replace(/^\+91/, '').replace(/^91/, '').replace(/\s+/g, '');

        const url = `${baseUrl}/verification/v3/validateOtp?countryCode=${countryCode}&customerId=${customerId}&mobileNumber=${cleanPhone}&verificationId=${verificationId}&code=${code}`;

        const response = await axios.get(url, {
            headers: {
                'authToken': token
            }
        });

        if (response.data && response.data.responseCode === 200) {
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Error validating OTP SMS:', error.response?.data || error.message);
        return false; // Invalid OTP
    }
};

module.exports = {
    sendOTPSMS,
    validateOTPSMS
};
