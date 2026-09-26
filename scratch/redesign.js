const fs = require('fs');

const path = require('path');
const file = path.join(__dirname, '../frontend/src/pages/HomePage.jsx');

let content = fs.readFileSync(file, 'utf-8');

// Extract the two base64 strings
const img1Match = content.match(/src="(data:image\/png;base64,[^"]+)"/);
const img2Match = content.match(/src="(data:image\/png;base64,[^"]+)"/g); // Get all matches
const img1 = img2Match && img2Match[0] ? img2Match[0].replace('src="', '').replace('"', '') : '';
const img2 = img2Match && img2Match[1] ? img2Match[1].replace('src="', '').replace('"', '') : '';

console.log("Extracted image 1 length:", img1.length);
console.log("Extracted image 2 length:", img2.length);

const newContent = `import React, { useState } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

export default function HomePage() {
  const [selectedModel, setSelectedModel] = useState('franchise');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleApplyClick = (model) => {
    setSelectedModel(model);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="font-['Figtree',sans-serif] bg-slate-950 text-slate-50 scroll-smooth selection:bg-fuchsia-500 selection:text-white">
      <Navbar />

      {/* Ambient Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-fuchsia-600/20 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen"></div>
      </div>

      <main className="relative z-10">
        {/* HERO SECTION */}
        <section id="top" className="relative min-h-[90vh] flex items-center py-20 overflow-hidden">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="flex flex-col items-start space-y-8 relative z-10">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-300">DGTLmart Growth Partner Program</span>
              </div>
              
              <h1 className="font-['Bricolage_Grotesque'] text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-white">
                Start Your Own <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-purple-500 to-blue-500">
                  Digital Technology
                </span> <br />
                Business
              </h1>
              
              <p className="text-lg sm:text-xl text-slate-400 max-w-xl leading-relaxed">
                A franchise partnership that turns your network and drive into a recurring-revenue digital agency, backed by DGTLmart's brand, training, and backend support team. No technical team or prior experience needed.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4">
                <a href="#apply" className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-bold text-white bg-gradient-to-r from-fuchsia-600 to-blue-600 shadow-[0_0_40px_-10px_rgba(217,70,239,0.5)] hover:shadow-[0_0_60px_-10px_rgba(217,70,239,0.7)] transition-all duration-300 hover:-translate-y-1">
                  <span>Become a Growth Partner</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </a>
                <a href="#opportunity" className="inline-flex items-center justify-center px-8 py-4 rounded-full font-bold text-white border border-white/20 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm">
                  See the Opportunity
                </a>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-12 mt-4 border-t border-white/10 w-full">
                {[
                  { value: '7+', label: 'Years in business' },
                  { value: '190+', label: 'Digital services' },
                  { value: 'Pan-India', label: 'Delivery team' },
                  { value: '6×', label: 'Award winner' }
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <b className="font-['Bricolage_Grotesque'] text-2xl lg:text-3xl font-bold text-white">{stat.value}</b>
                    <span className="text-sm text-slate-400">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Art */}
            <div className="relative w-full aspect-square max-w-lg mx-auto lg:ml-auto" style={{ perspective: '1000px' }}>
              <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-500/20 to-blue-500/20 rounded-full blur-3xl"></div>
              
              {/* Main Image */}
              <img 
                className="absolute inset-[10%] w-[80%] drop-shadow-[0_0_60px_rgba(217,70,239,0.4)] animate-[bounce_8s_ease-in-out_infinite]" 
                src="${img1}" alt="DGTLmart Logo mark" />
              
              {/* Floating Stat Card */}
              <div className="absolute right-[-10%] bottom-[5%] w-[45%] bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl transition-transform hover:scale-105">
                <img src="${img2}" alt="Chart" className="rounded-lg opacity-90 w-full h-auto" />
              </div>
              
              {/* Floating Text Card */}
              <div className="absolute left-[-5%] top-[15%] bg-slate-900/60 border border-white/10 backdrop-blur-md rounded-2xl p-5 max-w-[220px] shadow-2xl transition-transform hover:scale-105">
                <b className="block text-white font-['Bricolage_Grotesque'] font-bold text-xl mb-1">High Growth</b>
                <span className="text-sm text-slate-300 leading-snug block">Digital marketing & tech is a ₹50,000 Cr market in India.</span>
              </div>
            </div>
          </div>
        </section>

        {/* PROMISE SECTION */}
        <section className="py-24 relative border-t border-white/10">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {[
                { title: 'Zero Inventory', desc: 'No physical stock or warehouses required. Everything is digital.', icon: 'M5 12l5 5L20 7' },
                { title: 'Low Setup Cost', desc: 'Start with minimal capital compared to traditional franchises.', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                { title: 'High Margin', desc: 'Digital services command excellent profit margins.', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
                { title: 'Recurring Revenue', desc: 'Retainers and subscriptions build stable monthly income.', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
                { title: 'Location Independent', desc: 'Run your business from anywhere with just a laptop.', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
              ].map((item, idx) => (
                <div key={idx} className="bg-white/[0.02] border border-white/10 hover:border-fuchsia-500/50 rounded-2xl p-6 transition-colors duration-300 group">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-fuchsia-500/10 text-fuchsia-400 group-hover:bg-fuchsia-500 group-hover:text-white transition-colors duration-300 mb-6">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon}/></svg>
                  </div>
                  <h3 className="font-['Bricolage_Grotesque'] text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CHOICE SECTION */}
        <section className="py-24 border-t border-white/10">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              {/* Old Way */}
              <div className="bg-slate-900/50 p-10 sm:p-16 flex flex-col justify-center">
                <span className="font-bold text-xs uppercase tracking-widest text-slate-500 mb-4">The Old Way</span>
                <h3 className="font-['Bricolage_Grotesque'] text-3xl sm:text-4xl font-extrabold text-slate-500 line-through decoration-slate-700 decoration-2 mb-8">Start from scratch</h3>
                <ul className="space-y-5">
                  {['Build a brand from zero', 'Hire expensive developers & marketers', 'Figure out processes through trial & error', 'Struggle to build a portfolio', 'High risk of failure in the first year'].map((text, i) => (
                    <li key={i} className="flex gap-4 items-start text-slate-400">
                      <span className="flex-none w-6 h-6 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center text-xs font-bold mt-0.5">×</span>
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
              {/* DGTLmart Way */}
              <div className="relative bg-gradient-to-br from-fuchsia-900/40 to-blue-900/40 p-10 sm:p-16 flex flex-col justify-center">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-blue-500"></div>
                <span className="font-bold text-xs uppercase tracking-widest text-fuchsia-400 mb-4">The DGTLmart Way</span>
                <h3 className="font-['Bricolage_Grotesque'] text-3xl sm:text-4xl font-extrabold text-white mb-8">Plug & Play Franchise</h3>
                <ul className="space-y-5">
                  {['Leverage an established, trusted brand', 'Use our 190+ strong expert delivery team', 'Get proven sales scripts and processes', 'Access our massive case study portfolio', 'Start selling and earning from day one'].map((text, i) => (
                    <li key={i} className="flex gap-4 items-start text-slate-200">
                      <span className="flex-none w-6 h-6 rounded-full bg-gradient-to-r from-fuchsia-500 to-blue-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">✓</span>
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* OPPORTUNITY SECTION */}
        <section id="opportunity" className="py-24 border-t border-white/10 bg-slate-900/20">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
            <div className="max-w-2xl mb-16">
              <span className="inline-flex items-center gap-3 font-bold text-xs uppercase tracking-widest text-fuchsia-400 mb-4">
                <span className="w-6 h-0.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-blue-500"></span>
                Massive Demand
              </span>
              <h2 className="font-['Bricolage_Grotesque'] text-4xl sm:text-5xl font-extrabold leading-[1.1] tracking-tight mb-6">Every business needs digital.</h2>
              <p className="text-xl text-slate-400 leading-relaxed">The digital transformation market is exploding. Tap into this recurring revenue stream without the technical headache.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-fuchsia-900/20 to-blue-900/20 border border-fuchsia-500/30 rounded-3xl p-10 flex flex-col justify-start relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/20 blur-3xl rounded-full"></div>
                <div className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-blue-400 font-extrabold text-6xl lg:text-7xl tabular-nums tracking-tighter font-['Bricolage_Grotesque'] mb-4 z-10">₹50K Cr</div>
                <h3 className="text-xl font-['Bricolage_Grotesque'] font-bold text-white mb-2 z-10">Indian Digital Market</h3>
                <p className="text-slate-400 text-sm z-10">Projected digital marketing and tech spend by Indian businesses in 2024.</p>
              </div>
              <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-10 flex flex-col justify-start">
                <div className="font-extrabold text-6xl lg:text-7xl tabular-nums tracking-tighter font-['Bricolage_Grotesque'] text-white mb-4">12M+</div>
                <h3 className="text-xl font-['Bricolage_Grotesque'] font-bold text-white mb-2">Local Businesses</h3>
                <p className="text-slate-400 text-sm">MSMEs actively looking to transition their operations and marketing online.</p>
              </div>
              <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-10 flex flex-col justify-start">
                <div className="font-extrabold text-6xl lg:text-7xl tabular-nums tracking-tighter font-['Bricolage_Grotesque'] text-white mb-4">75%</div>
                <h3 className="text-xl font-['Bricolage_Grotesque'] font-bold text-white mb-2">Outsource Tech</h3>
                <p className="text-slate-400 text-sm">Of small businesses prefer outsourcing digital services to trusted local partners.</p>
              </div>
            </div>
          </div>
        </section>

        {/* MODELS SECTION */}
        <section id="models" className="py-24 border-t border-white/10">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
            <div className="max-w-2xl mb-16 text-center mx-auto flex flex-col items-center">
              <span className="inline-flex items-center gap-3 font-bold text-xs uppercase tracking-widest text-fuchsia-400 mb-4">
                <span className="w-6 h-0.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-blue-500"></span>
                Partnership Models
                <span className="w-6 h-0.5 rounded-full bg-gradient-to-r from-blue-500 to-fuchsia-500"></span>
              </span>
              <h2 className="font-['Bricolage_Grotesque'] text-4xl sm:text-5xl font-extrabold leading-[1.1] tracking-tight mb-6">Choose your growth path</h2>
              <p className="text-xl text-slate-400 leading-relaxed max-w-xl mx-auto">Whether you want to build a full agency or just earn from your network, we have a model for you.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
              
              {/* Referral Model */}
              <div className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-10 flex flex-col relative overflow-hidden transition-all duration-300 hover:bg-white/[0.04]">
                <div className="flex justify-between items-start gap-4 flex-wrap mb-8">
                  <span className="font-bold text-xs uppercase tracking-widest text-slate-400">Zero Investment</span>
                  <span className="font-bold text-xs px-4 py-1.5 rounded-full bg-white/10 text-white border border-white/20 backdrop-blur-md">Referral Partner</span>
                </div>
                <h3 className="font-['Bricolage_Grotesque'] text-3xl sm:text-4xl font-extrabold text-white mb-4">Earn by connecting</h3>
                <p className="text-slate-400 text-base mb-8 flex-grow">Refer clients to DGTLmart and earn a flat commission on every closed deal. We handle the sales and the delivery.</p>
                <ul className="space-y-4 mb-10">
                  {['10% commission on every sale', 'No technical knowledge needed', 'Real-time tracking dashboard', 'Monthly payouts'].map((item, i) => (
                    <li key={i} className="flex gap-4 items-center text-slate-300">
                      <span className="flex-none w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <a href="#apply" onClick={() => handleApplyClick('referral')} className="mt-auto w-full inline-flex items-center justify-center px-8 py-4 rounded-full font-bold text-white border border-white/20 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm">
                  Join for Free
                </a>
              </div>

              {/* Franchise Model */}
              <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 border border-fuchsia-500/50 rounded-[2rem] p-10 flex flex-col overflow-hidden shadow-[0_0_60px_-15px_rgba(217,70,239,0.3)] transform transition-all duration-300 hover:-translate-y-2">
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-blue-500"></div>
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-fuchsia-500/20 blur-[80px] rounded-full"></div>
                
                <div className="flex justify-between items-start gap-4 flex-wrap mb-8 relative z-10">
                  <span className="font-bold text-xs uppercase tracking-widest text-fuchsia-400">High ROI Business</span>
                  <span className="font-bold text-xs px-4 py-1.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-blue-500 text-white shadow-lg">Franchise Owner</span>
                </div>
                <h3 className="font-['Bricolage_Grotesque'] text-3xl sm:text-4xl font-extrabold text-white mb-4 relative z-10">Run your own agency</h3>
                <p className="text-slate-400 text-base mb-6 relative z-10">Operate a white-labeled digital marketing agency. You focus on local sales, we handle 100% of the fulfillment.</p>
                
                <div className="flex items-center gap-5 p-5 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 mb-8 relative z-10">
                  <b className="font-['Bricolage_Grotesque'] font-extrabold text-3xl text-fuchsia-400 tabular-nums whitespace-nowrap">₹1L - 5L</b>
                  <span className="text-sm text-slate-300 leading-tight">Potential monthly recurring revenue</span>
                </div>
                
                <ul className="space-y-4 mb-10 relative z-10 flex-grow">
                  {['Sell under your own brand', 'Keep up to 40% margins', 'Dedicated Account Manager', 'Complete training & CRM'].map((item, i) => (
                    <li key={i} className="flex gap-4 items-center text-slate-200">
                      <span className="flex-none w-5 h-5 rounded-full bg-gradient-to-r from-fuchsia-500 to-blue-500 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <a href="#apply" onClick={() => handleApplyClick('franchise')} className="mt-auto w-full inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-bold text-white bg-gradient-to-r from-fuchsia-600 to-blue-600 shadow-[0_0_40px_-10px_rgba(217,70,239,0.5)] hover:shadow-[0_0_60px_-10px_rgba(217,70,239,0.7)] transition-all duration-300 relative z-10">
                  View Franchise Plans →
                </a>
              </div>

            </div>
          </div>
        </section>

        {/* APPLY SECTION */}
        <section id="apply" className="py-24 relative overflow-hidden bg-slate-900 border-t border-white/10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>
          <div className="max-w-[1280px] mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
            <div>
              <span className="inline-flex items-center gap-3 font-bold text-xs uppercase tracking-widest text-blue-400 mb-6">
                <span className="w-6 h-0.5 rounded-full bg-gradient-to-r from-blue-500 to-fuchsia-500"></span>
                Take The First Step
              </span>
              <h2 className="font-['Bricolage_Grotesque'] text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight mb-6">Let's talk about your business growth.</h2>
              <p className="text-xl text-slate-400 mb-10 max-w-xl">Fill out the form and our franchise success team will get back to you within 24 hours to schedule a consultation.</p>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-5 rounded-2xl w-max backdrop-blur-md">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Email</div>
                    <div className="text-white font-medium">partners@dgtlmart.com</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-5 rounded-2xl w-max backdrop-blur-md">
                  <div className="w-10 h-10 rounded-full bg-fuchsia-500/20 flex items-center justify-center text-fuchsia-400">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Phone</div>
                    <div className="text-white font-medium">+91 98765 43210</div>
                  </div>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleFormSubmit} className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 sm:p-10 shadow-2xl relative">
              {isSubmitted ? (
                <div className="absolute inset-0 z-20 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center rounded-[2rem] p-10 text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-fuchsia-500 to-blue-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(217,70,239,0.5)]">
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <h3 className="font-['Bricolage_Grotesque'] text-3xl font-bold text-white mb-2">Thank you!</h3>
                  <p className="text-slate-400 text-lg">Your application has been received. Our team will contact you shortly.</p>
                </div>
              ) : null}

              <h3 className="font-['Bricolage_Grotesque'] text-3xl font-bold text-white mb-8">Request Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <label className="block">
                  <span className="block text-sm font-semibold text-slate-300 mb-2">First Name</span>
                  <input required type="text" className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all placeholder:text-slate-600" placeholder="John" />
                </label>
                <label className="block">
                  <span className="block text-sm font-semibold text-slate-300 mb-2">Last Name</span>
                  <input required type="text" className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all placeholder:text-slate-600" placeholder="Doe" />
                </label>
              </div>
              <div className="space-y-5 mb-8">
                <label className="block">
                  <span className="block text-sm font-semibold text-slate-300 mb-2">Email Address</span>
                  <input required type="email" className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all placeholder:text-slate-600" placeholder="john@example.com" />
                </label>
                <label className="block">
                  <span className="block text-sm font-semibold text-slate-300 mb-2">Phone Number</span>
                  <input required type="tel" className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all placeholder:text-slate-600" placeholder="+91 98765 43210" />
                </label>
                <label className="block">
                  <span className="block text-sm font-semibold text-slate-300 mb-2">I am interested in</span>
                  <div className="relative">
                    <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-5 py-4 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all cursor-pointer">
                      <option value="franchise" className="bg-slate-900">Franchise Ownership</option>
                      <option value="referral" className="bg-slate-900">Referral Partnership</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                  </div>
                </label>
              </div>
              <button type="submit" className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white text-lg bg-gradient-to-r from-fuchsia-600 to-blue-600 shadow-[0_0_30px_-5px_rgba(217,70,239,0.4)] hover:shadow-[0_0_50px_-5px_rgba(217,70,239,0.6)] transition-all duration-300 hover:-translate-y-1 mb-4">
                Submit Application
              </button>
              <p className="text-xs text-slate-500 text-center">By submitting, you agree to our privacy policy and terms of service.</p>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
`;

fs.writeFileSync(file, newContent, 'utf-8');
console.log("Rewrite completed successfully!");
