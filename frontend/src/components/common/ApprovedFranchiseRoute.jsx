import { Navigate } from 'react-router-dom';

/**
 * ApprovedFranchiseRoute
 * Checks if partnerToken exists and if the partner is approved.
 * If not approved, redirects to the waiting screen.
 */
export default function ApprovedFranchiseRoute({ children }) {
  const partnerToken = localStorage.getItem('partnerToken');
  const partnerUser = JSON.parse(localStorage.getItem('partnerUser') || '{}');

  if (!partnerToken) {
    return <Navigate to="/partner-login" replace />;
  }

  // Approval check removed for partner account status
  // if (!partnerUser.isApproved) {
  //   return <Navigate to="/waiting-for-approval" replace />;
  // }

  // If user hasn't completed the full onboarding process (which sets their account to ACTIVE)
  if (partnerUser.status !== 'ACTIVE') {
    return <Navigate to="/referral-success" replace state={{ partner: partnerUser }} />;
  }

  return children;
}
