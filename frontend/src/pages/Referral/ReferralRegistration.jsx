import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { referralAPI } from '../../utils/api';
import { useToast } from '../../components/common/Toast';
import Footer from '../../components/common/Footer';
import { Link } from 'react-router-dom';

export default function ReferralRegistration() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [formData, setFormData] = useState({
  fullName: '',
  email: '',
  password: '',
  phone: '',
  address: '',
  partnerType: 'referral',
  franchiseType: '',
  agreementAccepted: false,
  otp: '',
});

const [otpSent, setOtpSent] = useState(false);
const [sendingOtp, setSendingOtp] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Restrict phone input to numbers only and max 10 digits
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    if (formData.partnerType === "franchise" && !formData.franchiseType) {
  showToast('Please select franchise type (Sathi/Dost)', 'error');
  return;
}
    e.preventDefault();
    
    // Client-side validation for required fields
    const required = ['fullName', 'email', 'password', 'phone', 'address'];
    const missing = required.filter((k) => !formData[k] || (typeof formData[k] === 'string' && formData[k].trim() === ''));
    if (missing.length > 0) {
      showToast(`Please fill in required fields: ${missing.join(', ')}`, 'error');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    // Phone validation (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      showToast('Please enter a valid 10-digit phone number', 'error');
      return;
    }

    if (!formData.agreementAccepted) {
      showToast('Please accept the agreement to continue', 'error');
      return;
    }

    if (!otpSent) {
      return handleSendOTP();
    }

    if (!formData.otp) {
      showToast('Please enter the OTP sent to your email', 'error');
      return;
    }

    setLoading(true);
    try {
      // Log payload for debugging (avoid logging sensitive data in production)
      console.debug('[referral] register payload:', { ...formData, password: '••••••' });
      const response = await referralAPI.register(formData);
      
      // Navigate to success page with data
      navigate('/referral-success', {
        state: {
          referralCode: response.data.referralCode,
          referralLink: response.data.referralLink,
          partner: response.data.partner
        }
      });
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message || error);
      showToast(error.response?.data?.error || error.message || 'Registration failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    setSendingOtp(true);
    try {
      await referralAPI.sendOTP({ email: formData.email, phone: formData.phone });
      setOtpSent(true);
      showToast('OTP sent successfully to your email!', 'success');
    } catch (error) {
      console.error('OTP send error:', error);
      showToast(error.response?.data?.error || 'Failed to send OTP', 'error');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleAcceptAgreement = () => {
    setFormData(prev => ({ ...prev, agreementAccepted: true }));
    setShowAgreement(false);
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
                Join India's Top Referral Network
              </div>
              
              <h1 className="text-4xl xl:text-6xl font-bold text-white mb-6 leading-tight">
                Start Your Journey <br />
                <span className="text-blue-400">As A Partner</span>
              </h1>
              
              <p className="text-lg text-blue-100/80 leading-relaxed max-w-xl">
                Partner with DGTLmart and leverage our established brand to earn high-ticket commissions. Get all the tools and training you need to succeed.
              </p>

              <div className="mt-12 flex gap-8">
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-white">500+</span>
                  <span className="text-blue-200 text-sm font-medium">Active Partners</span>
                </div>
                <div className="w-px h-12 bg-white/20"></div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-white">₹2.5Cr+</span>
                  <span className="text-blue-200 text-sm font-medium">Payouts Done</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="flex-1 bg-gray-50/50 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 xl:p-8">
          <div className={`w-full max-w-xl transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-10">
              <div className="mb-6 ">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Become a {formData.partnerType === 'franchise' ? 'Franchise' : 'Referral'} Partner
                </h2>
                <p className="text-gray-500">Enter your details to join the program</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-5">

                  <div className="col-span-full space-y-3">
                    {/* <label className="block text-sm font-semibold text-gray-700">
                      Choose Partnership Model <span className="text-red-500">*</span>
                    </label> */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Referral Partner Option */}
                      {/* <div 
                        onClick={() => setFormData(prev => ({ ...prev, partnerType: 'referral' }))}
                        className={`cursor-pointer rounded-2xl p-4 border-2 transition-all ${
                          formData.partnerType === 'referral'
                            ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500'
                            : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                             formData.partnerType === 'referral' ? 'border-blue-500' : 'border-gray-400'
                          }`}>
                            {formData.partnerType === 'referral' && <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>}
                          </div>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">Referral Partner</h3>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          Ideal for individuals. Refer clients via link and earn commission on every successful sale.
                        </p>
                      </div> */}

                      {/* Franchise Partner Option */}
                      {/* <div 
                        onClick={() => setFormData(prev => ({ ...prev, partnerType: 'franchise' }))}
                        className={`cursor-pointer rounded-2xl p-4 border-2 transition-all ${
                          formData.partnerType === 'franchise'
                            ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500'
                            : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'
                        }`}
                      >
                         <div className="flex justify-between items-start mb-2">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                             formData.partnerType === 'franchise' ? 'border-indigo-500' : 'border-gray-400'
                          }`}>
                            {formData.partnerType === 'franchise' && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>}
                          </div>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">Franchise Partner</h3>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          For agencies & business owners. Higher commitment, higher rewards.
                        </p>
                      </div> */}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder=""
                      required
                      className="!rounded-2xl"
                    />

                    <Input
                      label="Email Address"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder=""
                      className="!rounded-2xl"
                    />
                    
                    <Input
                      label="Password"
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder=""
                      required
                      className="!rounded-2xl"
                    />

                     <Input
                      label="Confirm Password"
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder=""
                      required
                      className="!rounded-2xl"
                    />

                    <Input
                      label="Phone Number"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder=""
                      required
                      className="!rounded-2xl"
                    />
                    
                     <Input
                      label="City/Location"
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder=""
                      required
                      className="!rounded-2xl"
                    />

                      
                     <Input
                      label="Business Name (optional)"
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      placeholder=""
                      required
                      className="!rounded-2xl"
                    />

                  </div>

                  <Input
                    label="Full Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder=""
                    required
                    className="!rounded-2xl"
                  />
                </div>

                {/* 🔥 Franchise Type Dropdown */}
{formData.partnerType === "franchise" && (
  <div className="mt-4">
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      Select Franchise Type
    </label>

    <select
      name="franchiseType"
      value={formData.franchiseType}
      onChange={handleChange}
      className="w-full p-3 border rounded-xl"
      required
    >
      <option value="">Select Type</option>
      <option value="sathi">Sathi</option>
      <option value="dost">Dost</option>
    </select>
  </div>
)}





                <div className="flex items-start gap-3 pt-2">
                  <div className="flex items-center h-5">
                    <input
                      id="agreementAccepted"
                      name="agreementAccepted"
                      type="checkbox"
                      checked={formData.agreementAccepted}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                      required
                    />
                  </div>
                  <label htmlFor="agreementAccepted" className="text-sm text-gray-600">
                    I understand and accept the{' '}
                    <button
                      type="button"
                      onClick={() => setShowAgreement(true)}
                      className="text-blue-600 font-bold hover:underline"
                    >
                      {formData.partnerType === 'franchise' ? 'Franchise Partner Agreement' : 'Referral Partner Agreement'}
                    </button>
                  </label>
                </div>

                {otpSent && (
                  <div className="pt-4 border-t border-gray-100">
                    <Input
                      label="Enter OTP"
                      name="otp"
                      value={formData.otp}
                      onChange={handleChange}
                      placeholder="6-digit code"
                      required
                      className="!rounded-2xl text-center tracking-widest font-bold text-lg"
                      type="text"
                      maxLength={6}
                    />
                    <p className="text-xs text-gray-500 mt-2 text-center">OTP sent to {formData.email}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading || sendingOtp}
                  fullWidth
                  className="!rounded-2xl py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-xl shadow-blue-500/10 active:scale-[0.98] transition-all"
                >
                  {loading || sendingOtp ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {sendingOtp ? 'Sending OTP...' : 'Processing...'}
                    </span>
                  ) : (otpSent ? "Verify & Create Account" : "Send OTP")}
                </Button>

                <div className="text-center mt-4">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/partner-login" className="text-blue-600 font-bold hover:underline">
                      Login here
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Modal
        isOpen={showAgreement}
        onClose={() => setShowAgreement(false)}
        title={`${formData.partnerType === 'franchise' ? 'Franchise' : 'Referral'} Partner Agreement`}
        size="large"
        footer={
          <Button 
            onClick={handleAcceptAgreement} 
            fullWidth
            className="!rounded-2xl py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/10"
          >
            I Understand & Accept
          </Button>
        }
      >
        <div className="space-y-6 pr-2">
          <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Program Terms</h3>
              <p className="text-gray-500 text-sm">Review our partnership guidelines</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              {
                title: "Purpose of the Agreement",
                content: "The purpose of this Agreement is to define the terms under which the Partner may refer potential customers for DGTLmart franchise packages. The Partner's role is strictly limited to referral activities, and this Agreement does not create any partnership, employment, agency, or franchise relationship between the Company and the Partner."
              },
              {
                title: "Partner Registration and Eligibility",
                content: "Registration as a Referral Partner is free of cost. The Partner is not required to purchase any franchise or pay any joining or registration fee. Upon successful registration and acceptance of this Agreement, the Company will provide the Partner with a unique referral code and/or referral link for referral purposes."
              },
              {
                title: "Referral Process",
                content: "The Partner may refer potential franchise buyers to DGTLmart using the assigned referral link or referral code. Use of the referral link or code by a buyer is optional, and franchise purchases made without a referral code will be treated as direct sales of the Company. DGTLmart reserves the right to accept or reject any referred customer at its sole discretion."
              },
              {
                title: "Commission Policy",
                content: "The Partner acknowledges and agrees that: The Company is not obligated to provide any commission for referrals. The amount of commission, if any, is entirely determined by DGTLmart. The system does not automatically calculate or credit commissions. All commissions are manual, discretionary, and subject to internal review by the Company. Commission eligibility arises only after a successful franchise purchase by a referred customer and confirmation by the Company. No commission shall be considered earned or payable unless explicitly approved by DGTLmart."
              },
              {
                title: "Payment of Commission",
                content: "Any commission approved by DGTLmart shall be paid manually through methods determined by the Company, including but not limited to bank transfer, UPI, or other offline/online modes. The Partner shall not claim any automatic payment, wallet balance, or payout rights. DGTLmart reserves the right to delay, adjust, or withhold commission payments in case of suspected misuse, fraud, or violation of this Agreement."
              },
              {
                title: "Partner Responsibilities",
                content: "The Partner agrees to: Promote DGTLmart ethically and honestly; Avoid false promises, misrepresentation, or misleading claims; Not misuse DGTLmart's brand, logo, or marketing materials; Comply with all applicable laws and regulations. The Partner shall not represent themselves as an employee, agent, or authorized franchise of DGTLmart."
              },
              {
                title: "Prohibited Activities",
                content: "The Partner shall not: Engage in self-referrals or fraudulent activities; Manipulate referral tracking systems; Offer unauthorized discounts, guarantees, or commitments; Use spam, deceptive marketing, or illegal promotional methods. Violation of these terms may result in immediate termination and forfeiture of any pending commissions."
              },
              {
                title: "Termination",
                content: "DGTLmart reserves the right to suspend or terminate the Partner's account at any time, with or without notice, if the Partner violates this Agreement or if the Company decides to discontinue the referral program. Upon termination, all pending and unpaid commissions may be cancelled at the Company's discretion."
              },
              {
                title: "Limitation of Liability",
                content: "DGTLmart shall not be liable for any indirect, incidental, or consequential damages arising from participation in the referral program. The Partner participates at their own risk and agrees that the Company's decisions regarding referrals and commissions are final."
              },
              {
                title: "Modification of Agreement",
                content: "DGTLmart reserves the right to modify this Agreement at any time. Continued participation in the referral program after any changes constitutes acceptance of the revised Agreement."
              },
              {
                title: "Governing Law and Jurisdiction",
                content: "This Agreement shall be governed by and interpreted in accordance with the laws of India. Any disputes arising under this Agreement shall be subject to the exclusive jurisdiction of the courts located in the Company's registered location."
              },
              {
                title: "Acceptance",
                content: "By registering as a DGTLmart Referral Partner and checking the acceptance box, the Partner confirms that they have read, understood, and agreed to all terms and conditions of this Agreement."
              }

            ].map((item, index) => (
              <div key={index} className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">{index + 1}</span>
                  {item.title}
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );

}
