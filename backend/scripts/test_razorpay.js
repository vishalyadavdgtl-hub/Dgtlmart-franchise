require('dotenv').config({ path: '../.env' });
const Razorpay = require('razorpay');

console.log('Testing Razorpay Connection...');
console.log('Key ID:', process.env.RAZORPAY_KEY_ID);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

async function testOrder() {
  try {
    const options = {
      amount: 100, // 1 rupee
      currency: 'INR',
      receipt: 'test_order_123',
    };
    const order = await razorpay.orders.create(options);
    console.log('Success! Order created:', order);
  } catch (error) {
    console.error('Razorpay Error:', error);
  }
}

testOrder();
