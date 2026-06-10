import { useState } from "react";
import Sidebar from "../../components/FranchiseSidebar/Sidebar";
import { Outlet } from "react-router-dom";
import Navbar from "../../components/common/Navbar";

// import Footer from "../../components/common/Footer";

const FranchiseLayout = () => {
   const user = JSON.parse(localStorage.getItem("partnerData"));
   const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen">

      {/* 🔥 Navbar (sticky, no overlap) */}
      <div className="sticky top-0 z-50">
        <Navbar />
      </div>

      {/* 🔥 Middle Section */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar (full height) */}
        <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:relative md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <Sidebar user={user} setSidebarOpen={setSidebarOpen} />
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-slate-50 p-4 md:p-6 overflow-y-auto w-full">
          {/* Mobile hamburger button */}
          <div className="md:hidden flex items-center mb-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
            <span className="ml-3 font-bold text-slate-800 text-lg">Menu</span>
          </div>

          <Outlet />
        </div>

      </div>

      {/* Footer optional */}
      {/* <Footer /> */}

    </div>
  );
};

export default FranchiseLayout;