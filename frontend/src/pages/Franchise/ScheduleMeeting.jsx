import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import Button from "../../components/common/Button";
import { useToast } from "../../components/common/Toast";
import api from "../../utils/api";
import ApplicationStepper from "../../components/common/ApplicationStepper";

export default function ScheduleMeeting() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const partnerType = location.state?.partnerType || "Franchise";
  const partner = location.state?.partner;
  const [meetingLink, setMeetingLink] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/franchise/settings');
        const link = res.data?.meetingLink || res.data?.settings?.meetingLink || null;
        setMeetingLink(link);
      } catch (err) {
        console.error('Could not fetch meeting link:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleProceedToPayment = () => {
    navigate('/payment', { state: { franchiseType: partnerType, partner: partner } });
  };

  // Detect platform from URL
  const getPlatformInfo = (url) => {
    if (!url) return { name: 'Meeting', icon: null, color: 'blue' };
    if (url.includes('calendly.com')) return { name: 'Calendly', color: 'blue', emoji: '📅' };
    if (url.includes('zoom.us') || url.includes('zoom.com')) return { name: 'Zoom', color: 'blue', emoji: '💻' };
    if (url.includes('meet.google.com')) return { name: 'Google Meet', color: 'green', emoji: '🎥' };
    if (url.includes('teams.microsoft.com')) return { name: 'Microsoft Teams', color: 'purple', emoji: '💼' };
    return { name: 'Meeting', color: 'blue', emoji: '📞' };
  };

  const platform = getPlatformInfo(meetingLink);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      <Navbar />
      <div className="flex-1 py-6 md:py-10 px-4 sm:px-6 flex items-center justify-center">
        <div className="max-w-3xl w-full">

          {/* Step Progress Bar */}
          <ApplicationStepper currentStep={3} />

          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-3 md:p-4 text-center text-white">
              <h1 className="text-lg md:text-xl font-bold mb-1 flex items-center justify-center gap-2">
                <span className="text-2xl">🎉</span> Documents Submitted!
              </h1>
              <p className="text-blue-100 text-xs md:text-sm max-w-lg mx-auto leading-tight">
                Your documents have been received successfully. The next step is to schedule a quick <strong>Discovery Call</strong> with the DGTL Mart team.
              </p>
            </div>

            {/* Body */}
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
                
                {/* What to expect */}
                <div className="flex-1 w-full bg-blue-50 rounded-2xl p-5 md:p-6 border border-blue-100">
                  <h3 className="font-semibold text-blue-900 mb-3 text-sm md:text-base">What to expect in the Call?</h3>
                  <ul className="space-y-2.5 text-xs md:text-sm text-blue-800">
                    <li className="flex items-start gap-2"><span className="shrink-0 mt-0.5">✅</span> Review of your application</li>
                    <li className="flex items-start gap-2"><span className="shrink-0 mt-0.5">✅</span> Franchise model explanation</li>
                    <li className="flex items-start gap-2"><span className="shrink-0 mt-0.5">✅</span> Commission & earning potential</li>
                    <li className="flex items-start gap-2"><span className="shrink-0 mt-0.5">✅</span> Next steps & onboarding process</li>
                  </ul>
                </div>

                {/* Meeting Link Section */}
                <div className="flex-1 w-full flex flex-col justify-center items-center">
                  {loading ? (
                    <div className="text-center py-6">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">Loading meeting link...</p>
                    </div>
                  ) : meetingLink ? (
                    <div className="text-center w-full">
                      <p className="text-gray-600 mb-4 text-sm font-medium">
                        Pick a time slot for Discovery Call:
                      </p>
                      <a
                        href={meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-base font-bold rounded-2xl transition-all shadow-md hover:shadow-lg w-full"
                      >
                        <span className="text-xl">{platform.emoji}</span>
                        <span>Schedule on {platform.name}</span>
                        <svg className="w-5 h-5 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                      <p className="text-xs text-gray-400 mt-2">Link will open in a new tab</p>
                    </div>
                  ) : (
                    <div className="text-center bg-amber-50 border border-amber-200 rounded-2xl p-5 w-full">
                      <span className="text-2xl block mb-2">⏳</span>
                      <h3 className="font-semibold text-amber-900 mb-1 text-sm">Meeting Link Coming Soon</h3>
                      <p className="text-amber-700 text-xs">
                        Our team will send you the meeting link shortly via email or WhatsApp.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-400 mb-3">
                  Already scheduled? Go to your dashboard:
                </p>
                <button
                  onClick={handleProceedToPayment}
                  className="px-8 py-2.5 text-gray-600 border-2 border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-900 font-medium transition-all"
                >
                  I've scheduled my meeting — Proceed to Payment →
                </button>
              </div>
            </div>
          </div>

          {/* Help text */}
          <p className="text-center text-sm text-gray-400 mt-6">
            Need help? Contact us at <a href="mailto:support@dgtlmart.com" className="text-blue-500 hover:underline">support@dgtlmart.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}