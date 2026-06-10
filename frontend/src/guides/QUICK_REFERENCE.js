/**
 * QUICK REFERENCE: Authentication-Based Payment Flow
 * 
 * Copy-paste ready examples for implementing auth flow in your components
 */

// ============================================================================
// 1. PROTECTING A ROUTE (in App.jsx)
// ============================================================================

/*
Example: Protecting the payment package page

import ProtectedRoute from './components/common/ProtectedRoute';
import PackageSelection from './pages/Franchise/PackageSelection';

<Routes>
  <Route
    path="/buy-franchise"
    element={
      <ProtectedRoute 
        requiredTokens={['clientToken', 'partnerToken']}
        loginPath="/client-login"
      >
        <PackageSelection />
      </ProtectedRoute>
    }
  />
</Routes>

What happens:
- User tries to access /buy-franchise without token
- ProtectedRoute redirects to /client-login
- Current URL (/buy-franchise) is stored in sessionStorage
- After user logs in, they're redirected back to /buy-franchise
*/

// ============================================================================
// 2. HANDLING LOGIN WITH REDIRECT (in LoginComponent.jsx)
// ============================================================================

/*
import { useNavigate } from 'react-router-dom';
import { getRedirectPath } from '../utils/authUtils';
import { franchiseAPI } from '../utils/api';

const ClientLogin = () => {
  const navigate = useNavigate();
  
  const handleLogin = async (credentials) => {
    try {
      // Call login API
      const response = await franchiseAPI.clientLogin(credentials);
      
      // Save token
      localStorage.setItem('clientToken', response.data.token);
      
      // Get the URL where user was trying to go
      // Priority: saved route > /buy-franchise
      const redirectTo = getRedirectPath() || '/buy-franchise';
      
      // Redirect back to intended page
      navigate(redirectTo);
      
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  return (
    // Login form JSX
  );
};
*/

// ============================================================================
// 3. CHECKING AUTHENTICATION IN A COMPONENT
// ============================================================================

/*
import { useAuth } from '../context/AuthContext';
import { isAuthenticated, getToken } from '../utils/authUtils';

const PaymentComponent = () => {
  const { isAuthenticated: authStatus } = useAuth();
  
  // Check if user is logged in
  if (!authStatus) {
    return <Navigate to="/client-login" />;
  }
  
  // Get the active token
  const token = getToken('clientToken');
  
  // Render payment form
  return <PaymentForm />;
};
*/

// ============================================================================
// 4. MAKING AUTHENTICATED API CALLS
// ============================================================================

/*
Automatic token inclusion (handled by api.js interceptor):

import { franchiseAPI } from '../utils/api';

// This automatically includes the token in Authorization header
const handlePayment = async (paymentData) => {
  try {
    const response = await franchiseAPI.register(paymentData);
    // Token was automatically added by interceptor
    console.log('Payment initiated:', response.data);
  } catch (error) {
    if (error.response?.status === 401) {
      // Token invalid or expired
      // Interceptor will handle logout and redirect
    }
  }
};
*/

// ============================================================================
// 5. MANUAL TOKEN VALIDATION
// ============================================================================

/*
import { isAuthenticated, isTokenExpired, getToken } from '../utils/authUtils';

const checkAuthBeforePayment = () => {
  // Check if user has required token
  if (!isAuthenticated(['clientToken', 'partnerToken'])) {
    console.log('User not logged in');
    return false;
  }
  
  // Get the token
  const token = getToken('clientToken') || getToken('partnerToken');
  
  // Check if token is expired
  if (isTokenExpired(token)) {
    console.log('Token expired, please log in again');
    localStorage.removeItem('clientToken');
    localStorage.removeItem('partnerToken');
    return false;
  }
  
  return true;
};

// Usage
if (checkAuthBeforePayment()) {
  // Proceed with payment
}
*/

// ============================================================================
// 6. LOGOUT FUNCTIONALITY
// ============================================================================

/*
import { useAuth } from '../context/AuthContext';
import { clearAuthTokens, clearRedirectPath } from '../utils/authUtils';

const NavBar = () => {
  const { logout } = useAuth();
  
  const handleLogout = () => {
    // Clear everything
    logout(); // From AuthContext
    clearAuthTokens(); // Clear localStorage
    clearRedirectPath(); // Clear sessionStorage
    
    // Redirect to home or login
    navigate('/');
  };
  
  return (
    <button onClick={handleLogout}>Logout</button>
  );
};
*/

// ============================================================================
// 7. PROTECTING FROM UNAUTHENTICATED PAYMENT ATTEMPTS
// ============================================================================

/*
Backend Controller: franchise.controller.js

// Protected endpoint - requires authMiddleware
router.post('/franchise/register', authMiddleware, (req, res) => {
  // req.user contains decoded JWT info
  const userId = req.user.id;
  
  // Use userId for creating payment order tied to user
  const order = await razorpay.orders.create({
    amount: req.body.amount,
    currency: 'INR',
    notes: {
      userId: userId // Track which user created this order
    }
  });
  
  res.json({ order });
});

Frontend will automatically send token:
Authorization: Bearer <clientToken>

If token missing or invalid:
- Backend returns 401 Unauthorized
- Frontend interceptor catches 401
- User tokens cleared and redirected to login
*/

// ============================================================================
// 8. HANDLING 401 ERRORS IN COMPONENTS
// ============================================================================

/*
The API interceptor handles most 401 errors automatically, but you can also
handle them specifically in your components:

import { franchiseAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const PaymentComponent = () => {
  const navigate = useNavigate();
  
  const handlePayment = async () => {
    try {
      const response = await franchiseAPI.register(paymentData);
      console.log('Payment successful');
    } catch (error) {
      if (error.response?.status === 401) {
        // Token invalid or expired
        console.log('Session expired, please log in again');
        navigate('/client-login');
      } else {
        // Other error
        console.error('Payment failed:', error.message);
      }
    }
  };
};
*/

// ============================================================================
// 9. COMPLETE LOGIN FLOW EXAMPLE
// ============================================================================

/*
Step-by-step what happens:

1. User clicks \"View Packages\" button on home page
   - Navigates to /buy-franchise

2. App.jsx renders:
   <Routes>
     <Route path=\"/buy-franchise\" element={
       <ProtectedRoute requiredTokens={['clientToken']} loginPath=\"/client-login\">
         <PackageSelection />
       </ProtectedRoute>
     } />
   </Routes>

3. ProtectedRoute checks: Does localStorage.getItem('clientToken') exist?
   - NO → Redirect to '/client-login'
   - Also saves '/buy-franchise' in sessionStorage('redirectAfterLogin')

4. User is now on /client-login page
   - User fills in email and password
   - Clicks \"Login\"

5. ClientLogin.jsx handleSubmit() runs:
   ```
   const response = await franchiseAPI.clientLogin({ email, password });
   localStorage.setItem('clientToken', response.data.token);
   const redirectTo = getRedirectPath() || '/buy-franchise'; // Returns '/buy-franchise'
   navigate(redirectTo); // Goes back to /buy-franchise
   ```

6. User is back at /buy-franchise
   - ProtectedRoute checks for token again
   - Token exists → ProtectedRoute passes through
   - PackageSelection component renders
   - User can now view packages

7. User selects a package and clicks \"Continue to Payment\"
   - Frontend sends POST /api/franchise/register with token
   - Interceptor adds: Authorization: Bearer <clientToken>
   - Backend authMiddleware validates JWT
   - Token valid → Creates Razorpay order
   - Token invalid → Returns 401 → Interceptor clears tokens → Redirects to login

This entire flow is seamless and secure!
*/

// ============================================================================
// 10. TESTING THE FLOW
// ============================================================================

/*
Manual Testing Steps:

1. Open browser DevTools (F12) → Application → Storage → Local Storage
2. Delete the 'clientToken' key (simulate logged-out user)
3. Navigate to http://localhost:5174/buy-franchise
4. Expected: Redirect to /client-login
5. Check sessionStorage in DevTools → Look for 'redirectAfterLogin' key
6. Value should be: '/buy-franchise'
7. Log in with valid credentials
8. After login, should be redirected back to /buy-franchise
9. Check localStorage → clientToken should now exist
10. Navigate to other protected routes (/packages, /franchise-register/1)
11. All should be accessible now
12. Log out (clear tokens)
13. Try to access /buy-franchise again → Should redirect to login
14. Try to make payment request without token → Backend returns 401
15. Frontend interceptor redirects to login

Verification Checklist:
☐ Unauthenticated users cannot access /buy-franchise
☐ Unauthenticated users redirected to /client-login
☐ After login, users redirected back to /buy-franchise
☐ Token persists in localStorage
☐ logout clears token
☐ 401 responses trigger automatic logout
☐ Payment request includes Bearer token
☐ Backend receives token in Authorization header
☐ Pages refresh don't lose authentication state
*/
