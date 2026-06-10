// src/pages/Admin/PartnerDashboardView.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import FranchiseDashboard from "../Franchise/FranchiseDashboard";

export default function PartnerDashboardView() {
  const { partnerId } = useParams();
  const navigate = useNavigate();
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const url = `${import.meta.env.VITE_API_URL}/api/admin/partner-dashboard/${partnerId}`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setPartner(data);
      } catch (err) {
        setError("Partner data load nahi hua. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchPartner();
  }, [partnerId]);

  // ✅ Admin ke liye sidebar items
  const adminSidebarItems = [
    { name: "Dashboard", icon: "📊", path: `/admin/partner/${partnerId}` },
    { name: "My Leads", icon: "📋", path: `/admin/partner/${partnerId}?tab=leads` },
    { name: "Explore Packages", icon: "📦", path: `/admin/partner/${partnerId}?tab=packages` },
    { name: "Training", icon: "🎓", path: `/admin/partner/${partnerId}?tab=training` },
    { name: "Profile", icon: "👤", path: `/admin/partner/${partnerId}?tab=profile` },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 text-sm">Loading partner dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-semibold"
          >
            ← Wapas Jao
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* ✅ Admin Top Banner */}
      <div
        style={{
          background: "#0f172a",
          color: "white",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* ✅ Mobile Hamburger Menu */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden text-white p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button
            onClick={() => navigate("/admin/referrals")}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "white",
              padding: "6px 14px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            ← Back to Referral Partners
          </button>
          <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)" }}>
            👁️ Admin View —{" "}
            <strong style={{ color: "white" }}>{partner?.fullName}</strong> dashboard
          </span>
        </div>

        {/* ✅ Edit / Read Only Toggle Button */}
        <button
          onClick={() => setIsEditMode((prev) => !prev)}
          style={{
            background: isEditMode ? "#10b981" : "#f59e0b",
            color: isEditMode ? "white" : "#1e293b",
            padding: "6px 16px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: "700",
            border: "none",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          {isEditMode ? "✏️ EDIT MODE — Save Changes" : "👁 READ ONLY — Click to Edit"}
        </button>
      </div>

      {/* ✅ Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* ✅ Main Layout: Sidebar + Dashboard */}
      <div className="flex flex-1">
        {/* ✅ Sidebar */}
        <div className={`w-64 fixed top-0 left-0 h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-5 flex flex-col shadow-xl z-40 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-bold tracking-wide">DGTLmart</h2>
              <p className="text-xs text-slate-400">Partner Portal</p>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              ✕
            </button>
          </div>

          <ul className="space-y-2 flex-1">
            {adminSidebarItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isActive ? "bg-blue-600 shadow-md" : "hover:bg-slate-700"
                    }`
                  }
                >
                  <span>{item.icon}</span>
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Partner Info at bottom */}
          <div className="pt-6 border-t border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center font-bold shadow">
                {partner?.fullName?.charAt(0) || "P"}
              </div>
              <div>
                <p className="text-sm font-semibold">{partner?.fullName || "Partner"}</p>
                <p className="text-xs text-slate-400 capitalize">
                  {partner?.role ? `${partner.role} Partner` : "Partner"}
                </p>
              </div>
            </div>

            {/* ✅ Edit mode indicator in sidebar */}
            {isEditMode && (
              <div className="mt-2 bg-emerald-500/20 border border-emerald-500/40 rounded-lg px-3 py-2">
                <p className="text-emerald-400 text-xs font-semibold text-center">
                  ✏️ Edit Mode Active
                  
                </p>
                {/* {console.log("Edit Mode Active", error)} */}
              </div>
            )}
          </div>
        </div>

        {/* ✅ FranchiseDashboard — isEditMode pass karo */}
        <div className="flex-1 overflow-auto lg:ml-64 ml-0">
         <FranchiseDashboard
  adminPartner={partner}
  isAdminEditMode={isEditMode}
  onPartnerUpdate={(updatedData) => setPartner(updatedData)}
/>
        </div>
      </div>
    </div>
  );
}