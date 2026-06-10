import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";

import { franchiseDashboardAPI, adminAPI, leadAPI } from "../../utils/api";
import { useToast } from "../../components/common/Toast";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { franchiseAPI, explorePackagesAPI } from "../../utils/api";

const TABS = [
  {
    id: "overview",
    label: "Overview",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1  1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    roles: ["franchise", "referral"],
  },
  {
    id: "packages",
    label: "Packages",
    icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m0 0v10l8 4",
    roles: ["franchise", "referral"],
  },
  {
    id: "training",
    label: "Training",
    icon: "M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z",
    roles: ["franchise", "referral"],
  },
  {
    id: "branding",
    label: "Branding & CRM",
    icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
    roles: ["franchise"],
  },
  {
    id: "referral",
    label: "Referral",
    icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
    roles: ["franchise", "referral"],
  },
  {
    id: "profile",
    label: "Profile",
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    roles: ["franchise", "referral"],
  },
];

const statusBadge = (s) => {
  const map = {
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    pending: "bg-amber-100 text-amber-700",
    paid: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    sent: "bg-blue-100 text-blue-700",
    signed: "bg-purple-100 text-purple-700",
  };
  return map[s] || "bg-slate-100 text-slate-600";
};

// ✅ Reusable editable field component
function EditableField({ label, value, field, isEditMode, onChange, type = "text" }) {
  if (isEditMode) {
    return (
      <div className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
        <span className="text-slate-500 text-sm">{label}</span>
        <input
          type={type}
          value={value || ""}
          onChange={(e) => onChange(field, e.target.value)}
          className="border border-indigo-300 rounded-lg px-3 py-1 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-48 text-right"
        />
      </div>
    );
  }
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
      <span className="text-slate-500 text-sm">{label}</span>
      <span className={`font-semibold text-sm capitalize ${label === "Role" ? "text-indigo-700" :
        label === "Total Earnings" ? "text-emerald-600" :
          "text-slate-800"
        }`}>
        {value || "—"}
      </span>
    </div>
  );
}

// ✅ Editable stat card component
function EditableStatCard({ card, isEditMode, onEdit }) {
  return (
    <div className={`bg-gradient-to-br ${card.color} rounded-2xl p-6 text-white shadow-lg`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-white/80 text-sm font-medium">{card.label}</p>
          {card.note && <p className="text-white/60 text-xs">{card.note}</p>}
        </div>
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
          </svg>
        </div>
      </div>
      {isEditMode && card.editable ? (
        <input
          type={card.inputType || "text"}
          value={card.rawValue ?? card.value}
          onChange={(e) => onEdit(card.editKey, e.target.value)}
          className="text-2xl font-bold bg-white/20 border border-white/40 rounded-xl px-3 py-1 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 w-full"
        />
      ) : (
        <p className="text-3xl font-bold">{card.value}</p>
      )}
      {isEditMode && card.editable && (
        <p className="text-white/50 text-xs mt-1">✏️ Editing enabled</p>
      )}
    </div>
  );
}

// ✅ NEW: Editable status card (top row)
function EditableStatusCard({ c, isEditMode, onEdit }) {
  return (
    <div className={`${c.color} border rounded-2xl p-4`}>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{c.label}</p>
      {isEditMode && c.editable ? (
        c.options ? (
          <select
            value={c.rawValue ?? c.value}
            onChange={(e) => onEdit(c.editKey, e.target.value)}
            className={`text-xl font-bold ${c.text} capitalize bg-white border border-indigo-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full`}
          >
            {c.options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : (
          <input
            type={c.inputType || "text"}
            value={c.rawValue ?? c.value}
            onChange={(e) => onEdit(c.editKey, e.target.value)}
            className={`text-xl font-bold ${c.text} bg-white border border-indigo-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full`}
          />
        )
      ) : (
        <p className={`text-xl font-bold ${c.text} capitalize`}>{c.value}</p>
      )}
      {c.sub && <p className="text-xs text-slate-400 mt-0.5">{c.sub}</p>}
    </div>
  );
}

export default function FranchiseDashboard({ adminPartner, isAdminEditMode = false, onPartnerUpdate }) {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [packages, setPackages] = useState([]);
  const [training, setTraining] = useState([]);
  const [myLeads, setMyLeads] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const [isSaving, setIsSaving] = useState(false);

  const { partnerId } = useParams();
  const isAdminView = !!adminPartner || !!partnerId;

  // ✅ editedStats — admin jo changes kare wo yahan store honge
  const [editedStats, setEditedStats] = useState({});

  const [form, setForm] = useState({
    name: "", email: "", phone: "", businessType: "", requirement: "", website: "",
  });
  const [errors, setErrors] = useState({});
  const [isFormLoading, setIsFormLoading] = useState(false);

  const validateField = (name, value) => {
    let error = "";
    const trimmedValue = typeof value === 'string' ? value.trim() : value;

    switch (name) {
      case "name":
        if (!trimmedValue) error = "Full Name is required";
        break;
      case "email":
        if (!trimmedValue) {
          error = "Email Address is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) {
          error = "Please enter a valid email address";
        }
        break;
      case "phone":
        if (!trimmedValue) {
          error = "Phone Number is required";
        } else if (!/^\d+$/.test(trimmedValue)) {
          error = "Only digits allowed";
        } else if (trimmedValue.length < 10 || trimmedValue.length > 15) {
          error = "Phone must be 10-15 digits";
        }
        break;
      case "businessType":
        if (!trimmedValue) error = "Business Type is required";
        break;
      case "requirement":
        if (!trimmedValue) {
          error = "Requirement is required";
        } else if (trimmedValue.length < 10) {
          error = "Min 10 characters required";
        }
        break;
      case "website":
        if (trimmedValue && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(trimmedValue)) {
          error = "Please enter a valid URL";
        }
        break;
      default:
        break;
    }
    return error;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const isFormValid = () => {
    const requiredFields = ["name", "email", "phone", "businessType", "requirement"];
    const hasRequired = requiredFields.every(field => form[field]?.trim());
    const hasErrors = Object.values(errors).some(err => err);
    return hasRequired && !hasErrors;
  };

  const closeAddModal = () => {
    const hasData = Object.values(form).some(val => val && val.trim() !== "");
    if (hasData) {
      if (!window.confirm("Discard unsaved changes?")) return;
    }
    setForm({ name: "", email: "", phone: "", businessType: "", requirement: "", website: "" });
    setErrors({});
    setShowAddModal(false);
  };

  const totalEarned = myLeads
    .filter((l) => l.status === "converted")
    .reduce((sum, l) => sum + (l.commission || 0), 0);

  // ✅ Merged stats — original + admin edits
  const mergedStats = { ...stats, ...editedStats };

  // ✅ Handler jab admin koi field edit kare
  const handleAdminEdit = (field, value) => {
    setEditedStats((prev) => ({ ...prev, [field]: value }));
  };

  // ✅ Save changes to backend
  const handleSaveChanges = async () => {
    if (Object.keys(editedStats).length === 0) {
      showToast("Koi changes nahi kiye!", "info");
      return;
    }
    setIsSaving(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/partner-update/${partnerId || adminPartner?._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editedStats),
        }
      );
      if (!res.ok) throw new Error("Save failed");
      const updated = await res.json();
      setStats((prev) => ({ ...prev, ...editedStats }));
      setEditedStats({});
      showToast("✅ Changes saved successfully!", "success");
      if (onPartnerUpdate) onPartnerUpdate({ ...stats, ...editedStats });
    } catch (err) {
      showToast("❌ Save nahi hua. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    // ✅ Agar adminPartner prop aaya hai toh directly use karo
    if (adminPartner) {
      setUser(adminPartner);
      setStats(adminPartner);
      fetchAll(adminPartner);
      const params = new URLSearchParams(location.search);
      const tab = params.get("tab");
      if (tab) setActiveTab(tab);
      return;
    }

    const fetchUser = async () => {
      try {
        const baseURL = import.meta.env.VITE_API_URL;
        const token = isAdminView
          ? localStorage.getItem("adminToken")
          : localStorage.getItem("partnerToken");

        const url = isAdminView
          ? `${baseURL}/api/admin/partner-dashboard/${partnerId}`
          : `${baseURL}/api/referral/dashboard`;

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          if (res.status === 401) {
            if (isAdminView) {
              localStorage.removeItem("adminToken");
              navigate("/manage-dgtl");
            } else {
              localStorage.removeItem("partnerToken");
              localStorage.removeItem("partnerData");
              navigate("/partner-login");
            }
            return;
          }
          throw new Error("API failed");
        }

        const data = await res.json();
        if (!data) {
          navigate(isAdminView ? "/manage-dgtl" : "/partner-login");
          return;
        }
        if (!isAdminView && data.status !== "ACTIVE") {
          navigate("/waiting-for-approval");
          return;
        }

        if (isAdminView) {
          setUser(data);
        } else {
          setUser(data.user || data);
        }

        const params = new URLSearchParams(location.search);
        const tab = params.get("tab");
        if (tab) setActiveTab(tab);

        fetchAll(data);
      } catch (err) {
        console.error(err);
        navigate(isAdminView ? "/manage-dgtl" : "/partner-login");
      }
    };

    fetchUser();
  }, [partnerId, location, adminPartner]);

  // ✅ Save button dikhao jab edit mode ON ho aur changes ho
  useEffect(() => {
    if (isAdminEditMode && Object.keys(editedStats).length > 0) {
      // Auto-remind — optional
    }
  }, [isAdminEditMode, editedStats]);

  const fetchAll = async (userData) => {
    setLoading(true);
    try {
      if (isAdminView) {
        setStats(userData);
      } else {
        const isReferral = userData.role === 'referral' || userData.franchiseType === 'referral' || userData.partnerType === 'referral';
        
        if (isReferral) {
          // Referral partners have all their stats from the initial fetchUser call
          setStats(userData);
        } else {
          // Franchise partners need extra stats (paymentStatus, agreementStatus, selectedPackage)
          const dashRes = await franchiseDashboardAPI.getDashboard();
          setStats(dashRes.data);
        }
      }
      await Promise.all([fetchPackages(), fetchTraining(), fetchLeads()]);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      const res = await explorePackagesAPI.getPackages();

      const raw = res.data?.data || res.data || {};
      const flat = Object.values(raw).flat();

      console.log("EXPLORE PACKAGES:", flat); // debug

      setPackages(flat);
    } catch (err) {
      console.error("Error fetching packages:", err);
      setPackages([]);
    }
  };

  const fetchTraining = async () => {
    try {
      const res = await adminAPI.getTrainingModules();
      setTraining(res.data.modules || []);
    } catch { }
  };

  const fetchLeads = async () => {
    try {
      const baseURL = import.meta.env.VITE_API_URL;
      if (isAdminView) {
        const token = localStorage.getItem("adminToken");
        const pid = partnerId || adminPartner?._id;
        const res = await fetch(`${baseURL}/api/admin/partner-leads/${pid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setMyLeads(data.leads || []);
      } else {
        const response = await leadAPI.getMyLeads();
        setMyLeads(response.data.leads || []);
      }
    } catch (err) {
      console.log("ERROR FETCHING LEADS:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("partnerData");
    localStorage.removeItem("partnerToken");
    localStorage.removeItem("partnerUser");
    navigate("/partner-login");
  };

  const handleCopyLink = () => {
    if (mergedStats?.referralLink) {
      navigator.clipboard.writeText(mergedStats.referralLink);
      showToast("Referral link copied!", "success");
    }
  };

  const handleCopyCode = () => {
    if (mergedStats?.referralCode) {
      navigator.clipboard.writeText(mergedStats.referralCode);
      showToast("Referral code copied!", "success");
    }
  };

  const handleCreateLead = async () => {
    if (!isFormValid()) return;

    setIsFormLoading(true);
    try {
      // Trim all fields before sending
      const trimmedForm = Object.keys(form).reduce((acc, key) => {
        acc[key] = typeof form[key] === 'string' ? form[key].trim() : form[key];
        return acc;
      }, {});

      await leadAPI.create(trimmedForm);
      showToast("Lead Created Successfully ✅", "success");
      setShowAddModal(false);
      setForm({ name: "", email: "", phone: "", businessType: "", requirement: "", website: "" });
      setErrors({});
      fetchLeads();
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.error || "Error creating lead", "error");
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/admin/partner-dashboard/${partnerId}`,
      { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData }
    );
    if (!res.ok) { console.error("Upload failed"); return; }
    const data = await res.json();
    setUser((prev) => ({ ...prev, profileImage: data.image }));
  };

  const isActuallyReferral =
    mergedStats?.role === "referral" || mergedStats?.franchiseType === "referral";

  const roleBadge = isActuallyReferral
    ? { label: "Referral Partner", color: "from-green-600 to-emerald-600" }
    : mergedStats?.franchiseType === "sathi"
      ? { label: "Sathi Partner", color: "from-purple-600 to-pink-600" }
      : { label: "Dost Partner", color: "from-indigo-600 to-blue-600" };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-950">
        <LoadingSpinner size="lg" color="border-indigo-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-4 md:py-8 overflow-x-hidden">

        {/* ✅ Edit Mode Active Banner */}
        {isAdminEditMode && (
          <div className="mb-4 bg-amber-50 border border-amber-300 rounded-2xl px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-amber-600 text-xl">✏️</span>
              <div>
                <p className="text-amber-800 font-bold text-sm">Edit Mode Active</p>
                <p className="text-amber-600 text-xs">
                  {Object.keys(editedStats).length > 0
                    ? `${Object.keys(editedStats).length} field(s) modified — save karna mat bhoolna!`
                    : "Koi bhi field edit kar sakte ho"}
                </p>
              </div>
            </div>
            {Object.keys(editedStats).length > 0 && (
              <button
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2"
              >
                {isSaving ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Saving...</>
                ) : (
                  "💾 Save Changes"
                )}
              </button>
            )}
          </div>
        )}

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Welcome, {mergedStats?.fullName} 👋
          </h1>
          <p className="text-slate-500 mt-1">
            Your partner account is{" "}
            <span className="text-green-600 font-semibold">Active & Approved</span> ·
            <span className={`ml-2 font-bold bg-gradient-to-r ${roleBadge.color} bg-clip-text text-transparent`}>
              {roleBadge.label} · {isActuallyReferral ? 20 : mergedStats?.commissionRate}% Commission
            </span>
          </p>
        </div>

        {/* Key Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 md:mb-8">
          {!isActuallyReferral
            ? [
              {
                label: "Package",
                value: mergedStats?.selectedPackage?.packageName || "N/A",
                sub: mergedStats?.selectedPackage?.category,
                color: "bg-indigo-50 border-indigo-200",
                text: "text-indigo-900",
                editable: false,
              },
              {
                label: "Payment",
                value: mergedStats?.paymentStatus || "pending",
                rawValue: mergedStats?.paymentStatus || "pending",
                editKey: "paymentStatus",
                color: "bg-emerald-50 border-emerald-200",
                text: "text-emerald-900",
                editable: true,
                options: ["pending", "paid", "failed"],
              },
              {
                label: "Agreement",
                value: mergedStats?.agreementStatus || "pending",
                rawValue: mergedStats?.agreementStatus || "pending",
                editKey: "agreementStatus",
                color: "bg-purple-50 border-purple-200",
                text: "text-purple-900",
                editable: true,
                options: ["pending", "sent", "signed"],
              },
              {
                label: "My Leads",
                value: myLeads.length,
                sub: "assigned",
                color: "bg-blue-50 border-blue-200",
                text: "text-blue-900",
                editable: false,
              },
            ].map((c) => (
              <EditableStatusCard
                key={c.label}
                c={c}
                isEditMode={isAdminEditMode}
                onEdit={handleAdminEdit}
              />
            ))
            : [
              {
                label: "Total Earnings",
                value: `₹${totalEarned.toLocaleString("en-IN")}`,
                sub: "Lifetime",
                color: "bg-emerald-50 border-emerald-200",
                text: "text-emerald-900",
                editable: false,
              },
              {
                label: "Referrals",
                value: mergedStats?.referralCount || 0,
                rawValue: mergedStats?.referralCount || 0,
                editKey: "referralCount",
                sub: "Successful",
                color: "bg-indigo-50 border-indigo-200",
                text: "text-indigo-900",
                editable: true,
                inputType: "number",
              },
              {
                label: "Pending",
                value: mergedStats?.pendingApprovals || 0,
                rawValue: mergedStats?.pendingApprovals || 0,
                editKey: "pendingApprovals",
                sub: "Approvals",
                color: "bg-amber-50 border-amber-200",
                text: "text-amber-900",
                editable: true,
                inputType: "number",
              },
              {
                label: "Assigned Leads",
                value: myLeads.length,
                sub: "To you",
                color: "bg-blue-50 border-blue-200",
                text: "text-blue-900",
                editable: false,
              },
            ].map((c) => (
              <EditableStatusCard
                key={c.label}
                c={c}
                isEditMode={isAdminEditMode}
                onEdit={handleAdminEdit}
              />
            ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white rounded-2xl p-1.5 shadow-sm border overflow-x-auto">
          {TABS.filter((t) => t.roles.includes(mergedStats?.role)).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${activeTab === tab.id
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>

        {/* === OVERVIEW === */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {!isActuallyReferral
                ? [
                  {
                    label: "Commission Rate",
                    value: `${isActuallyReferral ? 20 : mergedStats?.commissionRate}%`,
                    // rawValue: mergedStats?.commissionRate,
                    editKey: "commissionRate",
                    note: mergedStats?.franchiseType === "sathi" ? "Sathi Premium Rate" : "Dost Rate",
                    color: "from-purple-500 to-indigo-600",
                    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                    editable: true,
                    inputType: "number",
                  },
                  {
                    label: "Package Price",
                    value: mergedStats?.selectedPackage?.price ? `₹${mergedStats.selectedPackage.price.toLocaleString("en-IN")}` : "—",
                    note: mergedStats?.selectedPackage?.packageName,
                    color: "from-blue-500 to-cyan-500",
                    icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m0 0v10l8 4",
                    editable: false,
                  },
                  {
                    label: "Training Progress",
                    value: `${mergedStats?.trainingProgress?.completedModules || 0} / ${training.length}`,
                    note: "modules completed",
                    color: "from-emerald-500 to-teal-600",
                    icon: "M12 14l9-5-9-5-9 5 9 5z",
                    editable: false,
                  },
                ].map((card) => (
                  <EditableStatCard
                    key={card.label}
                    card={card}
                    isEditMode={isAdminEditMode}
                    onEdit={handleAdminEdit}
                  />
                ))
                : [
                  {
                    label: "Total Earnings",
                    value: `₹${totalEarned.toLocaleString("en-IN")}`,
                    note: "Lifetime commission",
                    color: "from-emerald-500 to-teal-600",
                    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                    editable: false,
                  },
                  {
                    label: "Successful Referrals",
                    value: mergedStats?.referralCount || 0,
                    rawValue: mergedStats?.referralCount || 0,
                    editKey: "referralCount",
                    note: "Approved accounts",
                    color: "from-indigo-500 to-blue-600",
                    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
                    editable: true,
                    inputType: "number",
                  },
                  {
                    label: "Commission Rate",
                    value: `${isActuallyReferral ? 20 : mergedStats?.commissionRate}%`,
                    rawValue: isActuallyReferral ? 20 : mergedStats?.commissionRate,
                    editKey: "commissionRate",
                    note: "Standard Referral Plan (20%)",
                    color: "from-amber-500 to-orange-600",
                    icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
                    editable: true,
                    inputType: "number",
                  },
                ].map((card) => (
                  <EditableStatCard
                    key={card.label}
                    card={card}
                    isEditMode={isAdminEditMode}
                    onEdit={handleAdminEdit}
                  />
                ))}
            </div>

            {/* Referral-only section */}
            {mergedStats?.role === "referral" && (
              <div className="space-y-6">
                {/* Leads Table Container */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-8">
          <div className="px-6 md:px-8 py-5 md:py-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-bold text-slate-800">Recent Service Leads</h2>
            <div className="flex gap-2">
              <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                {myLeads.length} Total
              </span>
            </div>
          </div>
          
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 md:px-8 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wider">Date</th>
                  <th className="px-6 md:px-8 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wider">Lead Info</th>
                  <th className="px-6 md:px-8 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wider">Service</th>
                  <th className="px-6 md:px-8 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wider">Status</th>
                  <th className="px-6 md:px-8 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myLeads.length > 0 ? (
                  myLeads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 md:px-8 py-4 whitespace-nowrap text-sm text-slate-600">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 md:px-8 py-4 whitespace-nowrap">
                        <div className="font-bold text-slate-800">{lead.fullName}</div>
                        <div className="text-xs text-slate-500">{lead.email}</div>
                      </td>
                      <td className="px-6 md:px-8 py-4 whitespace-nowrap">
                         <span className="text-sm font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded">
                          {lead.serviceType}
                        </span>
                      </td>
                      <td className="px-6 md:px-8 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          lead.status === 'completed' ? 'bg-green-100 text-green-700' :
                          lead.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 md:px-8 py-4 whitespace-nowrap">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-bold">View Details</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-8 py-12 text-center text-slate-500">
                      No leads found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* CSS for custom scrollbar */}
        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            height: 6px;
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
        `}</style>

              </div>
            )}

            {isActuallyReferral && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">🚀</span>
                    Business Tools
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2 text-sm text-slate-700">📄 Ready Proposal</li>
                    <li className="flex items-center gap-2 text-sm text-slate-700">🎯 Promotion Material</li>
                    <li className="flex items-center gap-2 text-sm text-slate-700">🎨 Branding Assets</li>
                  </ul>
                </div>
                <div className="bg-white border rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center text-green-600">📇</span>
                    Referral Benefits
                  </h3>
                  <ul className="space-y-2.5">
                    <li className="flex items-center gap-2 text-sm text-slate-700">✔ No investment required</li>
                    <li className="flex items-center gap-2 text-sm text-slate-700">✔ Easy onboarding</li>
                    <li className="flex items-center gap-2 text-sm text-slate-700">✔ Earn per successful referral</li>
                    <li className="flex items-center gap-2 text-sm text-slate-700">✔ 1 Week Training Support</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* === PACKAGES === */}
        {activeTab === "packages" && (
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-6">Available Packages</h2>
            {packages.length === 0 ? (
              <div className="bg-white rounded-2xl border p-12 text-center text-slate-400">No packages available.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map((pkg) => {
                  const isCurrent = mergedStats?.selectedPackage?.packageName === pkg.name;
                  return (
                    <div key={pkg.id || pkg._id} className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition p-6 ${isCurrent ? "border-indigo-400 ring-2 ring-indigo-200" : ""}`}>
                        {(isCurrent && activeTab !== "packages") && <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-block mb-2">✓ Current Package</div>}
                      <span className="text-xs font-bold uppercase text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">{pkg.categoryName || pkg.category}</span>
                      <h3 className="text-lg font-bold text-slate-900 mt-2 mb-1">{pkg.Name || pkg.name}</h3>
                      <p className="text-slate-500 text-sm mb-3">{pkg.description || pkg.Description}</p>
                      <p className="text-2xl font-bold text-slate-900 mb-1">₹{(pkg.price || pkg.Price)?.toLocaleString("en-IN")}</p>
                      {pkg.commission > 0 && <p className="text-sm text-green-600 font-semibold mb-3">You earn {pkg.commission}% commission</p>}
                      <ul className="space-y-1.5">
                        {(pkg.features || []).slice(0, 5).map((f, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                            <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* === LEADS === */}
        {activeTab === "leads" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">My Assigned Leads</h2>
              {!isAdminView && (
                <button onClick={() => setShowAddModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                  + Add Lead
                </button>
              )}
            </div>
            {totalEarned > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3 mb-4 flex items-center gap-3">
                <span className="text-emerald-600 text-xl">💰</span>
                <div>
                  <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">Total Lifetime Earnings</p>
                  <p className="text-2xl font-bold text-emerald-700">₹{totalEarned.toLocaleString("en-IN")}</p>
                </div>
              </div>
            )}
            {myLeads.length === 0 ? (
              <div className="bg-white rounded-2xl border p-12 text-center text-slate-400">No leads assigned yet.</div>
            ) : (
              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        {["Name", "Contact", "Requirement", "Priority", "Status", "Date", "Actions"].map((h) => (
                          <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {myLeads.map((lead) => (
                        <tr key={lead._id} className="hover:bg-slate-50">
                          <td className="px-5 py-4 font-semibold text-slate-800">{lead.name}</td>
                          <td className="px-5 py-4">
                            <p className="text-slate-700">{lead.email}</p>
                            <p className="text-xs text-gray-400">{lead.phone}</p>
                          </td>
                          <td className="px-5 py-4 text-slate-600">{lead.requirement}</td>
                          <td className="px-5 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${lead.priority === "high" ? "bg-red-100 text-red-700" : lead.priority === "medium" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                              {lead.priority}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            {isAdminEditMode ? (
                              <select
                                defaultValue={lead.status}
                                onChange={async (e) => {
                                  const token = localStorage.getItem("adminToken");
                                  await fetch(`${import.meta.env.VITE_API_URL}/api/admin/leads/${lead._id}/status`, {
                                    method: "PUT",
                                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                    body: JSON.stringify({ status: e.target.value }),
                                  });
                                  fetchLeads();
                                  showToast("Lead status updated!", "success");
                                }}
                                className="border border-indigo-300 rounded-lg px-2 py-1 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400"
                              >
                                {["new", "assigned", "in-progress", "approved", "converted", "lost"].map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            ) : (
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${lead.status === "approved" ? "bg-blue-100 text-blue-700" :
                                lead.status === "converted" ? "bg-green-100 text-green-700" :
                                  lead.status === "assigned" ? "bg-indigo-100 text-indigo-700" :
                                    lead.status === "in-progress" ? "bg-purple-100 text-purple-700" :
                                      lead.status === "lost" ? "bg-red-100 text-red-700" :
                                        "bg-slate-100 text-slate-600"
                                }`}>{lead.status}</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-gray-500 whitespace-nowrap">{new Date(lead.createdAt).toLocaleDateString("en-IN")}</td>
                          <td className="px-5 py-4">
                            <div className="flex flex-col gap-1.5">
                              {lead.status === "converted" && lead.commission > 0 && (
                                <span className="text-xs font-bold text-green-600 whitespace-nowrap">₹{lead.commission.toLocaleString("en-IN")} earned</span>
                              )}
                              {!["approved", "converted"].includes(lead.status) && !isAdminEditMode && (
                                <span className="text-xs text-slate-400">—</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* === TRAINING === */}
        {activeTab === "training" && (
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-6">Training Modules</h2>
            {training.length === 0 ? (
              <div className="bg-white rounded-2xl border p-12 text-center text-slate-400">No training modules.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {training.map((mod) => (
                  <div key={mod._id} className="bg-white rounded-2xl border shadow-sm p-6 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-bold uppercase text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">{mod.category}</span>
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{mod.difficulty}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{mod.title}</h3>
                    <p className="text-slate-500 text-sm mb-4">{mod.description}</p>
                    {mod.duration > 0 && <p className="text-xs text-slate-400 mb-3">⏱ {mod.duration} minutes</p>}
                    {mod.videoUrl && (
                      <a href={mod.videoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition">
                        ▶ Watch Video
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* === BRANDING & CRM === */}
        {activeTab === "branding" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800">Branding & CRM Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: "🎨 Branding Kit", desc: "Download logos, banners, social media templates, and brand guidelines.", link: "https://drive.google.com/drive/folders/dgtlmart-branding", label: "Access Branding Kit", color: "from-purple-500 to-pink-500" },
                { title: "📄 Ready Proposals", desc: "Professional pitch decks and proposals ready to present.", link: "https://drive.google.com/drive/folders/dgtlmart-proposal", label: "View Proposals", color: "from-blue-500 to-indigo-600" },
                { title: "🎯 Promotion Material", desc: "Ad creatives, flyers, and digital content for promoting.", link: "https://drive.google.com/drive/folders/dgtlmart-promo", label: "Open Drive", color: "from-amber-500 to-orange-600" },
                { title: "📊 CRM Access (Zoho)", desc: "Manage your leads and customers using our integrated CRM.", link: "https://crm.zoho.com", label: "Open CRM", color: "from-emerald-500 to-teal-600" },
              ].map((tool) => (
                <div key={tool.title} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                  <div className={`bg-gradient-to-r ${tool.color} p-5 text-white`}>
                    <h3 className="text-lg font-bold">{tool.title}</h3>
                  </div>
                  <div className="p-5">
                    <p className="text-slate-600 text-sm mb-4">{tool.desc}</p>
                    <a href={tool.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition">
                      {tool.label}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === REFERRAL === */}
        {activeTab === "referral" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-2">Your Referral Info</h2>
              <p className="text-slate-500 text-sm mb-4">
                Share your referral link or code to earn <strong>{isActuallyReferral ? 20 : mergedStats?.commissionRate}%</strong> commission on successful referrals.
              </p>
              <div className="flex flex-col gap-4">
                {/* Referral Link */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="w-full sm:w-32 text-sm font-semibold text-slate-700">Referral Link:</div>
                  {isAdminEditMode ? (
                    <input
                      type="text"
                      value={editedStats.referralLink ?? mergedStats?.referralLink ?? ""}
                      onChange={(e) => handleAdminEdit("referralLink", e.target.value)}
                      className="flex-1 bg-slate-50 border border-indigo-300 rounded-xl px-4 py-3 font-mono text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  ) : (
                    <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-sm text-slate-600 truncate">
                      {mergedStats?.referralLink || "Not Available"}
                    </div>
                  )}
                  <button onClick={handleCopyLink} disabled={!mergedStats?.referralLink} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-3 rounded-xl font-semibold shadow transition flex items-center gap-2 justify-center">
                    Copy Link
                  </button>
                </div>

                {/* Referral Code */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="w-full sm:w-32 text-sm font-semibold text-slate-700">Referral Code:</div>
                  {isAdminEditMode ? (
                    <input
                      type="text"
                      value={editedStats.referralCode ?? mergedStats?.referralCode ?? ""}
                      onChange={(e) => handleAdminEdit("referralCode", e.target.value)}
                      className="flex-1 bg-slate-50 border border-indigo-300 rounded-xl px-4 py-3 font-mono text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  ) : (
                    <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-sm text-slate-600 truncate">
                      {mergedStats?.referralCode || "Not Available"}
                    </div>
                  )}
                  <button onClick={handleCopyCode} disabled={!mergedStats?.referralCode} className="bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 px-5 py-3 rounded-xl font-semibold transition flex items-center gap-2 justify-center">
                    Copy Code
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-800">Referred Persons</h2>
                <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">
                  {mergedStats?.referredBuyers?.length || 0} Total
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {["Date", "Name", "Contact", "Package", "Status"].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mergedStats?.referredBuyers?.length > 0 ? (
                      mergedStats.referredBuyers.map((b, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition">
                          <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{new Date(b.date).toLocaleDateString("en-IN")}</td>
                          <td className="px-5 py-3 font-semibold text-slate-800">{b.fullName}</td>
                          <td className="px-5 py-3">
                            <p className="text-slate-600">{b.email}</p>
                            <p className="text-slate-400 text-xs">{b.phone}</p>
                          </td>
                          <td className="px-5 py-3">
                            <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-medium">{b.packageName || "Pending"}</span>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${statusBadge(b.status)}`}>{b.status}</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-slate-400">No referrals yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* === PROFILE === */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-5">Profile Information</h2>
              {isAdminEditMode && (
                <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
                  <p className="text-amber-700 text-xs font-semibold">✏️ Edit mode — fields directly edit karo</p>
                </div>
              )}
              <div className="space-y-1">
                <EditableField label="Full Name" value={editedStats.fullName ?? mergedStats?.fullName} field="fullName" isEditMode={isAdminEditMode} onChange={handleAdminEdit} />
                <EditableField label="Email" value={editedStats.email ?? mergedStats?.email} field="email" isEditMode={isAdminEditMode} onChange={handleAdminEdit} type="email" />
                <EditableField label="Phone" value={editedStats.phone ?? mergedStats?.phone} field="phone" isEditMode={isAdminEditMode} onChange={handleAdminEdit} type="tel" />
                <EditableField label="Address" value={editedStats.address ?? mergedStats?.address} field="address" isEditMode={isAdminEditMode} onChange={handleAdminEdit} />
                {/* Status dropdown in edit mode */}
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 text-sm">Status</span>
                  {isAdminEditMode ? (
                    <select
                      value={editedStats.status ?? mergedStats?.status ?? "ACTIVE"}
                      onChange={(e) => handleAdminEdit("status", e.target.value)}
                      className="border border-indigo-300 rounded-lg px-3 py-1 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      {["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="font-semibold text-sm text-green-600">{mergedStats?.status || "ACTIVE"}</span>
                  )}
                </div>
                <EditableField label="Commission" value={editedStats.commissionRate !== undefined ? `${editedStats.commissionRate}%` : `${isActuallyReferral ? 20 : mergedStats?.commissionRate}%`} field="commissionRate" isEditMode={isAdminEditMode} onChange={handleAdminEdit} type="number" />
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 text-sm">Role</span>
                  {isAdminEditMode ? (
                    <select
                      value={editedStats.role ?? mergedStats?.role ?? "referral"}
                      onChange={(e) => handleAdminEdit("role", e.target.value)}
                      className="border border-indigo-300 rounded-lg px-3 py-1 text-sm font-semibold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      {["referral", "franchise"].map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  ) : (
                    <span className="font-semibold text-sm text-indigo-700">{roleBadge.label}</span>
                  )}
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                  <span className="text-slate-500 text-sm">Total Earnings</span>
                  <span className="font-semibold text-sm text-emerald-600">₹{totalEarned.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                  <span className="text-slate-500 text-sm">Member Since</span>
                  <span className="font-semibold text-sm text-slate-800">
                    {mergedStats?.joinedDate ? new Date(mergedStats.joinedDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "—"}
                  </span>
                </div>
              </div>

              {/* ✅ Save button at bottom of profile in edit mode */}
              {isAdminEditMode && Object.keys(editedStats).length > 0 && (
                <button
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Saving...</>
                  ) : (
                    "💾 Save All Changes"
                  )}
                </button>
              )}
            </div>

            <div>
              <div className={`bg-gradient-to-br ${roleBadge.color} rounded-2xl shadow-xl p-6 text-white mb-6`}>
                <div className="flex items-center gap-4 mb-6">
                  <label className="w-16 h-16 rounded-2xl overflow-hidden bg-white/20 flex items-center justify-center cursor-pointer">
                    <img
                      src={user?.profileImage ? `https://dgtlmart-franchise-we1o.onrender.com/uploads/${user.profileImage}` : `https://ui-avatars.com/api/?name=${user?.fullName}`}
                      className="w-full h-full object-cover"
                    />
                    {!isAdminView && <input type="file" className="hidden" onChange={handleImageUpload} />}
                  </label>
                  <div>
                    <h3 className="text-xl font-bold">{mergedStats?.fullName}</h3>
                    <p className="text-white/80 text-sm">{roleBadge.label} · DGTLmart</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-white/60 text-xs uppercase tracking-wider mb-0.5">Commission</p>
                    <p className="text-white font-bold text-lg">{isActuallyReferral ? 20 : mergedStats?.commissionRate}%</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs uppercase tracking-wider mb-0.5">Total Earned</p>
                    <p className="text-white font-bold text-lg">₹{totalEarned.toLocaleString("en-IN")}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/20 text-xs text-white/70">
                  <p>{mergedStats?.email}</p>
                  <p className="mt-0.5">{mergedStats?.phone}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border shadow-sm p-6">
                <h3 className="font-bold text-slate-800 mb-3">📅 Request a Meeting</h3>
                <p className="text-slate-500 text-sm mb-4">Schedule a call with our franchise support team.</p>
                <a href={`mailto:support@dgtlmart.com?subject=Meeting Request - ${mergedStats?.fullName}`} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl transition text-sm">
                  📧 Request Meeting
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ADD LEAD MODAL */}
        {showAddModal && (
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
            onClick={closeAddModal}
          >
            <div 
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Create New Lead</h2>
                  <p className="text-white/80 text-xs mt-1 uppercase tracking-widest font-semibold">Enter lead information clearly</p>
                </div>
                <button 
                  onClick={closeAddModal}
                  className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>


              <div className="p-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleFormChange}
                    error={errors.name}
                    placeholder="Enter full name"
                    className="!rounded-xl"
                  />
                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleFormChange}
                    error={errors.email}
                    placeholder="example@mail.com"
                    className="!rounded-xl"
                  />
                  <Input
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={handleFormChange}
                    error={errors.phone}
                    placeholder="10-15 digits"
                    className="!rounded-xl"
                  />
                  <Input
                    label="Business Type"
                    name="businessType"
                    required
                    value={form.businessType}
                    onChange={handleFormChange}
                    error={errors.businessType}
                    placeholder="e.g. Retail, Tech"
                    className="!rounded-xl"
                  />
                </div>

                <div className="mt-6 space-y-6">
                  <div className="w-full">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Requirement <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      name="requirement"
                      required
                      rows="3"
                      value={form.requirement}
                      onChange={handleFormChange}
                      placeholder="Describe the lead's requirements (min 10 characters)..."
                      className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none shadow-sm ${errors.requirement ? 'border-red-500 bg-red-50/20' : 'border-slate-200 hover:border-slate-300'}`}
                    />
                    {errors.requirement && <p className="mt-1 text-sm text-red-600 font-medium">{errors.requirement}</p>}
                  </div>

                  <Input
                    label="Website (Optional)"
                    name="website"
                    value={form.website}
                    onChange={handleFormChange}
                    error={errors.website}
                    placeholder="https://example.com"
                    className="!rounded-xl"
                  />
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="secondary"
                  onClick={closeAddModal}
                  fullWidth
                  className="sm:flex-1 !rounded-xl !py-3.5 !bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </Button>
                <Button 
                  disabled={!isFormValid() || isFormLoading}
                  onClick={handleCreateLead}
                  fullWidth
                  className={`sm:flex-1 !rounded-xl !py-3.5 font-bold shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 ${!isFormValid() ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                >
                  {isFormLoading ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                      Create Lead
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}