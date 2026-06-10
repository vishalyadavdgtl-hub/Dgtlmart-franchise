import { useEffect, useState } from 'react';
import AdminSidebar from '../../components/Admin/Sidebar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { adminAPI } from '../../utils/api';
import { useToast } from '../../components/common/Toast';

export default function BuyerManagement() {
  const { showToast } = useToast();
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  
  // Modal state
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchBuyers();
    window.scrollTo(0, 0);
  }, [page, statusFilter, paymentFilter]);

  const fetchBuyers = async (showFullLoading = true) => {
    if (showFullLoading) setLoading(true);
    try {
      const response = await adminAPI.getBuyers({
        page,
        limit: 10,
        search,
        status: statusFilter,
        paymentStatus: paymentFilter,
      });
      setBuyers(response.data.buyers);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching buyers:', error);
      showToast('Failed to load buyers', 'error');
    } finally {
      if (showFullLoading) setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBuyers(true);
  };

  const handleStatusChange = async (id, newStatus, notes = '') => {
    setUpdating(true);
    try {
      await adminAPI.updateBuyerStatus(id, { status: newStatus, notes });
      showToast('Status updated successfully');
      
      // Update local state immediately
      setBuyers(prev => prev.map(b => b._id === id ? { ...b, status: newStatus, notes } : b));
      
      if (selectedBuyer && selectedBuyer._id === id) {
        setSelectedBuyer(prev => ({ ...prev, status: newStatus, notes }));
      }
      
      await fetchBuyers(false);
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('Failed to update status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete buyer "${name}"? This action cannot be undone.`)) {
      return;
    }

    setUpdating(true);
    try {
      await adminAPI.deleteBuyer(id);
      showToast('Buyer deleted successfully');
      setBuyers(prev => prev.filter(b => b._id !== id));
      if (selectedBuyer && selectedBuyer._id === id) {
        setIsDetailsModalOpen(false);
      }
    } catch (error) {
      console.error('Error deleting buyer:', error);
      showToast('Failed to delete buyer', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentStatusChange = async (id, paymentStatus) => {
    setUpdating(true);
    try {
      await adminAPI.updatePaymentStatus(id, { paymentStatus });
      showToast('Payment status updated', 'success');
      setBuyers(prev => prev.map(b => b._id === id ? { ...b, paymentStatus } : b));
      if (selectedBuyer && selectedBuyer._id === id) {
        setSelectedBuyer(prev => ({ ...prev, paymentStatus }));
      }
      await fetchBuyers(false);
    } catch (error) {
      showToast('Failed to update payment status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const openDetailsModal = (buyer) => {
    setSelectedBuyer(buyer);
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
                Franchise Buyers
              </h1>
              <div className="px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-100 flex items-center gap-2">
                <span className="text-sm font-bold">Manage franchise applications</span>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-6">
              <div className="grid md:grid-cols-4 gap-4">
                <form onSubmit={handleSearch} className="md:col-span-1">
                  <div className="relative group">
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search buyers..."
                      className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-4 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                </form>

                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                >
                  <option value="">All App Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>

                <select
                  value={paymentFilter}
                  onChange={(e) => {
                    setPaymentFilter(e.target.value);
                    setPage(1);
                  }}
                  className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                >
                  <option value="">All Payments</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>

                <button
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('');
                    setPaymentFilter('');
                    setPage(1);
                    fetchBuyers(true);
                  }}
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
              <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[400px] ${updating ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b border-gray-200">Buyer</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b border-gray-200">Business</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b border-gray-200">Package</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b border-gray-200">Amount</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b border-gray-200">Payment Status</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b border-gray-200">Purchased</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b border-gray-200">Status</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b border-gray-200">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buyers.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                          No franchise buyers found
                        </td>
                      </tr>
                    ) : (
                      buyers.map((buyer) => (
                        <tr key={buyer._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4">
                            <div className="text-sm font-medium text-gray-900">{buyer.fullName}</div>
                            <div className="text-xs text-gray-500">{buyer.email}</div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600">{buyer.businessName}</td>
                          <td className="px-4 py-4 text-sm text-gray-600">{buyer.selectedPackage?.packageName || 'N/A'}</td>
                          <td className="px-4 py-4 text-sm font-bold text-gray-900">₹{(buyer.paymentAmount || 0).toLocaleString()}</td>
                          <td className="px-4 py-4">
                            <select
                              value={buyer.paymentStatus}
                              onChange={(e) => handlePaymentStatusChange(buyer._id, e.target.value)}
                              className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                                buyer.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                buyer.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="paid">Paid</option>
                              <option value="failed">Failed</option>
                            </select>
                          </td>
                          <td className="px-4 py-4 text-xs font-medium text-gray-500 whitespace-nowrap">
                            {new Date(buyer.createdAt).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            })}
                          </td>
                          <td className="px-4 py-4">
                            <select
                              value={buyer.status}
                              onChange={(e) => handleStatusChange(buyer._id, e.target.value)}
                              className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border-0 focus:ring-2 focus:ring-blue-500 shadow-sm outline-none cursor-pointer ${
                                buyer.status === 'approved' ? 'bg-green-100 text-green-800' :
                                buyer.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex gap-3">
                              <button
                                onClick={() => openDetailsModal(buyer)}
                                className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase tracking-wider transition-colors"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleDelete(buyer._id, buyer.fullName)}
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
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all shadow-sm"
                    >
                      Previous
                    </button>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest px-4">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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

      {/* Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Buyer Details"
        size="medium"
      >
        {selectedBuyer && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Customer Name</h4>
                <p className="text-gray-900 font-medium">{selectedBuyer.fullName}</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Business Name</h4>
                <p className="text-gray-900 font-medium">{selectedBuyer.businessName}</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email</h4>
                <p className="text-gray-900 font-medium">{selectedBuyer.email}</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Phone</h4>
                <p className="text-gray-900 font-medium">{selectedBuyer.phone}</p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Package Information</h4>
              <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-gray-900 font-bold">{selectedBuyer.selectedPackage?.packageName || 'N/A'}</p>
                  <p className="text-sm text-gray-500 capitalize">{selectedBuyer.selectedPackage?.category ? selectedBuyer.selectedPackage.category.replace(/([A-Z])/g, ' $1').trim() : 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">₹{(selectedBuyer.paymentAmount || 0).toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-400">Paid on {new Date(selectedBuyer.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Payment Status</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    selectedBuyer.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedBuyer.paymentStatus.toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Approval Status</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    selectedBuyer.status === 'approved' ? 'bg-green-100 text-green-800' : 
                    selectedBuyer.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedBuyer.status.toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Agreement Status</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    selectedBuyer.agreementStatus === 'signed' ? 'bg-green-100 text-green-800' : 
                    selectedBuyer.agreementStatus === 'sent' ? 'bg-blue-100 text-blue-800' :
                    selectedBuyer.agreementStatus === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {(selectedBuyer.agreementStatus || 'pending').toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Training Progress</h4>
                  <p className="text-gray-900 font-medium">
                    {selectedBuyer.trainingProgress?.completedModules || 0} / {selectedBuyer.trainingProgress?.totalModules || 0}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Referred By</h4>
                  <p className="text-gray-900 font-medium">
                    {selectedBuyer.referredBy ? `${selectedBuyer.referredBy.fullName} (${selectedBuyer.referredBy.referralCode})` : 'Direct Sale'}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Reference ID</h4>
                   <p className="text-sm font-mono text-gray-600">{selectedBuyer._id}</p>
                 </div>
                 <div>
                   <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Registered At</h4>
                   <p className="text-gray-900 font-medium">
                     {new Date(selectedBuyer.createdAt).toLocaleString('en-IN', {
                       dateStyle: 'medium',
                       timeStyle: 'short'
                     })}
                   </p>
                 </div>
               </div>
             </div>

            <div className="border-t border-gray-100 pt-6">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Buyer Management</h4>
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
                      {['pending', 'approved', 'rejected'].map((status) => (
                        <button
                          key={status}
                          disabled={updating}
                          onClick={() => handleStatusChange(selectedBuyer._id, status)}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold uppercase transition-all border ${
                            selectedBuyer.status === status
                              ? status === 'approved' ? 'bg-green-600 border-green-600 text-white shadow-md' :
                                status === 'pending' ? 'bg-yellow-500 border-yellow-500 text-white shadow-md' :
                                'bg-red-600 border-red-600 text-white shadow-md'
                              : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex gap-3">
                  {selectedBuyer.status === 'pending' && (
                    <button
                      disabled={updating}
                      onClick={() => handleStatusChange(selectedBuyer._id, 'approved')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Approve Buyer
                    </button>
                  )}
                  {selectedBuyer.status !== 'rejected' && (
                    <button
                      disabled={updating}
                      onClick={() => handleStatusChange(selectedBuyer._id, 'rejected')}
                      className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm font-bold hover:bg-red-100 transition-all disabled:opacity-50"
                    >
                      Reject Application
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
    </div>
  );
}
