// import { useNavigate } from "react-router-dom";
// import { useEffect, useState } from "react";
// // import { partnerPackagesAPI } from "../../utils/api";
// // import { packagesAPI } from "../../utils/api";
// import { adminAPI } from "../../utils/api";
// import packagesAPI from "../../utils/api";
// import LoadingSpinner from "../../components/common/LoadingSpinner";
// import { useToast } from "../../components/common/Toast";
// import Footer from "../../components/common/Footer";
// import Navbar from "../../components/common/Navbar";

// const Packages = () => {
//   const [packages, setPackages] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const { showToast } = useToast();
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchPackages();
//   }, []);

//  const fetchPackages = async () => {
//   try {
//     setLoading(true);

//     const response = await adminAPI.getPartnerCards();

//     console.log("Packages API:", response.data);

//     setPackages(response.data.data || []);
//   } catch (error) {
//     console.error("Error fetching packages:", error);
//     showToast("Failed to load packages", "error");
//   } finally {
//     setLoading(false);
//   }
// };

//   if (loading) return <LoadingSpinner />;

//   if (packages.length === 0) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-6">
//         <div className="text-center">
//           <h1 className="text-4xl font-bold text-gray-800 mb-2">
//             No Packages Available
//           </h1>
//           <p className="text-gray-500 text-lg">
//             Packages will be available soon. Check back later!
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
//       <Navbar />
//       {/* Hero Section */}
//       <section className="relative min-h-[50vh] flex items-center overflow-hidden py-16 md:py-24">
//         {/* Background */}
//         <div className="absolute inset-0 z-0">
//           <div
//             className="absolute inset-0 bg-cover bg-center bg-no-repeat"
//             style={{
//               backgroundImage: `url('https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1800')`,
//             }}
//           ></div>
//           <div className="absolute inset-0 bg-gradient-to-br from-blue-900/92 via-slate-900/90 to-blue-800/88"></div>
//         </div>

//         <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
//           <div className="text-center">
//             <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm font-semibold mb-6">
//               <span className="flex h-2 w-2 rounded-full bg-blue-400"></span>
//               Choose Your Perfect Plan
//             </div>

//             <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
//               Pick Your Partnership Package
//               <br />
//               <span className="text-blue-300">
//                 And Start Your Journey Today
//               </span>
//             </h1>

//             <p className="text-lg text-blue-100 max-w-2xl mx-auto">
//               Select the perfect partnership model tailored to your ambitions
//               and goals. Each plan includes dedicated support and proven growth
//               strategies.
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* Packages Section */}
//       <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//           {packages.map((pkg, index) => (
//             <div
//               key={pkg._id}
//               className={`rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-xl ${
//                 index === 2 ? "border-blue-500 shadow-lg" : "border-gray-200"
//               }`}
//             >
//               {/* Card */}
// <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col h-[420px]">

//   {/* HEADER */}
//   <div>
//     <h2 className="text-sm font-semibold text-gray-800 leading-tight">
//       {pkg.name}
//     </h2>

//     <p className="text-2xl font-bold text-blue-600 mt-1">
//       ₹{pkg.price.toLocaleString()}
//     </p>

//     <p className="text-xs text-gray-500 mt-1 leading-tight">
//       {pkg.description}
//     </p>
//   </div>

//   {/* FEATURES */}
//   <div className="mt-4 flex-1 overflow-y-auto pr-1">

//     <h3 className="text-xs font-semibold text-gray-700 mb-2">
//       What's Included
//     </h3>

//     <ul className="space-y-1">
//       {pkg.features?.map((feature, idx) => (
//         <li
//           key={idx}
//           className="flex items-start gap-2 text-xs text-gray-600 leading-tight"
//         >
//           <span className="text-green-500 text-[10px] mt-[2px]">✔</span>
//           {feature}
//         </li>
//       ))}
//     </ul>
//   </div>

//   {/* BUTTON */}
//   <button
//     onClick={() =>
//       navigate(`/referral-partner/${pkg._id}`, {
//         state: {
//           package: pkg,
//           isPartnerFlow: true,
//           // role: partnerType,
//         },
//       })
//     }
//     className="mt-4 w-full py-2 text-sm rounded-md font-medium text-white 
//     bg-blue-600 hover:bg-blue-700 transition"
//   >
//     Get Started →
//   </button>
// </div>
//             </div>
//           ))}
//         </div>
//       </section>
//       <Footer />
//     </div>
//   );
// };

// export default Packages;
