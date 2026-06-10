import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useToast } from '../components/common/Toast';
import { franchiseAPI } from '../utils/api';

export default function Contact() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
    agreed: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.agreed) {
      showToast('Please agree to the Terms & Conditions', 'error');
      return;
    }
    
    setLoading(true);
    try {
      await franchiseAPI.submitInquiry({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        service: formData.service,
        message: formData.message
      });
      
      showToast('Message sent successfully! We will get back to you soon.', 'success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        message: '',
        agreed: false
      });
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      showToast(error.response?.data?.error || 'Failed to send message. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      
      {/* Hero Section - Compact */}
     <section className="relative pt-24 pb-12 overflow-hidden border-b border-slate-100">
  {/* Background Image */}
  <div className="absolute inset-0">
    <div 
      className="absolute inset-0 bg-cover bg-center bg-no-repeat"
      style={{ 
        backgroundImage: `url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1800')`
      }}
    ></div>
    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/93 via-slate-900/90 to-blue-800/88"></div>
  </div>

  {/* Decorative Grid Pattern */}
  <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
  
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.8 }}
    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center"
  >
    <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
      Contact Us
    </h1>
    <div className="mt-3 flex items-center justify-center gap-2 text-white font-semibold text-sm">
      <a href="/" className="hover:text-yellow-500 transition-colors">Home</a>
      <span className="text-white">/</span>
      <span className="text-white">Contact Us</span>
    </div>
  </motion.div>
</section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-stretch">
          
          {/* Left Side: Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1"
          >
            <div className="space-y-4 mb-10">
              <span className="inline-block px-3 py-1 bg-orange-50 text-orange-600 font-bold uppercase tracking-widest text-[10px] rounded-full border border-orange-100">
                CONTACT NOW
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-[#0a1d37] leading-tight">
                Have Question? <br className="hidden md:block"/>Write a Message
              </h2>
              <p className="text-slate-500 text-base md:text-lg leading-relaxed max-w-xl">
                We will catch you as soon as we receive the message. We are committed to provide better quality service.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="relative border-b border-slate-200 group focus-within:border-blue-500 transition-colors">
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Full Name *"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-0 py-3 bg-transparent outline-none text-slate-800 placeholder:text-slate-400 font-semibold text-base transition-all"
                  />
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-focus-within:w-full"></div>
                </div>
                
                <div className="relative border-b border-slate-200 group focus-within:border-blue-500 transition-colors">
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="Email Address *"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-0 py-3 bg-transparent outline-none text-slate-800 placeholder:text-slate-400 font-semibold text-base transition-all"
                  />
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-focus-within:w-full"></div>
                </div>

                <div className="relative border-b border-slate-200 group focus-within:border-blue-500 transition-colors">
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="Phone Number *"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-0 py-3 bg-transparent outline-none text-slate-800 placeholder:text-slate-400 font-semibold text-base transition-all"
                  />
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-focus-within:w-full"></div>
                </div>

                <div className="relative border-b border-slate-200 group focus-within:border-blue-500 transition-colors">
                  <select
                    name="service"
                    required
                    value={formData.service}
                    onChange={handleChange}
                    className="w-full px-0 py-3 bg-transparent outline-none text-slate-800 appearance-none cursor-pointer font-semibold text-base pr-8"
                  >
                    <option value="" disabled>Select Service / Inquiry Type *</option>
                    <option value="Buy a Franchise">Buy a Franchise</option>
                    <option value="Referral Partnership">Referral Partnership</option>
                    <option value="Website Development">Website Development</option>
                    <option value="SEO & Social Media">SEO & Social Media</option>
                    <option value="Performance Marketing (Ads)">Performance Marketing (Ads)</option>
                    <option value="Partner Cards">Partner Cards</option>
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Support">Support</option>
                  </select>
                  <div className="absolute right-0 bottom-4 pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-focus-within:w-full"></div>
                </div>
              </div>

              <div className="relative border-b border-slate-200 group focus-within:border-blue-500 transition-colors">
                <textarea
                  name="message"
                  required
                  rows="3"
                  placeholder="Your Message *"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-0 py-3 bg-transparent outline-none text-slate-800 placeholder:text-slate-400 font-semibold text-base resize-none transition-all"
                ></textarea>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-focus-within:w-full"></div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4">
                <label className="flex items-center gap-3 cursor-pointer group select-none">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="agreed"
                      id="agreed"
                      checked={formData.agreed}
                      onChange={handleChange}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 border-2 border-slate-300 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all flex items-center justify-center group-hover:border-blue-400">
                      <svg className={`w-3 h-3 text-white transform transition-transform duration-200 ${formData.agreed ? 'scale-100' : 'scale-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <span className="text-slate-500 font-semibold text-sm group-hover:text-slate-700 transition-colors">
                    Accept terms-conditions
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-10 py-4 bg-[#0a1d37] text-white font-extrabold rounded-xl hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-blue-900/10 disabled:opacity-70 disabled:scale-100 whitespace-nowrap"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Sending...
                    </div>
                  ) : 'SEND MESSAGE'}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Right Side: Contact Info */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:w-1/3 flex flex-col gap-6"
          >
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow group">
              <div className="flex items-start gap-4 md:gap-5">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-colors">
                  <svg className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1 md:mb-2">Visit Our Office</h3>
                  <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                    G-31, Sector-3, Noida,<br />
                    Uttar Pradesh (201301)
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow group">
              <div className="flex items-start gap-4 md:gap-5">
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0 group-hover:bg-green-600 transition-colors">
                  <svg className="w-6 h-6 text-green-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1 md:mb-2">Call Us</h3>
                  <a href="tel:+919716301323" className="block text-slate-600 text-sm md:text-base hover:text-blue-600 transition-colors">+91 9716301323</a>
                  <a href="tel:+919716301323" className="block text-slate-600 text-sm md:text-base hover:text-blue-600 transition-colors">+91 9716301323</a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow group">
              <div className="flex items-start gap-4 md:gap-5">
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 group-hover:bg-purple-600 transition-colors">
                  <svg className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1 md:mb-2">Email Us</h3>
                  <a href="mailto:info@dgtlmart.com" className="block text-slate-600 text-sm md:text-base hover:text-blue-600 transition-colors">info@dgtlmart.com</a>
                  <a href="mailto:support@dgtlmart.com" className="block text-slate-600 text-sm md:text-base hover:text-blue-600 transition-colors">support@dgtlmart.com</a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
