import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ NAYA IMPORT
import AdminSidebar from "../../components/Admin/Sidebar";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Modal from "../../components/common/Modal";
import { adminAPI } from "../../utils/api";
import { useToast } from "../../components/common/Toast";
import Button from "../../components/common/Button";

export default function ReferralManagement() {
  const { showToast } = useToast();
  const navigate = useNavigate(); // ✅ NAYA
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modals state
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [newCommission, setNewCommission] = useState("");
  const [updating, setUpdating] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchReferrals();
    window.scrollTo(0, 0);
  }, [page, statusFilter]);

  const fetchReferrals = async (showFullLoading = true) => {
    if (showFullLoading) setLoading(true);
    try {
      const response = await adminAPI.getReferrals({
        page,
        limit: 10,
        search,
        status: statusFilter,
        type: "referral",
      });
      setReferrals(response.data.referrals);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching referrals:", error);
      showToast("Failed to load referrals", "error");
    } finally {
      if (showFullLoading) setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchReferrals(true);
  };

  const handleStatusChange = async (id, newStatus) => {
    setUpdating(true);
    try {
      await adminAPI.updateReferralStatus(id, { status: newStatus });
      showToast("Status updated successfully");
      setReferrals((prev) =>
        prev.map((p) => (p._id === id ? { ...p, status: newStatus } : p)),
      );
      if (selectedPartner && selectedPartner._id === id) {
        setSelectedPartner((prev) => ({ ...prev, status: newStatus }));
      }
      await fetchReferrals(false);
    } catch (error) {
      console.error("Error updating status:", error);
      showToast("Failed to update status", "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleEdit = (partner) => {
    setSelectedPartner(partner);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      await adminAPI.updateReferral(selectedPartner._id, selectedPartner);
      showToast("Partner updated successfully");
      setIsEditModalOpen(false);
      fetchReferrals();
    } catch (error) {
      console.error(error);
      showToast("Update failed", "error");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete partner "${name}"? This action cannot be undone.`)) {
      return;
    }
    setUpdating(true);
    try {
      await adminAPI.deleteReferral(id);
      showToast("Partner deleted successfully");
      setReferrals((prev) => prev.filter((p) => p._id !== id));
      if (selectedPartner && selectedPartner._id === id) {
        setIsDetailsModalOpen(false);
      }
    } catch (error) {
      console.error("Error deleting partner:", error);
      showToast("Failed to delete partner", "error");
    } finally {
      setUpdating(false);
    }
  };

  const openCommissionModal = (partner) => {
    setSelectedPartner(partner);
    setNewCommission((partner.totalCommission || 0).toString());
    setIsCommissionModalOpen(true);
  };

  const handleCommissionUpdate = async () => {
    const amount = parseFloat(newCommission);
    if (isNaN(amount) || amount < 0) {
      showToast("Please enter a valid positive number", "error");
      return;
    }
    setUpdating(true);
    try {
      await adminAPI.updateReferralCommission(selectedPartner._id, { totalCommission: amount });
      showToast("Commission updated successfully");
      setIsCommissionModalOpen(false);
      fetchReferrals();
    } catch (error) {
      console.error("Error updating commission:", error);
      showToast("Failed to update commission", "error");
    } finally {
      setUpdating(false);
    }
  };

  const openDetailsModal = (partner) => {
    setSelectedPartner(partner);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 lg:ml-64 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Sticky Header Section */}
          <div className="sticky top-0 z-30 bg-gray-50/95 backdrop-blur-sm pt-4 lg:pt-0 pb-6 mb-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 font-heading">
                Referral Partners
              </h1>
              <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 flex items-center gap-2">
                <span className="text-sm font-bold">
                  Manage referral partners and approvals
                </span>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-6">
              <div className="grid md:grid-cols-4 gap-4">
                <form onSubmit={handleSearch} className="md:col-span-2">
                  <div className="relative group">
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by name, email or code..."
                      className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    />
                    <svg
                      className="w-5 h-5 text-gray-400 absolute left-4 top-3 group-focus-within:text-blue-500 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </form>

                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="ACTIVE">Active</option>
                  <option value="REJECTED">Rejected</option>
                </select>

                <button
                  onClick={() => { setSearch(""); setStatusFilter(""); setPage(1); fetchReferrals(true); }}
                  className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-all font-medium"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="mt-2">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <LoadingSpinner />
              </div>
            ) : (
              <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[400px] ${updating ? "opacity-50 pointer-events-none" : ""}`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b border-gray-200">Name</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b border-gray-200">Email</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b border-gray-200">Phone</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b border-gray-200">Type</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b border-gray-200">Referral Code</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b border-gray-200 text-center">Referrals</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b border-gray-200">Commission</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b border-gray-200">Registered</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b border-gray-200">Status</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b border-gray-200">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referrals.length === 0 ? (
                        <tr>
                          <td colSpan="10" className="px-4 py-8 text-center text-gray-500">
                            No referral partners found
                          </td>
                        </tr>
                      ) : (
                        referrals.map((partner) => (
                          <tr key={partner._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-4 text-sm font-medium text-gray-900">{partner.fullName}</td>
                            <td className="px-4 py-4 text-sm text-gray-600">{partner.email}</td>
                            <td className="px-4 py-4 text-sm text-gray-600">{partner.phone}</td>
                            <td className="px-4 py-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                partner.partnerType === "franchise"
                                  ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                                  : "bg-slate-50 text-slate-700 border border-slate-100"
                              }`}>
                                {partner.partnerType || "referral"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <code className="bg-gray-50 border border-gray-100 px-2 py-1 rounded text-xs font-mono text-blue-700 font-bold">
                                {partner.referralCode}
                              </code>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="bg-blue-50 text-blue-700 font-bold px-2 py-1 rounded-lg text-xs border border-blue-100">
                                {partner.referralCount}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-900">
                                  ₹{partner.totalCommission.toLocaleString("en-IN")}
                                </span>
                                <button
                                  onClick={() => openCommissionModal(partner)}
                                  className="p-1 hover:bg-blue-50 rounded text-blue-600 transition-colors"
                                  title="Edit Commission"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-xs font-medium text-gray-500 whitespace-nowrap">
                              {new Date(partner.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                            </td>
                            <td className="px-4 py-4">
                              <select
                                value={partner.status}
                                onChange={(e) => handleStatusChange(partner._id, e.target.value)}
                                className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border-0 focus:ring-2 focus:ring-blue-500 shadow-sm ${
                                  partner.status === "ACTIVE" ? "bg-green-100 text-green-800"
                                  : partner.status === "PENDING" ? "bg-yellow-100 text-yellow-800"
                                  : partner.status === "REJECTED" ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                <option value="PENDING">Pending</option>
                                <option value="ACTIVE">Active</option>
                                <option value="REJECTED">Rejected</option>
                              </select>
                            </td>

                            {/* ✅ ACTIONS COLUMN — DASHBOARD button add kiya */}
                            <td className="px-4 py-4">
                              <div className="flex gap-3 items-center">

                                {/* ✅ NAYA DASHBOARD BUTTON */}
                                <button
                                  onClick={() =>navigate(`/admin/partner/${partner._id}`)}
                                  className="text-indigo-600 hover:text-indigo-900 font-bold text-xs uppercase tracking-wider transition-colors"
                                >
                                  Dashboard
                                </button>

                                <button
                                  onClick={() => openDetailsModal(partner)}
                                  className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase tracking-wider transition-colors"
                                >
                                  View
                                </button>

                                <button
                                  onClick={() => handleEdit(partner)}
                                  className="text-green-600 hover:text-green-800 font-bold text-xs uppercase tracking-wider transition-colors"
                                >
                                  Edit
                                </button>

                                <button
                                  onClick={() => handleDelete(partner._id, partner.fullName)}
                                  className="text-red-500 hover:text-red-700 font-bold text-xs uppercase tracking-wider transition-colors"
                                  disabled={updating}
                                >
                                  Delete
                                </button>

                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8 py-4 border-t border-gray-100">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all shadow-sm"
                    >
                      Previous
                    </button>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest px-4">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all shadow-sm"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Commission Update Modal */}
      <Modal isOpen={isCommissionModalOpen} onClose={() => setIsCommissionModalOpen(false)} title="Update Commission" size="small">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Set the total commission amount for <span className="font-semibold">{selectedPartner?.fullName}</span>.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Commission Amount (₹)</label>
            <input
              type="number"
              value={newCommission}
              onChange={(e) => setNewCommission(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="0.00"
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setIsCommissionModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
            <Button onClick={handleCommissionUpdate} disabled={updating}>{updating ? "Updating..." : "Update Commission"}</Button>
          </div>
        </div>
      </Modal>

      {/* Details Modal */}
      <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} title="Partner Details" size="medium">
        {selectedPartner && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Full Name</h4>
                <p className="text-gray-900 font-medium">{selectedPartner.fullName}</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email Address</h4>
                <p className="text-gray-900 font-medium">{selectedPartner.email}</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Phone Number</h4>
                <p className="text-gray-900 font-medium">{selectedPartner.phone}</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Partner Type</h4>
                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${selectedPartner.partnerType === "franchise" ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-700"}`}>
                  {selectedPartner.partnerType || "referral"} ({selectedPartner.commissionRate || 10}%)
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Referral Code</h4>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-blue-700">{selectedPartner.referralCode}</code>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Registered At</h4>
                <p className="text-gray-900 font-medium">{new Date(selectedPartner.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Address Information</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-900">{selectedPartner.address}</p>
                <p className="text-gray-900">{selectedPartner.city}, {selectedPartner.state} - {selectedPartner.pincode}</p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Performance</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 mb-1">Total Referrals</p>
                  <p className="text-2xl font-bold text-blue-900">{selectedPartner.referralCount}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 mb-1">Total Commission</p>
                  <p className="text-2xl font-bold text-green-900">₹{selectedPartner.totalCommission.toLocaleString("en-IN")}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Partner Management</h4>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Change Account Status</label>
                    <div className="flex gap-2 relative">
                      {updating && (
                        <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center rounded-lg">
                          <LoadingSpinner size="small" />
                        </div>
                      )}
                      {["PENDING", "ACTIVE", "REJECTED"].map((status) => (
                        <button
                          key={status}
                          disabled={updating}
                          onClick={() => handleStatusChange(selectedPartner._id, status)}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold uppercase transition-all border ${
                            selectedPartner.status === status
                              ? status === "ACTIVE" ? "bg-green-600 border-green-600 text-white shadow-md"
                                : status === "PENDING" ? "bg-yellow-500 border-yellow-500 text-white shadow-md"
                                : "bg-red-600 border-red-600 text-white shadow-md"
                              : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  {selectedPartner.status === "PENDING" && (
                    <button
                      disabled={updating}
                      onClick={() => handleStatusChange(selectedPartner._id, "ACTIVE")}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Approve Partner
                    </button>
                  )}
                  {selectedPartner.status !== "REJECTED" && (
                    <button
                      disabled={updating}
                      onClick={() => handleStatusChange(selectedPartner._id, "REJECTED")}
                      className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm font-bold hover:bg-red-100 transition-all disabled:opacity-50"
                    >
                      Reject Account
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Partner" size="small">
        {selectedPartner && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Full Name</label>
              <input
                type="text"
                value={selectedPartner.fullName}
                onChange={(e) => setSelectedPartner({ ...selectedPartner, fullName: e.target.value })}
                className="w-full border px-3 py-2 rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                type="text"
                value={selectedPartner.email}
                onChange={(e) => setSelectedPartner({ ...selectedPartner, email: e.target.value })}
                className="w-full border px-3 py-2 rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <input
                type="text"
                value={selectedPartner.phone}
                onChange={(e) => setSelectedPartner({ ...selectedPartner, phone: e.target.value })}
                className="w-full border px-3 py-2 rounded-lg"
              />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
              <button onClick={handleUpdate} className="px-4 py-2 bg-green-600 text-white rounded-lg">Save Changes</button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}