


import axios from 'axios';

// const API_URL = import.meta.env.VITE_API_URL || 'https://dgtlmart-franchise.onrender.com';
const API_URL = import.meta.env.VITE_API_URL || 'https://api.dgtlmart.com';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests based on route
api.interceptors.request.use((config) => {
  const partnerData = localStorage.getItem('partnerData');
  const partnerToken = localStorage.getItem('partnerToken');
  const adminToken = localStorage.getItem('adminToken');

  const url = config.url || '';
  const method = config.method?.toLowerCase();

  // ✅ Yeh routes hamesha partnerToken se chalenge
  const partnerRoutes = [
    '/leads/my/assigned',
    // '/leads/offer-letter',
    // '/leads/certificate',
    '/franchise',
    '/referral',
  ];

  // ✅ POST /leads = partner lead banata hai (partnerToken chahiye)
  const isPartnerCreateLead = url === '/leads' && method === 'post';

  const isPartnerRoute =
    isPartnerCreateLead ||
    partnerRoutes.some(route => url.startsWith(route));

  if (isPartnerRoute) {
    // Partner token lagao
    if (partnerData) {
      const data = JSON.parse(partnerData);
      if (data.token) config.headers.Authorization = `Bearer ${data.token}`;
    } else if (partnerToken) {
      config.headers.Authorization = `Bearer ${partnerToken}`;
    }
  } else {
    // Admin token lagao (GET /leads, DELETE, UPDATE, /packages, /training sab)
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
  }

  return config;
});

// Referral Partner APIs
export const referralAPI = {
  sendOTP: (data) => api.post('/referral/send-otp', data),
  register: (data) => api.post('/referral/register', data),
  login: (credentials) => api.post('/referral/login', credentials),
  getDashboard: () => api.get('/referral/dashboard'),
  validate: (code) => api.get(`/referral/${code}`),
  getStats: (code) => api.get(`/referral/stats/${code}`),
};

// Franchise Buyer APIs
export const franchiseAPI = {
  getPackages: () => api.get('/packages'),
  sendOTP: (data) => api.post('/franchise/send-otp', data),
  register: (data) => api.post('/franchise/register', data),
  buyPackage: (data) => api.post('/franchise/buy-package', data),
  verifyPayment: (data) => api.post('/franchise/verify-payment', data),
  submitInquiry: (data) => api.post('/franchise/contact', data),
};

// Admin APIs
export const adminAPI = {
  login: (credentials) => api.post('/admin/login', credentials),
  getDashboardStats: () => api.get('/admin/dashboard-stats'),
  getReferrals: (params) => api.get('/admin/referrals', { params }),
  getFranchiseBuyers: (params) => api.get('/admin/franchise-buyers', { params }),
  getBuyers: (params) => api.get('/admin/franchise-buyers', { params }),
  updateFranchise: (id, data) => api.put(`/admin/franchise/${id}`, data),
  updateBuyerStatus: (id, data) => api.patch(`/admin/buyer/${id}/status`, data),
  updateReferralStatus: (id, data) => api.patch(`/admin/referral/${id}/status`, data),
  updateReferral: (id, data) => api.put(`/admin/referral/${id}`, data),
  updateReferralCommission: (id, data) => api.patch(`/admin/referral/${id}/commission`, data),
  deleteReferral: (id) => api.delete(`/admin/referral/${id}`),
  getContacts: (params) => api.get('/admin/contacts', { params }),
  updateContactStatus: (id, data) => api.patch(`/admin/contact/${id}/status`, data),
  deleteContact: (id) => api.delete(`/admin/contact/${id}`),
  deleteBuyer: (id) => api.delete(`/admin/buyer/${id}`),
  updatePaymentStatus: (id, data) => api.patch(`/admin/buyer/${id}/payment-status`, data),
  getAllUsers: (params) => api.get('/admin/users', { params }),

  // Partner Card APIs (Dynamic Services)
  getPartnerCards: (params) => api.get('/packages', { params }),
  getPartnerCardById: (id) => api.get(`/packages/${id}`),
  createPartnerCard: (data) => api.post('/packages', data),
  updatePartnerCard: (id, data) => api.put(`/packages/${id}`, data),
  deletePartnerCard: (id) => api.delete(`/packages/${id}`),

  // Training Module APIs
  getTrainingModules: (params) => api.get('/training', { params }),
  getTrainingModuleById: (id) => api.get(`/training/${id}`),
  createTrainingModule: (data) => api.post('/admin/training', data),
  updateTrainingModule: (id, data) => api.put(`/admin/training/${id}`, data),
  deleteTrainingModule: (id) => api.delete(`/admin/training/${id}`),

  // Agreement APIs
  getAgreements: (params) => api.get('/admin/agreements', { params }),
  getAgreementById: (id) => api.get(`/admin/agreements/${id}`),
  sendAgreement: (data) => api.post('/admin/agreements/send', data),
  updateAgreementStatus: (id, data) => api.patch(`/admin/agreements/${id}/status`, data),
  deleteAgreement: (id) => api.delete(`/admin/agreements/${id}`),
};

// Explore Package APIs (Dynamic Services)
export const explorePackagesAPI = {
  getPackages: (params) => api.get('/explore-packages', { params }),
  getPackageById: (id) => api.get(`/explore-packages/${id}`),
  createPackage: (data) => api.post('/explore-packages', data),
  updatePackage: (id, data) => api.put(`/explore-packages/${id}`, data),
  deletePackage: (id) => api.delete(`/explore-packages/${id}`),
};

// Partner Package APIs (Starter, Professional, etc.)
export const partnerPackagesAPI = {
  getPackages: (params) => api.get('/partner-packages', { params }),
  getPackageById: (id) => api.get(`/partner-packages/${id}`),
};

// Lead APIs
export const leadAPI = {
  create: (data) => api.post('/leads', data),           // partnerToken ✅
  getAll: (params) => api.get('/leads', { params }),    // adminToken ✅
  getById: (id) => api.get(`/leads/${id}`),             // adminToken ✅
  assign: (id, data) => api.patch(`/leads/${id}/assign`, data),    // adminToken ✅
  updateStatus: (id, data) => api.patch(`/leads/${id}/status`, data), // adminToken ✅
  update: (id, data) => api.put(`/leads/${id}`, data),  // adminToken ✅
  delete: (id) => api.delete(`/leads/${id}`),           // adminToken ✅
  getMyLeads: () => api.get('/leads/my/assigned'),      // partnerToken ✅
  approve: (id, data) => api.put(`/leads/approve/${id}`, data),    // adminToken ✅
  // downloadOffer: (id) => `/api/leads/offer-letter/${id}`,          // partnerToken ✅
  // downloadCertificate: (id) => `/api/leads/certificate/${id}`,     // partnerToken ✅
  convert: (id, data) => api.put(`/leads/convert/${id}`, data),   // adminToken ✅
};

// Franchise user dashboard (uses partnerToken)
export const franchiseDashboardAPI = {
  getDashboard: () => api.get('/franchise/dashboard'),
};

export default api;