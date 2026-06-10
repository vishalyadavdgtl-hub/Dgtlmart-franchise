import { useEffect, useState } from "react";
import { explorePackagesAPI } from "../../utils/api";
import AdminSidebar from "../../components/Admin/Sidebar";
import { useToast } from "../../components/common/Toast";
import Modal from "../../components/common/Modal";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Button from "../../components/common/Button";

const CATEGORIES = [
  { value: "Website Development", label: "Web Dev",      icon: "</>", color: "from-indigo-500 to-purple-500",  light: "bg-indigo-50 text-indigo-700 border-indigo-100" },
  { value: "SEO",                 label: "SEO",          icon: "🔍",  color: "from-green-500 to-emerald-500",  light: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  { value: "Social Media",        label: "Social Media", icon: "#",   color: "from-pink-500 to-rose-500",      light: "bg-pink-50 text-pink-700 border-pink-100" },
  { value: "Digital Marketing",   label: "Digital Mkt",  icon: "📣",  color: "from-orange-500 to-amber-500",   light: "bg-orange-50 text-orange-700 border-orange-100" },
  { value: "Google Ads",          label: "Google Ads",   icon: "✦",   color: "from-blue-500 to-cyan-500",      light: "bg-blue-50 text-blue-700 border-blue-100" },
  { value: "Meta Ads",            label: "Meta Ads",     icon: "∞",   color: "from-violet-500 to-fuchsia-500", light: "bg-violet-50 text-violet-700 border-violet-100" },
];

const getCatConfig = (val) => CATEGORIES.find((c) => c.value === val) || CATEGORIES[0];

const parseFeatures = (raw) => {
  if (!raw || (Array.isArray(raw) && raw.length === 0)) return [{ key: "", value: "" }];
  return raw.map((item) => {
    const parts = String(item).split(":");
    return parts.length >= 2
      ? { key: parts[0].trim(), value: parts.slice(1).join(":").trim() }
      : { key: String(item).trim(), value: "" };
  });
};

const serializeFeatures = (arr) =>
  arr.filter((f) => f.key.trim()).map((f) => f.value.trim() ? `${f.key}: ${f.value}` : f.key);

const emptyForm = (cat = "Website Development") => ({
  Name: "", category: cat, description: "", price: "",
  features: [{ key: "", value: "" }], status: "Active", buttonText: "Get Started",
});

export default function ExplorePackages() {
  const { showToast } = useToast();
  const [packages, setPackages]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);
  const [activeTab, setActiveTab] = useState("All");
  const [formData, setFormData]   = useState(emptyForm());
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded]   = useState({});
  const [deleteId, setDeleteId]   = useState(null);

  useEffect(() => { fetchPackages(); }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await explorePackagesAPI.getPackages();
      const raw = res.data?.data || res.data || {};
      const flat = Array.isArray(raw) ? raw : Object.values(raw).flat();
      setPackages(flat);
    } catch (err) {
      console.error(err);
      showToast("Failed to load packages", "error");
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingPkg(null);
    setFormData(emptyForm(activeTab !== "All" ? activeTab : "Website Development"));
    setShowModal(true);
  };

  const openEdit = (pkg) => {
    setEditingPkg(pkg);
    setFormData({
      Name: pkg.Name || "", category: pkg.category || "Website Development",
      description: pkg.description || "", price: pkg.price || "",
      features: parseFeatures(pkg.features), status: pkg.status || "Active",
      buttonText: pkg.buttonText || "Get Started",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.Name || !formData.price || !formData.category || !formData.description) {
      showToast("Please fill all required fields", "error");
      return;
    }
    try {
      setSubmitting(true);
      const payload = { ...formData, price: parseFloat(formData.price), features: serializeFeatures(formData.features) };
      if (editingPkg) {
        await explorePackagesAPI.updatePackage(editingPkg._id, payload);
        showToast("Package updated successfully", "success");
      } else {
        await explorePackagesAPI.createPackage(payload);
        showToast("Package created successfully", "success");
      }
      setShowModal(false);
      fetchPackages();
    } catch (err) {
      console.error(err);
      showToast("Failed to save package", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await explorePackagesAPI.deletePackage(deleteId);
      showToast("Package deleted", "success");
      setDeleteId(null);
      fetchPackages();
    } catch (err) {
      showToast("Failed to delete package", "error");
    }
  };

  const toggleExpand = (id) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const displayed = activeTab === "All" ? packages : packages.filter((p) => p.category === activeTab);
  const grouped = CATEGORIES.map((cat) => ({ ...cat, pkgs: packages.filter((p) => p.category === cat.value) })).filter((g) => g.pkgs.length > 0);
  const stats = [
    { label: "Total",      val: packages.length,                                      color: "text-slate-800" },
    { label: "Active",     val: packages.filter((p) => p.status === "Active").length, color: "text-emerald-600" },
    { label: "Inactive",   val: packages.filter((p) => p.status !== "Active").length, color: "text-red-500" },
    { label: "Categories", val: new Set(packages.map((p) => p.category)).size,        color: "text-indigo-600" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="flex-1 lg:ml-64 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Explore Packages Management</h1>
              <p className="text-slate-500 mt-1">Manage all service packages shown in "Explore Our Services".</p>
            </div>
            <Button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Package
            </Button>
          </div>

          {/* Stats */}
          {!loading && (
            <div className="flex gap-3 flex-wrap mb-6">
              {stats.map((s) => (
                <div key={s.label} className="bg-white rounded-2xl border border-slate-200 px-5 py-3 flex flex-col items-center shadow-sm min-w-[80px]">
                  <span className={`text-2xl font-black ${s.color}`}>{s.val}</span>
                  <span className="text-xs text-slate-400 mt-0.5">{s.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Tabs */}
          {!loading && packages.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-7">
              {["All", ...CATEGORIES.map((c) => c.value)].map((cat) => (
                <button key={cat} onClick={() => setActiveTab(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${activeTab === cat ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-600"}`}>
                  {cat === "All" ? "All Services" : getCatConfig(cat)?.label}
                </button>
              ))}
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center p-20"><LoadingSpinner /></div>
          ) : packages.length === 0 ? (
            <EmptyState onAdd={openAdd} />
          ) : activeTab === "All" ? (
            <div className="space-y-10">
              {grouped.map((group) => (
                <section key={group.value}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r ${group.color} text-white text-sm font-bold shadow-md`}>
                      <span>{group.icon}</span><span>{group.value}</span>
                      <span className="bg-white/25 text-white text-xs rounded-full px-2 py-0.5 font-bold ml-1">{group.pkgs.length}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {group.pkgs.map((pkg) => (
                      <PackageCard key={pkg._id} pkg={pkg} catConfig={group}
                        isExpanded={!!expanded[pkg._id]} onToggleExpand={() => toggleExpand(pkg._id)}
                        onEdit={() => openEdit(pkg)} onDelete={() => setDeleteId(pkg._id)} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : displayed.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="text-lg font-semibold">No packages in this category.</p>
              <button onClick={openAdd} className="mt-3 text-blue-600 font-semibold text-sm hover:underline">+ Add one</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {displayed.map((pkg) => (
                <PackageCard key={pkg._id} pkg={pkg} catConfig={getCatConfig(pkg.category)}
                  isExpanded={!!expanded[pkg._id]} onToggleExpand={() => toggleExpand(pkg._id)}
                  onEdit={() => openEdit(pkg)} onDelete={() => setDeleteId(pkg._id)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingPkg ? "Edit Package" : "Add New Package"}>
        <PackageForm formData={formData} setFormData={setFormData} onSubmit={handleSubmit}
          onCancel={() => setShowModal(false)} isEditing={!!editingPkg} submitting={submitting} />
      </Modal>

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Delete Package?</h3>
            <p className="text-slate-500 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-red-500/20">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PackageCard({ pkg, catConfig, isExpanded, onToggleExpand, onEdit, onDelete }) {
  const features = parseFeatures(pkg.features);
  const isActive = pkg.status === "Active";
  const PREVIEW = 6;
  const visible = isExpanded ? features : features.slice(0, PREVIEW);

  return (
    <div className={`relative bg-white rounded-2xl border-2 flex flex-col shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5 ${isActive ? "border-slate-200" : "border-slate-100 opacity-60"}`}>
      <div className={`h-1 rounded-t-2xl w-full bg-gradient-to-r ${catConfig.color}`} />
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${catConfig.light}`}>{pkg.category}</span>
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${isActive ? "text-emerald-600" : "text-slate-400"}`}>
            <span className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-300"}`} />{pkg.status}
          </span>
        </div>
        <h3 className="text-lg font-black text-slate-900 mb-1 leading-tight">{pkg.Name}</h3>
        {pkg.description && <p className="text-xs text-slate-400 mb-3 line-clamp-2">{pkg.description}</p>}
        <div className="flex items-baseline gap-0.5 mb-4">
          <span className="text-slate-400 text-base font-semibold">₹</span>
          <span className="text-3xl font-black text-slate-900 tracking-tight">{Number(pkg.price).toLocaleString("en-IN")}</span>
          <span className="text-xs text-slate-400 ml-1">/mo</span>
        </div>
        <div className={`h-px bg-gradient-to-r ${catConfig.color} opacity-20 mb-3`} />
        <ul className="flex flex-col gap-2 flex-1 mb-1">
          {visible.map((f, i) => (
            <li key={i} className="flex items-center justify-between text-xs gap-2">
              <span className="flex items-center gap-1.5 text-slate-500 min-w-0">
                <svg className="w-3 h-3 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span className="truncate">{f.key}</span>
              </span>
              <span className={`font-bold text-right flex-shrink-0 max-w-[140px] truncate ${f.value === "No" || f.value === "NA" ? "text-slate-300" : "text-slate-800"}`}>{f.value}</span>
            </li>
          ))}
        </ul>
        {features.length > PREVIEW && (
          <button onClick={onToggleExpand} className="text-xs font-semibold text-indigo-500 hover:text-indigo-700 mt-2 mb-3 text-left transition-colors">
            {isExpanded ? "▲ Show less" : `▼ +${features.length - PREVIEW} more features`}
          </button>
        )}
        <div className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold text-center mt-auto mb-4 select-none opacity-75">
          {pkg.buttonText || "Get Started"} →
        </div>
        <div className="flex gap-2 pt-3 border-t border-slate-100">
          <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all active:scale-95">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button onClick={onDelete} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-all active:scale-95">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function PackageForm({ formData, setFormData, onSubmit, onCancel, isEditing, submitting }) {
  const set = (key, val) => setFormData((p) => ({ ...p, [key]: val }));
  const setFeature = (i, field, val) => { const u = [...formData.features]; u[i] = { ...u[i], [field]: val }; set("features", u); };
  const addFeature = () => set("features", [...formData.features, { key: "", value: "" }]);
  const removeFeature = (i) => set("features", formData.features.filter((_, idx) => idx !== i));

  return (
    <form onSubmit={onSubmit} className="space-y-4 p-1">
      <div className="max-h-[65vh] overflow-y-auto space-y-4 pr-1">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Package Name *</label>
          <input type="text" value={formData.Name} onChange={(e) => set("Name", e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
            placeholder="e.g. Basic Website, Standard SEO..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Category *</label>
            <select value={formData.category} onChange={(e) => set("category", e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm appearance-none cursor-pointer">
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.value}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Price (₹) *</label>
            <input type="number" value={formData.price} onChange={(e) => set("price", e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm" placeholder="15000" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Button Text</label>
            <input type="text" value={formData.buttonText} onChange={(e) => set("buttonText", e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm" placeholder="Get Started" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Status</label>
            <div className="flex gap-4 mt-3">
              {["Active", "Inactive"].map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="pkg_status" value={s} checked={formData.status === s} onChange={(e) => set("status", e.target.value)} className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-slate-600">{s}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Description *</label>
          <textarea value={formData.description} onChange={(e) => set("description", e.target.value)} rows={2}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm resize-none"
            placeholder="Brief description of this package..." />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold text-slate-700">Features <span className="text-slate-400 font-normal text-xs">(Label : Value)</span></label>
            <button type="button" onClick={addFeature} className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-all">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
              Add Row
            </button>
          </div>
          <div className="space-y-2 max-h-52 overflow-y-auto pr-0.5">
            {formData.features.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="text" value={f.key} onChange={(e) => setFeature(i, "key", e.target.value)} placeholder="Label (e.g. Website Type)"
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
                <span className="text-slate-300 font-bold text-lg flex-shrink-0">:</span>
                <input type="text" value={f.value} onChange={(e) => setFeature(i, "value", e.target.value)} placeholder="Value (e.g. Static Website)"
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
                <button type="button" onClick={() => removeFeature(i)} className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 italic">e.g. "Website Type : Static Website" — will show as a row on the card.</p>
        </div>
      </div>
      <div className="flex gap-3 pt-2 border-t border-slate-100">
        <button type="button" onClick={onCancel} className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all active:scale-95 text-sm">Cancel</button>
        <button type="submit" disabled={submitting} className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95 text-sm">
          {submitting ? "Saving..." : isEditing ? "Update Package" : "Create Package"}
        </button>
      </div>
    </form>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-12 text-center">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m0 0v10l8 4" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-slate-900">No packages yet</h3>
      <p className="text-slate-500 mt-2 max-w-sm mx-auto">
        Run <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">node seed.js</code> first to import all 18 packages from your existing data.
      </p>
      <button onClick={onAdd} className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95 text-sm">
        + Add First Package
      </button>
    </div>
  );
}