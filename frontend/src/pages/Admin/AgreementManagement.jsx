
 import { useEffect, useState } from "react";
 import { adminAPI } from "../../utils/api";
import AdminSidebar from "../../components/Admin/Sidebar";
 import {useToast} from "../../components/common/Toast";
 import Modal from "../../components/common/Modal";
 import LoadingSpinner from "../../components/common/LoadingSpinner";
 import Button from "../../components/common/Button";

export default function AgreementManagement() {
  const { showToast } = useToast();
  const [agreements, setAgreements] = useState([]);
  const [franchiseBuyers, setFranchiseBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const [formData, setFormData] = useState({
    franchiseBuyerId: '',
    title: '',
    content: '',
    documentUrl: ''
  });

  useEffect(() => {
    fetchAgreements();
    fetchFranchiseBuyers();
  }, []);

  const fetchAgreements = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAgreements();
      setAgreements(response.data.agreements || []);
    } catch (error) {
      console.error('Error fetching agreements:', error);
      showToast('Failed to load agreements', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchFranchiseBuyers = async () => {
    try {
      const response = await adminAPI.getFranchiseBuyers();
      setFranchiseBuyers(response.data.buyers || []);
    } catch (error) {
      console.error('Error fetching franchise buyers:', error);
    }
  };

  const handleOpenModal = () => {
    setFormData({
      franchiseBuyerId: '',
      title: '',
      content: '',
      documentUrl: ''
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.franchiseBuyerId || !formData.title || !formData.content) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    try {
      await adminAPI.sendAgreement(formData);
      showToast('Agreement sent successfully', 'success');
      setShowModal(false);
      fetchAgreements();
    } catch (error) {
      console.error('Error sending agreement:', error);
      showToast('Failed to send agreement', 'error');
    }
  };

  const handleViewDetails = (agreement) => {
    setSelectedAgreement(agreement);
    setShowDetailsModal(true);
  };

  const handleStatusUpdate = async (status) => {
    if (!selectedAgreement) return;

    try {
      await adminAPI.updateAgreementStatus(selectedAgreement._id, { status });
      showToast('Agreement status updated successfully', 'success');
      setShowDetailsModal(false);
      fetchAgreements();
    } catch (error) {
      console.error('Error updating agreement status:', error);
      showToast('Failed to update agreement status', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this agreement?')) {
      try {
        await adminAPI.deleteAgreement(id);
        showToast('Agreement deleted successfully', 'success');
        fetchAgreements();
      } catch (error) {
        console.error('Error deleting agreement:', error);
        showToast('Failed to delete agreement', 'error');
      }
    }
  };

  // if (loading) return <LoadingSpinner />;

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-200',
      sent: 'bg-blue-200',
      signed: 'bg-green-200',
      accepted: 'bg-green-300',
      rejected: 'bg-red-200'
    };
    return colors[status] || 'bg-gray-200';
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 lg:ml-64 p-4 lg:p-8">
        {loading ? (
          <LoadingSpinner />
        ) : (
        <div className="max-w-7xl mx-auto">
      <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Agreement Management</h2>
        <Button 
          onClick={handleOpenModal}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
        >
          + Send Agreement
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-3 text-left font-semibold">Buyer Name</th>
              <th className="border p-3 text-left font-semibold">Agreement Title</th>
              <th className="border p-3 text-left font-semibold">Status</th>
              <th className="border p-3 text-left font-semibold">Sent Date</th>
              <th className="border p-3 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {agreements.map((agreement) => (
              <tr key={agreement._id} className="hover:bg-gray-50">
                <td className="border p-3">{agreement.franchiseBuyer?.fullName}</td>
                <td className="border p-3">{agreement.title}</td>
                <td className="border p-3">
                  <span className={`px-2 py-1 rounded text-sm font-semibold ${getStatusColor(agreement.status)}`}>
                    {agreement.status.charAt(0).toUpperCase() + agreement.status.slice(1)}
                  </span>
                </td>
                <td className="border p-3">
                  {agreement.sendDate ? new Date(agreement.sendDate).toLocaleDateString() : 'N/A'}
                </td>
                <td className="border p-3 text-center">
                  <button
                    onClick={() => handleViewDetails(agreement)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded mr-2 text-sm"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDelete(agreement._id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Send Agreement Modal */}
      <Modal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Send Agreement"
      >
        <div className="w-full">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Franchise Buyer *</label>
                <select
                  name="franchiseBuyerId"
                  value={formData.franchiseBuyerId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="">Choose buyer...</option>
                  {franchiseBuyers.map(buyer => (
                    <option key={buyer._id} value={buyer._id}>
                      {buyer.fullName} ({buyer.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agreement Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="e.g., Franchise Agreement 2025"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agreement Content *</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="Enter agreement content here"
                  rows="6"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document URL</label>
                <input
                  type="url"
                  name="documentUrl"
                  value={formData.documentUrl}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="https://example.com/agreement.pdf"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 py-2 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium"
                >
                  Send Agreement
                </button>
              </div>
            </form>
          </div>
      </Modal>

      {/* Agreement Details Modal */}
      <Modal 
        isOpen={showDetailsModal && !!selectedAgreement}
        onClose={() => setShowDetailsModal(false)}
        title={selectedAgreement?.title || 'Agreement Details'}
      >
        {selectedAgreement && (
        <div className="w-full max-h-96 overflow-y-auto">
            
            <div className="mb-4 pb-4 border-b">
              <p className="text-sm text-gray-600">
                <strong>Buyer:</strong> {selectedAgreement?.franchiseBuyer?.fullName}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Email:</strong> {selectedAgreement?.franchiseBuyer?.email}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Status:</strong> <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(selectedAgreement?.status)}`}>
                  {selectedAgreement?.status?.charAt(0).toUpperCase() + selectedAgreement?.status?.slice(1)}
                </span>
              </p>
            </div>

            <div className="mb-4 pb-4 border-b">
              <p className="text-sm font-semibold text-gray-700 mb-2">Agreement Content:</p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedAgreement?.content}</p>
            </div>

            {selectedAgreement?.documentUrl && (
              <div className="mb-4 pb-4 border-b">
                <a 
                  href={selectedAgreement?.documentUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                >
                  📄 Download Document
                </a>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">Update Status:</p>
              <div className="flex flex-wrap gap-2">
                {['sent', 'signed', 'accepted', 'rejected'].map(status => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(status)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm capitalize"
                  >
                    Mark as {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 py-2 rounded-lg font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

        </div>
        
      </div>
  )}
    </div>
    </div>
  );
}
