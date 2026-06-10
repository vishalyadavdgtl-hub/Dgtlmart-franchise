import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Button from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';

export default function ReferralSuccess() {
  const { showToast } = useToast();
  const location = useLocation();
  const { referralCode, referralLink, partner } = location.state || {};
  const [copied, setCopied] = useState({ code: false, link: false });
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    // Page load animation
    setTimeout(() => setPageLoaded(true), 100);
    
    // Confetti effect on mount
    const createConfetti = () => {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 60%)`;
      confetti.style.animationDelay = `${Math.random() * 2}s`;
      document.querySelector('.confetti-container')?.appendChild(confetti);
      
      setTimeout(() => confetti.remove(), 4000);
    };

    // Create confetti for 3 seconds
    const confettiInterval = setInterval(createConfetti, 50);
    setTimeout(() => clearInterval(confettiInterval), 3000);
  }, []);

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(prev => ({ ...prev, [type]: true }));
      showToast(`${type === 'code' ? 'Code' : 'Link'} copied to clipboard!`);
      
      // Button animation
      const button = document.getElementById(`${type}-button`);
      if (button) {
        button.classList.add('animate-success');
        setTimeout(() => {
          button.classList.remove('animate-success');
        }, 300);
      }
      
      setTimeout(() => {
        setCopied(prev => ({ ...prev, [type]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      showToast('Failed to copy. Please try manually.', 'error');
    }
  };

  if (!partner) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <p className="text-gray-600 mb-4">No referral data found. Please register first.</p>
            <Link to="/referral-partner">
              <Button variant="primary">
                Go to Registration
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Confetti Container */}
      <div className="confetti-container fixed inset-0 pointer-events-none z-0 overflow-hidden"></div>

      <Navbar />
      
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className={`transition-all duration-500 transform ${pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Success Header - More Compact */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4 animate-scale-in">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Registration Successful!
            </h1>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 inline-block text-left max-w-md">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-yellow-800 font-bold text-sm uppercase tracking-wide">Account Pending Approval</p>
                  <p className="text-yellow-700 text-xs mt-1 leading-relaxed">
                    Your account has been created and is currently being reviewed by our team. You will be able to log in to your dashboard once an admin verifies your account.
                  </p>
                </div>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-1">
              Welcome to the DGTLmart Referral Partner Program
            </p>
            <p className="text-lg font-semibold text-blue-700">
              {partner?.fullName}
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="p-6">
              {/* Referral Code Info Section */}
              <div className="mb-8">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 text-center">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Referral Code & Link
                  </h3>
                  <p className="text-sm text-blue-800">
                    Your unique referral code and tracking link will be generated automatically and made available on your dashboard once your account is approved by our team.
                  </p>
                </div>
              </div>

              {/* Commission Steps */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  How to Earn Commissions
                </h3>
                
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    {
                      step: '01',
                      title: 'Share Your Code',
                      desc: 'Share your referral code or link with potential franchise buyers',
                      icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z'
                    },
                    {
                      step: '02',
                      title: 'Buyer Registers',
                      desc: 'When they register for a franchise, they enter your code in the form',
                      icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                    },
                    {
                      step: '03',
                      title: 'Earn Commissions',
                      desc: 'You earn commissions on every successful franchise purchase you refer.',
                      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    }
                  ].map((item, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors duration-200">
                      <div className="flex items-start mb-3">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-md flex items-center justify-center mr-3 flex-shrink-0 text-xs font-bold">
                          {item.step}
                        </div>
                        <h4 className="text-base font-semibold text-gray-900">{item.title}</h4>
                      </div>
                      <p className="text-gray-600 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/" className="flex-1">
                    <Button variant="outline" fullWidth className="py-2.5 text-sm">
                      Back to Home
                    </Button>
                  </Link>
                  <Link to="/buy-franchise" className="flex-1">
                    <Button variant="primary" fullWidth className="py-2.5 text-sm">
                      View Franchise Packages
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Need help? Contact us at{' '}
              <a href="mailto:support@dgtlmart.com" className="text-blue-600 hover:underline">
                support@dgtlmart.com
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Add custom styles */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes confettiFall {
          0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes successPulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }

        .animate-scale-in {
          animation: scaleIn 0.5s ease-out forwards;
        }

        .animate-success {
          animation: successPulse 0.3s ease-in-out;
        }

        .confetti {
          position: absolute;
          width: 8px;
          height: 8px;
          opacity: 0.6;
          animation: confettiFall 4s linear forwards;
          border-radius: 2px;
        }

        /* Professional typography */
        h1, h2, h3, h4 {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          letter-spacing: -0.025em;
        }
      `}</style>
    </div>
  );
}