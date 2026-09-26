import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

export default function HomePage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    model: 'DOST Franchise Partner',
    occupation: 'Salaried professional',
    message: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const formRef = useRef(null);

  // Generate bars data once
  const graphBars = Array.from({ length: 24 }).map((_, i) => {
    const idx = i + 1;
    const v = Math.round(8 + (idx / 24) * 92 * (0.85 + 0.15 * Math.sin(idx)));
    return Math.min(v, 100);
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleModelClick = (model) => (e) => {
    e.preventDefault();
    setFormData((prev) => ({ ...prev, model }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formRef.current.checkValidity()) {
      formRef.current.reportValidity();
      return;
    }
    setShowSuccess(true);
    setIsSubmitted(true);
  };

  const eyebrow = 'inline-flex items-center gap-2.5 font-bold text-[12px] uppercase tracking-[0.16em] text-[#B00F68]';
  const eyebrowBar = 'w-[22px] h-[2px] rounded bg-gradient-to-r from-[#D6127D] via-[#7A2FD1] to-[#2F6FED]';
  const h2Class = "font-['Outfit',system-ui,sans-serif] font-bold leading-[1.08] tracking-[-0.02em] text-[clamp(28px,4vw,40px)]";
  const btnPrimary = 'inline-flex items-center justify-center gap-2.5 px-[26px] py-[15px] rounded-full font-bold text-[16px] text-white bg-gradient-to-r from-[#D6127D] via-[#7A2FD1] to-[#2F6FED] shadow-[0_8px_24px_-8px_rgba(214,18,125,0.55)] hover:-translate-y-0.5 transition-transform';

  return (
    <div className="font-['Inter',system-ui,sans-serif] text-[#1B1B3A] bg-white">
      <Navbar />

      <main>
        {/* ================= HERO ================= */}
        <section id="top" className="relative pt-8 sm:pt-10 lg:pt-10 border-t border-[#E7E7F1] bg-white">
          
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-[max(2rem,calc((100vw-1380px)/2))] flex flex-col lg:flex-row items-center gap-10 lg:gap-8 xl:gap-16">
            
            {/* Left */}
            <div className="w-full lg:w-[50%] xl:w-[48%] shrink-0 relative z-10">
              <span className={eyebrow}>
                <span className={eyebrowBar}></span>
                DGTLmart Growth Partner Program
              </span>

              <h1 className="font-['Outfit',system-ui,sans-serif] font-bold text-[clamp(36px,5vw,64px)] leading-[1.05] tracking-[-0.025em] mt-3 mb-5">
                <span className="lg:block">Start Your Own{' '}</span>
                <span className="bg-gradient-to-r from-[#D6127D] via-[#7A2FD1] to-[#2F6FED] bg-clip-text text-transparent">
                  Digital Technology
                </span>
                <br />
                Business
              </h1>

              <p className="text-[#3A3A5C] text-[clamp(18px,1.6vw,21px)] max-w-[56ch] leading-[1.55]">
                A franchise partnership that turns your network and drive into a recurring-revenue digital agency, backed by DGTLmart's brand, training and backend support team. No large technical team or prior industry experience needed.
              </p>

              <div className="flex flex-wrap gap-3.5 mt-9">
                <a href="#apply" className={btnPrimary}>
                  Become a Growth Partner →
                </a>
                <a
                  href="#opportunity"
                  className="inline-flex items-center justify-center px-[26px] py-[15px] rounded-full font-bold text-[16px] text-[#1B1B3A] border-[1.5px] border-[#E7E7F1] bg-white hover:border-[#7A2FD1] hover:text-[#7A2FD1] transition-colors"
                >
                  See the Opportunity
                </a>
              </div>
            </div>

            {/* Right Image (Desktop) */}
            <div className="hidden lg:flex w-full lg:w-[50%] xl:w-[52%] justify-end mt-12 lg:mt-0 z-0 relative lg:min-h-[500px]">
               <div className="relative lg:absolute lg:right-[-4%] lg:top-[55%] lg:-translate-y-[50%] lg:w-[145%] xl:w-[160%] max-w-none h-auto pointer-events-none">
                 <img 
                   src="/banner.png" 
                   className="w-full h-auto object-contain" 
                   alt="DGTLmart Business Model" 
                 />
                 {/* Seamless Blending Overlays */}
                 <div className="absolute inset-y-0 left-0 w-[15%] bg-gradient-to-r from-white to-transparent"></div>
                 <div className="absolute inset-y-0 right-0 w-[12%] bg-gradient-to-l from-white to-transparent"></div>
                 <div className="absolute inset-x-0 top-0 h-[15%] bg-gradient-to-b from-white to-transparent"></div>
                 <div className="absolute inset-x-0 bottom-0 h-[15%] bg-gradient-to-t from-white to-transparent"></div>
               </div>
            </div>

            {/* Mobile Image (Small screens) */}
            <div className="w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)] -mx-4 sm:-mx-6 mt-8 lg:hidden relative z-0 overflow-hidden">
               <div className="relative w-full max-w-[600px] mx-auto pointer-events-none">
                 <img 
                   src="/banner2.png" 
                   className="w-full h-auto object-contain" 
                   alt="DGTLmart Business Model" 
                 />
                 {/* Top/Bottom Blending Overlays for Mobile */}
                 <div className="absolute inset-x-0 top-0 h-[15%] bg-gradient-to-b from-white to-transparent"></div>
                 <div className="absolute inset-x-0 bottom-0 h-[15%] bg-gradient-to-t from-white to-transparent"></div>
               </div>
            </div>

          </div>

          {/* Full-Width Trust Banner */}
          <div className="border-t border-[#E7E7F1] mt-10 lg:mt-16 bg-[#fafbfc]">
             <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
               <div className="flex flex-wrap justify-center gap-y-8 gap-x-12 sm:gap-x-24 text-center">
                 {[
                   ['7+', 'Years in business'],
                   ['190+', 'Digital services'],
                   ['Pan-India', 'Delivery team'],
                   ['6×', 'Award winner'],
                 ].map(([n, l], i) => (
                   <div key={i} className="text-[15px] text-[#70718A]">
                     <b className="block font-['Outfit',system-ui,sans-serif] font-bold text-[32px] sm:text-[36px] leading-[1.1] text-[#1B1B3A] tabular-nums mb-2">
                       {n}
                     </b>
                     {l}
                   </div>
                 ))}
               </div>
             </div>
          </div>
        </section>


        {/* ================= PROMISE ================= */}
        <section id="promise" className="border-t border-[#E7E7F1] py-10 sm:py-12 lg:py-16">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-4 max-w-[720px] mb-8 sm:mb-10">
              <span className={eyebrow}>
                <span className={eyebrowBar}></span>
                Our Promise
              </span>
              <h2 className={h2Class}>
                We make you self-reliant.{' '}
                <span className="bg-gradient-to-r from-[#D6127D] via-[#7A2FD1] to-[#2F6FED] bg-clip-text text-transparent">Aatmnirbhar.</span>
              </h2>
              <p className="text-[#3A3A5C] text-lg sm:text-[19px] max-w-[62ch]">
                Five things every DGTLmart Growth Partner gets from day one.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { icon: (<svg viewBox="0 0 40 40" fill="none" className="w-10 h-10"><rect width="40" height="40" rx="10" fill="#D6127D" fillOpacity=".12" /><path d="M11 27l6-7 5 4 8-11" stroke="#D6127D" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /><path d="M24 13h6v6" stroke="#D6127D" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>), title: 'Scalable Income', desc: 'Unlimited growth, never capped by a salary ceiling.' },
                { icon: (<svg viewBox="0 0 40 40" fill="none" className="w-10 h-10"><rect width="40" height="40" rx="10" fill="#7A2FD1" fillOpacity=".12" /><path d="M12 25l3-10 5 5 5-5 3 10H12z" stroke="#7A2FD1" strokeWidth="2.2" strokeLinejoin="round" /><path d="M12 29h16" stroke="#7A2FD1" strokeWidth="2.2" strokeLinecap="round" /></svg>), title: 'Be Your Own Boss', desc: 'Run the business your way, on your terms.' },
                { icon: (<svg viewBox="0 0 40 40" fill="none" className="w-10 h-10"><rect width="40" height="40" rx="10" fill="#2F6FED" fillOpacity=".12" /><circle cx="20" cy="20" r="9" stroke="#2F6FED" strokeWidth="2.2" /><path d="M20 15v5l3 3" stroke="#2F6FED" strokeWidth="2.2" strokeLinecap="round" /></svg>), title: 'Flexible Hours', desc: 'Build a schedule that fits your life.' },
                { icon: (<svg viewBox="0 0 40 40" fill="none" className="w-10 h-10"><rect width="40" height="40" rx="10" fill="#D6127D" fillOpacity=".12" /><circle cx="20" cy="17" r="6" stroke="#D6127D" strokeWidth="2.2" /><path d="M16 22l-2 8 6-3 6 3-2-8" stroke="#D6127D" strokeWidth="2.2" strokeLinejoin="round" /></svg>), title: 'Pride of Partnership', desc: 'A recognised brand behind your name.' },
                { icon: (<svg viewBox="0 0 40 40" fill="none" className="w-10 h-10"><rect width="40" height="40" rx="10" fill="#7A2FD1" fillOpacity=".12" /><path d="M20 10l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11v-6l8-3z" stroke="#7A2FD1" strokeWidth="2.2" strokeLinejoin="round" /><path d="M16.5 20l2.5 2.5 4.5-5" stroke="#7A2FD1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>), title: 'Secure Life', desc: 'A durable second income stream for your family.' },
              ].map((item, i) => (
                <div key={i} className="bg-white border border-[#E7E7F1] rounded-[14px] p-6 flex flex-col gap-2.5">
                  {item.icon}
                  <h3 className="font-['Outfit',system-ui,sans-serif] font-bold text-[20px] tracking-[-0.01em] leading-tight">{item.title}</h3>
                  <p className="text-[#70718A] text-[15px] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= CHOICE ================= */}
        <section id="choice" className="border-t border-[#E7E7F1] pb-10 sm:pb-12 lg:pb-16">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-4 max-w-[720px] mb-8 sm:mb-10">
              <span className={eyebrow}>
                <span className={eyebrowBar}></span>
                The Choice
              </span>
              <h2 className={h2Class}>Why join the DGTLmart Partnership Program?</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 rounded-[20px] overflow-hidden border border-[#E7E7F1]">
              <div className="bg-white p-8 sm:p-10 lg:p-12 flex flex-col gap-4.5">
                <span className="font-bold text-[12px] uppercase tracking-[0.16em] text-[#70718A]">Stay lazy</span>
                <h3 className="font-['Outfit',system-ui,sans-serif] font-bold text-[clamp(22px,2.5vw,32px)] text-[#70718A] line-through decoration-2">Waste time</h3>
                <ul className="grid gap-3.5 list-none p-0 m-0 mt-1">
                  {['Watching opportunity pass by', 'Staying in a capped-salary job', 'Waiting for "someday" to start'].map((t, i) => (
                    <li key={i} className="flex gap-3 items-start text-[17px] text-[#70718A]">
                      <span className="flex-none w-6 h-6 rounded-full bg-[#E7E7F1] text-[#70718A] grid place-items-center text-[13px] font-bold mt-0.5">—</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative bg-white border-l border-[#E7E7F1] p-8 sm:p-10 lg:p-12 flex flex-col gap-4.5">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#D6127D] via-[#7A2FD1] to-[#2F6FED]"></div>
                <span className="font-bold text-[12px] uppercase tracking-[0.16em] text-[#B00F68]">Get active</span>
                <h3 className="font-['Outfit',system-ui,sans-serif] font-bold text-[clamp(22px,2.5vw,32px)]">Earn more</h3>
                <ul className="grid gap-3.5 list-none p-0 m-0 mt-1">
                  {['Building a recurring-revenue business', 'Owning a recognised digital brand', 'Starting today, with full backing'].map((t, i) => (
                    <li key={i} className="flex gap-3 items-start text-[17px]">
                      <span className="flex-none w-6 h-6 rounded-full bg-gradient-to-r from-[#D6127D] via-[#7A2FD1] to-[#2F6FED] text-white grid place-items-center text-[13px] font-bold mt-0.5">✓</span>
                      {t}
                    </li>
                  ))}
                </ul>
                <div className="mt-1">
                  <a href="#apply" className={btnPrimary}>I'm ready to start →</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= OPPORTUNITY ================= */}
        <section className="border-t border-[#E7E7F1] py-10 sm:py-12 lg:py-16 bg-white" id="opportunity">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-4 max-w-[720px] mb-8 sm:mb-10">
              <span className={eyebrow}>
                <span className={eyebrowBar}></span>
                The Opportunity
              </span>
              <h2 className={h2Class}>Why digital marketing, why now</h2>
              <p className="text-[#3A3A5C] text-lg sm:text-[19px] max-w-[62ch]">Every business in India is going online. Almost none know how.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-[14px] p-7 sm:p-8 border border-[#E7E7F1] flex flex-col gap-2.5">
                <span className="font-['Outfit',system-ui,sans-serif] font-bold text-[clamp(42px,5vw,60px)] leading-none tracking-[-0.03em] tabular-nums bg-gradient-to-r from-[#D6127D] via-[#7A2FD1] to-[#2F6FED] bg-clip-text text-transparent">6 Cr+</span>
                <h3 className="text-[18px] font-['Outfit',system-ui,sans-serif] font-bold">MSMEs in India</h3>
                <p className="text-[#70718A] text-[15px]">The addressable market for digital services.</p>
              </div>
              <div className="bg-white rounded-[14px] p-7 sm:p-8 border border-[#E7E7F1] flex flex-col gap-2.5">
                <span className="font-['Outfit',system-ui,sans-serif] font-bold text-[clamp(42px,5vw,60px)] leading-none tracking-[-0.03em] tabular-nums bg-gradient-to-r from-[#D6127D] via-[#7A2FD1] to-[#2F6FED] bg-clip-text text-transparent">&lt;15%</span>
                <h3 className="text-[18px] font-['Outfit',system-ui,sans-serif] font-bold">Have a real digital presence</h3>
                <p className="text-[#70718A] text-[15px]">Clinics, coaching centres, realtors, D2C brands. All buying, few served well.</p>
              </div>
              <div className="rounded-[14px] p-[2px] bg-gradient-to-r from-[#D6127D] via-[#7A2FD1] to-[#2F6FED]">
                <div className="bg-white rounded-[12px] p-7 sm:p-8 h-full flex flex-col gap-2.5 justify-start">
                  <span className="font-['Outfit',system-ui,sans-serif] font-bold text-[clamp(42px,5vw,60px)] leading-none tracking-[-0.03em] tabular-nums bg-gradient-to-r from-[#D6127D] via-[#7A2FD1] to-[#2F6FED] bg-clip-text text-transparent">The Gap</span>
                  <h3 className="text-[18px] font-['Outfit',system-ui,sans-serif] font-bold">Demand exists. Supply doesn't.</h3>
                  <p className="text-[#70718A] text-[15px]">There aren't enough competent agencies to serve them. That gap is your business.</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 max-w-[720px] mb-8 sm:mb-10 mt-10 sm:mt-12 lg:mt-16">
              <span className={eyebrow}>
                <span className={eyebrowBar}></span>
                The Comparison
              </span>
              <h2 className={h2Class}>A smarter franchise model</h2>
              <p className="text-[#3A3A5C] text-lg sm:text-[19px] max-w-[62ch]">How a DGTLmart digital franchise compares with a traditional one on cost, risk and income.</p>
            </div>
            <div className="overflow-x-auto rounded-[18px] border border-[#E7E7F1] bg-white">
              <table className="w-full border-collapse min-w-[560px]">
                <thead>
                  <tr>
                    <th className="text-left p-5 px-6 border-b border-[#E7E7F1] font-bold text-[13px] tracking-[0.12em] uppercase text-[#70718A] bg-white"></th>
                    <th className="text-left p-5 px-6 border-b border-[#E7E7F1] font-bold text-[13px] tracking-[0.12em] uppercase text-[#70718A] bg-white">Traditional Franchise</th>
                    <th className="text-left p-5 px-6 border-b-2 border-[#7A2FD1] font-bold text-[13px] tracking-[0.12em] uppercase text-[#7A2FD1] bg-white">DGTLmart Digital Franchise</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Setup cost', '₹25 Lakh – ₹1 Crore+', 'A fraction of it'],
                    ['Inventory', 'Heavy', 'Zero'],
                    ['Premises', 'Mandatory', 'Optional'],
                    ['Revenue type', 'One-time transactions', 'Monthly retainers'],
                    ['Geography', 'One catchment area', 'Any location in India'],
                  ].map(([label, them, us], i, arr) => (
                    <tr key={i}>
                      <td className={`text-left p-5 px-6 text-[16px] font-bold text-[#1B1B3A] ${i === arr.length - 1 ? '' : 'border-b border-[#E7E7F1]'}`}>{label}</td>
                      <td className={`text-left p-5 px-6 text-[16px] text-[#70718A] ${i === arr.length - 1 ? '' : 'border-b border-[#E7E7F1]'}`}>{them}</td>
                      <td className={`text-left p-5 px-6 text-[16px] font-bold bg-[rgba(122,47,209,0.08)] ${i === arr.length - 1 ? '' : 'border-b border-[#E7E7F1]'}`}>
                        <span className="inline-grid place-items-center w-[22px] h-[22px] rounded-full bg-gradient-to-r from-[#D6127D] via-[#7A2FD1] to-[#2F6FED] text-white text-[12px] mr-2.5 align-[1px]">✓</span>
                        {us}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ================= ECONOMICS ================= */}
        <section className="border-t border-[#E7E7F1] py-10 sm:py-12 lg:py-16 bg-white" id="economics">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-6 lg:gap-8 items-center">
            <div>
              <div className="grid gap-4 max-w-[720px] mb-7">
                <span className={eyebrow}>
                  <span className={eyebrowBar}></span>
                  The Economics
                </span>
                <h2 className={h2Class}>Recurring revenue changes everything</h2>
              </div>
              <div className="grid gap-0">
                {[
                  ['Clients pay monthly, not once', 'A different model from transaction-based traditional franchises.'],
                  ['Predictable income', '20 stable retainers means income you can count on before the month begins.'],
                  ['Retention compounds', "Year 2 starts where Year 1 ended. Growth stacks; it doesn't reset."],
                  ['You build an asset', 'A business with a valuation, not just a salary.'],
                ].map(([title, desc], i, arr) => (
                  <div key={i} className={`py-[22px] flex flex-col gap-1.5 border-t border-[#E7E7F1] ${i === arr.length - 1 ? 'border-b border-b-[#E7E7F1]' : ''}`}>
                    <h3 className="font-['Outfit',system-ui,sans-serif] font-bold text-[20px] tracking-[-0.01em]">{title}</h3>
                    <p className="text-[#70718A]">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-[#E7E7F1] rounded-[18px] p-7" role="img" aria-label="Illustration: active retainers grow month over month across two years">
              <h3 className="text-[16px] font-['Outfit',system-ui,sans-serif] font-bold mb-1">How retainers stack up</h3>
              <small className="text-[#70718A] text-[13px]">Illustrative: active monthly clients over 24 months</small>
              <div className="flex items-end gap-1.5 h-[200px] mt-6 border-b border-[#E7E7F1]">
                {graphBars.map((height, i) => (
                  <div key={i} style={{ height: `${height}%` }} className="flex-1 bg-gradient-to-b from-[#D6127D] to-[#2F6FED] rounded-t-[4px]" />
                ))}
              </div>
              <div className="flex justify-between text-[12px] text-[#70718A] mt-2"><span>Month 1</span><span>Month 12</span><span>Month 24</span></div>
            </div>
          </div>
        </section>

        {/* ================= FIT ================= */}
        <section id="fit" className="border-t border-[#E7E7F1] py-10 sm:py-12 lg:py-16">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-4 max-w-[720px] mb-8 sm:mb-10">
              <span className={eyebrow}>
                <span className={eyebrowBar}></span>
                The Right Fit
              </span>
              <h2 className={h2Class}>Who this works for</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-6 h-6"><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.8-3.5 3.3-5.5 6.5-5.5s5.7 2 6.5 5.5" /><path d="M16 4.8a3.5 3.5 0 010 6.4M18 14.8c1.8.7 3 2.5 3.5 5.2" /></svg>), title: 'A people person', desc: 'You enjoy meeting people and building relationships.' },
                { icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M3 13h18" /></svg>), title: 'Sales or network background', desc: 'Ex-sales professionals, local business network holders and first-time entrepreneurs.' },
                { icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M4 19V6a2 2 0 012-2h12a2 2 0 012 2v13" /><path d="M2 19h20M9 9h6M9 13h4" /></svg>), title: 'No technical background needed', desc: 'We train you, and our backend team supports you on every project.' },
                { icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M12 2c3 2.5 4.5 6 4.5 10L12 16l-4.5-4C7.5 8 9 4.5 12 2z" /><circle cx="12" cy="9" r="1.6" /><path d="M7.5 12L5 15l3 1M16.5 12l2.5 3-3 1M10 19l2 3 2-3" /></svg>), title: 'Ready to be an entrepreneur', desc: 'You want to own a business, not just hold a job.' },
              ].map((item, i) => (
                <div key={i} className="p-7 rounded-[14px] bg-white border border-[#E7E7F1] flex flex-col gap-2.5">
                  <span className="w-12 h-12 rounded-[12px] bg-[#F4F1FC] grid place-items-center text-[#7A2FD1]">{item.icon}</span>
                  <h3 className="text-[20px] font-['Outfit',system-ui,sans-serif] font-bold tracking-[-0.01em]">{item.title}</h3>
                  <p className="text-[#70718A] text-[15px]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= MODELS ================= */}
        <section id="models" className="border-t border-[#E7E7F1] py-10 sm:py-12 lg:py-16">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-4 max-w-[720px] mb-8 sm:mb-10">
              <span className={eyebrow}>
                <span className={eyebrowBar}></span>
                Partnership Models
              </span>
              <h2 className={h2Class}>
                Two ways to partner with <span className="bg-gradient-to-r from-[#D6127D] via-[#7A2FD1] to-[#2F6FED] bg-clip-text text-transparent">DGTLmart</span>
              </h2>
              <p className="text-[#3A3A5C] text-lg sm:text-[19px] max-w-[62ch]">Start by referring clients, or build your own digital business as a DOST franchise partner. Pick the model that fits your time and ambition.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
              {/* Referral */}
              <article className="border border-[#E7E7F1] rounded-[20px] p-7 sm:p-9 flex flex-col gap-4.5 bg-white relative">
                <div className="flex justify-between items-start gap-3 flex-wrap">
                  <div>
                    <span className="font-bold text-[12px] uppercase tracking-[0.16em] text-[#B00F68]">Model 01</span>
                    <h3 className="font-['Outfit',system-ui,sans-serif] font-bold text-[clamp(24px,2.5vw,34px)] mt-2">Referral Partner</h3>
                  </div>
                  <span className="font-bold text-[12px] px-3 py-2 rounded-full bg-[#F4F1FC] text-[#7A2FD1] whitespace-nowrap">Easy start</span>
                </div>
                <p className="text-[#3A3A5C] text-[17px]">Introduce businesses that need digital services. DGTLmart handles the pitch, closing and delivery, and you earn on every successful referral.</p>
                <div className="flex items-center gap-3.5 p-4 px-5 rounded-[14px] bg-[#F4F1FC]">
                  <b className="font-['Outfit',system-ui,sans-serif] font-bold text-[30px] text-[#7A2FD1] tabular-nums whitespace-nowrap">1 month</b>
                  <span className="text-[14px] text-[#3A3A5C] leading-[1.4]">Training and onboarding before you start referring</span>
                </div>
                <h4 className="font-bold text-[13px] uppercase tracking-[0.12em] text-[#70718A] mt-2">Best for</h4>
                <ul className="grid gap-2.5 list-none p-0 m-0">
                  {['Working professionals who want a side income', 'People with a strong local or business network', 'Anyone who wants to start without running a business'].map((t, i) => (
                    <li key={i} className="flex gap-2.5 items-start text-[15.5px]">
                      <span className="flex-none w-5 h-5 rounded-full bg-gradient-to-r from-[#D6127D] via-[#7A2FD1] to-[#2F6FED] text-white grid place-items-center text-[11px] mt-0.5">✓</span>
                      {t}
                    </li>
                  ))}
                </ul>
                <h4 className="font-bold text-[13px] uppercase tracking-[0.12em] text-[#70718A] mt-2">What you do</h4>
                <ul className="grid gap-2.5 list-none p-0 m-0">
                  {['Share your referral link or code with businesses', 'Connect interested clients with the DGTLmart team', 'Track your referrals and earnings'].map((t, i) => (
                    <li key={i} className="flex gap-2.5 items-start text-[15.5px]">
                      <span className="flex-none w-5 h-5 rounded-full bg-gradient-to-r from-[#D6127D] via-[#7A2FD1] to-[#2F6FED] text-white grid place-items-center text-[11px] mt-0.5">✓</span>
                      {t}
                    </li>
                  ))}
                </ul>
                <h4 className="font-bold text-[13px] uppercase tracking-[0.12em] text-[#70718A] mt-2">What DGTLmart does</h4>
                <ul className="grid gap-2.5 list-none p-0 m-0">
                  {['Sales pitch, proposal and closing', 'Complete service delivery and client support', 'Referral commission on every successful client'].map((t, i) => (
                    <li key={i} className="flex gap-2.5 items-start text-[15.5px]">
                      <span className="flex-none w-5 h-5 rounded-full bg-gradient-to-r from-[#D6127D] via-[#7A2FD1] to-[#2F6FED] text-white grid place-items-center text-[11px] mt-0.5">✓</span>
                      {t}
                    </li>
                  ))}
                </ul>
                <a href="#apply" onClick={handleModelClick('Referral Partner')} className="justify-self-start inline-flex items-center justify-center px-[26px] py-[15px] rounded-full font-bold text-[16px] border-[1.5px] border-[#7A2FD1] text-[#7A2FD1] bg-white hover:bg-[#F4F1FC] transition-colors mt-1">
                  Become a Referral Partner →
                </a>
              </article>

              {/* DOST */}
              <article className="rounded-[20px] p-7 sm:p-9 flex flex-col gap-4.5 relative border-2 border-transparent bg-white [background-image:linear-gradient(#fff,#fff),linear-gradient(100deg,#D6127D,#7A2FD1_55%,#2F6FED)] [background-origin:border-box] [background-clip:padding-box,border-box] shadow-[0_24px_50px_-28px_rgba(122,47,209,0.45)]">
                <div className="flex justify-between items-start gap-3 flex-wrap">
                  <div>
                    <span className="font-bold text-[12px] uppercase tracking-[0.16em] text-[#B00F68]">Model 02</span>
                    <h3 className="font-['Outfit',system-ui,sans-serif] font-bold text-[clamp(24px,2.5vw,34px)] mt-2">DOST Franchise Partner</h3>
                  </div>
                  <span className="font-bold text-[12px] px-3 py-2 rounded-full bg-gradient-to-r from-[#D6127D] via-[#7A2FD1] to-[#2F6FED] text-white whitespace-nowrap">Full business</span>
                </div>
                <p className="text-[#3A3A5C] text-[17px]">Run your own DGTLmart-backed digital agency in your city. You own the clients, deliver the services and build monthly recurring revenue, with DGTLmart's backend team supporting you at every step.</p>
                <div className="flex items-center gap-3.5 p-4 px-5 rounded-[14px] bg-[#F4F1FC]">
                  <b className="font-['Outfit',system-ui,sans-serif] font-bold text-[30px] text-[#7A2FD1] tabular-nums whitespace-nowrap">3 months</b>
                  <span className="text-[14px] text-[#3A3A5C] leading-[1.4]">In-depth training in sales, services, tools and client management</span>
                </div>
                <h4 className="font-bold text-[13px] uppercase tracking-[0.12em] text-[#70718A] mt-2">Best for</h4>
                <ul className="grid gap-2.5 list-none p-0 m-0">
                  {['Aspiring entrepreneurs ready to own a business', 'Ex-sales professionals and business owners', 'Freelancers and agencies looking to scale'].map((t, i) => (
                    <li key={i} className="flex gap-2.5 items-start text-[15.5px]">
                      <span className="flex-none w-5 h-5 rounded-full bg-gradient-to-r from-[#D6127D] via-[#7A2FD1] to-[#2F6FED] text-white grid place-items-center text-[11px] mt-0.5">✓</span>
                      {t}
                    </li>
                  ))}
                </ul>
                <h4 className="font-bold text-[13px] uppercase tracking-[0.12em] text-[#70718A] mt-2">What you do</h4>
                <ul className="grid gap-2.5 list-none p-0 m-0">
                  {['Find, pitch and close clients in your market', 'Own and manage client relationships', 'Deliver services to your clients', 'Grow a book of monthly retainer clients'].map((t, i) => (
                    <li key={i} className="flex gap-2.5 items-start text-[15.5px]">
                      <span className="flex-none w-5 h-5 rounded-full bg-gradient-to-r from-[#D6127D] via-[#7A2FD1] to-[#2F6FED] text-white grid place-items-center text-[11px] mt-0.5">✓</span>
                      {t}
                    </li>
                  ))}
                </ul>
                <h4 className="font-bold text-[13px] uppercase tracking-[0.12em] text-[#70718A] mt-2">What DGTLmart does</h4>
                <ul className="grid gap-2.5 list-none p-0 m-0">
                  {['Brand, sales decks, pricing and marketing materials', 'Backend team support on every client project', 'Technology stack, mentorship and growth guidance'].map((t, i) => (
                    <li key={i} className="flex gap-2.5 items-start text-[15.5px]">
                      <span className="flex-none w-5 h-5 rounded-full bg-gradient-to-r from-[#D6127D] via-[#7A2FD1] to-[#2F6FED] text-white grid place-items-center text-[11px] mt-0.5">✓</span>
                      {t}
                    </li>
                  ))}
                </ul>
                <a href="#apply" onClick={handleModelClick('DOST Franchise Partner')} className={`${btnPrimary} justify-self-start mt-1`}>
                  Become a DOST Partner →
                </a>
              </article>
            </div>

            <div className="overflow-x-auto rounded-[18px] border border-[#E7E7F1] bg-white mt-7">
              <table className="w-full border-collapse min-w-[520px]">
                <thead>
                  <tr>
                    <th className="text-left p-5 px-6 border-b border-[#E7E7F1] font-bold text-[13px] tracking-[0.12em] uppercase text-[#70718A] bg-white"></th>
                    <th className="text-left p-5 px-6 border-b border-[#E7E7F1] font-bold text-[13px] tracking-[0.12em] uppercase text-[#70718A] bg-white">Referral Partner</th>
                    <th className="text-left p-5 px-6 border-b-2 border-[#7A2FD1] font-bold text-[13px] tracking-[0.12em] uppercase text-[#7A2FD1] bg-white">DOST Franchise Partner</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Training period', '1 month', '3 months'],
                    ['Your role', 'Refer clients', 'Run your own digital business'],
                    ['Selling & closing', 'Done by DGTLmart', 'Done by you, with DGTLmart support'],
                    ['Client ownership', 'DGTLmart', 'You'],
                    ['Service delivery', 'DGTLmart', 'Done by you, with DGTLmart backend support'],
                    ['Earnings', 'Commission per successful referral', 'Recurring monthly retainer income'],
                    ['Time commitment', 'Flexible, part-time', 'Full business focus'],
                  ].map(([label, them, us], i, arr) => (
                    <tr key={i}>
                      <td className={`text-left p-5 px-6 text-[16px] font-bold text-[#1B1B3A] ${i === arr.length - 1 ? '' : 'border-b border-[#E7E7F1]'}`}>{label}</td>
                      <td className={`text-left p-5 px-6 text-[16px] text-[#70718A] ${i === arr.length - 1 ? '' : 'border-b border-[#E7E7F1]'}`}>{them}</td>
                      <td className={`text-left p-5 px-6 text-[16px] font-bold bg-[rgba(122,47,209,0.06)] ${i === arr.length - 1 ? '' : 'border-b border-[#E7E7F1]'}`}>{us}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ================= SHORTCUT ================= */}
        <section id="shortcut" className="border-t border-[#E7E7F1] py-10 sm:py-12 lg:py-16 bg-white">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
            <div>
              <span className={eyebrow}>
                <span className={eyebrowBar}></span>
                The Shortcut
              </span>
              <div className="mt-4.5 font-['Outfit',system-ui,sans-serif] font-bold text-[clamp(48px,7vw,96px)] leading-[0.95] tracking-[-0.04em]">
                <span className="bg-gradient-to-r from-[#D6127D] via-[#7A2FD1] to-[#2F6FED] bg-clip-text text-transparent">2–3 yrs</span>
                <small className="block font-['Inter',system-ui,sans-serif] font-bold text-[18px] leading-[1.3] tracking-normal text-[#3A3A5C] mt-3.5">
                  of trial, error and wasted money that most independent agencies go through, handed to you on day one.
                </small>
              </div>
            </div>
            <div>
              <h2 className={`${h2Class} mb-7`}>What you get</h2>
              <ul className="grid gap-3.5 list-none p-0 m-0">
                {[
                  'Proven pricing and proposal decks',
                  'Sales training and objection-handling scripts',
                  'Tools stack, reporting dashboards and SOPs',
                  "A brand name that opens doors a solo consultant can't",
                ].map((t, i) => (
                  <li key={i} className="flex gap-3.5 items-start bg-white p-4.5 px-5 rounded-[12px] border border-[#E7E7F1] font-semibold">
                    <span className="flex-none w-6 h-6 rounded-full bg-gradient-to-r from-[#D6127D] via-[#7A2FD1] to-[#2F6FED] text-white grid place-items-center text-[13px]">✓</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ================= SUPPORT ================= */}
        <section id="support" className="border-t border-[#E7E7F1] py-10 sm:py-12 lg:py-16">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-4 max-w-[720px] mb-8 sm:mb-10">
              <span className={eyebrow}>
                <span className={eyebrowBar}></span>
                Franchisee Support
              </span>
              <h2 className={h2Class}>
                Eight pillars of support. <span className="bg-gradient-to-r from-[#D6127D] via-[#7A2FD1] to-[#2F6FED] bg-clip-text text-transparent">You grow, we back you.</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-l border-[#E7E7F1]">
              {[
                { icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" className="w-[22px] h-[22px]"><path d="M12 3l2.6 5.5 6 .8-4.4 4.2 1.1 6L12 16.6 6.7 19.5l1.1-6L3.4 9.3l6-.8z" /></svg>), title: 'Branding', desc: 'An established name, not a startup.' },
                { icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]"><path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" /></svg>), title: 'Sales', desc: 'Scripts, decks and a closer on call.' },
                { icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]"><path d="M14.7 6.3a4 4 0 00-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 005.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z" /></svg>), title: 'Service Execution Support', desc: 'Expert backend help on every project.' },
                { icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]"><path d="M2 8l10-5 10 5-10 5z" /><path d="M6 10v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" /></svg>), title: 'Training', desc: '1 month for Referral, 3 months for DOST partners.' },
                { icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]"><path d="M3 11v2a1 1 0 001 1h3l6 5V5L7 10H4a1 1 0 00-1 1z" /><path d="M17 8.5a5 5 0 010 7" /></svg>), title: 'Marketing Materials', desc: 'Ready to deploy from day one.' },
                { icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]"><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></svg>), title: 'Technology', desc: 'Full tools stack, zero licence cost.' },
                { icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]"><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5-5 2 2-5z" /></svg>), title: 'Growth Guidance', desc: 'A mentor, not a manual.' },
                { icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]"><circle cx="12" cy="7" r="3" /><circle cx="5" cy="10" r="2.2" /><circle cx="19" cy="10" r="2.2" /><path d="M7 20c.5-3.3 2.4-5 5-5s4.5 1.7 5 5M1.5 18c.3-2 1.5-3.2 3.5-3.2M22.5 18c-.3-2-1.5-3.2-3.5-3.2" /></svg>), title: 'Backend Team', desc: 'Specialists on call when you need them.' },
              ].map((item, i) => (
                <div key={i} className="p-7 border-r border-b border-[#E7E7F1] flex flex-col gap-2.5 bg-white hover:bg-[#F4F1FC] transition-colors">
                  <span className="w-11 h-11 rounded-full bg-gradient-to-r from-[#D6127D] via-[#7A2FD1] to-[#2F6FED] grid place-items-center text-white mb-1.5">{item.icon}</span>
                  <h3 className="text-[20px] font-['Outfit',system-ui,sans-serif] font-bold tracking-[-0.01em]">{item.title}</h3>
                  <p className="text-[#70718A] text-[15px]">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-11">
              <a href="#apply" className={btnPrimary}>Talk to our partnership team →</a>
            </div>
          </div>
        </section>

        {/* ================= ABOUT ================= */}
        <section id="about" className="border-t border-[#E7E7F1] py-10 sm:py-12 lg:py-16 bg-white">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6 lg:gap-8 items-center">
            <div className="grid gap-4">
              <span className={eyebrow}>
                <span className={eyebrowBar}></span>
                About Us
              </span>
              <h2 className={h2Class}>End-to-end digital solutions, built over 7+ years</h2>
              <p className="text-[#3A3A5C] text-lg">DGTLmart Technologies Pvt Ltd is a digital technology company delivering end-to-end marketing, web and technology services to businesses across India. Now we're opening our franchise partner network to entrepreneurs nationwide.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                {[['190+', 'Services'], ['7+', 'Years'], ['Pan-India', 'Delivery team']].map(([n, l], i) => (
                  <div key={i} className="border-l-[3px] border-[#D6127D] pl-3.5">
                    <b className="block font-['Outfit',system-ui,sans-serif] font-bold text-[36px] leading-[1.1] tabular-nums">{n}</b>
                    <span className="text-[#70718A] text-[14px]">{l}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-4">
              <article className="rounded-[14px] p-7 flex flex-col gap-3 bg-gradient-to-r from-[#D6127D] via-[#7A2FD1] to-[#2F6FED] text-white">
                <span className="font-bold text-[12px] uppercase tracking-[0.16em] opacity-85">Our Vision</span>
                <p className="font-['Outfit',system-ui,sans-serif] font-bold text-[22px] leading-[1.35]">To help people become self-reliant by encouraging and supporting entrepreneurship.</p>
              </article>
              <article className="rounded-[14px] p-7 flex flex-col gap-3 bg-white border border-[#E7E7F1]">
                <span className="font-bold text-[12px] uppercase tracking-[0.16em] text-[#B00F68]">Our Mission</span>
                <ul className="m-0 pl-[18px] grid gap-2.5 text-[#3A3A5C] list-disc">
                  <li>Provide knowledge, skills and digital tools that help aspiring entrepreneurs start and grow their businesses.</li>
                  <li>Create opportunities, mentorship and support that enable people to reach financial independence through entrepreneurship.</li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        {/* ================= AWARDS ================= */}
        <section id="awards" className="border-t border-[#E7E7F1] py-10 sm:py-12 lg:py-16 bg-white">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-4 max-w-[720px] mb-8 sm:mb-10">
              <span className={eyebrow}>
                <span className={eyebrowBar}></span>
                Awards &amp; Recognition
              </span>
              <h2 className={h2Class}>Recognised nationally for performance marketing and digital transformation</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {[
                ['2022', 'Winner, India 500 Startup Award'],
                ['2024', 'Winner, Best Performance Marketing Company'],
                ['2024', 'Star of the Year, Digital Marketing'],
                ['Award', 'Best Digital Transformation Company'],
                ['Award', 'Innovative Educator Award'],
                ['Award', 'Global Sustainability Award'],
              ].map(([yr, title], i) => (
                <div key={i} className="p-6 rounded-[14px] bg-white border border-[#E7E7F1] flex flex-col gap-2">
                  <span className="font-bold text-[12px] tracking-[0.14em] uppercase text-[#B00F68]">{yr}</span>
                  <h3 className="text-[19px] font-['Outfit',system-ui,sans-serif] font-bold leading-tight">{title}</h3>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 items-center mt-8">
              <img src="https://res.cloudinary.com/dkdcdldi0/image/upload/v1790314884/badge_1.png" alt="India 500 Startup Awards winner badge" className="h-[110px] w-auto bg-white rounded-[14px] p-2.5 border border-[#E7E7F1]" />
              <img src="https://res.cloudinary.com/dkdcdldi0/image/upload/v1790314884/badge_2.jpg" alt="GoodFirms Top Digital Marketing Company badge" className="h-[110px] w-auto bg-white rounded-[14px] p-2.5 border border-[#E7E7F1]" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr] gap-3 mt-14 [grid-auto-rows:220px]" aria-label="Moments from the stage">
              <figure className="m-0 rounded-[14px] overflow-hidden relative md:row-span-2">
                <img src="https://res.cloudinary.com/dkdcdldi0/image/upload/v1790314727/img_1.jpg" alt="DGTLmart team presenting at a government office" className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
              </figure>
              <figure className="m-0 rounded-[14px] overflow-hidden relative">
                <img src="https://res.cloudinary.com/dkdcdldi0/image/upload/v1790314726/img_4.jpg" alt="DGTLmart at Sustainability Carnival award ceremony" className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
              </figure>
              <figure className="m-0 rounded-[14px] overflow-hidden relative">
                <img src="https://res.cloudinary.com/dkdcdldi0/image/upload/v1790314726/img_3.jpg" alt="DGTLmart receiving IB-SEA award and certificate on stage" className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
              </figure>
              <figure className="m-0 rounded-[14px] overflow-hidden relative">
                <img src="https://res.cloudinary.com/dkdcdldi0/image/upload/v1790314726/img2.jpg" alt="DGTLmart receiving award at Business Connect event" className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
              </figure>
              <figure className="m-0 rounded-[14px] overflow-hidden relative">
                <img src="https://res.cloudinary.com/dkdcdldi0/image/upload/v1790314726/img_5.jpg" alt="Collage of DGTLmart award wins" className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
              </figure>
            </div>
          </div>
        </section>

        {/* ================= HOW IT WORKS ================= */}
        <section id="how" className="border-t border-[#E7E7F1] py-10 sm:py-12 lg:py-16">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-4 max-w-[720px] mb-8 sm:mb-10">
              <span className={eyebrow}>
                <span className={eyebrowBar}></span>
                Your Roadmap
              </span>
              <h2 className={h2Class}>From enquiry to your first client</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 relative">
              <div className="hidden lg:block absolute left-[26px] right-[10%] top-[26px] h-[2px] bg-gradient-to-r from-[#7A2FD1] to-[#E7E7F1]"></div>
              {[
                ['1', 'Enquire', 'Fill the form and our partnership team calls you back.'],
                ['2', 'Discovery call', 'Understand the opportunity, the model and the economics.'],
                ['3', 'Choose & train', 'Pick Referral (1-month training) or DOST (3-month training).'],
                ['4', 'Launch', 'Go live in your city with DGTLmart branding and marketing materials.'],
                ['5', 'Sell & grow', 'Win clients and grow. Referrals are delivered by DGTLmart; DOST partners deliver with backend support.'],
              ].map(([n, title, desc], i, arr) => (
                <div key={i} className="flex flex-col gap-2.5 relative">
                  <span className={`w-[52px] h-[52px] rounded-full grid place-items-center font-['Outfit',system-ui,sans-serif] font-bold text-[20px] relative z-[1] ${i === arr.length - 1 ? 'text-white bg-gradient-to-r from-[#D6127D] via-[#7A2FD1] to-[#2F6FED] border-2 border-transparent' : 'bg-white border-2 border-[#7A2FD1] text-[#7A2FD1]'}`}>{n}</span>
                  <h3 className="font-['Outfit',system-ui,sans-serif] font-bold text-[20px] tracking-[-0.01em] mt-1">{title}</h3>
                  <p className="text-[#70718A] text-[15px]">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= FAQ ================= */}
        <section id="faq" className="border-t border-[#E7E7F1] py-10 sm:py-12 lg:py-16 bg-white">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-10">
            <div className="grid gap-4 max-w-[720px]">
              <span className={eyebrow}>
                <span className={eyebrowBar}></span>
                FAQ
              </span>
              <h2 className={h2Class}>Questions partners ask us</h2>
              <p className="text-[#3A3A5C] text-lg sm:text-[19px] max-w-[62ch]">Can't find your answer? Our partnership team will walk you through it.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2">
              <details open className="border-b border-[#E7E7F1] py-1">
                <summary className="cursor-pointer list-none flex justify-between gap-4 py-5 font-bold text-[18px] leading-[1.35] [&::-webkit-details-marker]:hidden">
                  Do I need a technical or marketing background?
                  <span className="flex-none w-[30px] h-[30px] rounded-full bg-[#F4F1FC] text-[#7A2FD1] grid place-items-center text-[20px]">+</span>
                </summary>
                <p className="pb-6 pr-11 text-[#3A3A5C]">No. Referral Partners get 1 month of training and DOST Partners get 3 months, covering sales, services and tools. Our backend team supports you after that too.</p>
              </details>
              {[
                ['Who delivers the services to my clients?', "For Referral Partners, DGTLmart delivers the services. DOST Franchise Partners deliver the services to their own clients, with DGTLmart's backend team providing support throughout."],
                ['Do I need an office?', "No. Premises are optional and there's no inventory to hold."],
                ['How do I earn?', 'Clients pay monthly retainers, so your income is recurring and grows as you add clients.'],
                ['Can I serve clients outside my city?', "Yes. Unlike a traditional franchise, you aren't limited to one catchment area."],
                ['How long is the training?', 'Referral Partners complete 1 month of training. DOST Franchise Partners complete 3 months of in-depth training in sales, services, tools and client management.'],
                ['What is the difference between Referral and DOST?', "As a Referral Partner you introduce clients and DGTLmart sells and delivers. As a DOST Franchise Partner you run your own digital business, own your clients, deliver the services and earn recurring monthly income, with DGTLmart's backend team supporting you."],
                ['What services can I offer?', "DGTLmart's full portfolio of 190+ services across digital marketing, web and technology."],
                ['Can I start as a Referral Partner and move to DOST later?', 'Talk to our partnership team about upgrading once you are ready to run your own business.'],
              ].map(([q, a], i) => (
                <details key={i} className="border-b border-[#E7E7F1] py-1">
                  <summary className="cursor-pointer list-none flex justify-between gap-4 py-5 font-bold text-[18px] leading-[1.35] [&::-webkit-details-marker]:hidden">
                    {q}
                    <span className="flex-none w-[30px] h-[30px] rounded-full bg-[#F4F1FC] text-[#7A2FD1] grid place-items-center text-[20px]">+</span>
                  </summary>
                  <p className="pb-6 pr-11 text-[#3A3A5C]">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ================= APPLY ================= */}
        <section id="apply" className="border-t border-[#E7E7F1] py-10 sm:py-12 lg:py-16 bg-white relative overflow-hidden">
          <div className="absolute inset-x-1/2 -top-[30%] h-[120%] w-[60%] bg-[radial-gradient(closest-side,rgba(214,18,125,0.07),transparent)] pointer-events-none"></div>
          <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
            <div>
              <span className={eyebrow}>
                <span className={eyebrowBar}></span>
                Apply Now
              </span>
              <h2 className="font-['Outfit',system-ui,sans-serif] font-bold leading-[1.08] tracking-[-0.02em] text-[clamp(28px,4vw,46px)] mt-4">
                Let's build your digital technology business, together.
              </h2>
              <p className="text-[#3A3A5C] text-lg sm:text-[19px] mt-4.5 max-w-[48ch]">
                Join the DGTLmart Growth Partner Program and start your own recurring-revenue digital agency, backed by a 7+ year brand.
              </p>
              <div className="mt-8 grid gap-3 text-[#3A3A5C] text-[15px]">
                <div><b className="text-[#1B1B3A]">Company:</b> DGTLmart Technologies Pvt Ltd</div>
                <div><b className="text-[#1B1B3A]">Website:</b> www.dgtlmart.com</div>
                <div><b className="text-[#1B1B3A]">Phone / WhatsApp:</b> +91 9810559439</div>
                <div><b className="text-[#1B1B3A]">Email:</b> contact@dgtlmart.com</div>
              </div>
            </div>

            <div className="w-full h-[540px] overflow-y-auto overflow-x-hidden rounded-[12px] shadow-[0_8px_30px_-12px_rgba(27,27,58,0.2)] border border-[#E7E7F1] relative">
              <div className="w-full h-[1050px] overflow-hidden">
                <iframe
                  src="https://forms.zohopublic.in/seemadgtl1/form/DgtlmartContactForm/formperma/ssGiVxY5H2EHUMxDu11iHwtub4d514yISnpgWQgmblc"
                  width="100%"
                  height="1250"
                  frameBorder="0"
                  scrolling="no"
                  style={{ border: 'none' }}
                  loading="lazy">
                </iframe>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}