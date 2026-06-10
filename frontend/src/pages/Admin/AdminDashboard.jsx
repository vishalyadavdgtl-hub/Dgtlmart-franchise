import { useEffect, useState } from 'react';
import AdminSidebar from '../../components/Admin/Sidebar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { adminAPI } from '../../utils/api';
import { useToast } from '../../components/common/Toast';

export default function AdminDashboard() {
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBuyer, setSelectedBuyer] = useState(null);

 useEffect(() => {
  fetchDashboardData();
}, []);

  const fetchDashboardData = async () => {
    try {
      const response = await adminAPI.getDashboardStats();
      setStats(response.data.stats);
      setRecentActivity(response.data.recentActivity);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };
  const handleEdit = (buyer) => {
  setSelectedBuyer(buyer);
};

const handleUpdate = async () => {
  try {
    await adminAPI.updateFranchise(selectedBuyer._id, {
      fullName: selectedBuyer.fullName,
      businessName: selectedBuyer.businessName,
      paymentStatus: selectedBuyer.paymentStatus,
      selectedPackage: {
        ...selectedBuyer.selectedPackage
      }
    });

    alert("Updated successfully");

    fetchDashboardData(); // 🔥 important

    setSelectedBuyer(null);

  } catch (err) {
    console.log(err);
  }
};

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 lg:ml-64 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 font-heading">
            Dashboard
          </h1>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              {/* Statistics Cards - Compact Size */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-lg shadow-md p-4 bg-blue-50 border-2 border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-blue-600 font-medium mb-1">Total Referral Partners</p>
                      <p className="text-2xl font-bold text-blue-900">{stats?.totalReferrals || 0}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4 bg-green-50 border-2 border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-green-600 font-medium mb-1">Total Franchise Buyers</p>
                      <p className="text-2xl font-bold text-green-900">{stats?.totalBuyers || 0}</p>
                    </div>
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4 bg-yellow-50 border-2 border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-yellow-600 font-medium mb-1">Pending Buyers</p>
                      <p className="text-2xl font-bold text-yellow-900">{stats?.pendingBuyers || 0}</p>
                    </div>
                    <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4 bg-orange-50 border-2 border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-orange-600 font-medium mb-1">Pending Partners</p>
                      <p className="text-2xl font-bold text-orange-900">{stats?.pendingReferrals || 0}</p>
                    </div>
                    <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4 bg-purple-50 border-2 border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-purple-600 font-medium mb-1">Paid Buyers</p>
                      <p className="text-2xl font-bold text-purple-900">{stats?.paidBuyers || 0}</p>
                    </div>
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4 bg-indigo-50 border-2 border-indigo-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-indigo-600 font-medium mb-1">Total Revenue</p>
                      <p className="text-2xl font-bold text-indigo-900">
                        ₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4 bg-pink-50 border-2 border-pink-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-pink-600 font-medium mb-1">Total Commissions</p>
                      <p className="text-2xl font-bold text-pink-900">
                        ₹{(stats?.totalCommissions || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4 bg-slate-50 border-2 border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-600 font-medium mb-1">Total Inquiries</p>
                      <p className="text-2xl font-bold text-slate-900">{stats?.totalContacts || 0}</p>
                    </div>
                    <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 font-heading">
                  Recent Franchise Buyers
                </h2>
                
                {recentActivity.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No recent activity</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100 text-left">
                        <tr>
                          <th className="px-4 py-3 font-semibold text-gray-900">Name</th>
                          <th className="px-4 py-3 font-semibold text-gray-900">Business</th>
                          <th className="px-4 py-3 font-semibold text-gray-900">Package</th>
                          <th className="px-4 py-3 font-semibold text-gray-900">Payment</th>
                          <th className="px-4 py-3 font-semibold text-gray-900">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentActivity.map((buyer) => (
                          <tr key={buyer._id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-3">{buyer.fullName}</td>
                            <td className="px-4 py-3">
  {buyer.businessName || buyer.fullName}
</td>
                            <td className="px-4 py-3">{buyer.selectedPackage?.packageName || 'N/A'}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                buyer.paymentStatus === 'paid'
                                  ? 'bg-green-100 text-green-800'
                                  : buyer.paymentStatus === 'failed'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {buyer.paymentStatus}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(buyer.createdAt).toLocaleDateString()}
                            </td>
                             <td className="px-4 py-3">
  <button onClick={() => handleEdit(buyer)}>
    Edit
  </button>
</td> 
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
      
{selectedBuyer && (
  <div className="bg-white p-6 mt-6 rounded shadow">
    <h2 className="text-xl font-bold mb-4">Edit Franchise</h2>

    {/* NAME */}
    <label className="block font-medium">Name</label>
    <input
      className="border p-2 mb-3 w-full rounded"
      value={selectedBuyer.fullName}
      onChange={(e) =>
        setSelectedBuyer({
          ...selectedBuyer,
          fullName: e.target.value
        })
      }
    />

    {/* BUSINESS */}
    <label className="block font-medium">Business</label>
    <input
      className="border p-2 mb-3 w-full rounded"
      value={selectedBuyer.businessName || ""}
      onChange={(e) =>
        setSelectedBuyer({
          ...selectedBuyer,
          businessName: e.target.value
        })
      }
    />

    {/* PACKAGE */}
    <label className="block font-medium">Package</label>
    <input
      className="border p-2 mb-3 w-full rounded"
      value={selectedBuyer.selectedPackage?.packageName || ""}
      onChange={(e) =>
        setSelectedBuyer({
          ...selectedBuyer,
          selectedPackage: {
            ...selectedBuyer.selectedPackage,
            packageName: e.target.value
          }
        })
      }
    />

    {/* PAYMENT */}
    <label className="block font-medium">Payment Status</label>
    <select
      className="border p-2 mb-4 w-full rounded"
      value={selectedBuyer.paymentStatus}
      onChange={(e) =>
        setSelectedBuyer({
          ...selectedBuyer,
          paymentStatus: e.target.value
        })
      }
    >
      <option value="pending">Pending</option>
      <option value="paid">Paid</option>
      <option value="failed">Failed</option>
    </select>

    <button
      onClick={handleUpdate}
      className="bg-green-500 text-white px-4 py-2 rounded"
    >
      Update
    </button>
  </div>
)}
        </div>
      </div>
    </div>
  );
}