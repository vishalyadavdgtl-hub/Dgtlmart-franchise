import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import { referralAPI } from '../../utils/api';
import { useToast } from '../../components/common/Toast';
import Footer from '../../components/common/Footer';

export default function ReferralLogin() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [loginRole, setLoginRole] = useState('referral'); // 'referral' or 'franchise'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // include the selected login role so backend enforces role-based login
      const response = await referralAPI.login({ ...formData, loginRole });
      
      // Store token and user data in unified partnerData for dashboards
      const partnerData = {
        ...response.data.partner,
        token: response.data.token
      };
     localStorage.setItem("token", response.data.token); // 🔥 MOST IMPORTANT

localStorage.setItem('partnerData', JSON.stringify(partnerData));

localStorage.setItem('partnerToken', response.data.token);
localStorage.setItem('partnerUser', JSON.stringify(response.data.partner));
      
      showToast('Login successful!', 'success');
      
      // Redirect based on approval status
      setTimeout(() => {
        const partner = response.data.partner;
        if (partner.status !== "ACTIVE") {
          navigate('/waiting-for-approval', { replace: true });
          return;
        }

        const destination = '/dashboard';
        const from = location.state?.from?.pathname || destination;
        navigate(from, { replace: true });
      }, 500);
      
    } catch (error) {
      console.error('Login error:', error);
      const msg = error.response?.data?.error || 'Login failed. Please check your credentials.';
      // If server indicates the account is of a different partner type, switch the role selector to help user
      if (error.response?.status === 403 && msg.includes('registered as a')) {
        // Extract 'franchise' or 'referral' from message
        const match = msg.match(/registered as a (\w+) partner/i);
        if (match && match[1]) {
          const serverRole = match[1].toLowerCase();
          setLoginRole(serverRole);
          showToast(`${msg} (Login role switched)`, 'info');
        } else {
          showToast(msg, 'error');
        }
      } else {
        showToast(msg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-1 flex flex-col lg:flex-row relative">
        {/* Left Side - Background Image & Brand Messaging */}
        <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms]"
            style={{ 
              backgroundImage: `url('https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1600')`,
              transform: isLoaded ? 'scale(1)' : 'scale(1.1)'
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/93 via-slate-900/90 to-blue-800/88"></div>
          
          <div className="relative z-10 w-full h-full flex flex-col justify-center px-12 xl:px-20">
            <div className={`transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-sm font-semibold mb-8">
                <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse"></span>
                Welcome Back, Partner
              </div>
              
              <h1 className="text-4xl xl:text-6xl font-bold text-white mb-6 leading-tight">
                Access Your <br />
                <span className="text-blue-400">Partner Dashboard</span>
              </h1>
              
              <p className="text-lg text-blue-100/80 leading-relaxed max-w-xl">
                Track your referrals, monitor commissions, and manage your partnership with DGTLmart all in one place.
              </p>

              <div className="mt-12 flex gap-8">
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-white">24/7</span>
                  <span className="text-blue-200 text-sm font-medium">Dashboard Access</span>
                </div>
                <div className="w-px h-12 bg-white/20"></div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-white">Real-time</span>
                  <span className="text-blue-200 text-sm font-medium">Tracking</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 bg-gray-50/50 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 xl:p-8">
          <div className={`w-full max-w-xl transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-10">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                <p className="text-gray-500">Login to access your partner dashboard</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Role Selector */}
                <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-2">Login As</label>
                   <div className="bg-gray-100 p-1 rounded-xl flex">
                    <button
                        type="button"
                        onClick={() => setLoginRole('referral')}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                        loginRole === 'referral'
                            ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Referral Partner
                    </button>
                    {/* <button
                        type="button"
                        onClick={() => setLoginRole('franchise')}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                        loginRole === 'franchise'
                            ? 'bg-white text-indigo-600 shadow-sm border border-gray-200'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Franchise Partner
                    </button> */}
                   </div>
                   {/* <p className="text-xs text-gray-500 mt-2 text-center">
                    {loginRole === 'referral' 
                        ? 'For partners earning 10% commission on referrals.' 
                        : 'For territory partners earning 25% commission.'}
                   </p> */}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                  <div className="flex justify-end mt-2">
                    <Link 
                      to={`/forgot-password?role=${loginRole}`} 
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-xl shadow-blue-500/10 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Logging In...
                    </span>
                  ) : "Login to Dashboard"}
                </button>

                <div className="text-center mt-4">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/referral-partner" className="text-blue-600 font-bold hover:underline">
                      Register Now
                    </Link>
                  </p>
                </div>
              </form>
            </div>

            {/* Help section */}
            <div className="mt-6 bg-blue-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Need Help?</h3>
                  <p className="text-sm text-gray-600">
                    Having trouble logging in? Contact our support team at{' '}
                    <a href="mailto:support@dgtlmart.com" className="text-blue-600 font-semibold hover:underline">
                      support@dgtlmart.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}