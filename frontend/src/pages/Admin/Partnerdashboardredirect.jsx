// src/pages/Admin/PartnerDashboardRedirect.jsx
// Purane route /admin/referral-partner/:partnerId/dashboard ko
// naye route /admin/partner/:partnerId pe redirect karta hai

import { useParams, Navigate } from "react-router-dom";

export default function PartnerDashboardRedirect() {
  const { partnerId } = useParams();
  return <Navigate to={`/admin/partner/${partnerId}`} replace />;
}