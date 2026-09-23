import { useEffect, useState } from "react";
import AdminSidebar from "../../components/Admin/Sidebar";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { adminAPI } from "../../utils/api";
import { useToast } from "../../components/common/Toast";

export default function ApplicationsManagement() {
  const { showToast } = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchApplications();
    window.scrollTo(0, 0);
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      // Fetch both referral and franchise (if API supports it, otherwise fetch one by one and merge)
      // The current API allows no type to fetch all, or we can fetch franchise only as per request.
      const response = await adminAPI.getReferrals({ page: 1, limit: 100, type: "franchise" });
      setApplications(response.data?.referrals || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      showToast("Failed to load applications", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    if (!window.confirm(`Are you sure you want to change the status to ${newStatus}?`)) return;
    
    setUpdatingId(id);
    try {
      await adminAPI.updateReferralStatus(id, { status: newStatus });
      showToast("Status updated successfully");
      setApplications((prev) =>
        prev.map((app) => (app._id === id ? { ...app, status: newStatus } : app))
      );
    } catch (error) {
      console.error("Error updating status:", error);
      showToast("Failed to update status", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      ACTIVE: "bg-green-100 text-green-800 border-green-200",
      REJECTED: "bg-red-100 text-red-800 border-red-200",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${colors[status] || "bg-gray-100 text-gray-800 border-gray-200"}`}>
        {status}
      </span>
    );
  };

  const actualApplications = applications.filter(app => 
    (app.selectedPackage?.packageName) || 
    (app.Packages && app.Packages.trim() !== '') || 
    app.kycDocumentUrl || 
    app.ndaDocumentUrl || 
    app.signedAgreementUrl || 
    app.panNumber || 
    app.aadharNumber
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <div className="flex-1 lg:ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 font-heading">
              Franchise Applications
            </h1>
            <p className="text-gray-500 mt-2">
              Review and manage all submitted franchise applications in detail.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner size="large" />
            </div>
          ) : actualApplications.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <p className="text-gray-500">No applications found. Only users who have submitted details or documents will appear here.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {actualApplications.map((app) => (
                <div key={app._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
                  {updatingId === app._id && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
                      <LoadingSpinner />
                    </div>
                  )}
                  
                  {/* Card Header */}
                  <div className="bg-slate-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                        {app.fullName}
                        <StatusBadge status={app.status} />
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Applied on {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Package Selected</p>
                      <p className="text-lg font-bold text-blue-700">{app.selectedPackage?.packageName || app.Packages || "N/A"}</p>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Left Column: Personal Info */}
                    <div className="space-y-6">
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">Personal Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Email Address</p>
                          <p className="font-medium text-gray-900 break-all">{app.email}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                          <p className="font-medium text-gray-900">{app.phone}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Business Name</p>
                          <p className="font-medium text-gray-900">{app.businessName || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Partner Type</p>
                          <p className="font-medium text-gray-900 capitalize">{app.franchiseType || app.role || 'N/A'}</p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-1">Payment Status</p>
                          <p className={`font-medium font-bold capitalize ${app.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-500'}`}>
                            {app.paymentStatus || 'pending'} (₹{app.paymentAmount?.toLocaleString('en-IN') || 0})
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">City & State</p>
                          <p className="font-medium text-gray-900">{app.cityAndState || 'N/A'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-gray-500 mb-1">Professional Background</p>
                          <p className="font-medium text-gray-900">{app.professionalBackground || 'N/A'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-gray-500 mb-1">Marketing Experience</p>
                          <p className="font-medium text-gray-900">{app.marketingExperience || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Investment Budget</p>
                          <p className="font-medium text-gray-900">{app.investmentBudget || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Franchise Start Date</p>
                          <p className="font-medium text-gray-900">{app.franchiseStartDate || 'N/A'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-gray-500 mb-1">Existing Setup</p>
                          <p className="font-medium text-gray-900">{app.existingSetup || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Revenue Target</p>
                          <p className="font-medium text-gray-900">{app.revenueTarget || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Consultation Readiness</p>
                          <p className="font-medium text-gray-900">{app.consultationReadiness || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Documents & Actions */}
                    <div className="space-y-6">
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">Uploaded Documents</h3>
                      <div className="space-y-3">
                        
                        {/* KYC Doc */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            <span className="font-medium text-sm text-gray-900">KYC Document</span>
                          </div>
                          {app.kycDocumentUrl ? (
                            <a href={app.kycDocumentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold text-sm hover:underline">View File</a>
                          ) : (
                            <span className="text-gray-400 text-sm italic">Not Uploaded</span>
                          )}
                        </div>

                        {/* NDA Doc */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            <span className="font-medium text-sm text-gray-900">Signed NDA</span>
                          </div>
                          {app.ndaDocumentUrl ? (
                            <a href={app.ndaDocumentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold text-sm hover:underline">View File</a>
                          ) : (
                            <span className="text-gray-400 text-sm italic">Not Uploaded</span>
                          )}
                        </div>

                        {/* Agreement Doc */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            <span className="font-medium text-sm text-gray-900">Signed Agreement</span>
                          </div>
                          {app.signedAgreementUrl ? (
                            <a href={app.signedAgreementUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold text-sm hover:underline">View File</a>
                          ) : (
                            <span className="text-gray-400 text-sm italic">Not Uploaded</span>
                          )}
                        </div>

                      </div>

                      {/* Approval Actions */}
                      <div className="mt-6 pt-4 border-t flex gap-3">
                        {app.status === 'PENDING' && (
                          <button
                            onClick={() => handleStatusChange(app._id, 'ACTIVE')}
                            className="flex-1 py-2.5 bg-green-600 text-white rounded-lg font-bold shadow hover:bg-green-700 transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        {app.status !== 'REJECTED' && (
                          <button
                            onClick={() => handleStatusChange(app._id, 'REJECTED')}
                            className="flex-1 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg font-bold hover:bg-red-100 transition-colors"
                          >
                            Reject
                          </button>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}