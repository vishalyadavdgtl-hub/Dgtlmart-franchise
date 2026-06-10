import { useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import axios from 'axios';
import { useToast } from '../../components/common/Toast';

const API_URL = import.meta.env.VITE_API_URL || 'https://dgtlmart-franchise.onrender.com';

export default function ResetPassword() {
  const { token } = useParams();
  
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/reset-password/${token}`, { password });
      const { role } = response.data;
      showToast('Password reset successful! Please login.', 'success');
      
      // Determine login destination based on role
      let loginRedirect = '/partner-login';
      if (role === 'admin') loginRedirect = '/manage-dgtl';
      else loginRedirect = '/partner-login';
      
      setTimeout(() => navigate(loginRedirect), 2000);
    } catch (error) {
      console.error('Reset password error:', error);
      showToast(error.response?.data?.error || 'Failed to reset password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Set New Password</h1>
            <p className="text-gray-500 text-sm mt-1">
              Please enter your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              required
              fullWidth
            />

            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              required
              fullWidth
            />

            <Button
              type="submit"
              disabled={loading}
              fullWidth
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl"
            >
              {loading ? 'Updating...' : 'Reset Password'}
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
