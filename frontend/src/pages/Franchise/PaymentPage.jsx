import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import api from '../../utils/api';
import { useToast } from '../../components/common/Toast';
import ApplicationStepper from '../../components/common/ApplicationStepper';

const PACKAGE_DETAILS = {
  Referral: {
    name: 'Referral Partner',
    price: 10000,
    color: 'from-blue-500 to-indigo-600',
    badge: '🤝',
    commission: '20%',
    subtitle: 'Best For: Individuals, Freelancers, Students',
    features: [
      'Registration Fee: Free',
      'Easy onboarding',
      'Earn per successful referral',
      'Training - 1 Week',
      'Welcome Partner Kit',
      'Digital assets pack',
      'Custom referral link',
      'Referral dashboard access'
    ]
  },
  Dost: {
    name: 'Dost Partner',
    price: 49999,
    color: 'from-purple-500 to-pink-600',
    badge: '⭐',
    commission: '60%',
    subtitle: 'Best for: Small agencies, consultants',
    features: [
      'Maximum Commission 40%',
      'Higher earnings potential',
      'Dedicated support',
      'Access to marketing resources',
      'Training - 4 Weeks',
      '4 Certifications',
      '50 Leads yearly',
      'Promotion Material',
      'Full Webpage Profile Listing',
      'Visiting Cards',
      'Professional Email ID',
      'Ready Proposal',
      'Support Number',
      'CRM Access',
      'Referral dashboard access'
    ]
  }
};

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const franchiseType = location.state?.franchiseType || localStorage.getItem('selectedProposal') || 'Referral';
  const pkg = PACKAGE_DETAILS[franchiseType] || PACKAGE_DETAILS['Referral'];

  const [loading, setLoading] = useState(false);
  const [partnerInfo, setPartnerInfo] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/referral/dashboard');
        setPartnerInfo(res.data);
        // If already paid, redirect to onboarding
        if (res.data?.paymentStatus === 'paid') {
          navigate('/onboarding-success', { replace: true, state: { franchiseType } });
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();

    // Load Razorpay SDK
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const orderRes = await api.post('/referral/create-payment-order', {
        amount: pkg.price,
        franchiseType: franchiseType.toLowerCase(),
        pkgName: pkg.name
      });

      const { orderId, amount, currency, keyId } = orderRes.data;

      // Step 2: Open Razorpay checkout
      const options = {
        key: keyId,
        amount,
        currency,
        name: 'DGTL Mart',
        description: `${pkg.name} - Franchise Onboarding`,
        order_id: orderId,
        prefill: {
          name: partnerInfo?.fullName || '',
          email: partnerInfo?.email || '',
          contact: partnerInfo?.phone || '',
        },
        theme: { color: '#4F46E5' },
        handler: async function (response) {
          // Step 3: Verify payment
          try {
            const verifyRes = await api.post('/referral/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              showToast('Payment successful! Franchise activated! 🎉', 'success');
              
              // Update localStorage to reflect payment is complete so the 'Complete Application' button hides
              try {
                const partnerUser = JSON.parse(localStorage.getItem('partnerUser') || '{}');
                partnerUser.paymentStatus = 'paid';
                localStorage.setItem('partnerUser', JSON.stringify(partnerUser));
              } catch (e) {}

              navigate('/onboarding-success', {
                state: { franchiseType, paymentId: response.razorpay_payment_id }
              });
            }
          } catch (verifyErr) {
            showToast('Payment verification failed. Please contact support.', 'error');
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            showToast('Payment cancelled', 'info');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        showToast('Payment failed. Please try again.', 'error');
        setLoading(false);
      });
      rzp.open();

    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.error || 'Could not initiate payment. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 flex flex-col">
      <Navbar />
      <div className="flex-1 py-4 md:py-6 px-4 flex items-center justify-center">
        <div className="max-w-2xl w-full space-y-4">

          {/* Step Progress Bar */}
          <ApplicationStepper currentStep={4} />

          {/* Package Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mt-4">
            {/* Header */}
            <div className="p-4 md:p-5 bg-blue-600 border-b border-blue-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-left w-full sm:w-auto">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 border border-white/30 text-2xl shrink-0">
                  {pkg.badge}
                </div>
                <div>
                  <h1 className="text-lg md:text-xl font-bold text-white leading-tight">{pkg.name}</h1>
                  <p className="text-blue-100 text-xs mt-0.5">{pkg.subtitle || 'Complete your onboarding'}</p>
                </div>
              </div>
              
              <div className="flex items-baseline gap-1 bg-white/10 border border-white/20 px-4 py-2 rounded-xl shrink-0">
                <span className="text-lg text-blue-100 font-medium">₹</span>
                <span className="text-3xl font-extrabold text-white">{pkg.price.toLocaleString('en-IN')}</span>
                <span className="text-blue-100 text-xs ml-1 font-medium">/ yearly</span>
              </div>
            </div>

            <div className="p-4 md:p-5 bg-gray-50/50">
              {/* Commission highlight */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-5 flex items-center gap-2">
                <span className="text-lg">💰</span>
                <p className="text-xs text-blue-900">
                  <span className="font-semibold">Commission Rate: {pkg.commission}</span> 
                  <span className="hidden sm:inline"> — Earn on every successful referral you bring.</span>
                </p>
              </div>

              {/* What's included */}
              <h3 className="font-semibold text-gray-900 text-xs mb-3 uppercase tracking-wide">Included in package</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mb-6">
                {pkg.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
                    <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={loading}
                className={`w-full py-3.5 rounded-xl text-white text-base font-semibold transition-all
                  ${loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gray-900 hover:bg-black hover:shadow-lg shadow'
                  }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Pay ₹{pkg.price.toLocaleString('en-IN')} & Activate
                  </span>
                )}
              </button>

              <p className="text-center text-xs text-gray-400 mt-3">
                Secured by Razorpay · UPI, Cards, Net Banking accepted
              </p>
            </div>
          </div>

          <p className="text-center text-sm text-gray-400">
            Need help? Email us at{' '}
            <a href="mailto:support@dgtlmart.com" className="text-indigo-500 hover:underline">
              support@dgtlmart.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
