# DGTLmart Franchise Package Model System

A comprehensive franchise management platform with dual user flows: Referral Partners and Franchise Buyers, integrated with Razorpay payment gateway.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- Razorpay account ([Sign up here](https://razorpay.com))

### 1. Backend Setup

```bash
cd backend
npm install

# Configure environment variables
# Edit .env file with your MongoDB URI and Razorpay keys

# Create default admin user
node scripts/createAdmin.js

# Start server
npm run dev
```

**Default Admin Credentials:**
- Username: `admin`
- Password: `Admin@123`

### 2. Frontend Setup

```bash
cd frontend
npm install

# Configure environment variables
# Edit .env file with your Razorpay key

# Start development server
npm run dev
```

## 📦 Features

### For Referral Partners
- Free registration
- Unique referral code generation (Format: DGTL-XXXXXX)
- Shareable referral links
- 10% commission on successful referrals
- Real-time tracking (via admin panel)

### For Franchise Buyers
- Browse 6 service categories:
  - Website Development (₹15K - ₹75K)
  - SEO Services (₹18K - ₹45K/month)
  - Social Media Management (₹18K - ₹85K/month)
  - Digital Marketing (₹30K - ₹180K/month)
  - Google Ads (₹20K - ₹75K/month)
  - Meta Ads (₹15K - ₹70K/month)
- Optional referral code entry
- Secure Razorpay payment integration
- Instant order confirmation

### Admin Panel
- Real-time dashboard with statistics
- Manage referral partners
- Manage franchise buyers
- Track payments and referrals
- Approve/reject applications
- Search and filter capabilities

## 🔒 Security

- JWT authentication for admin panel
- Bcrypt password hashing
- Razorpay signature verification
- Protected API routes
- CORS configuration

## 🌐 URLs

- **Homepage**: http://localhost:5173
- **Become Partner**: http://localhost:5173/referral-partner
- **Buy Franchise**: http://localhost:5173/buy-franchise
- **Admin Login**: http://localhost:5173/admin/login
- **API Base**: http://localhost:5000/api

## 📊 Database Collections

- `referralpartners` - All referral partner data
- `franchisebuyers` - All franchise buyer applications
- `admins` - Admin user accounts

## 🧪 Testing Guide

### Test Referral Flow
1. Navigate to homepage
2. Click "Become a Partner"
3. Fill registration form
4. Accept agreement
5. Submit → Get unique referral code
6. Copy code for next test

### Test Franchise Purchase
1. Go to "Buy Franchise"
2. Select any package
3. Fill registration form
4. Enter referral code (from previous test)
5. Click "Validate" to verify code
6. Proceed to payment
7. Use Razorpay test cards:
   - Card: `4111 1111 1111 1111`
   - CVV: Any 3 digits
   - Expiry: Any future date
8. Complete payment
9. Verify success page

### Test Admin Panel
1. Go to http://localhost:5173/admin/login
2. Login with default credentials
3. View dashboard statistics
4. Check referral partners list
5. Check franchise buyers list
6. Verify referral tracking works

## 📁 Project Structure

```
Franchise/
├── backend/
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API endpoints
│   ├── middleware/        # Auth middleware
│   ├── utils/             # Helper functions
│   ├── scripts/           # Admin setup scripts
│   └── server.js          # Express server
│
└── frontend/
    ├── src/
    │   ├── pages/         # All page components
    │   ├── components/    # Reusable components
    │   └── utils/         # API & Razorpay helpers
    ├── App.jsx            # Routes configuration
    └── App.css            # Global styles
```

## ⚙️ Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/franchise-db
JWT_SECRET=your_secret_key
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

## 🎨 Design

- **Framework**: React 19 + Tailwind CSS
- **Color Scheme**: Professional blues and grays
- **Typography**: Inter (body), Poppins (headings)
- **No gradients** - Clean, professional solid colors
- **Responsive** - Mobile-first design

## 📝 API Endpoints

### Referral
- `POST /api/referral/register` - Register partner
- `GET /api/referral/:code` - Validate code
- `GET /api/referral/stats/:code` - Get statistics

### Franchise
- `GET /api/franchise/packages` - Get all packages
- `POST /api/franchise/register` - Create order
- `POST /api/franchise/verify-payment` - Verify payment

### Admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/dashboard-stats` - Dashboard data
- `GET /api/admin/referrals` - List partners
- `GET /api/admin/franchise-buyers` - List buyers
- `PATCH /api/admin/buyer/:id/status` - Update status

## 🆘 Troubleshooting

**MongoDB Connection Error:**
- Ensure MongoDB is running
- Check connection string in `.env`

**Razorpay Not Loading:**
- Verify API keys in both `.env` files
- Use test mode keys for development

**CORS Error:**
- Ensure `FRONTEND_URL` in backend `.env` matches frontend URL

**Admin Can't Login:**
- Run `node scripts/createAdmin.js`
- Use credentials: admin / Admin@123

## 📞 Support

For issues or questions:
- Check the [walkthrough.md](./walkthrough.md) for detailed documentation
- Review [implementation_plan.md](./implementation_plan.md) for architecture details

## 🎯 Next Steps

1. **Get Razorpay Keys**: Sign up at razorpay.com and get test API keys
2. **Update .env Files**: Add your Razorpay and MongoDB credentials
3. **Test All Flows**: Use the testing guide above
4. **Customize Branding**: Update company name, logo, colors
5. **Deploy**: Deploy backend and frontend to your hosting service

---

**Built with ❤️ using MERN Stack + Tailwind CSS + Razorpay**
