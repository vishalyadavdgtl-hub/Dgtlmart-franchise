import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Button from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';
import api from '../../utils/api';
import ApplicationStepper from '../../components/common/ApplicationStepper';

export default function ReferralSuccess() {
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [partnerData, setPartnerData] = useState(() => {
    if (location.state?.partner) {
      localStorage.setItem('referralSuccessData', JSON.stringify({
        partner: location.state.partner,
        referralCode: location.state.referralCode,
        referralLink: location.state.referralLink
      }));
      return location.state;
    }
    const saved = localStorage.getItem('referralSuccessData');
    if (saved) return JSON.parse(saved);
    return null;
  });

  const { referralCode, referralLink, partner } = partnerData || {};
  const [copied, setCopied] = useState({ code: false, link: false });
  const [pageLoaded, setPageLoaded] = useState(false);
  const [systemSettings, setSystemSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/franchise/settings');
        setSystemSettings(res.data);
      } catch (err) {
        console.error('Failed to fetch settings', err);
      }
    };
    fetchSettings();
  }, []);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(() => {
    return localStorage.getItem('isModalOpen') === 'true';
  });
  const [isApplicationSubmitted, setIsApplicationSubmitted] = useState(() => {
    return localStorage.getItem('isApplicationSubmitted') === 'true';
  });
  const [formData, setFormData] = useState(() => {
    // Partner profile from localStorage (set during login/register)
    const savedPartner = localStorage.getItem('referralSuccessData');
    const parsedPartner = savedPartner ? JSON.parse(savedPartner) : null;
    const p = location.state?.partner || parsedPartner?.partner || {};

    // Previously saved form data
    const saved = localStorage.getItem('franchiseFormData');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Sirf tab use karo jab saare required fields filled hain
      if (parsed.name && parsed.email && parsed.phone && parsed.address) {
        return parsed;
      }
    }

    // Fresh fill from partner profile
    return {
      name: p?.fullName || p?.name || '',
      email: p?.email || '',
      phone: p?.phone || '',
      address: p?.address || '',
      businessName: p?.businessName || '',
      profession: p?.profession || '',
      experience: p?.experience || '',
      linkedinUrl: p?.linkedinUrl || '',
      preferredCategory: p?.preferredCategory || ''
    };
  });
  const [isDocumentSection, setIsDocumentSection] = useState(() => {
    return localStorage.getItem('isDocumentSection') === 'true';
  });
  const [selectedProposal, setSelectedProposal] = useState(() => {
    return localStorage.getItem('selectedProposal') || null;
  });
  const [documents, setDocuments] = useState({
    kycDocument: null,
    ndaDocument: null,
    signedAgreement: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    localStorage.setItem('isModalOpen', isModalOpen);
  }, [isModalOpen]);

  useEffect(() => {
    localStorage.setItem('isApplicationSubmitted', isApplicationSubmitted);
  }, [isApplicationSubmitted]);

  useEffect(() => {
    localStorage.setItem('isDocumentSection', isDocumentSection);
  }, [isDocumentSection]);

  useEffect(() => {
    if (selectedProposal) {
      localStorage.setItem('selectedProposal', selectedProposal);
    } else {
      localStorage.removeItem('selectedProposal');
    }
  }, [selectedProposal]);

  useEffect(() => {
    localStorage.setItem('franchiseFormData', JSON.stringify(formData));
  }, [formData]);

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

  const handleApplyFranchiseSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return showToast('Full Name is required', 'error');
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return showToast('Please enter a valid email address', 'error');
    }
    
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      return showToast('Please enter a valid 10-digit phone number', 'error');
    }
    
    if (!formData.address.trim()) {
      return showToast('Full Address is required', 'error');
    }

    setIsApplicationSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProposal = (type) => {
    setSelectedProposal(type);
    setIsDocumentSection(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!documents.kycDocument || !documents.ndaDocument || !documents.signedAgreement) {
      showToast('Please upload all required documents (KYC, NDA, Agreement)', 'error');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) submitData.append(key, formData[key]);
      });
      
      submitData.append('role', selectedProposal.toLowerCase());
      submitData.append('franchiseType', selectedProposal.toLowerCase());
      submitData.append('commissionRate', selectedProposal === 'Referral' ? 10 : 25);
      
      submitData.append('kycDocument', documents.kycDocument);
      submitData.append('ndaDocument', documents.ndaDocument);
      submitData.append('signedAgreement', documents.signedAgreement);
      
      await api.post('/referral/upload-documents', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      showToast(`Successfully applied for ${selectedProposal} Partner! Pending Admin Approval.`, 'success');
      
      setIsModalOpen(false);
      setIsApplicationSubmitted(false);
      setIsDocumentSection(false);
      setSelectedProposal(null);
      setDocuments({ kycDocument: null, ndaDocument: null, signedAgreement: null });
      localStorage.removeItem('isModalOpen');
      localStorage.removeItem('isApplicationSubmitted');
      localStorage.removeItem('isDocumentSection');
      localStorage.removeItem('selectedProposal');
      localStorage.removeItem('franchiseFormData');
      
      // Navigate to the Schedule Meeting page after successful submission
      navigate('/schedule-meeting', { state: { partnerType: selectedProposal } });
      
    } catch (error) {
      console.error('Submit error:', error);
      showToast(error.response?.data?.message || 'Failed to submit application', 'error');
    } finally {
      setIsSubmitting(false);
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

  if (isModalOpen) {
    if (isApplicationSubmitted && isDocumentSection) {
      const getFileUrl = (filename) => {
        if (!filename) return null;
        if (filename.startsWith('http')) return filename;
        return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${filename}`;
      };
      
      const ndaUrl = getFileUrl(systemSettings?.ndaTemplateUrl);
      const agreementUrl = getFileUrl(systemSettings?.agreementTemplateUrl);

      return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <div className="flex-1 py-8 px-4 sm:px-6">
            <ApplicationStepper currentStep={2} />
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden animate-scale-in">
              <div className="bg-blue-600 p-8 text-white text-center">
                <h2 className="text-3xl font-bold">Upload Signed Documents</h2>
                <p className="text-blue-100 text-base mt-2">Please download the templates, sign them, and upload them back along with your KYC.</p>
              </div>
              
              <div className="p-8 md:p-10">
                <form onSubmit={handleFinalSubmit} className="space-y-8">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
                    <div className="border border-gray-200 rounded-xl p-4 md:p-6 text-center hover:shadow-md transition-shadow bg-gray-50 flex flex-col items-center justify-center">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2 md:mb-4">
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h4 className="font-bold text-gray-900 mb-1 md:mb-2 text-sm md:text-base">NDA Template</h4>
                      <p className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4">Download and sign the Non-Disclosure Agreement.</p>
                      {ndaUrl ? (
                        <a href={ndaUrl} target="_blank" rel="noreferrer" className="inline-flex items-center text-xs md:text-sm font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                          Download PDF &rarr;
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">Template not uploaded by Admin</span>
                      )}
                    </div>
                    
                    <div className="border border-gray-200 rounded-xl p-4 md:p-6 text-center hover:shadow-md transition-shadow bg-gray-50 flex flex-col items-center justify-center">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2 md:mb-4">
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h4 className="font-bold text-gray-900 mb-1 md:mb-2 text-sm md:text-base">Partnership Agreement</h4>
                      <p className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4">Download and sign the {selectedProposal || 'Partnership'} Agreement.</p>
                      {agreementUrl ? (
                        <a href={agreementUrl} target="_blank" rel="noreferrer" className="inline-flex items-center text-xs md:text-sm font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                          Download PDF &rarr;
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">Template not uploaded by Admin</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">1. KYC Document (Aadhar/PAN) <span className="text-red-500">*</span> <span className="text-gray-400 font-normal text-xs ml-1">(PDF, JPG, PNG up to 5MB)</span></label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file && file.size > 5 * 1024 * 1024) {
                            showToast('File size must be less than 5MB', 'error');
                            e.target.value = '';
                            return;
                          }
                          setDocuments({...documents, kycDocument: file});
                        }}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-200 rounded-lg p-1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">2. Upload Signed NDA <span className="text-red-500">*</span> <span className="text-gray-400 font-normal text-xs ml-1">(PDF, JPG, PNG up to 5MB)</span></label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file && file.size > 5 * 1024 * 1024) {
                            showToast('File size must be less than 5MB', 'error');
                            e.target.value = '';
                            return;
                          }
                          setDocuments({...documents, ndaDocument: file});
                        }}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-200 rounded-lg p-1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">3. Upload Signed Agreement <span className="text-red-500">*</span> <span className="text-gray-400 font-normal text-xs ml-1">(PDF, JPG, PNG up to 5MB)</span></label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file && file.size > 5 * 1024 * 1024) {
                            showToast('File size must be less than 5MB', 'error');
                            e.target.value = '';
                            return;
                          }
                          setDocuments({...documents, signedAgreement: file});
                        }}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-200 rounded-lg p-1"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-8 mt-8 flex gap-4 border-t border-gray-200">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1 py-3 text-lg"
                      onClick={() => setIsDocumentSection(false)}
                      disabled={isSubmitting}
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      variant="primary" 
                      className="flex-1 py-3 text-lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Submitting...</span>
                        </div>
                      ) : (
                        "Submit Final Application"
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (isApplicationSubmitted) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <div className="flex-1 py-12 px-4 sm:px-6">
            <ApplicationStepper currentStep={1} />
            <div className="max-w-6xl mx-auto mt-4">
              <div className="text-center mb-12 animate-scale-in">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Choose Your Partnership Proposal</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Your application details have been received. Please select the partnership model that best fits your goals to complete your registration.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch mt-4">
                {/* Referral Partner Card */}
                <div className="bg-white rounded-3xl shadow-sm hover:shadow-xl border border-gray-100 flex flex-col transition-all duration-300 animate-scale-in group">
                  <div className="p-8 pb-6 border-b border-gray-50 bg-gradient-to-br from-blue-50/50 to-white rounded-t-3xl">
                    <div className="inline-flex items-center justify-center px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold mb-6 tracking-wide uppercase">
                      Referral Partner
                    </div>
                    <div className="text-gray-500 text-sm font-medium mb-4">Best for: Individuals, Freelancers, Students</div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-4xl font-extrabold text-gray-900">₹10,000</span>
                    </div>

                    
                    <div className="flex flex-wrap gap-2 mb-2">
                       <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-100">Commission: 20%</span>
                       <span className="px-3 py-1 bg-gray-50 text-gray-700 text-xs font-bold rounded-lg border border-gray-200">Validity: 365 Days</span>
                    </div>
                  </div>
                  
                  <div className="p-8 pt-6 flex-1 flex flex-col bg-white rounded-b-3xl">
                    <p className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">What's included</p>
                    <ul className="space-y-3.5 mb-8 flex-1">
                      {[
                        'Easy onboarding process',
                        'Earn per successful referral',
                        'Training - 1 Week'
                      ].map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <svg className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                          <span className="text-gray-600 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      variant="outline" 
                      className="w-full py-3.5 text-sm font-semibold border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all"
                      onClick={() => handleSelectProposal('Referral')}
                    >
                      Select Referral Model
                    </Button>
                  </div>
                </div>

                {/* Dost Partner Card */}
                <div className="bg-white rounded-3xl shadow-md hover:shadow-2xl border border-indigo-100 flex flex-col relative transition-all duration-300 animate-scale-in transform md:-translate-y-2 group">
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-t-3xl"></div>
                  
                  <div className="p-8 pb-6 border-b border-gray-50 bg-gradient-to-br from-indigo-50/50 to-white rounded-t-3xl">
                    <div className="flex justify-between items-start mb-6">
                      <div className="inline-flex items-center justify-center px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold tracking-wide uppercase">
                        Dost Partner
                      </div>
                      <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                        Recommended
                      </span>
                    </div>
                    <div className="text-gray-500 text-sm font-medium mb-4">Best for: Small agencies, consultants</div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-4xl font-extrabold text-gray-900">₹49,999</span>
                    </div>

                    
                    <div className="flex flex-wrap gap-2 mb-2">
                       <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-100">Commission: 60%</span>
                       <span className="px-3 py-1 bg-gray-50 text-gray-700 text-xs font-bold rounded-lg border border-gray-200">Validity: 365 Days</span>
                    </div>
                  </div>
                  
                  <div className="p-8 pt-6 flex-1 flex flex-col bg-white rounded-b-3xl">
                    <p className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">Premium Features</p>
                    <ul className="grid grid-cols-2 gap-x-4 gap-y-3 mb-8 flex-1">
                      {[
                        'Maximum Commission 40%',
                        'Higher earnings potential',
                        'Dedicated support',
                        'Marketing resources',
                        'Training - 4 Weeks',
                        '4- Certification',
                        'Lead - 50 yearly',
                        'Promotion Material',
                        'Webpage Profile Listing',
                        'Visiting Cards',
                        'Professional Email ID',
                        'Ready Proposal',
                        'Support Number',
                        'CRM Access'
                      ].map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <svg className="h-4 w-4 text-indigo-500 mr-1.5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                          <span className="text-gray-600 text-[13px] leading-tight">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      variant="primary" 
                      className="w-full py-3.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all border-0"
                      onClick={() => handleSelectProposal('Dost')}
                    >
                      Select Dost Model
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-12">
                <button 
                  onClick={() => setIsApplicationSubmitted(false)}
                  className="text-gray-500 hover:text-gray-800 font-medium underline transition-colors"
                >
                  Go back to edit application details
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 py-8 px-4 sm:px-6">
          <ApplicationStepper currentStep={1} />
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden animate-scale-in">
            <div className="bg-blue-600 p-8 text-white text-center flex-shrink-0">
              <h2 className="text-3xl font-bold">Apply for Franchise</h2>
              <p className="text-blue-100 text-base mt-2">Fill out the details below to complete your franchise application</p>
            </div>
            
            <div className="p-6 md:p-10">
              <form onSubmit={handleApplyFranchiseSubmit} className="space-y-8 max-w-3xl mx-auto">
                
                {/* Mandatory Section */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-6">Required Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address <span className="text-red-500">*</span></label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number <span className="text-red-500">*</span></label>
                      <input
                        type="tel"
                        pattern="[0-9]{10}"
                        title="Please enter a valid 10-digit phone number"
                        value={formData.phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val.length <= 10) {
                            setFormData({...formData, phone: val});
                          }
                        }}
                        maxLength="10"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="Enter your 10-digit phone number"
                        required
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Address <span className="text-red-500">*</span></label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                        placeholder="Enter your complete address"
                        rows="2"
                        required
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* Optional Section */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-6 mt-8">Professional Details <span className="text-sm font-normal text-gray-500 ml-2">(Optional)</span></h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Business/Company Name</label>
                      <input
                        type="text"
                        value={formData.businessName}
                        onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="e.g. Acme Corp"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Current Profession/Industry</label>
                      <input
                        type="text"
                        value={formData.profession}
                        onChange={(e) => setFormData({...formData, profession: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="e.g. Digital Marketing, Sales"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Years of Experience</label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={formData.experience}
                        onChange={(e) => setFormData({...formData, experience: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="e.g. 5"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">LinkedIn / Website URL</label>
                      <input
                        type="text"
                        value={formData.linkedinUrl}
                        onChange={(e) => setFormData({...formData, linkedinUrl: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Service Category</label>
                      <input
                        type="text"
                        list="service-categories"
                        value={formData.preferredCategory}
                        onChange={(e) => setFormData({...formData, preferredCategory: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                        placeholder="Select or type a category..."
                      />
                      <datalist id="service-categories">
                        <option value="Website Development" />
                        <option value="SEO Services" />
                        <option value="Social Media Management" />
                        <option value="Digital Marketing" />
                        <option value="Google Ads" />
                        <option value="Meta Ads" />
                        <option value="Other" />
                      </datalist>
                    </div>
                  </div>
                </div>

                <div className="pt-8 mt-8 flex gap-4 border-t border-gray-200">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 py-3 text-lg"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    variant="primary" 
                    className="flex-1 py-3 text-lg"
                  >
                    Submit Application
                  </Button>
                </div>
              </form>
            </div>
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
            <p className="text-lg font-semibold text-blue-700 mb-6">
              {partner?.fullName}
            </p>
            <Button 
              variant="primary" 
              className="py-2.5 px-8 shadow-md"
              onClick={async () => {
                try {
                  const res = await api.get('/referral/dashboard');
                  const profile = res.data?.partner || res.data?.user || res.data;
                  if (profile) {
                    setFormData(prev => ({
                      ...prev,
                      name: profile.fullName || profile.name || prev.name,
                      email: profile.email || prev.email,
                      phone: profile.phone || prev.phone,
                      address: profile.address || prev.address,
                      businessName: profile.businessName || prev.businessName,
                    }));
                  }
                } catch (err) {
                  console.error('Could not fetch profile:', err);
                }
                setIsModalOpen(true);
              }}
            >
              Apply for Franchise
            </Button>
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
                  <Button 
                    variant="primary" 
                    fullWidth 
                    className="py-2.5 text-sm flex-1"
                    onClick={() => setIsModalOpen(true)}
                  >
                    Apply for Franchise
                  </Button>
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
          animation: scaleIn 0.3s ease-out forwards;
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