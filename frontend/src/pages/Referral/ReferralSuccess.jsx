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
    const fetchSettingsAndProfile = async () => {
      try {
        const res = await api.get('/franchise/settings');
        setSystemSettings(res.data);
      } catch (err) {
        console.error('Failed to fetch settings', err);
      }

      try {
        const res = await api.get('/referral/dashboard');
        const profile = res.data?.partner || res.data?.user || res.data;
        if (profile) {
          setPartnerData(prev => ({
            ...prev,
            partner: {
              ...(prev?.partner || {}),
              ...profile
            }
          }));
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    };
    fetchSettingsAndProfile();
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
      if (parsed.name && parsed.email && parsed.phone && parsed.cityAndState) {
        return parsed;
      }
    }

    // Fresh fill from partner profile
    return {
      name: p?.fullName || p?.name || '',
      email: p?.email || '',
      phone: p?.phone || '',
      cityAndState: p?.cityAndState || '',
      professionalBackground: p?.professionalBackground || '',
      marketingExperience: p?.marketingExperience || '',
      investmentBudget: p?.investmentBudget || '',
      franchiseStartDate: p?.franchiseStartDate || '',
      existingSetup: p?.existingSetup || '',
      revenueTarget: p?.revenueTarget || '',
      consultationReadiness: p?.consultationReadiness || ''
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
    if (partnerData) {
      localStorage.setItem('referralSuccessData', JSON.stringify(partnerData));
    }
  }, [partnerData]);

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

  const handleApplyFranchiseSubmit = async (e) => {
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
    
    if (!formData.cityAndState || !formData.cityAndState.trim()) {
      return showToast('City & State is required', 'error');
    }
    
    const requiredFields = [
      { key: 'professionalBackground', label: 'Professional Background' },
      { key: 'marketingExperience', label: 'Marketing Experience' },
      { key: 'investmentBudget', label: 'Investment Budget' },
      { key: 'franchiseStartDate', label: 'Franchise Start Date' },
      { key: 'existingSetup', label: 'Existing Setup' },
      { key: 'revenueTarget', label: 'Revenue Target' },
      { key: 'consultationReadiness', label: 'Consultation Readiness' }
    ];

    for (const field of requiredFields) {
      if (!formData[field.key]) {
        return showToast(`Please answer: ${field.label}`, 'error');
      }
    }

    try {
      setIsSubmitting(true);
      const payload = {
        userId: partner?.id || partner?._id,
        ...formData
      };
      
      const res = await api.post('/referral/submit-details', payload);
      showToast(res.data.message || 'Details submitted! Waiting for Admin approval.', 'success');
      
      // Update local state
      setPartnerData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          partner: { ...prev.partner, detailsStatus: 'PENDING' }
        };
      });
      
      setIsModalOpen(false); // Close the modal
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to submit details', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectProposal = (type) => {
    setSelectedProposal(type);
    setIsDocumentSection(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!documents.kycDocument || !documents.ndaDocument || !documents.signedAgreement) {
      showToast('Please check all agreements to proceed', 'error');
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
      submitData.append('commissionRate', selectedProposal === 'Referral' ? 20 : 60);
      
      if (partner?.id || partner?._id) {
        submitData.append('userId', partner.id || partner._id);
      }
      
      // Files are no longer required, user just checks boxes
      // if (documents.kycDocument instanceof File) submitData.append('kycDocument', documents.kycDocument);
      // if (documents.ndaDocument instanceof File) submitData.append('ndaDocument', documents.ndaDocument);
      // if (documents.signedAgreement instanceof File) submitData.append('signedAgreement', documents.signedAgreement);
      
      submitData.append('agreementAccepted', 'true');
      
      await api.post('/referral/upload-documents', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      showToast(`Successfully agreed to terms for ${selectedProposal} Partner!`, 'success');
      
      navigate('/payment', { state: { franchiseType: selectedProposal, partner: { ...partner, role: selectedProposal.toLowerCase() } } });
      
      setIsModalOpen(false);
      setIsApplicationSubmitted(false);
      setIsDocumentSection(false);
      setDocuments({ kycDocument: null, ndaDocument: null, signedAgreement: null });
      localStorage.removeItem('isModalOpen');
      localStorage.removeItem('isApplicationSubmitted');
      localStorage.removeItem('isDocumentSection');
      localStorage.removeItem('selectedProposal');
      localStorage.removeItem('franchiseFormData');
      // Navigate to the Payment page after successful document submission
      navigate('/payment', { state: { franchiseType: selectedProposal, partner: partner } });
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
            <ApplicationStepper currentStep={4} />
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden animate-scale-in">
              <div className="bg-blue-600 p-8 text-white text-center">
                <h2 className="text-3xl font-bold">Review & Agree to Documents</h2>
                <p className="text-blue-100 text-base mt-2">Please read the agreements below and confirm your acceptance to proceed.</p>
              </div>
              
              <div className="p-8 md:p-10">
                <form onSubmit={handleFinalSubmit} className="space-y-8">
                  


                  <div className="space-y-6 bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                    <label className="flex items-start gap-4 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={!!documents.kycDocument}
                        onChange={(e) => setDocuments({...documents, kycDocument: e.target.checked})}
                        className="mt-1 w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <div>
                        <span className="block text-sm font-semibold text-gray-900">1. Information Accuracy <span className="text-red-500">*</span></span>
                        <span className="block text-xs text-gray-500 mt-1">I confirm that all personal and professional details provided in this application are accurate and true to the best of my knowledge.</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-4 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={!!documents.ndaDocument}
                        onChange={(e) => setDocuments({...documents, ndaDocument: e.target.checked})}
                        className="mt-1 w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <div>
                        <span className="block text-sm font-semibold text-gray-900">2. Confidentiality Agreement <span className="text-red-500">*</span></span>
                        <span className="block text-xs text-gray-500 mt-1">I agree to maintain strict confidentiality regarding DGTLmart's business models, pricing, and client data as per standard Non-Disclosure guidelines.</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-4 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={!!documents.signedAgreement}
                        onChange={(e) => setDocuments({...documents, signedAgreement: e.target.checked})}
                        className="mt-1 w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <div>
                        <span className="block text-sm font-semibold text-gray-900">3. Standard Terms & Conditions <span className="text-red-500">*</span></span>
                        <span className="block text-xs text-gray-500 mt-1">I understand and agree to the standard terms of the DGTLmart {selectedProposal || 'Partnership'} Program, including the commission structures and payout timelines.</span>
                      </div>
                    </label>
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
            <ApplicationStepper currentStep={4} />
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
                        'Maximum Commission 60%',
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
                
                {/* Qualification Questions */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-6">Qualification Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">1. Full Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="Short answer"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">2. Mobile / WhatsApp Number <span className="text-red-500">*</span></label>
                      <input
                        type="tel"
                        pattern="[0-9]{10}"
                        value={formData.phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val.length <= 10) setFormData({...formData, phone: val});
                        }}
                        maxLength="10"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="Phone number"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">3. Email Address <span className="text-red-500">*</span></label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="Email"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">4. City & State <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={formData.cityAndState || ''}
                        onChange={(e) => setFormData({...formData, cityAndState: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="Short answer"
                        required
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">5. What is your current professional background? <span className="text-red-500">*</span></label>
                      <select
                        value={formData.professionalBackground || ''}
                        onChange={(e) => setFormData({...formData, professionalBackground: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                        required
                      >
                        <option value="" disabled>Select an option</option>
                        <option value="Business Owner">Business Owner</option>
                        <option value="Digital Marketing Professional">Digital Marketing Professional</option>
                        <option value="Sales & Marketing Professional">Sales & Marketing Professional</option>
                        <option value="IT/Technology Professional">IT/Technology Professional</option>
                        <option value="Freelancer/Consultant">Freelancer/Consultant</option>
                        <option value="Job/Corporate Professional">Job/Corporate Professional</option>
                        <option value="Student">Student</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">6. Do you have experience in Digital Marketing / IT / Sales? <span className="text-red-500">*</span></label>
                      <select
                        value={formData.marketingExperience || ''}
                        onChange={(e) => setFormData({...formData, marketingExperience: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                        required
                      >
                        <option value="" disabled>Select an option</option>
                        <option value="Yes – 5+ years">Yes – 5+ years</option>
                        <option value="Yes – 2–5 years">Yes – 2–5 years</option>
                        <option value="Yes – Less than 2 years">Yes – Less than 2 years</option>
                        <option value="No">No</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">7. What is your investment budget for the DGTLmart Franchise? <span className="text-red-500">*</span></label>
                      <select
                        value={formData.investmentBudget || ''}
                        onChange={(e) => setFormData({...formData, investmentBudget: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                        required
                      >
                        <option value="" disabled>Select an option</option>
                        <option value="₹10,000 – ₹50,000">₹10,000 – ₹50,000</option>
                        <option value="₹50,000 – ₹1.5 Lakh">₹50,000 – ₹1.5 Lakh</option>
                        <option value="₹1.5 Lakh – ₹5 Lakh">₹1.5 Lakh – ₹5 Lakh</option>
                        <option value="Above ₹5 Lakh">Above ₹5 Lakh</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">8. When are you planning to start the franchise? <span className="text-red-500">*</span></label>
                      <select
                        value={formData.franchiseStartDate || ''}
                        onChange={(e) => setFormData({...formData, franchiseStartDate: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                        required
                      >
                        <option value="" disabled>Select an option</option>
                        <option value="Immediately">Immediately</option>
                        <option value="Within 30 Days">Within 30 Days</option>
                        <option value="1–3 Months">1–3 Months</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">9. Do you have an existing office/business setup? <span className="text-red-500">*</span></label>
                      <select
                        value={formData.existingSetup || ''}
                        onChange={(e) => setFormData({...formData, existingSetup: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                        required
                      >
                        <option value="" disabled>Select an option</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                        <option value="Planning to set one up">Planning to set one up</option>
                        <option value="Work from Home">Work from Home</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">10. What is your expected monthly revenue target from the franchise? <span className="text-red-500">*</span></label>
                      <select
                        value={formData.revenueTarget || ''}
                        onChange={(e) => setFormData({...formData, revenueTarget: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                        required
                      >
                        <option value="" disabled>Select an option</option>
                        <option value="Below ₹50,000">Below ₹50,000</option>
                        <option value="₹50,000 – ₹1 Lakh">₹50,000 – ₹1 Lakh</option>
                        <option value="₹1 Lakh – ₹3 Lakh">₹1 Lakh – ₹3 Lakh</option>
                        <option value="₹3 Lakh – ₹5 Lakh">₹3 Lakh – ₹5 Lakh</option>
                        <option value="₹5 Lakh+">₹5 Lakh+</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">11. Are you ready for a franchise consultation call? <span className="text-red-500">*</span></label>
                      <select
                        value={formData.consultationReadiness || ''}
                        onChange={(e) => setFormData({...formData, consultationReadiness: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                        required
                      >
                        <option value="" disabled>Select an option</option>
                        <option value="Yes, Call Me">Yes, Call Me</option>
                        <option value="Yes, WhatsApp Me">Yes, WhatsApp Me</option>
                        <option value="I need more information first">I need more information first</option>
                      </select>
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
        <div className={`transition-all duration-700 transform ${pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Success Header - More Premium */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-12 mb-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-blue-500"></div>
            
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 rounded-full mb-6 animate-scale-in">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Registration Successful!
            </h1>
            
            <div className="bg-amber-50/80 border border-amber-200/60 rounded-2xl p-5 mb-8 inline-block text-left max-w-lg shadow-sm">
              <div className="flex gap-4">
                <div className="mt-0.5 bg-amber-100 p-1.5 rounded-full text-amber-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-amber-900 font-bold text-sm uppercase tracking-wider mb-1">Account Pending Approval</p>
                  <p className="text-amber-800/80 text-sm leading-relaxed">
                    Your account has been created and is currently being reviewed by our team. You will be able to log in to your dashboard once an admin verifies your account.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-1 mb-8">
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">
                Welcome to the DGTLmart Partner Program
              </p>
              <p className="text-2xl font-bold text-blue-700">
                {partner?.fullName}
              </p>
            </div>
            
            <Button 
              variant={partner?.detailsStatus === 'PENDING' || partner?.meetingStatus === 'PENDING' || partner?.paymentStatus === 'paid' ? "outline" : "primary"}
              className={`py-3.5 px-8 text-base font-bold rounded-xl transition-all ${
                partner?.detailsStatus === 'PENDING' || partner?.meetingStatus === 'PENDING' || partner?.paymentStatus === 'paid' 
                  ? '!bg-blue-700 !text-white !border-blue-700 !border-2 cursor-not-allowed disabled:!opacity-100 shadow-md' 
                  : 'shadow-lg shadow-blue-200'
              }`}
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
                      cityAndState: profile.cityAndState || prev.cityAndState,
                      professionalBackground: profile.professionalBackground || prev.professionalBackground,
                      marketingExperience: profile.marketingExperience || prev.marketingExperience,
                      investmentBudget: profile.investmentBudget || prev.investmentBudget,
                      franchiseStartDate: profile.franchiseStartDate || prev.franchiseStartDate,
                      existingSetup: profile.existingSetup || prev.existingSetup,
                      revenueTarget: profile.revenueTarget || prev.revenueTarget,
                      consultationReadiness: profile.consultationReadiness || prev.consultationReadiness,
                    }));
                    
                    if (profile.detailsStatus === 'PENDING') {
                      showToast('Your details are pending admin approval.', 'info');
                      setPartnerData(prev => ({...prev, partner: {...prev.partner, detailsStatus: 'PENDING'}}));
                      return;
                    }

                    if (profile.detailsStatus === 'APPROVED') {
                      if (!profile.meetingStatus || profile.meetingStatus === 'NOT_SCHEDULED') {
                        navigate('/schedule-meeting', { state: { partner: profile } });
                        return;
                      }
                      if (profile.meetingStatus === 'PENDING') {
                        showToast('Your meeting completion is pending admin approval.', 'info');
                        setPartnerData(prev => ({...prev, partner: {...prev.partner, meetingStatus: 'PENDING'}}));
                        return;
                      }
                      if (profile.meetingStatus === 'COMPLETED') {
                        setIsApplicationSubmitted(true);
                        setIsModalOpen(true);
                        return;
                      }
                    } else {
                      setIsApplicationSubmitted(false);
                      setIsModalOpen(true);
                    }
                  } else {
                    setIsModalOpen(true);
                  }
                } catch (err) {
                  console.error('Could not fetch profile:', err);
                  setIsModalOpen(true);
                }
              }}
              disabled={partner?.detailsStatus === 'PENDING' || partner?.meetingStatus === 'PENDING' || partner?.paymentStatus === 'paid'}
            >
              <div className="flex items-center gap-2 justify-center">
                {(partner?.detailsStatus === 'PENDING' || partner?.meetingStatus === 'PENDING' || partner?.paymentStatus === 'paid') && (
                  <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {partner?.paymentStatus === 'paid' ? 'Paid - Pending Final Activation' 
                 : partner?.detailsStatus === 'PENDING' ? 'Details Pending Approval' 
                 : (partner?.detailsStatus === 'APPROVED' && (!partner?.meetingStatus || partner?.meetingStatus === 'NOT_SCHEDULED')) ? 'Schedule Meeting'
                 : (partner?.detailsStatus === 'APPROVED' && partner?.meetingStatus === 'PENDING') ? 'Meeting Pending Approval'
                 : (partner?.detailsStatus === 'APPROVED' && partner?.meetingStatus === 'COMPLETED') ? 'Proceed to Application'
                 : 'Apply for Franchise'}
              </div>
            </Button>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
            <div className="p-8">
              {/* Referral Code Info Section */}
              <div className="mb-10">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/50 rounded-2xl p-6 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <svg className="w-16 h-16 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-blue-900 mb-2 relative z-10">
                    Referral Code & Link
                  </h3>
                  <p className="text-sm text-blue-800/80 max-w-lg mx-auto relative z-10">
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
                    disabled={partner?.detailsStatus === 'PENDING' || partner?.meetingStatus === 'PENDING'}
                    onClick={async () => {
                      if (partner?.detailsStatus === 'PENDING' || partner?.meetingStatus === 'PENDING') return;
                      
                      if (partner?.detailsStatus === 'APPROVED') {
                        if (!partner?.meetingStatus || partner?.meetingStatus === 'NOT_SCHEDULED') {
                          navigate('/schedule-meeting', { state: { partner } });
                          return;
                        }
                        if (partner?.meetingStatus === 'COMPLETED') {
                          setIsApplicationSubmitted(true);
                          setIsModalOpen(true);
                          return;
                        }
                      } else {
                        setIsApplicationSubmitted(false);
                        setIsModalOpen(true);
                      }
                    }}
                  >
                    {partner?.detailsStatus === 'PENDING' ? 'Details Pending Approval' 
                     : (partner?.detailsStatus === 'APPROVED' && (!partner?.meetingStatus || partner?.meetingStatus === 'NOT_SCHEDULED')) ? 'Schedule Meeting'
                     : (partner?.detailsStatus === 'APPROVED' && partner?.meetingStatus === 'PENDING') ? 'Meeting Pending Approval'
                     : (partner?.detailsStatus === 'APPROVED' && partner?.meetingStatus === 'COMPLETED') ? 'Proceed to Application'
                     : 'Apply for Franchise'}
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