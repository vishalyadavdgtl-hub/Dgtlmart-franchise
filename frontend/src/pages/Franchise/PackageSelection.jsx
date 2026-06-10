import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { explorePackagesAPI } from '../../utils/api';
import { useToast } from '../../components/common/Toast';

export default function PackageSelection() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [packages, setPackages] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hoveredCard, setHoveredCard] = useState(null);
  const referralCode = searchParams.get('ref');

  useEffect(() => {
    // Check Auth
    const partnerToken = localStorage.getItem('partnerToken');
    
    if (!partnerToken) {
        // Redirect to Partner Login, preserving current location
        showToast('Please login as a partner to view packages', 'info');
        navigate('/partner-login', { state: { from: location } });
        return;
    }

    fetchPackages();
    window.scrollTo(0, 0);
  }, []);

const fetchPackages = async () => {
  try {
    const response = await explorePackagesAPI.getPackages();

    console.log("API DATA:", response.data); // debug

    const apiData = response.data.data; // Explore API wraps data in `data` again

    const fixedData = Object.fromEntries(
      Object.entries(apiData).map(([category, pkgs]) => [
        category,
        pkgs.map(pkg => ({
          ...pkg,
          name: pkg.Name,
          id: pkg._id
        }))
      ])
    );

    setPackages(fixedData);

  } catch (error) {
    console.error('Error fetching packages:', error);
  } finally {
    setLoading(false);
  }
};

  const handleSelectPackage = (category, pkg) => {
    const packageData = {
      category,
      packageName: pkg.Name,
      price: pkg.price,
      id: pkg.id
    };
    
    navigate(`/franchise-register/${pkg.id}`, {
      state: { package: packageData, referralCode }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar />
        <LoadingSpinner text="Loading premium packages..." />
      </div>
    );
  }

  const categories = [
    { id: 'all', name: 'All Services', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
    { id: 'Website Development', name: 'Web Dev', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
    { id: 'SEO', name: 'SEO', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
    { id: 'Social Media', name: 'Social Media', icon: 'M7 20l4-16m2 16l4-16M6 9h14M4 15h14' },
    { id: 'Digital Marketing', name: 'Digital Mkt', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
    { id: 'Google Ads', name: 'Google Ads', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { id: 'Meta Ads', name: 'Meta Ads', icon: 'M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5z' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />
      
      {/* Compact Hero Section */}
      <section className="relative pt-24 pb-12 md:pt-32 md:pb-20 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-0 w-64 md:w-96 h-64 md:h-96 bg-blue-600 rounded-full blur-[80px] md:blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-4 md:mb-6 leading-tight">
            Choose Your Path to
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Digital Excellence
            </span>
          </h1>
          <p className="text-slate-300 text-sm md:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Partner with us and launch your digital marketing empire. Comprehensive packages with enterprise-grade tools and 24/7 support.
          </p>

          {referralCode && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg"
            >
              <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-blue-100 text-xs font-medium">Referral applied:</span>
              <span className="text-white text-sm font-bold font-mono px-3 py-1 bg-blue-600/50 rounded-lg">
                {referralCode}
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-8 md:h-12 text-slate-50" preserveAspectRatio="none" viewBox="0 0 1200 120" fill="currentColor">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"></path>
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Category Filter */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`group flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 active:scale-95 ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                      : 'bg-white text-slate-700 hover:bg-white hover:text-blue-600 border border-slate-200 hover:border-blue-200 shadow-sm'
                  }`}
                >
                  <svg className={`w-4 h-4 transition-transform ${selectedCategory === cat.id ? '' : 'group-hover:scale-110'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={cat.icon} />
                  </svg>
                  <span className="whitespace-nowrap">{cat.name}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Package Sections */}
          <div className="space-y-16">
            <AnimatePresence mode="wait">
              {packages && Object.entries(packages).map(([categoryKey, categoryPackages]) => {
                if (selectedCategory !== 'all' && selectedCategory !== categoryKey) return null;

                return (
                  <motion.div
                    key={categoryKey}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    {/* Category Header */}
                    <div className="flex items-center gap-4">
                      <h2 className="text-xl md:text-2xl font-bold text-slate-800 capitalize flex items-center gap-3">
                        <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                        {categoryKey.replace(/([A-Z])/g, ' $1').trim()}
                        <span className="text-slate-400 font-normal text-sm">({categoryPackages.length})</span>
                      </h2>
                      <div className="flex-1 h-px bg-slate-200"></div>
                    </div>

                    {/* Package Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categoryPackages.map((pkg, idx) => (
                        <motion.div
                          key={pkg._id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.1 }}
                          className="bg-white rounded-2xl shadow-md hover:shadow-xl border border-slate-200 transition-all group p-6 flex flex-col"
                        >
                          <div className="mb-6">
                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">{pkg.Name}</h3>
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-bold text-slate-900 tracking-tight">₹{pkg.price.toLocaleString('en-IN')}</span>
                            </div>
                          </div>

                          {/* Features */}
                          <div className="space-y-3 mb-8 flex-1">
                            {pkg.features && pkg.features.slice(0, 8).map((feature, fIdx) => {
                               const [key, value] = typeof feature === 'string' ? feature.split(':') : ['', ''];
                               return (
                                <div key={fIdx} className="flex items-center justify-between text-xs">
                                  <span className="text-slate-500 font-medium">{key.trim()}</span>
                                  <span className="text-slate-900 font-bold">{value?.trim() || 'Yes'}</span>
                                </div>
                               );
                            })}
                          </div>

                          <button
                            onClick={() => handleSelectPackage(categoryKey, pkg)}
                            className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition-all shadow-lg active:scale-95"
                          >
                            Select Package
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <Footer />
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}