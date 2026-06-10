import { useEffect, useState } from 'react';
import AdminSidebar from '../../components/Admin/Sidebar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { adminAPI } from '../../utils/api';
import { useToast } from '../../components/common/Toast';

export default function ContactManagement() {
  const { showToast } = useToast();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modal state
  const [selectedContact, setSelectedContact] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, [page, statusFilter]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getContacts({
        page,
        limit: 10,
        search,
        status: statusFilter,
      });
      setContacts(response.data.contacts);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      showToast('Failed to load contacts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchContacts();
  };

  const handleStatusChange = async (id, newStatus) => {
    setUpdating(true);
    try {
      await adminAPI.updateContactStatus(id, { status: newStatus });
      showToast('Status updated successfully');
      setContacts(prev => prev.map(c => c._id === id ? { ...c, status: newStatus } : c));
      if (selectedContact && selectedContact._id === id) {
        setSelectedContact(prev => ({ ...prev, status: newStatus }));
      }
      await fetchContacts();
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('Failed to update status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the inquiry from "${name}"?`)) {
      return;
    }

    setUpdating(true);
    try {
      await adminAPI.deleteContact(id);
      showToast('Inquiry deleted successfully');
      setContacts(prev => prev.filter(c => c._id !== id));
      if (selectedContact && selectedContact._id === id) {
        setIsDetailsModalOpen(false);
      }
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      showToast('Failed to delete inquiry', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const openDetailsModal = (contact) => {
    setSelectedContact(contact);
    setIsDetailsModalOpen(true);
    // Automatically mark as 'read' if it's 'pending'
    if (contact.status === 'pending') {
      handleStatusChange(contact._id, 'read');
    }
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
                Contact Inquiries
              </h1>
              <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 flex items-center gap-2">
                <span className="text-sm font-bold">Manage customer messages and support</span>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-6 mb-2">
              <div className="grid md:grid-cols-3 gap-4">
                <form onSubmit={handleSearch} className="md:col-span-2">
                  <div className="relative group flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, email, or message..."
                        className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                      />
                      <svg className="w-5 h-5 text-gray-400 absolute left-4 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <button type="submit" className="bg-gray-900 text-white px-6 py-2.5 rounded-xl hover:bg-gray-800 transition-all font-bold shadow-lg shadow-gray-900/10">
                      Search
                    </button>
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
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                </select>
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
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b border-gray-200">Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b border-gray-200">Contact Info</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b border-gray-200">Service</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b border-gray-200">Date</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b border-gray-200">Status</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b border-gray-200">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                          No contact inquiries found
                        </td>
                      </tr>
                    ) : (
                      contacts.map((contact) => (
                        <tr key={contact._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 font-bold text-gray-900">{contact.name}</td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-900">{contact.email}</div>
                            <div className="text-xs text-gray-500">{contact.phone}</div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                              {contact.service}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600 font-medium">
                            {new Date(contact.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-4">
                            <select
                              value={contact.status}
                              onChange={(e) => handleStatusChange(contact._id, e.target.value)}
                              className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border-0 focus:ring-2 focus:ring-blue-500 shadow-sm outline-none cursor-pointer ${
                                contact.status === 'replied' ? 'bg-green-100 text-green-800' : 
                                contact.status === 'read' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="read">Read</option>
                              <option value="replied">Replied</option>
                            </select>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex gap-3">
                              <button
                                onClick={() => openDetailsModal(contact)}
                                className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase tracking-wider transition-colors"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleDelete(contact._id, contact.name)}
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
        title="Inquiry Details"
        size="medium"
      >
        {selectedContact && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Name</h4>
                <p className="text-gray-900 font-medium">{selectedContact.name}</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Service Requested</h4>
                <p className="text-gray-900 font-medium">{selectedContact.service}</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email</h4>
                <p className="text-gray-900 font-medium">{selectedContact.email}</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Phone</h4>
                <p className="text-gray-900 font-medium">{selectedContact.phone}</p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Message</h4>
              <div className="bg-gray-50 p-4 rounded-xl text-gray-700 whitespace-pre-wrap leading-relaxed italic border border-gray-100">
                "{selectedContact.message}"
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Submitted On</h4>
                  <p className="text-gray-900 font-medium">
                    {new Date(selectedContact.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Current Status</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${
                    selectedContact.status === 'replied' ? 'bg-green-100 text-green-800' : 
                    selectedContact.status === 'read' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedContact.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => handleDelete(selectedContact._id, selectedContact.name)}
                className="px-6 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition-colors font-medium disabled:opacity-50"
                disabled={updating}
              >
                Delete Inquiry
              </button>
              <button
                onClick={() => handleStatusChange(selectedContact._id, 'replied')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                disabled={selectedContact.status === 'replied' || updating}
              >
                Mark as Replied
              </button>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
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
