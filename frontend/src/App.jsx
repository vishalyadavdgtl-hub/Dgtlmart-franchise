import { Routes, Route } from "react-router-dom";

// Pages
import HomePage from "./pages/HomePage";
import ReferralRegistration from "./pages/Referral/ReferralRegistration";
import ReferralSuccess from "./pages/Referral/ReferralSuccess";
import ReferralLogin from "./pages/Referral/ReferralLogin";
import FranchiseDashboard from "./pages/Franchise/FranchiseDashboard";
import PackageSelection from "./pages/Franchise/PackageSelection";
import FranchiseRegistration from "./pages/Franchise/FranchiseRegistration";
import FranchiseSuccess from "./pages/Franchise/FranchiseSuccess";
import WaitingForApproval from "./pages/Franchise/WaitingForApproval";
import OfferLetter from "./pages/Franchise/OfferLetter";
import Certificate from "./pages/Franchise/Certificate";
import Contact from "./pages/Contact";
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ReferralManagement from "./pages/Admin/ReferralManagement";
import BuyerManagement from "./pages/Admin/BuyerManagement";
import ContactManagement from "./pages/Admin/ContactManagement";
import PackageManagement from "./pages/Admin/Partner Cards Management";
import AgreementManagement from "./pages/Admin/AgreementManagement";
import TrainingManagement from "./pages/Admin/TrainingManagement";
import LeadManagement from "./pages/Admin/LeadManagement";
import ExplorePackages from "./pages/Admin/ExplorePackages";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import ProtectedRoute from "./components/common/ProtectedRoute";
import ApprovedFranchiseRoute from "./components/common/ApprovedFranchiseRoute";
import { ToastProvider } from "./components/common/Toast";
import FloatingWhatsApp from "./components/common/FloatingWhatsApp";
import ScrollRestoration from "./components/common/ScrollRestoration";
import ScrollToTop from "./components/common/ScrollToTop";
import FranchiseLayout from "./pages/Franchise/Layout";
import { Navigate } from "react-router-dom";
import PartnerDashboardView from "./pages/Admin/PartnerDashboardView";
import PartnerDashboardRedirect from "./pages/Admin/Partnerdashboardredirect";

import "./App.css";
import FranchiseManagement from "./pages/Admin/FranchiseManagement";

function App() {
  return (
    <ToastProvider>
      <ScrollRestoration />
      <div className="min-h-screen bg-gray-50">
        <Routes>

          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/referral-partner" element={<ReferralRegistration />} />
          <Route path="/referral-partner/:id" element={<ReferralRegistration />} />
          <Route path="/referral-success" element={<ReferralSuccess />} />
          <Route path="/partner-login" element={<ReferralLogin />} />
          <Route path="/waiting-for-approval" element={<WaitingForApproval />} />

          {/* Partner Routes */}
          <Route element={<ApprovedFranchiseRoute><FranchiseLayout /></ApprovedFranchiseRoute>}>
            <Route path="/dashboard" element={<FranchiseDashboard />} />
            <Route path="/offer-letter" element={<OfferLetter />} />
            <Route path="/certificate" element={<Certificate />} />
          </Route>

          <Route path="/partner-dashboard" element={<Navigate to="/dashboard" replace />} />
          <Route path="/partner">
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Navigate to="/dashboard" replace />} />
          </Route>
          <Route path="/franchise-dashboard" element={<Navigate to="/dashboard" replace />} />
          <Route path="/buy-franchise" element={<PackageSelection />} />
          <Route path="/franchise-register/:packageId" element={<FranchiseRegistration />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Admin Routes */}
          <Route path="/manage-dgtl" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/referrals" element={<ProtectedRoute><ReferralManagement /></ProtectedRoute>} />
          <Route path="/admin/franchise" element={<ProtectedRoute><FranchiseManagement /></ProtectedRoute>} />
          <Route path="/admin/buyers" element={<Navigate to="/admin/referrals" />} />
          <Route path="/admin/contacts" element={<ProtectedRoute><ContactManagement /></ProtectedRoute>} />
          <Route path="/admin/packages" element={<ProtectedRoute><PackageManagement /></ProtectedRoute>} />
          <Route path="/admin/agreements" element={<ProtectedRoute><AgreementManagement /></ProtectedRoute>} />
          <Route path="/admin/training" element={<ProtectedRoute><TrainingManagement /></ProtectedRoute>} />
          <Route path="/admin/leads" element={<ProtectedRoute><LeadManagement /></ProtectedRoute>} />
          <Route path="/admin/explore-packages" element={<ProtectedRoute><ExplorePackages /></ProtectedRoute>} />

          {/* ✅ Purane dono routes redirect honge naye pe */}
          <Route
            path="/admin/referral-partner/:partnerId/dashboard"
            element={<PartnerDashboardRedirect />}
          />

          {/* ✅ MAIN route — /admin/partner/:id aur /admin/partner/:id/dashboard dono handle */}
          <Route
            path="/admin/partner/:partnerId"
            element={<ProtectedRoute><PartnerDashboardView /></ProtectedRoute>}
          />
          <Route
            path="/admin/partner/:partnerId/dashboard"
            element={<ProtectedRoute><PartnerDashboardView /></ProtectedRoute>}
          />

        </Routes>
        <ScrollToTop />
        <FloatingWhatsApp />
      </div>
    </ToastProvider>
  );
}

export default App;