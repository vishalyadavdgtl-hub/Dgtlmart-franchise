import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function WaitingForApproval() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dots, setDots] = useState('');

  useEffect(() => {
    // Try to get user info from partnerData
    const data = localStorage.getItem('partnerData');
    if (data) setUser(JSON.parse(data));

    // Animated dots
    const interval = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 600);
    return () => clearInterval(interval);
  }, []);

  // const handleLogout = () => {
  //   localStorage.removeItem('partnerData');
  //   localStorage.removeItem('partnerToken');
  //   localStorage.removeItem('partnerUser');
  //   navigate('/partner-login');
  // };

  const steps = [
    { label: 'Registration Submitted', status: 'done', icon: '✓' },
    { label: 'Application Under Review', status: 'active', icon: '⏳' },
    { label: 'Admin Approval', status: 'pending', icon: '○' },
    { label: 'Access Granted', status: 'pending', icon: '○' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center px-4">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl text-center">
          {/* Animated Clock Icon */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-amber-400/20 animate-ping" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Under Review{dots}</h1>
          {user && (
            <p className="text-slate-300 text-sm mb-1">
              Hello, <span className="font-semibold text-white">{user.fullName}</span>
            </p>
          )}
          <p className="text-slate-400 text-sm mb-8">
            Your account is currently being reviewed by our admin team. You'll receive an email notification once approved.
          </p>

          {/* Progress Steps */}
          <div className="space-y-3 mb-8 text-left">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                  step.status === 'done' ? 'bg-green-500 text-white' :
                  step.status === 'active' ? 'bg-amber-500 text-white animate-pulse' :
                  'bg-white/10 text-slate-500'
                }`}>
                  {step.icon}
                </div>
                <span className={`text-sm font-medium ${
                  step.status === 'done' ? 'text-green-400' :
                  step.status === 'active' ? 'text-amber-300' :
                  'text-slate-500'
                }`}>
                  {step.label}
                </span>
                {step.status === 'active' && (
                  <span className="ml-auto text-xs text-amber-400 font-medium bg-amber-400/10 px-2 py-0.5 rounded-full">In Progress</span>
                )}
              </div>
            ))}
          </div>

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-400/30 rounded-2xl p-4 mb-6 text-left">
            <p className="text-blue-300 text-sm font-semibold mb-1">📬 What happens next?</p>
            <ul className="text-blue-200/80 text-xs space-y-1">
              <li>• Our team reviews your application within 24–48 hours</li>
              <li>• You'll receive an approval email with access instructions</li>
              <li>• Contact us at <span className="text-blue-300">support@dgtlmart.com</span> for queries</li>
            </ul>
          </div>

          {/* Actions */}
         <div className="flex flex-col gap-3">
  <button
    onClick={() => navigate('/')}
    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition text-sm"
  >
    🏠 Back to Home Page
  </button>
</div>
        </div>

        {/* Footer note */}
        <p className="text-center text-slate-600 text-xs mt-6">
          © 2025 DGTLmart. All rights reserved.
        </p>
      </div>
    </div>
  );
}
