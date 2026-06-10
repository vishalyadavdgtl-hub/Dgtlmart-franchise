import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useEffect, useRef, useState } from 'react';
import CountUp from '../components/common/CountUp';

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const sectionRefs = useRef([]);

  useEffect(() => {
    // Trigger page load animation
    setIsLoaded(true);
    
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    // Observe all section refs
    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white overflow-x-hidden">
      <Navbar />
      
      {/* Hero Section */}
     <section 
  className={`relative min-h-[60vh] flex items-center overflow-hidden transition-all duration-1000 ${
    isLoaded ? 'opacity-100' : 'opacity-0'
  }`}
>
  {/* Background with Gradient Overlay */}
  <div className="absolute inset-0 z-0">
    <div 
      className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10000ms]"
      style={{ 
        backgroundImage: `url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1800')`,
        transform: isLoaded ? 'scale(1)' : 'scale(1.1)'
      }}
    ></div>
    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/93 via-slate-900/90 to-blue-800/88"></div>
  </div>

  <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
      {/* Left Content */}
      <div className={`text-center lg:text-left transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-xs md:sm font-semibold mb-6">
          <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse"></span>
          India's #1 Digital Marketing Franchise
        </div>
        
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          Scale Your Entrepreneurial Journey
          <br className="hidden md:block" />
          <span className="text-blue-300">
            With DGTLmart
          </span>
        </h1>
        
        <p className="text-base md:text-lg text-blue-100 mb-8 md:mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
          Step into the fastest-growing digital marketing industry and launch your own profitable business with DGTLmart. proven model, complete execution support.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
          <Link
            to="/referral-partner"
            className="inline-flex items-center justify-center bg-white text-blue-900 px-8 py-4 rounded-xl font-bold text-base md:text-lg hover:bg-blue-50 transition-all duration-300 shadow-xl active:scale-95"
          >
            Become a Partner
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          
          <Link
            to="/buy-franchise"
            className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white rounded-xl font-bold text-base md:text-lg hover:bg-white/10 transition-all duration-300"
          >
            Explore Plans
          </Link>
        </div>
      </div>
      
      {/* Right Image - Responsive Display */}
      <div className={`relative transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="relative max-w-2xl mx-auto">
          <img 
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800"
            alt="Marketing Dashboard"
            className="w-full h-auto rounded-3xl shadow-2xl border border-white/10"
          />
          
          {/* Stats Badge - Hidden on mobile, shown on LG */}
          <div className="hidden lg:block absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-2xl border border-slate-100 transition-transform hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Revenue Milestone</p>
                <p className="text-2xl font-black text-slate-900">₹2.5 Cr+</p>
              </div>
            </div>
          </div>
          
          {/* Partner Count Badge - Bottom right on mobile, Top right on LG */}
          <div className="absolute -bottom-4 -right-4 lg:bottom-auto lg:-top-8 lg:-right-8 bg-blue-600 text-white p-5 rounded-2xl shadow-2xl transition-transform hover:scale-105">
            <p className="text-2xl md:text-3xl font-black">500+</p>
            <p className="text-[10px] md:text-sm font-bold uppercase tracking-wider">Active Partners</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

      <section 
        ref={el => sectionRefs.current[0] = el}
        className="relative z-20 mt-8 mb-12 max-w-6xl mx-auto px-6 sm:px-6 transform transition-all duration-700 opacity-0 translate-y-10"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 grid grid-cols-2 md:grid-cols-4 gap-8 divide-y-2 md:divide-y-0 md:divide-x divide-gray-100">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center text-center p-4">
              <span className="text-3xl md:text-4xl font-extrabold text-blue-600 mb-2">
                <CountUp 
                  end={stat.numericValue} 
                  suffix={stat.suffix} 
                  prefix={stat.prefix} 
                  duration={2500}
                />
              </span>
              <span className="text-sm md:text-base font-medium text-gray-600">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

    {/* Two Ways to Partner Section */}
    <section 
      ref={el => sectionRefs.current[1] = el}
      className="py-12 md:py-16 bg-white transform transition-all duration-700 opacity-0 translate-y-10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 animate-fade-up">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Two Ways to Partner with Us
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Choose the partnership model that works best for you
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Referral Partner Card */}
          <div className="group relative bg-white border border-slate-200 rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden flex flex-col justify-between">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-[100px] -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-125"></div>
            
            <div className="relative z-10">
              <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-widest border border-green-200">
                Zero Investment
              </span>
              <h3 className="text-3xl font-bold text-slate-900 mb-4 group-hover:text-green-600 transition-colors">
                Become a <br />Referral Partner
              </h3>
              <p className="text-slate-600 mb-8 leading-relaxed text-lg">
                Join our network for free and earn the highest commissions in the industry by referring franchise buyers.
              </p>
              
              <ul className="space-y-4 mb-10">
                {[
                  'Instant onboard & unique link',
                  'High payout on every referral',
                  'Real-time tracking dashboard',
                  'Dedicated partner manager'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-white transition-all duration-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-slate-700 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link 
              to="/referral-partner" 
              className="group/btn relative px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg text-center overflow-hidden transition-all duration-300 hover:shadow-lg active:scale-95"
            >
              <span className="relative z-10 transition-colors group-hover/btn:text-white flex items-center justify-center gap-2">
                Join as Partner
                <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-green-600 transform translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
            </Link>
          </div>

          {/* Franchise Owner Card */}
          <div className="group relative bg-slate-900 border border-slate-800 rounded-3xl p-10 shadow-2xl hover:shadow-[0_20px_50px_rgba(37,99,235,0.3)] transition-all duration-500 hover:-translate-y-2 overflow-hidden flex flex-col justify-between">
            {/* Animated Glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] group-hover:bg-blue-600/30 transition-all duration-500"></div>
            
            <div className="relative z-10">
              <span className="inline-block bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-widest animate-pulse">
                High ROI Business
              </span>
              <h3 className="text-3xl font-bold text-white mb-4">
                Own a DGTLmart <br />Franchise
              </h3>
              <p className="text-slate-400 mb-8 leading-relaxed text-lg">
                Launch your own multi-service digital agency with our 360° support, training, and brand authority.
              </p>
              
              <ul className="space-y-4 mb-10">
                {[
                  'Full business setup & training',
                  '3-month intensive mentoring',
                  'Marketing & Sales templates',
                  'Verified lead generation'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-slate-300 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link 
              to="/buy-franchise" 
              className="group/btn relative px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold text-lg text-center overflow-hidden transition-all duration-300 hover:shadow-lg active:scale-95"
            >
              <span className="relative z-10 flex items-center justify-center gap-2 group-hover/btn:text-white">
                View Packages
                <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-blue-600 transform translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
            </Link>
          </div>
        </div>
      </div>
    </section>

    {/* New Why Choose Section */}
    <section 
      ref={el => sectionRefs.current[2] = el}
      className="py-12 md:py-16 bg-white overflow-hidden transform transition-all duration-1000 opacity-0 translate-y-10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left Content */}
          <div className="lg:w-1/2 space-y-8">
            <div className="space-y-4">
              <span className="text-orange-500 font-bold uppercase tracking-widest text-sm">
                WHY CHOOSE US
              </span>
              <h2 className="text-4xl font-bold md:text-4xl text-slate-900 leading-tight">
                Why DGTLmart Is a <span className="text-orange-500">Trusted Digital Marketing </span> Franchise Partner

              </h2>
            </div>

            <div className="space-y-8">
              {[
                {
                  title: 'Proven & Streamlined Business Framework',
                  desc: 'DGTLmart provides a ready-to-deploy franchise model with defined processes, tools, and workflows—making it easy to acquire clients, manage campaigns, and scale operations efficiently from day one.',

                  icon: (
                    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )
                },
                {
                  title: 'Dedicated Expert Support Team',
                  desc: 'As a DGTLmart franchise partner, you’re backed by a centralized team of digital marketing experts. From strategy and execution to reporting and optimization, we work as an extension of your agency to ensure consistent results.',
                  icon: (
                    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )
                },
                {
                  title: 'Faster Go-to-Market & Reliable Delivery',
                  desc: 'Time-to-market is critical when building a digital business. Our structured onboarding, service playbooks, and execution support help you start selling quickly and deliver projects on time—without compromising quality.',
                  icon: (
                    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )
                }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-6 group hover:translate-x-2 transition-transform duration-300">
                  <div className="shrink-0 w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    {item.icon}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content / Image Area */}
          <div className="lg:w-1/2 relative">
            <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl border-b-8 border-r-8 border-blue-600">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800" 
                alt="Team Collaboration" 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 scale-105 hover:scale-100"
              />
              <div className="absolute inset-0 bg-blue-900/10 mix-blend-multiply"></div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-50 animate-pulse"></div>
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-orange-100 rounded-full blur-3xl opacity-30 animate-pulse delay-1000"></div>
            
            <div className="mt-12 space-y-8 animate-fade-up">
              <p className="text-slate-500 font-medium leading-relaxed italic border-l-4 border-orange-500 pl-6">
                "We keep the franchise onboarding and business operations simple, structured, and growth-driven—so you can focus on scaling your digital marketing business with confidence."
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-8">
                <div className="space-y-4">
                  <h3 className="text-3xl text-slate-900 flex items-center gap-2">
                   Let’s Build Your
 <span className="text-orange-500 underline decoration-4 underline-offset-8">Digital Marketing</span>Business Together
                  </h3>
                  <p className="text-slate-600 font-medium">
                    <span className="text-orange-500">Act now!</span> Partner with DGTLmart and leverage a proven franchise model, expert execution support, and high-growth digital solutions designed to accelerate your success.
                  </p>
                </div>
                <Link 
                  to="/buy-franchise"
                  className="shrink-0 inline-flex items-center justify-center w-15 h-15 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-all shadow-xl hover:shadow-orange-500/20 active:scale-95 group"
                >
                  <svg className="w-8 h-8 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

   

      {/* FAQ Section */}
      <section 
        ref={el => sectionRefs.current[4] = el}
        className="py-12 md:py-16 bg-slate-50 transform transition-all duration-700 opacity-0 translate-y-10"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
            <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details 
                key={index} 
                className="group bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <span className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {faq.question}
                  </span>
                  <span className="transition-transform duration-300 group-open:rotate-180">
                    <svg className="w-6 h-6 text-slate-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-50 pt-4">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        ref={el => sectionRefs.current[5] = el}
        className="relative py-12 md:py-16 px-4 bg-gradient-to-r from-blue-700 via-blue-800 to-purple-800 text-white transform transition-all duration-700 opacity-0 translate-y-10 overflow-hidden"
      >
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Your Digital Marketing Business?

          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Launch your own digital marketing agency with DGTLmart’s proven franchise model, complete service support, and growth-ready solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/referral-partner"
              className="group relative px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10">Become a DGTLmart Franchise Partner</span>
              <div className="absolute inset-0 bg-gray-100 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
            </Link>
            <Link
              to="/buy-franchise"
              className="group relative px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10">Explore Franchise Plans</span>
              <div className="absolute inset-0 bg-gray-100 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Add CSS for custom animations */}
      <style>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-in {
          animation: fadeUp 0.7s ease forwards;
        }
        
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        
        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }
        
        .animate-fade-up {
          animation: fadeUp 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .animate-pulse-slow {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce 2s infinite;
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% {
            transform: translateY(-25%);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }
      `}</style>
    </div>
  );
}

const stats = [
  { numericValue: 500, suffix: '+', prefix: '', label: 'Franchise Partners' },
  { numericValue: 10, suffix: 'k+', prefix: '', label: 'Projects Completed' },
  { numericValue: 2.5, suffix: 'Cr+', prefix: '₹', label: 'Revenue Earned' },
  { numericValue: 99, suffix: '%', prefix: '', label: 'Success Rate' },
];

const faqs = [
  {
    question: 'How do I become a Referral Partner?',
    answer: 'It\'s simple! Click on the "Become a Partner" button, fill in your details, and you\'ll get your unique referral link instantly. There\'s zero investment required.'
  },
  {
    question: 'What kind of support do franchise owners get?',
    answer: 'Franchise owners receive complete business setup assistance, technical training, marketing materials, sales support, and ongoing business guidance from our expert team.'
  },
  {
    question: 'Is any prior digital marketing experience needed?',
    answer: 'No prior experience is necessary. We provide comprehensive training and all the tools you need to run a successful digital marketing agency.'
  },
  {
    question: 'How much commission can I earn as a partner?',
    answer: 'Our referral partners earn attractive commissions on every successful franchise sale. Contact us for the detailed commission structure.'
  }
];

const whyChooseUs = [
  {
    title: 'Proven Model',
    description: 'Successfully operating franchise model with established processes and proven track record',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    title: 'Comprehensive Support',
    description: 'Full technical and marketing support from our expert team throughout your journey',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
  },
  {
    title: 'Earn Revenue',
    description: 'Multiple revenue streams with competitive pricing packages and attractive profit margins',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
];

const packages = [
  {
    id: 'website',
    name: 'Website Development',
    description: 'Static to custom e-commerce solutions with modern design.',
    count: '3',
    priceRange: '₹15K - ₹75K',
    color: 'bg-gradient-to-br from-blue-500 to-blue-600',
    icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  },
  {
    id: 'seo',
    name: 'SEO Services',
    description: 'Boost rankings with technical and on-page optimization.',
    count: '3',
    priceRange: '₹18K - ₹45K/mo',
    color: 'bg-gradient-to-br from-green-500 to-green-600',
    icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  },
  {
    id: 'social-media',
    name: 'Social Media Packages',
    description: 'Comprehensive marketing suites including Ads & SEO.',
    count: '3',
    priceRange: '₹30K - ₹1.8L/mo',
    color: 'bg-gradient-to-br from-purple-500 to-purple-600',
    icon: 'M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z',
  },
  {
    id: 'google-ads',
    name: 'Google Ads',
    description: 'PPC, Display & Retargeting for immediate ROI.',
    count: '3',
    priceRange: '₹20K - ₹75K/mo',
    color: 'bg-gradient-to-br from-red-500 to-red-600',
    icon: 'M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122',
  },
  {
    id: 'meta-ads',
    name: 'Meta Ads',
    description: 'FB & IG full-funnel strategy and audience targeting.',
    count: '3',
    priceRange: '₹15K - ₹70K/mo',
    color: 'bg-gradient-to-br from-pink-500 to-pink-600',
    icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z',
  },
];
