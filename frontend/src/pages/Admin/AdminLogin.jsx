import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { adminAPI } from '../../utils/api';
import { useToast } from '../../components/common/Toast';

export default function AdminLogin() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await adminAPI.login(formData);
      
      // Store token
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminUser', JSON.stringify(response.data.admin));
      
      showToast('Login successful! Welcome to Admin Panel.');
      // Navigate to dashboard
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      showToast(error.response?.data?.error || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2 font-heading">
            DGTLmart
          </h1>
          <p className="text-gray-600">Admin Panel</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Admin Login
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Username or Email"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="admin"
              required
              autoComplete="username"
            />

            <div className="relative">
              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <div className="flex justify-end mt-1">
                <Link 
                  to="/forgot-password?role=admin" 
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              fullWidth
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          {/* Default Credentials Info */}
          {/* <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Default Credentials:</strong><br />
              Username: admin<br />
              Password: Admin@123
            </p>
          </div> */}
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center text-gray-500 hover:text-blue-600 font-medium transition-all group"
          >
            <svg 
              className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-base">Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
}
