// ApplicationStepper.jsx - Reusable progress bar for franchise application flow

const STEPS = [
  { id: 1, label: 'Apply',     icon: '📝', path: '/referral-success' },
  { id: 2, label: 'Documents', icon: '📄', path: '/referral-success' },
  { id: 3, label: 'Schedule',  icon: '📅', path: '/schedule-meeting' },
  { id: 4, label: 'Payment',   icon: '💳', path: '/payment' },
  { id: 5, label: 'Activated', icon: '🏆', path: '/onboarding-success' },
];

export default function ApplicationStepper({ currentStep }) {
  // currentStep: 1 = Apply, 2 = Documents, 3 = Schedule, 4 = Payment, 5 = Activated
  return (
    <div className="w-full max-w-2xl mx-auto px-4 pt-1 pb-3 mb-1">
      <div className="relative flex items-center justify-between">
        
        {/* Connector Line Background */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0" />
        
        {/* Active Connector Line */}
        <div
          className="absolute top-4 left-0 h-0.5 bg-gradient-to-r from-indigo-500 to-blue-500 z-0 transition-all duration-700"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map((step) => {
          const isCompleted = step.id < currentStep;
          const isActive    = step.id === currentStep;
          const isPending   = step.id > currentStep;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-1.5 flex-1">
              {/* Circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-500 shadow-sm
                  ${isCompleted ? 'bg-green-500 border-green-500 text-white shadow-green-200'
                    : isActive ? 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-300 ring-4 ring-indigo-100 scale-110'
                    : 'bg-white border-gray-300 text-gray-400'}
                `}
              >
                {isCompleted ? '✓' : step.icon}
              </div>

              {/* Label */}
              <span
                className={`text-xs font-semibold text-center leading-tight
                  ${isCompleted ? 'text-green-600'
                    : isActive ? 'text-indigo-700'
                    : 'text-gray-400'}
                `}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
