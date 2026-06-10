import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import { referralAPI } from '../../utils/api';
import { useToast } from '../../components/common/Toast';
import Footer from '../../components/common/Footer';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function ReferralDashboard() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    let mounted = true;
    let intervalId;

    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('partnerToken');
        if (!token) {
          if (mounted) navigate('/partner-login');
          return;
        }

        const response = await referralAPI.getDashboard();
        if (response.data?.partnerType === 'franchise') {
          // If this account is a franchise partner, redirect to franchise dashboard
          navigate('/franchise-dashboard');
          return;
        }
        if (mounted) {
          setStats(response.data);
          setLastUpdated(new Date());
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching dashboard:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('partnerToken');
          navigate('/partner-login');
        } else {
          showToast('Failed to load dashboard data', 'error');
        }
      }
    };

    // initial fetch
    fetchStats();
    // Poll every 10 seconds to keep dashboard live
    intervalId = setInterval(fetchStats, 10000);

    return () => {
      mounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [navigate, showToast]);

  const handleCopyLink = () => {
    if (stats?.referralLink) {
      navigator.clipboard.writeText(stats.referralLink);
      showToast('Referral link copied to clipboard!', 'success');
    }
  };

  const handleCopyCode = () => {
    if (stats?.referralCode) {
      navigator.clipboard.writeText(stats.referralCode);
      showToast('Referral code copied to clipboard!', 'success');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('partnerToken');
    localStorage.removeItem('partnerUser');
    navigate('/partner-login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" color="border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex flex-wrap items-center gap-3 md:gap-4">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                {stats?.partnerType === 'franchise' ? 'Franchise Partner' : 'Partner'} Dashboard
              </h1>

              {/* Live indicator */}
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-sm"></span>
                <span className="text-sm text-green-600 font-medium">Live</span>
              </div>
            </div>

            <p className="text-slate-500 mt-1">Welcome back, <span className="font-semibold text-slate-800">{stats?.fullName}</span></p>
            <p className="text-[10px] text-slate-400 mt-1">Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '—'}</p>

            {stats?.partnerType && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase mt-2 ${
                stats.partnerType === 'franchise' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {stats.partnerType} Partner • {stats.commissionRate}% Commission
              </span>
            )}
          </div>
          <button 
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700 font-medium px-4 py-2 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-sm"
          >
            Logout
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Commission */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <h3 className="text-slate-500 font-medium text-xs uppercase tracking-wide">Total Earnings</h3>
            <p className="text-3xl md:text-4xl font-bold text-slate-800 mt-2">
              ₹{stats?.totalCommission?.toLocaleString('en-IN') || 0}
            </p>
            <p className="text-[10px] text-green-600 mt-2 font-medium flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
              Paid via Bank Transfer/UPI
            </p>
          </div>

          {/* Referral Count */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <h3 className="text-slate-500 font-medium text-xs uppercase tracking-wide">Successful Referrals</h3>
            <p className="text-3xl md:text-4xl font-bold text-slate-800 mt-2">
              {stats?.referralCount || 0}
            </p>
            <p className="text-[10px] text-blue-600 mt-2 font-medium">
              Verified Purchases
            </p>
          </div>

          {/* Referral Code */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <h3 className="text-slate-500 font-medium text-xs uppercase tracking-wide">Your Referral Code</h3>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <code className="text-xl font-mono font-bold text-slate-800 bg-slate-100 px-3 py-2 rounded break-all">
                {stats?.referralCode}
              </code>
              <button
                onClick={handleCopyCode}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium shadow-md active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap text-sm"
                title="Copy referral code"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                Copy
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              Share this code with potential buyers
            </p>
          </div>
        </div>

        {/* Share Link Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Your Unique Referral Link</h2>
          <p className="text-slate-600 mb-6 max-w-2xl text-sm md:text-base">
            Share this link with your network. When they use this link to register and purchase a franchise, you will automatically earn a <strong>{stats?.commissionRate || 10}% commission</strong> on the sale.
          </p>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 max-w-3xl">
            <div className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 font-mono text-slate-600 overflow-hidden text-ellipsis whitespace-nowrap text-xs md:text-sm">
              {stats?.referralLink}
            </div>
            <button
              onClick={handleCopyLink}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
              Copy Link
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
            <h3 className="font-bold text-blue-900 mb-2">How Commission Works</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">• <span>Share your link or code with potential franchise buyers.</span></li>
              <li className="flex items-start gap-2">• <span>When they purchase a package, you earn {stats?.commissionRate || 10}% of the sale value.</span></li>
              <li className="flex items-start gap-2">• <span>Commission is credited after successful payment verification.</span></li>
            </ul>
          </div>
          <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
            <h3 className="font-bold text-amber-900 mb-2">Payout Information</h3>
            <p className="text-sm text-amber-800">
              Commissions are paid out weekly/monthly via bank transfer. Please ensure your bank details are up to date with the admin team. Contact support for any payment related queries.
            </p>
          </div>
        </div>

        {/* Referred Persons List */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">Referred Persons</h2>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase">
              {stats?.referredBuyers?.length || 0} Total
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-8 py-4 text-slate-500 font-semibold text-sm uppercase tracking-wider">Date</th>
                  <th className="px-8 py-4 text-slate-500 font-semibold text-sm uppercase tracking-wider">Name</th>
                  <th className="px-8 py-4 text-slate-500 font-semibold text-sm uppercase tracking-wider">Contact Info</th>
                  <th className="px-8 py-4 text-slate-500 font-semibold text-sm uppercase tracking-wider">Package</th>
                  <th className="px-8 py-4 text-slate-500 font-semibold text-sm uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats?.referredBuyers && stats.referredBuyers.length > 0 ? (
                  stats.referredBuyers.map((buyer, index) => (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-4 whitespace-nowrap text-sm text-slate-600">
                        {new Date(buyer.date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <div className="font-bold text-slate-800">{buyer.fullName}</div>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600">{buyer.email}</div>
                        <div className="text-xs text-slate-400 font-medium">{buyer.phone}</div>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded">
                          {buyer.packageName || 'Pending Selection'}
                        </span>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                          buyer.status === 'approved' ? 'bg-green-100 text-green-700' :
                          buyer.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {buyer.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-8 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <svg className="w-12 h-12 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <p className="text-lg font-medium">No referrals yet</p>
                        <p className="text-sm">Start sharing your link to earn commissions</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}