import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import ApplicationStepper from "../../components/common/ApplicationStepper";

const KitIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V11" />
  </svg>
);
const TrainingIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
  </svg>
);
const AssetsIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
  </svg>
);
const CheckIcon = ({ className = "" }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);

const ONBOARDING_STEPS = [
  {
    id: "kit",
    Icon: KitIcon,
    title: "Welcome Partner Kit",
    subtitle: "Your starter pack is ready",
    bg: "bg-amber-50",
    border: "border-amber-200",
    iconBg: "bg-amber-500",
    items: [
      { label: "Partner Welcome Letter", status: "Ready" },
      { label: "Brand Guidelines PDF", status: "Ready" },
      { label: "Logo & Banner Pack", status: "Ready" },
      { label: "Marketing Pitch Deck", status: "Ready" },
    ],
  },
  {
    id: "training",
    Icon: TrainingIcon,
    title: "Training Program",
    subtitle: "Onboarding modules unlocked",
    bg: "bg-blue-50",
    border: "border-blue-200",
    iconBg: "bg-blue-600",
    items: [
      { label: "Module 1: DGTL Mart Overview", status: "Unlocked" },
      { label: "Module 2: Sales Process", status: "Unlocked" },
      { label: "Module 3: Lead Management", status: "Unlocked" },
      { label: "Module 4: Commission & Payouts", status: "Unlocked" },
    ],
  },
  {
    id: "assets",
    Icon: AssetsIcon,
    title: "Digital Assets Activated",
    subtitle: "Your digital presence is live",
    bg: "bg-green-50",
    border: "border-green-200",
    iconBg: "bg-green-600",
    showItems: true,
    items: [
      { label: "Profile Listing on DGTL Mart", status: "Live" },
      { label: "One Page Partner Website", status: "Being Setup" },
      { label: "Google Business Profile", status: "Being Setup" },
      { label: "CRM Dashboard Access", status: "Active" },
    ],
  },
];

const statusStyle = (status) => {
  if (["Live", "Active", "Ready", "Unlocked"].includes(status))
    return "bg-green-50 text-green-700 border border-green-200";
  return "bg-amber-50 text-amber-700 border border-amber-200";
};

export default function OnboardingSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const franchiseType = location.state?.franchiseType || "Referral";
  const paymentId = location.state?.paymentId;

  const [visible, setVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    const timers = ONBOARDING_STEPS.map((_, i) =>
      setTimeout(() => setActiveStep(i + 1), (i + 1) * 700)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 py-6 px-4 flex items-start justify-center">
        <div
          className={`max-w-2xl w-full transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <ApplicationStepper currentStep={5} />

          {/* Hero */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-700 rounded-2xl px-6 py-5 mb-4 shadow-sm text-center">
            <div className="w-10 h-10 bg-white/20 border border-white/30 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckIcon className="text-white" />
            </div>
            <h1 className="text-lg font-bold text-white mb-1">Franchise Activated</h1>
            <p className="text-blue-100 text-xs">
              Welcome to DGTL Mart Partner Network —{" "}
              <span className="font-semibold text-white">{franchiseType} Partner</span>
            </p>
            {paymentId && (
              <p className="text-blue-200 text-xs mt-1.5 font-mono">Payment ID: {paymentId}</p>
            )}
          </div>

          {/* Steps - flow layout */}
          <div className="relative">
            {/* Vertical connector line */}
            <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-amber-300 via-blue-300 to-green-300 z-0" />

            <div className="space-y-3">
              {ONBOARDING_STEPS.map((step, idx) => {
                const { Icon } = step;
                return (
                  <div
                    key={step.id}
                    className={`relative z-10 rounded-2xl overflow-hidden border shadow-sm transition-all duration-500 ${step.bg} ${step.border} ${
                      activeStep > idx ? "opacity-100" : "opacity-30"
                    }`}
                  >
                    <div className="flex items-center gap-3 px-4 py-3.5">
                      <div className={`w-9 h-9 ${step.iconBg} rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-sm`}>
                        <Icon />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-sm font-semibold text-gray-900">{step.title}</h2>
                        <p className="text-xs text-gray-500">{step.subtitle}</p>
                      </div>
                      {activeStep > idx && (
                        <div className="w-6 h-6 bg-white/80 border border-green-300 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {step.showItems && (
                      <div className="px-3 pb-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {step.items.map((item, i) => (
                          <div key={i} className="flex items-center justify-between gap-2 bg-white/70 border border-green-100 rounded-xl px-3 py-2">
                            <p className="text-xs font-medium text-gray-700 truncate">{item.label}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusStyle(item.status)}`}>
                              {item.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          {activeStep >= ONBOARDING_STEPS.length && (
            <div className="mt-5 text-center bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm">
              <h3 className="font-bold text-blue-900 text-sm mb-1">Final Step: Admin Verification</h3>
              <p className="text-blue-700 text-xs">
                Your payment and agreements have been successfully received. Please wait for final admin approval to access your partner dashboard.
              </p>
            </div>
          )}

          {/* Support */}
          <div className="mt-4 p-4 bg-white border border-gray-200 rounded-xl text-center">
            <p className="text-gray-500 text-xs">
              Our team will contact you within 24 hours for training kickoff.{" "}
              Need help?{" "}
              <a href="mailto:support@dgtlmart.com" className="text-blue-600 hover:underline">
                support@dgtlmart.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
