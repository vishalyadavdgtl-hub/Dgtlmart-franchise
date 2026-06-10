//  import { Navigate } from "react-router-dom";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
 
 const  Sidebar = ({ user, setSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

 const handleLogout = () => {
  localStorage.clear();
  navigate("/partner-login");
};


  return (
    <div className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white h-full p-5 flex flex-col shadow-xl">

      <div className="mb-10 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-wide">DGTLmart</h2>
          <p className="text-xs text-slate-400">Partner Portal</p>
        </div>
        {/* Close button for mobile */}
        {setSidebarOpen && (
          <button 
            className="md:hidden text-slate-400 hover:text-white transition"
            onClick={() => setSidebarOpen(false)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <ul className="space-y-2 flex-1">
        {[
          { name: "Dashboard", icon: "📊", path: "/dashboard" },
          { name: "My Leads", icon: "📋", path: "/dashboard?tab=leads" },
          { name: "Explore Packages", icon: "📦", path: "/buy-franchise" },
          { name: "Offer Letter", icon: "📄", path: "/offer-letter" },
          { name: "Certificate", icon: "🏅", path: "/certificate" },
        ].map((item) => {
          // Strict active state check
          const isLeadsTab = location.search.includes("tab=leads");
          const isActive = item.path === "/dashboard?tab=leads" 
            ? isLeadsTab 
            : item.path === "/dashboard" 
              ? location.pathname === "/dashboard" && !isLeadsTab 
              : location.pathname === item.path;

          return (
            <li key={item.name}>
              <NavLink
                to={item.path}
                onClick={() => setSidebarOpen && setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 shadow-md"
                    : "hover:bg-slate-700"
                }`}
              >
                <span>{item.icon}</span>
                {item.name}
              </NavLink>
            </li>
          );
        })}
      </ul>

      {/* 🔥 Profile */}
     <div className="pt-6 border-t border-slate-700">
  <div className="flex items-center gap-3 mb-4">
    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center font-bold shadow">
      {user?.fullName?.charAt(0) || "P"}
    </div>
    <div>
      <p className="text-sm font-semibold truncate w-32">
        {user?.fullName || "Partner"}
      </p>
      {/* {console.log(user)} */}
      <p className="text-xs text-slate-400">
        Referral Partner
      </p>
    </div>
  </div>

  {/* 🔥 LOGOUT BUTTON */}
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