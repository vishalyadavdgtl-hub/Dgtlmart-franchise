/**
 * AUTHENTICATION-BASED PAYMENT FLOW IMPLEMENTATION GUIDE
 * 
 * A comprehensive guide to implementing secure authentication for payment flows
 * in a MERN stack application with JWT tokens and route protection.
 * 
 * ============================================================================
 * 1. ARCHITECTURE OVERVIEW
 * ============================================================================
 * 
 * Frontend Flow:
 * User clicks "View Packages"
 *   ↓
 * ProtectedRoute checks if user has valid token
 *   ↓
 * If NO token → Redirect to login page (save intended route in sessionStorage)
 *   ↓
 * User logs in
 *   ↓
 * ClientLogin retrieves saved route and redirects back to it
 *   ↓
 * User can now proceed with payment
 * 
 * Backend Flow:
 * Frontend sends payment request with JWT Bearer token
 *   ↓
 * authMiddleware validates JWT
 *   ↓
 * If valid → Process payment
 *   ↓
 * If invalid/expired → Return 401 Unauthorized
 *   ↓
 * Frontend interceptor clears tokens and redirects to login
 * 
 * ============================================================================
 * 2. IMPLEMENTATION COMPONENTS
 * ============================================================================
 * 
 * A. ProtectedRoute Component (frontend/src/components/common/ProtectedRoute.jsx)
 * ────────────────────────────────────────────────────────────────────────────
 * 
 *    Purpose: Wraps routes that require authentication
 *    
 *    Features:
 *    - Checks if user has required token(s)
 *    - Stores intended route in sessionStorage for post-login redirect
 *    - Supports multiple token types (clientToken, partnerToken, adminToken)
 *    - Custom redirect paths (default: /manage-dgtl for admin)
 *    
 *    Usage Example:
 *    ```jsx
 *    <ProtectedRoute 
 *      requiredTokens={['clientToken', 'partnerToken']}
 *      loginPath="/client-login"
 *    >
 *      <PaymentPage />
 *    </ProtectedRoute>
 *    ```
 * 
 * B. AuthContext (frontend/src/context/AuthContext.jsx)
 * ────────────────────────────────────────────────────────────────────────────
 * 
 *    Purpose: Global authentication state management
 *    
 *    Features:
 *    - Manages tokens across app
 *    - Login/logout actions
 *    - Redirect path handling
 *    - Token persistence from localStorage
 *    
 *    Usage Example:
 *    ```jsx
 *    import { useAuth } from './context/AuthContext';
 *    
 *    function MyComponent() {
 *      const { isAuthenticated, login, logout, getRedirectPath } = useAuth();
 *      // ...
 *    }
 *    ```
 * 
 * C. Auth Utilities (frontend/src/utils/authUtils.js)
 * ────────────────────────────────────────────────────────────────────────────
 * 
 *    Purpose: Helper functions for token and auth management
 *    
 *    Functions:
 *    - isAuthenticated(tokenTypes) - Check if user has required tokens
 *    - getActiveToken() - Get primary active token
 *    - getToken(tokenType) - Get specific token
 *    - isTokenValid(tokenType) - Validate token exists
 *    - clearAuthTokens() - Clear all tokens
 *    - decodeToken(token) - Decode JWT payload (basic)
 *    - isTokenExpired(token) - Check if JWT expired
 *    - getUserFromToken(tokenType) - Extract user info from token
 *    
 *    Usage Example:
 *    ```jsx
 *    import { isAuthenticated, getToken, isTokenExpired } from './utils/authUtils';
 *    
 *    if (isAuthenticated(['clientToken'])) {
 *      const token = getToken('clientToken');
 *      if (!isTokenExpired(token)) {
 *        // Proceed with payment
 *      }
 *    }
 *    ```
 * 
 * ============================================================================
 * 3. FRONTEND IMPLEMENTATION
 * ============================================================================
 * 
 * Step 1: Wrap App with AuthProvider
 * ──────────────────────────────────
 * File: frontend/src/main.jsx
 * 
 * ```jsx
 * import { AuthProvider } from './context/AuthContext';
 * 
 * createRoot(document.getElementById('root')).render(
 *   <StrictMode>
 *    <BrowserRouter>
 *      <AuthProvider>
 *        <App />
 *      </AuthProvider>
 *    </BrowserRouter>
 *   </StrictMode>
 * );
 * ```
 * 
 * Step 2: Protect Routes in App.jsx
 * ──────────────────────────────────
 * File: frontend/src/App.jsx
 * 
 * ```jsx
 * <Route
 *   path="/buy-franchise"
 *   element={
 *     <ProtectedRoute 
 *       requiredTokens={['clientToken', 'partnerToken']}
 *       loginPath="/client-login"
 *     >
 *       <PackageSelection />
 *     </ProtectedRoute>
 *   }
 * />
 * 
 * <Route
 *   path="/franchise-register/:packageId"
 *   element={
 *     <ProtectedRoute 
 *       requiredTokens={['clientToken', 'partnerToken']}
 *       loginPath="/client-login"
 *     >
 *       <FranchiseRegistration />
 *     </ProtectedRoute>
 *   }
 * />
 * ```
 * 
 * Step 3: Handle Post-Login Redirect in Login Component
 * ───────────────────────────────────────────────────────
 * File: frontend/src/pages/Franchise/ClientLogin.jsx
 * 
 * ```jsx
 * import { getRedirectPath } from '../../utils/authUtils';
 * 
 * const handleSubmit = async (e) => {
 *   e.preventDefault();
 *   
 *   try {
 *     const response = await franchiseAPI.clientLogin({ 
 *       email: formData.email, 
 *       password: formData.password 
 *     });
 *     
 *     // Save token
 *     localStorage.setItem('clientToken', response.data.token);
 *     
 *     // Get stored redirect path or default
 *     const redirectTo = getRedirectPath() || '/buy-franchise';
 *     navigate(redirectTo);
 *     
 *   } catch (error) {
 *     showToast(error.response?.data?.error || 'Login failed', 'error');
 *   }
 * };
 * ```
 * 
 * Step 4: Add 401 Error Handling in API Interceptor
 * ──────────────────────────────────────────────────
 * File: frontend/src/utils/api.js
 * 
 * ```jsx
 * api.interceptors.response.use(
 *   (response) => response,
 *   (error) => {
 *     if (error.response?.status === 401) {
 *       // Clear tokens
 *       localStorage.removeItem('clientToken');
 *       localStorage.removeItem('partnerToken');
 *       localStorage.removeItem('adminToken');
 *       
 *       // Redirect to login
 *       window.location.href = '/client-login';
 *     }
 *     return Promise.reject(error);
 *   }
 * );
 * ```
 * 
 * ============================================================================
 * 4. BACKEND IMPLEMENTATION
 * ============================================================================
 * 
 * Step 1: Create Auth Middleware (if not exists)
 * ───────────────────────────────────────────────
 * File: backend/middleware/authMiddleware.js
 * 
 * ```javascript
 * const jwt = require('jsonwebtoken');
 * 
 * module.exports = (req, res, next) => {
 *   try {
 *     const token = req.headers.authorization?.split(' ')[1];
 *     
 *     if (!token) {
 *       return res.status(401).json({ error: 'No token provided' });
 *     }
 *     
 *     const decoded = jwt.verify(token, process.env.JWT_SECRET);
 *     req.user = decoded;
 *     next();
 *     
 *   } catch (error) {
 *     return res.status(401).json({ error: 'Invalid or expired token' });
 *   }
 * };
 * ```
 * 
 * Step 2: Protect Payment Routes with Middleware
 * ────────────────────────────────────────────────
 * File: backend/routes/franchise.routes.js
 * 
 * ```javascript
 * const authMiddleware = require('../middleware/authMiddleware');
 * 
 * // Protect payment endpoints
 * router.post('/register', authMiddleware, franchiseController.registerAndBuy);
 * router.post('/buy-package', authMiddleware, franchiseController.buyPackage);
 * router.post('/verify-payment', authMiddleware, franchiseController.verifyPayment);
 * 
 * // Public endpoints (for registration)
 * router.post('/client/register', franchiseController.registerClient);
 * router.post('/client/login', franchiseController.loginClient);
 * ```
 * 
 * Step 3: Return JWT Token on Login
 * ──────────────────────────────────
 * File: backend/controllers/franchise.controller.js
 * 
 * ```javascript
 * exports.loginClient = async (req, res) => {
 *   try {
 *     const { email, password } = req.body;
 *     
 *     // Find user and validate password
 *     const user = await FranchiseBuyer.findOne({ email });
 *     if (!user || !await user.matchPassword(password)) {
 *       return res.status(401).json({ error: 'Invalid credentials' });
 *     }
 *     
 *     // Create JWT token
 *     const token = jwt.sign(
 *       { id: user._id, email: user.email },
 *       process.env.JWT_SECRET,
 *       { expiresIn: '7d' }
 *     );
 *     
 *     res.json({ 
 *       token,
 *       user: { id: user._id, email: user.email, name: user.fullName }
 *     });
 *     
 *   } catch (error) {
 *     res.status(500).json({ error: 'Login failed' });
 *   }
 * };
 * ```
 * 
 * ============================================================================
 * 5. COMPLETE FLOW EXAMPLE
 * ============================================================================
 * 
 * Scenario: User wants to purchase a franchise package
 * 
 * 1. User navigates to '/buy-franchise'
 * 2. ProtectedRoute checks: Does user have 'clientToken' or 'partnerToken'?
 * 3. NO → Redirect to '/client-login' and save '/buy-franchise' in sessionStorage
 * 4. User is now on login page
 * 5. User enters credentials and clicks "Login"
 * 6. ClientLogin.handleSubmit():
 *    - Calls franchiseAPI.clientLogin()
 *    - Backend validates credentials and returns JWT token
 *    - Frontend stores token in localStorage
 *    - Frontend retrieves saved route from sessionStorage (/buy-franchise)
 *    - Frontend redirects user back to '/buy-franchise'
 * 7. User is now on '/buy-franchise' page (ProtectedRoute passes through)
 * 8. User selects a package and proceeds to checkout
 * 9. Frontend sends payment request with 'Authorization: Bearer <clientToken>'
 * 10. Backend authMiddleware validates JWT token
 * 11. If valid → Process payment and create Razorpay order
 * 12. If invalid/expired → Return 401 status
 * 13. Frontend API interceptor catches 401, clears tokens, redirects to login
 * 
 * ============================================================================
 * 6. KEY FEATURES
 * ============================================================================
 * 
 * ✓ Seamless redirect after login
 * ✓ Multiple token type support (client, partner, admin)
 * ✓ Automatic token validation
 * ✓ Expired token detection
 * ✓ Global auth state with Context API
 * ✓ JWT-based authentication
 * ✓ Secure token storage in localStorage
 * ✓ Protected API endpoints
 * ✓ Automatic logout on 401 response
 * ✓ Route preservation with sessionStorage
 * 
 * ============================================================================
 * 7. ERROR HANDLING
 * ============================================================================
 * 
 * Common Scenarios:
 * 
 * A. Token Expired During Session
 * ────────────────────────────────
 * 1. User logged in and has token
 * 2. Token expires while using app
 * 3. User clicks \"Proceed to Payment\"
 * 4. Frontend sends request with expired token
 * 5. Backend returns 401 Unauthorized
 * 6. Frontend interceptor catches 401, clears tokens
 * 7. User redirected to '/client-login'
 * 8. User logs in again
 * 
 * B. Invalid Token in localStorage
 * ─────────────────────────────────
 * 1. Token corrupted or manually edited in localStorage
 * 2. User navigates to protected route
 * 3. ProtectedRoute checks if token exists (it does but invalid)
 * 4. User can access page but API calls will fail with 401
 * 5. Frontend interceptor handles cleanup
 * 
 * C. No Token at All
 * ──────────────────
 * 1. New user or localStorage cleared
 * 2. Navigates to '/packages' or '/buy-franchise'
 * 3. ProtectedRoute immediately redirects to '/client-login'
 * 4. sessionStorage stores intended route
 * 5. After login, user is redirected to original route
 * 
 * ============================================================================
 * 8. TESTING CHECKLIST
 * ============================================================================
 * 
 * [ ] Unauthenticated user cannot access /packages
 * [ ] Unauthenticated user cannot access /buy-franchise
 * [ ] Unauthenticated user cannot access /franchise-register
 * [ ] Redirected users land on login page
 * [ ] After login, user redirected back to intended page
 * [ ] Logged-in user can directly access protected pages
 * [ ] Token persists after page refresh
 * [ ] Expired token triggers logout and redirect
 * [ ] 401 response clears tokens and redirects
 * [ ] Payment endpoints return 401 without valid token
 * [ ] Payment endpoints process request with valid token
 * [ ] Admin users cannot access client payment pages
 * [ ] Partners can access client payment pages (if same token)
 * [ ] Session timeout redirects to login
 * 
 * ============================================================================
 * 9. SECURITY BEST PRACTICES
 * ============================================================================
 * 
 * ✓ Use HTTPS in production (tokens over secure connection)
 * ✓ Set httpOnly flag on cookies (if using cookies instead of localStorage)
 * ✓ Validate token expiry on backend
 * ✓ Use strong JWT secret (minimum 32 characters)
 * ✓ Implement token refresh mechanism for long-lived sessions
 * ✓ Clear tokens on logout immediately
 * ✓ Validate all payments server-side (don't trust frontend)
 * ✓ Use Bearer token scheme for Authorization header
 * ✓ Implement rate limiting on login endpoint
 * ✓ Log auth failures and suspicious activity
 * 
 * ============================================================================
 * 10. FUTURE ENHANCEMENTS
 * ============================================================================
 * 
 * - Implement token refresh mechanism (refresh tokens in httpOnly cookies)
 * - Add two-factor authentication (2FA)
 * - Implement session management with active login tracking
 * - Add auth state persistence with Redux or Zustand
 * - Create auth guards for specific user roles
 * - Implement \"Remember Me\" functionality
 * - Add social login (Google, Facebook, etc.)
 * - Create auth activity audit log
 * - Implement biometric authentication
 * - Add account recovery options\n */\n\n// This file serves as documentation. All implementation is in the respective files mentioned above.
