  import { useState } from "react";
import Sidebar from "../../components/FranchiseSidebar/Sidebar";
import { Outlet } from "react-router-dom";
import Navbar from "../../components/common/Navbar";

// import Footer from "../../components/common/Footer";

const FranchiseLayout = () => {
   const user = JSON.parse(localStorage.getItem("partnerUser") || localStorage.getItem("partnerData") || "{}");
   const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      {/* Navbar fixed at top */}
      <div className="flex-shrink-0 z-50">
        <Navbar />
      </div>

      {/* Main Layout Area */}
      <div className="flex flex-1 overflow-hidden relative pt-4">
        
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`fixed md:static inset-y-0 left-0 z-50 md:z-0 transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 flex-shrink-0`}>
          <Sidebar user={user} setSidebarOpen={setSidebarOpen} />
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 bg-slate-50 overflow-y-auto w-full">
          <div className="p-4 md:p-6 min-h-full">
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
      </div>
    </div>
  );
};

export default FranchiseLayout;