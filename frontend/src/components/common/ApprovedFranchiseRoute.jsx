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

  // If the partner is logged in but not approved, redirect to waiting screen
  if (!partnerUser.isApproved) {
    return <Navigate to="/waiting-for-approval" replace />;
  }

  return children;
}
