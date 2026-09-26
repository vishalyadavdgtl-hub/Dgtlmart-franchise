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
      const response = await adminAPI.getReferrals({ page: 1, limit: 100 });
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

  const handleDetailsStatusChange = async (id, newStatus) => {
    if (!window.confirm(`Are you sure you want to change the details status to ${newStatus}?`)) return;
    
    setUpdatingId(id);
    try {
      await adminAPI.updateReferral(id, { detailsStatus: newStatus });
      showToast("Details status updated successfully");
      setApplications((prev) =>
        prev.map((app) => (app._id === id ? { ...app, detailsStatus: newStatus } : app))
      );
    } catch (error) {
      console.error("Error updating details status:", error);
      showToast("Failed to update details status", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMeetingStatusChange = async (id, newStatus) => {
    if (!window.confirm(`Are you sure you want to change the meeting status to ${newStatus}?`)) return;
    
    setUpdatingId(id);
    try {
      await adminAPI.updateReferral(id, { meetingStatus: newStatus });
      showToast("Meeting status updated successfully");
      setApplications((prev) =>
        prev.map((app) => (app._id === id ? { ...app, meetingStatus: newStatus } : app))
      );
    } catch (error) {
      console.error("Error updating meeting status:", error);
      showToast("Failed to update meeting status", "error");
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
    app.aadharNumber ||
    app.detailsStatus === 'PENDING' ||
    app.detailsStatus === 'APPROVED' ||
    app.meetingStatus === 'PENDING' ||
    app.meetingStatus === 'COMPLETED'
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
                        {app.detailsStatus === 'PENDING' && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 border border-purple-200 rounded-full text-[10px] font-bold uppercase">Details Pending</span>
                        )}
                        {app.detailsStatus === 'APPROVED' && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 border border-green-200 rounded-full text-[10px] font-bold uppercase">Details Approved</span>
                        )}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Applied on {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        {app.status === 'ACTIVE' && (
                          <span className="ml-2 pl-2 border-l border-gray-300">
                            Activated on {new Date(app.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        )}
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
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">Terms & Agreements</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium text-sm text-gray-900">Partner Terms & NDA</span>
                          </div>
                          {app.agreementAccepted ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md">Accepted</span>
                          ) : (
                            <span className="text-gray-400 text-sm italic">Not Accepted</span>
                          )}
                        </div>
                      </div>

                      {/* Approval Actions */}
                      <div className="mt-6 pt-4 border-t flex flex-col gap-3">
                        {app.detailsStatus === 'PENDING' && (
                          <div className="flex gap-3 w-full">
                            <button
                              onClick={() => handleDetailsStatusChange(app._id, 'APPROVED')}
                              className="flex-1 py-2.5 bg-purple-600 text-white rounded-lg font-bold shadow hover:bg-purple-700 transition-colors text-sm"
                            >
                              Approve Details Only
                            </button>
                            <button
                              onClick={() => handleDetailsStatusChange(app._id, 'REJECTED')}
                              className="flex-1 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg font-bold hover:bg-red-100 transition-colors text-sm"
                            >
                              Reject Details
                            </button>
                          </div>
                        )}
                        
                        {app.detailsStatus === 'APPROVED' && (!app.meetingStatus || app.meetingStatus === 'NOT_SCHEDULED') && (
                          <div className="p-3 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-sm font-semibold flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            Details Approved! Waiting for user to schedule a meeting.
                          </div>
                        )}

                        {app.meetingStatus === 'PENDING' && (
                          <div className="flex gap-3 w-full">
                            <button
                              onClick={() => handleMeetingStatusChange(app._id, 'COMPLETED')}
                              className="flex-1 py-2.5 bg-orange-500 text-white rounded-lg font-bold shadow hover:bg-orange-600 transition-colors text-sm"
                            >
                              Mark Meeting Completed
                            </button>
                          </div>
                        )}

                        {app.meetingStatus === 'COMPLETED' && app.status !== 'ACTIVE' && (
                          <div className="p-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-semibold flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            Meeting Completed! Awaiting final Franchise Approval.
                          </div>
                        )}

                        {app.status === 'ACTIVE' && (
                          <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Fully Approved Franchise
                          </div>
                        )}

                        {app.status !== 'ACTIVE' && (
                          <div className="flex gap-3 w-full">
                          {app.status === 'PENDING' && (
                            <button
                              onClick={() => handleStatusChange(app._id, 'ACTIVE')}
                              className="flex-1 py-2.5 bg-green-600 text-white rounded-lg font-bold shadow hover:bg-green-700 transition-colors"
                            >
                              Approve Franchise
                            </button>
                          )}
                          {app.status !== 'REJECTED' && (
                            <button
                              onClick={() => handleStatusChange(app._id, 'REJECTED')}
                              className="flex-1 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg font-bold hover:bg-red-100 transition-colors"
                            >
                              Reject Franchise
                            </button>
                          )}
                        </div>
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