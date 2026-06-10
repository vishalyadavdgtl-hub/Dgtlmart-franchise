import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { referralAPI } from "../../utils/api";

export default function Navbar({ isAdmin = false, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPartnerLoggedIn, setIsPartnerLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [partnerName, setPartnerName] = useState("");
  const [partnerType, setPartnerType] = useState("");
  const [partnerRole, setPartnerRole] = useState("");
  const [commissionRate, setCommissionRate] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkPartnerAuth = () => {
      const partnerData = localStorage.getItem("partnerData");
      if (partnerData) {
        setIsPartnerLoggedIn(true);
        const data = JSON.parse(partnerData);
        setPartnerName(data.fullName || "Partner");
        setPartnerType(data.partnerType || "referral");
        setPartnerRole(data.role || "");
      } else {
        setIsPartnerLoggedIn(false);
        setPartnerType("");
        setPartnerRole("");
      }

      // Check Admin Auth
      const adminToken = localStorage.getItem("adminToken");
      const adminData = localStorage.getItem("adminUser");
      if (adminToken && adminData) {
        setAdminUser(JSON.parse(adminData));
      } else {
        setAdminUser(null);
      }
    };

    checkPartnerAuth();
    // Listen for storage changes
    window.addEventListener("storage", checkPartnerAuth);
    return () => window.removeEventListener("storage", checkPartnerAuth);
  }, []);

  // If we have a token but missing partnerType/details, fetch dashboard once to populate
  useEffect(() => {
    let mounted = true;
    const ensureDetails = async () => {
      try {
        const token = localStorage.getItem("partnerToken");
        const user = localStorage.getItem("partnerUser");
        const parsed = user ? JSON.parse(user) : null;
        if (token && (!parsed || !parsed.partnerType)) {
          const res = await referralAPI.getDashboard();
          if (!mounted) return;
          const p = {
            fullName: res.data.fullName,
            email: res.data.email, // Ensure email is stored
            partnerType: res.data.partnerType,
            commissionRate: res.data.commissionRate,
            referralCode: res.data.referralCode,
          };
          localStorage.setItem("partnerUser", JSON.stringify(p));
          setPartnerName(p.fullName || "Partner");
          setPartnerType(p.partnerType || "referral");
          setCommissionRate(p.commissionRate || null);
        } else if (parsed) {
          setPartnerType(parsed.partnerType || "");
          setCommissionRate(parsed.commissionRate || null);
        }
      } catch (err) {
        console.warn(
          "Failed to fetch partner details for navbar",
          err?.message || err,
        );
      }
    };

    ensureDetails();
    return () => {
      mounted = false;
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showProfileDropdown &&
        !event.target.closest(".profile-dropdown-container")
      ) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfileDropdown]);

  const isActive = (path) => location.pathname === path;

  const getNavLinkClass = (path) => {
    return `px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
      isActive(path)
        ? "text-blue-600 bg-blue-50 font-bold"
        : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
    }`;
  };

  const getPartnerEmail = () => {
    try {
      const user = localStorage.getItem("partnerUser");
      return user ? JSON.parse(user).email : "";
    } catch (e) {
      return "";
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg py-3"
            : "bg-white shadow-sm py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center group"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <img
                src="https://res.cloudinary.com/dbbll23jz/image/upload/v1770010224/dgtlmart-Logo_Digital-marketing-company_1_fykyyt.png"
                alt="DGTLmart Logo"
                className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              {!isAdmin ? (
                <>
                  <Link to="/" className={getNavLinkClass("/")}>
                    Home
                  </Link>
                  <Link to="/contact" className={getNavLinkClass("/contact")}>
                    Contact Us
                  </Link>
                  <Link
                    to="/partner-login"
                    className={`px-4 py-2 text-sm font-medium transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md rounded-lg ${
                      isActive("/partner-login")
                        ? "bg-blue-700 text-white shadow-md"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    Partner Login
                  </Link>
                  {!isPartnerLoggedIn && (
                    <>
                      {/* <Link
                        to="/packages"
                        className={`px-4 py-2 text-sm font-medium transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md rounded-lg ${
                          isActive("/referral-partner")
                            ? "bg-blue-700 text-white shadow-md"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        Become a Partner
                      </Link> */}
                    </>
                  )}
                  <Link
                    to="/referral-partner"
                     className={`px-5 py-2.5 text-sm font-medium rounded-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-blue-500/25 ${
                  isActive("/referral-partner")
                    ? "text-white bg-gradient-to-r from-blue-700 to-purple-700 shadow-lg ring-2 ring-blue-500 ring-offset-2"
                    : "text-white bg-gradient-to-r from-blue-600 to-purple-600"
                }`}
                  >
                    Become a Partner
                  </Link>
                  <Link
                    to="/buy-franchise"
                    className={`px-5 py-2.5 text-sm font-medium rounded-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-blue-500/25 ${
                      isActive("/buy-franchise")
                        ? "text-white bg-gradient-to-r from-blue-700 to-purple-700 shadow-lg ring-2 ring-blue-500 ring-offset-2"
                        : "text-white bg-gradient-to-r from-blue-600 to-purple-600"
                    }`}
                  >
                    Explore Packages
                  </Link>
                  {isPartnerLoggedIn && (
                    <div className="relative profile-dropdown-container">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setShowProfileDropdown(!showProfileDropdown)
                          }
                          className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm hover:shadow-lg transition-all transform hover:scale-105"
                        >
                          {partnerName.charAt(0).toUpperCase()}
                        </button>
                        {partnerType && (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${partnerType === "franchise" ? "bg-indigo-100 text-indigo-700" : "bg-blue-100 text-blue-700"}`}
                          >
                            {partnerType.charAt(0).toUpperCase() +
                              partnerType.slice(1)}
                          </span>
                        )}
                      </div>
                      {showProfileDropdown && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-sm font-bold text-gray-900 leading-none mb-1">
                              {partnerName}
                            </p>
                            <p className="text-[11px] text-gray-500 truncate mb-1">
                              {getPartnerEmail()}
                            </p>
                            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">
                              {partnerType
                                ? `${partnerType} Partner`
                                : "Partner"}
                            </p>
                          </div>
                          <Link
                            to="/dashboard"
                            onClick={() => setShowProfileDropdown(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                          >
                            <svg
                              className="w-4 h-4 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                              />
                            </svg>
                            Dashboard
                          </Link>
                          <button
                            onClick={() => {
                              localStorage.removeItem("partnerData");
                              localStorage.removeItem("partnerToken");
                              localStorage.removeItem("partnerUser");
                              setIsPartnerLoggedIn(false);
                              setShowProfileDropdown(false);
                              navigate("/partner-login");
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                              />
                            </svg>
                            Logout
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="text-right flex flex-col items-end">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
                      Admin Session
                    </span>
                    <span className="text-sm text-gray-900 font-bold leading-none">
                      {adminUser?.username || "Administrator"}
                    </span>
                    <span className="text-[10px] text-gray-500 mt-1">
                      {adminUser?.email}
                    </span>
                  </div>
                  <div className="h-8 w-px bg-gray-200"></div>
                  <button
                    onClick={onLogout}
                    className="px-4 py-2 text-sm font-bold text-gray-700 hover:text-red-600 border border-gray-200 rounded-xl hover:border-red-100 hover:bg-red-50 transition-all duration-300 flex items-center gap-2 shadow-sm"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          <div
            className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${
              isMobileMenuOpen
                ? "max-h-[80vh] opacity-100 mt-4 pb-4"
                : "max-h-0 opacity-0"
            }`}
          >
            <div className="bg-white rounded-2xl p-4 space-y-3 border border-gray-100 shadow-xl mx-1">
              {!isAdmin ? (
                <>
                  <Link
                    to="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                      isActive("/") 
                        ? "bg-blue-50 text-blue-600" 
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Home
                  </Link>
                  <Link
                    to="/contact"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                      isActive("/contact") 
                        ? "bg-blue-50 text-blue-600" 
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Contact Us
                  </Link>
                  
                  <div className="h-px bg-gray-100 my-2"></div>

                  {!isPartnerLoggedIn ? (
                    <>
                      <Link
                        to="/partner-login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-4 py-3 text-sm font-bold text-white bg-green-600 hover:bg-green-700 transition-all rounded-xl text-center shadow-lg shadow-green-500/20 active:scale-95"
                      >
                        Partner Login
                      </Link>
                    </>
                  ) : (
                    <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100">
                      <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-2 px-1">Active Session</p>
                      <Link
                        to="/dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg shadow-sm border border-blue-100/50"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                          {partnerName.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-gray-900 leading-none">{partnerName}</p>
                          <p className="text-[10px] text-gray-500 mt-1">Visit Dashboard</p>
                        </div>
                      </Link>
                    </div>
                  )}

                  <Link
                    to="/referral-partner"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg transition-all rounded-xl text-center active:scale-95"
                  >
                    Become a Partner
                  </Link>
                  
                  <Link
                    to="/buy-franchise"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg transition-all rounded-xl text-center active:scale-95"
                  >
                    Explore Packages
                  </Link>

                  {isPartnerLoggedIn && (
                    <button
                      onClick={() => {
                        localStorage.removeItem("partnerData");
                        localStorage.removeItem("partnerToken");
                        localStorage.removeItem("partnerUser");
                        setIsPartnerLoggedIn(false);
                        setIsMobileMenuOpen(false);
                        navigate("/partner-login");
                      }}
                      className="block w-full px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 border border-red-100 rounded-xl transition-all active:scale-95"
                    >
                      Logout
                    </button>
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Signed in as Admin</p>
                    <p className="text-sm font-bold text-slate-900">{adminUser?.username}</p>
                  </div>
                  <button
                    onClick={() => {
                      onLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 border border-red-100 rounded-xl transition-all active:scale-95"
                  >
                    Admin Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Add spacing for fixed navbar */}
      <div className="h-16"></div>

      {/* Add custom animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        nav {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </>
  );
}
