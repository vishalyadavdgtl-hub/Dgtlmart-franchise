import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import axios from 'axios';
import { useToast } from '../../components/common/Toast';

const API_URL = import.meta.env.VITE_API_URL || 'https://dgtlmart-franchise.onrender.com';

export default function ForgotPassword() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      setSent(true);
      showToast('Reset link sent to your email!', 'success');
    } catch (error) {
      console.error('Forgot password error:', error);
      showToast(error.response?.data?.error || 'Failed to send reset link', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h1>
            <p className="text-gray-500 mb-8">
              We've sent a password reset link to <strong>{email}</strong>. Please click the link in the email to reset your password.
            </p>
            <button 
              onClick={() => navigate(-1)} 
              className="text-blue-600 font-bold hover:underline"
            >
              Return to Login
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
            <p className="text-gray-500 text-sm mt-1">
              No worries, we'll send you reset instructions.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
             <p className="text-gray-500 text-sm mb-6 text-center">
               Please enter your registered email address and we will send you a secure link to reset your password.
             </p>

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
              required
              fullWidth
            />

            <Button
              type="submit"
              disabled={loading}
              fullWidth
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>

            <div className="text-center">
              <button 
                type="button"
                onClick={() => navigate(-1)} 
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                Back to Login
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
