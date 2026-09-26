import { NavLink, useNavigate, useLocation } from "react-router-dom";

const DASHBOARD_TABS = [
  { id: "overview",  label: "Overview",      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { id: "training",  label: "Training",      icon: "M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" },
  { id: "branding",  label: "Branding & CRM",icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
  { id: "referral",  label: "Referral",      icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" },
  { id: "leads",     label: "Leads",         icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
  { id: "profile",   label: "Profile",       icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
];

const Sidebar = ({ user, setSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/partner-login");
  };

  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get("tab") || "overview";
  const isOnDashboard = location.pathname === "/dashboard";

  const handleTabClick = (tabId) => {
    navigate(`/dashboard?tab=${tabId}`, { replace: true });
    if (setSidebarOpen) setSidebarOpen(false);
  };

  return (
    <div className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white h-full flex flex-col shadow-xl overflow-y-auto">

      {/* Header */}
      <div className="px-4 pt-5 pb-3 flex justify-between items-center border-b border-slate-700/60 flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold tracking-wide">DGTLmart</h2>
          <p className="text-xs text-slate-400">Partner Portal</p>
        </div>
        {setSidebarOpen && (
          <button
            className="md:hidden text-slate-400 hover:text-white transition"
            onClick={() => setSidebarOpen(false)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="mx-3 my-2 border-t border-slate-700/40 flex-shrink-0" />
      {/* Dashboard Tabs */}
      <div className="px-2 flex-1 overflow-y-auto pt-1">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 px-2 mb-1">Dashboard</p>
        <ul className="space-y-0.5 mb-3">
          {DASHBOARD_TABS.map((tab) => (
            <li key={tab.id}>
              <button
                onClick={() => handleTabClick(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-base transition-all duration-200 text-left ${
                  isOnDashboard && activeTab === tab.id
                    ? "bg-blue-600 shadow-md font-semibold text-white"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                <span className="truncate">{tab.label}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="mx-1 mb-2 border-t border-slate-700/40" />

        {/* Other Links */}
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 px-2 mb-1">More</p>
        <ul className="space-y-0.5">
          {[
            { name: "Explore Packages", icon: "📦", path: "/buy-franchise" },
            { name: "Offer Letter",      icon: "📄", path: "/offer-letter" },
            { name: "Certificate",       icon: "🏅", path: "/certificate" },
          ].map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                onClick={() => setSidebarOpen && setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-base transition-all duration-200 ${
                    isActive ? "bg-blue-600 shadow-md font-semibold text-white" : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`
                }
              >
                <span className="text-base">{item.icon}</span>
                <span className="truncate">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Profile + Logout */}
      <div className="px-3 pt-3 pb-4 border-t border-slate-700/60 flex-shrink-0">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center font-bold text-base shadow flex-shrink-0">
            {user?.fullName?.charAt(0) || "P"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{user?.fullName || "Partner"}</p>
            <p className="text-xs text-slate-400 capitalize truncate">
              {user?.franchiseType
                ? `${user.franchiseType} Partner`
                : user?.partnerType
                  ? `${user.partnerType} Partner`
                  : "Partner"}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-semibold transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;