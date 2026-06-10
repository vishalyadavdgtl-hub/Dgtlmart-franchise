import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { franchiseAPI, referralAPI } from "../../utils/api";
import { displayRazorpay } from "../../utils/razorpay";
import { useToast } from "../../components/common/Toast";

export default function FranchiseRegistration() {
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const partnerType = location.state?.partnerType || "";
const franchiseType = location.state?.franchiseType || "";
  const isMountedRef = useRef(true);
  const { package: selectedPackage, referralCode: urlReferralCode } =
    location.state || {};
  const isPartnerFlow = location.state?.isPartnerFlow || false;
  const [loading, setLoading] = useState(false);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponValid, setCouponValid] = useState(null);
  const [referralPartner, setReferralPartner] = useState(null);

  // Cleanup on unmount to prevent state updates
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const type = location.state?.type || ""; // Default to 'dost' if not provided
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    businessName: "",
    address: "",
    password: "",
    confirmPassword: "",
    city: "",
    state: "",
    role: type, // 🔥 Use the type from state or default to dost
    couponCode: urlReferralCode || "",
    otp: "",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  console.log("Selected type:", type);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Restrict phone input to numbers only and max 10 digits
    if (name === "phone") {
      const numericValue = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Reset coupon validation if code changes
    if (name === "couponCode") {
      setCouponValid(null);
      setReferralPartner(null);
    }
  };

  const validateCoupon = async () => {
    if (!formData.couponCode.trim()) {
      showToast("Please enter a coupon code", "error");
      return;
    }

    setValidatingCoupon(true);
    try {
      const response = await referralAPI.validate(formData.couponCode);
      setCouponValid(true);
      setReferralPartner(response.data.partner);
      showToast("Coupon applied successfully!");
    } catch (error) {
      setCouponValid(false);
      setReferralPartner(null);
      showToast(error.response?.data?.error || "Invalid coupon code", "error");
    } finally {
      setValidatingCoupon(false);
    }
  };

 const handleSubmit = async (e) => {
  console.log("FINAL FORM DATA:", formData);
  e.preventDefault();

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    showToast("Please enter a valid email address", "error");
    return;
  }

  // Phone validation
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(formData.phone)) {
    showToast("Please enter a valid 10-digit phone number", "error");
    return;
  }

  if (formData.password !== formData.confirmPassword) {
    showToast("Passwords do not match", "error");
    return;
  }

  if (formData.password.length < 6) {
    showToast("Password must be at least 6 characters", "error");
    return;
  }

  if (!selectedPackage) {
    showToast("No package selected", "error");
    navigate("/buy-franchise");
    return;
  }

  if (!otpSent) {
    return handleSendOTP();
  }

  if (!formData.otp) {
    showToast("Please enter the OTP sent to your email", "error");
    return;
  }

  setLoading(true);

  try {
    const registrationData = {
      ...formData,
      selectedPackage: {
        name: selectedPackage.name || selectedPackage.packageName,
        category: selectedPackage.category,
        price: selectedPackage.price,
      },
    };

    // 🔥 ✅ CASE 1: Partner Flow (NO PAYMENT)
    if (isPartnerFlow) {
      const response = await franchiseAPI.register(registrationData);

      showToast("Registered Successfully 🎉", "success");

      const userData = {
        id: response.data.buyerId || response.data.id,
        fullName: formData.fullName,
        email: formData.email,
        businessName: formData.businessName,
        status: "pending",
        registeredAt: new Date().toISOString(),
      };

      localStorage.setItem("partnerUser", JSON.stringify(userData));
      localStorage.setItem("pendingPartner", JSON.stringify(userData));

      if (response.data.token) {
        localStorage.setItem("partnerToken", response.data.token);
      }

      navigate("/waiting-for-approval", {
        state: {
          buyer: {
            fullName: formData.fullName,
            email: formData.email,
            businessName: formData.businessName,
            package: selectedPackage,
          },
        },
      });

      return; // ❗ stop here
    }

    // 🔥 ✅ CASE 2: FREE PACKAGE (NO PAYMENT)
    if (selectedPackage.price === 0) {
      const response = await franchiseAPI.register(registrationData);

      showToast("Registered Successfully 🎉", "success");

      const userData = {
        id: response.data.buyerId || response.data.id,
        fullName: formData.fullName,
        email: formData.email,
        businessName: formData.businessName,
        status: "pending",
        registeredAt: new Date().toISOString(),
      };

      localStorage.setItem("partnerUser", JSON.stringify(userData));
      localStorage.setItem("pendingPartner", JSON.stringify(userData));

      if (response.data.token) {
        localStorage.setItem("partnerToken", response.data.token);
      }

      navigate("/waiting-for-approval", {
        state: {
          buyer: {
            fullName: formData.fullName,
            email: formData.email,
            businessName: formData.businessName,
            package: selectedPackage,
          },
        },
      });

      return; // ❗ stop here
    }

    // 🔥 ✅ CASE 3: PAID PACKAGE (WITH PAYMENT)
    if (!isPartnerFlow && selectedPackage.price > 0) {
      const response = await franchiseAPI.register(registrationData);

      await displayRazorpay(
        {
          id: response.data.order.id,
          amount: response.data.order.amount,
          currency: response.data.order.currency,
          prefill: {
            name: formData.fullName,
            email: formData.email,
            contact: formData.phone,
          },
        },
        async (paymentResponse) => {
          try {
            await franchiseAPI.verifyPayment({
              razorpayOrderId: paymentResponse.razorpay_order_id,
              razorpayPaymentId: paymentResponse.razorpay_payment_id,
              razorpaySignature: paymentResponse.razorpay_signature,
              buyerId: response.data.buyerId,
            });

            showToast("Payment successful! 🎉", "success");

            const userData = {
              id: response.data.buyerId,
              fullName: formData.fullName,
              email: formData.email,
              businessName: formData.businessName,
              status: "pending",
              registeredAt: new Date().toISOString(),
            };

            localStorage.setItem("partnerUser", JSON.stringify(userData));
            localStorage.setItem("pendingPartner", JSON.stringify(userData));

            if (response.data.token) {
              localStorage.setItem("partnerToken", response.data.token);
            }

            navigate("/waiting-for-approval", {
              state: {
                buyer: {
                  fullName: formData.fullName,
                  email: formData.email,
                  businessName: formData.businessName,
                  package: selectedPackage,
                  buyerId: response.data.buyerId,
                },
              },
            });
          } catch (error) {
            console.error("Payment verification error:", error);
            showToast("Payment verification failed.", "error");
            setLoading(false);
          }
        },
        (error) => {
          console.error("Payment error:", error);
          showToast("Payment failed.", "error");
          setLoading(false);
        }
      );
    }

  } catch (error) {
    console.error("Registration error:", error);
    showToast(error.response?.data?.error || "Registration failed.", "error");
    setLoading(false);
  }
};

const handleSendOTP = async () => {
  setSendingOtp(true);
  try {
    await franchiseAPI.sendOTP({ email: formData.email, phone: formData.phone });
    setOtpSent(true);
    showToast("OTP sent successfully to your email!", "success");
  } catch (error) {
    console.error("OTP send error:", error);
    showToast(error.response?.data?.error || "Failed to send OTP", "error");
  } finally {
    setSendingOtp(false);
  }
};

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get("ref");

    if (ref) {
      setFormData((prev) => ({
        ...prev,
        couponCode: ref,
      }));
    }
  }, [location.search]);

  if (!selectedPackage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="card p-8 text-center">
            <p className="text-gray-600 mb-4">
              No package selected. Please choose a package first.
            </p>
            <Button onClick={() => navigate("/buy-franchise")}>
              Select Package
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Selected Package Display */}
        {/* <div className="bg-white rounded-xl shadow-lg border-l-4 border-blue-600 p-6 mb-8 transform transition-all hover:scale-[1.01] duration-300 animate-[fadeIn_0.5s_ease-out]">
          <h2 className="text-xl font-semibold text-slate-800 mb-2 font-heading">
            Selected Package
          </h2>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-2xl font-bold text-slate-900">{selectedPackage.packageName}</p>
              <p className="text-sm text-slate-500 font-medium tracking-wide uppercase">
                {selectedPackage.category.replace(/([A-Z])/g, ' $1').trim()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-extrabold text-blue-600">
                ₹{selectedPackage.price.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-slate-400">One-time investment</p>
            </div>
          </div>
        </div> */}

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-[fadeIn_0.6s_ease-out_0.1s]">
          <div className="bg-slate-900 px-8 py-6 text-white">
            <h1 className="text-2xl md:text-3xl font-bold text-center">
              Complete Your Registration
            </h1>
            <p className="text-center text-slate-400 mt-2 text-sm">
              Securely register your franchise business
            </p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 hover:border-blue-300"
                />

                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 hover:border-blue-300"
                />

                <Input
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 hover:border-blue-300"
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 hover:border-blue-300"
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 hover:border-blue-300"
                />

                <Input
                  label="Business Name"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="My Digital Business"
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 hover:border-blue-300"
                />

                {/* <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Partnership Tier <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    required
                  >
                    <option value="dost">Dost Partner (25% Commission)</option>
                    <option value="sathi">Sathi Partner (30% Commission)</option>
                  </select>
                  <p className="text-[10px] text-slate-500 font-medium">Select your preferred franchise model</p>
                </div> */}
              </div>

              <Input
                label="Full Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Street address, Office No."
                required
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 hover:border-blue-300"
              />

                <Input
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  required
                />

                <Input
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  required
                />

              {/* Coupon Code Section */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                  <span className="bg-blue-100 text-blue-600 rounded-lg p-1 mr-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                      />
                    </svg>
                  </span>
                  Referral / Coupon Code{" "}
                  <span className="text-sm font-normal text-slate-500 ml-2">
                    (Optional)
                  </span>
                </h3>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Input
                      name="couponCode"
                      value={formData.couponCode}
                      onChange={handleChange}
                      placeholder="Enter code (e.g. DGTL-1234)"
                      className="bg-white"
                    />
                  </div>
                  <div className="sm:mt-1">
                    <Button
                      type="button"
                      onClick={validateCoupon}
                      disabled={validatingCoupon || !formData.couponCode.trim()}
                      variant="secondary"
                      className="h-[46px] w-full sm:w-auto whitespace-nowrap"
                    >
                      {validatingCoupon ? "Checking..." : "Apply Code"}
                    </Button>
                  </div>
                </div>

                {couponValid === true && referralPartner && (
                  <div className="mt-3 flex items-center text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200 animate-[fadeIn_0.3s_ease-out]">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Referred by:{" "}
                    <strong className="ml-1">{referralPartner.fullName}</strong>
                  </div>
                )}

                {couponValid === false && (
                  <div className="mt-3 flex items-center text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-200 animate-[fadeIn_0.3s_ease-out]">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Invalid or inactive referral code
                  </div>
                )}
              </div>

              {/* Submit Button */}

              {otpSent && (
                <div className="pt-4 border-t border-gray-100 mt-4">
                  <Input
                    label="Enter OTP"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    placeholder="6-digit code"
                    required
                    className="text-center tracking-widest font-bold text-lg"
                    type="text"
                    maxLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">OTP sent to {formData.email}</p>
                </div>
              )}

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={loading || sendingOtp}
                  fullWidth
                  className="py-4 text-lg font-bold shadow-lg hover:shadow-xl transform transition-transform active:scale-[0.98] hover:bg-blue-700"
                >
                  {loading || sendingOtp ? (
                    <span className="flex items-center justify-center">
                      <LoadingSpinner size="sm" color="border-white" />
                      <span className="ml-2">{sendingOtp ? "Sending OTP..." : "Processing..."}</span>
                    </span>
                  ) : otpSent ? (
                    isPartnerFlow ? "Verify & Register" : `Verify & Pay ₹${selectedPackage.price}`
                  ) : (
                    "Send OTP"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
