import { useLocation, Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Button from '../../components/common/Button';

export default function FranchiseSuccess() {
  const location = useLocation();
  const { buyer, package: selectedPackage, buyerId } = location.state || {};

  if (!buyer || !selectedPackage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No purchase data found.</p>
            <Link to="/" className="inline-block mt-4">
              <Button>Go to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Success Header */}
          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-white border-b border-gray-200">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                Payment Successful!
              </h1>
            </div>
            <p className="text-sm text-gray-600">
              Thank you, <span className="font-semibold text-gray-900">{buyer.fullName}</span>
            </p>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {/* Reference Number */}
            <div className="bg-blue-50 border-l-4 border-blue-600 rounded-r-lg p-4">
              <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide mb-1">
                Reference Number
              </p>
              <p className="text-xl font-bold text-blue-700 font-mono">
                {buyerId}
              </p>
            </div>

            {/* Purchase Details */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">Purchase Details</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Business Name</span>
                  <span className="font-medium text-gray-900">{buyer.businessName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Email</span>
                  <span className="font-medium text-gray-900">{buyer.email}</span>
                </div>
                <div className="border-t border-gray-200 my-2"></div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Package</span>
                  <span className="font-semibold text-gray-900">{selectedPackage.packageName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {selectedPackage.category.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
                <div className="border-t border-gray-200 my-2"></div>
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                  <span className="font-semibold text-gray-900">Amount Paid</span>
                  <span className="text-xl font-bold text-green-600">
                    ₹{selectedPackage.price.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="border border-gray-200 rounded-lg p-5">
              <h3 className="font-semibold text-gray-900 mb-4">What's Next?</h3>
              <div className="space-y-3">
                {[
                  { title: 'Application Review', desc: 'Review within 24-48 hours' },
                  { title: 'Welcome Email', desc: 'Onboarding details sent to your email' },
                  { title: 'Orientation Call', desc: 'Support team will contact you' },
                  { title: 'Launch', desc: 'Access tools to start your business' }
                ].map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-semibold">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">{step.title}</h4>
                      <p className="text-sm text-gray-600">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="bg-gray-50 rounded-lg p-4 text-center text-sm">
              <p className="text-gray-600 mb-2">Need help?</p>
              <div className="flex flex-col sm:flex-row justify-center gap-3 text-blue-600">
                <a href="mailto:support@dgtlmart.com" className="hover:text-blue-700 font-medium">
                  support@dgtlmart.com
                </a>
                <span className="hidden sm:inline text-gray-300">|</span>
                <a href="tel:+919876543210" className="hover:text-blue-700 font-medium">
                  +91 98765 43210
                </a>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link to="/" className="flex-1">
                <Button variant="outline" fullWidth>
                  Back to Home
                </Button>
              </Link>
              <button
                onClick={() => window.print()}
                className="flex-1 bg-gray-800 text-white px-4 py-2.5 rounded-lg hover:bg-gray-900 transition-colors font-medium"
              >
                Download Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}