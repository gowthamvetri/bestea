# Razorpay Payment Gateway Integration - Test Mode

This project has been integrated with Razorpay Payment Gateway in **TEST MODE** for secure online payments.

## 🔧 Setup Instructions

### 1. Get Razorpay Test API Keys

1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/signup)
2. Navigate to **Settings** → **API Keys**
3. Switch to **Test Mode** (toggle in top-right corner)
4. Generate **Test API Keys**
   - You'll get `Key ID` (starts with `rzp_test_`)
   - And `Key Secret`

### 2. Backend Configuration

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```

3. Add your Razorpay test keys to `.env`:
   ```env
   RAZORPAY_KEY_ID=rzp_test_your_key_id_here
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
   ```

4. Install dependencies (if not already done):
   ```bash
   npm install
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```

### 3. Frontend Configuration

1. The frontend is already configured to use the payment service
2. No additional configuration needed
3. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

## 📋 Features Implemented

### Backend (`/backend`)

- ✅ **Payment Controller** (`controllers/paymentController.js`)
  - Create Razorpay orders
  - Verify payment signatures
  - Fetch payment details
  - Process refunds

- ✅ **Payment Routes** (`routes/payment.js`)
  - `POST /api/payment/create-razorpay-order` - Create order
  - `POST /api/payment/verify-razorpay` - Verify payment
  - `GET /api/payment/methods` - Get payment methods
  - `GET /api/payment/razorpay/:paymentId` - Get payment details
  - `POST /api/payment/razorpay/refund` - Process refund (Admin)

### Frontend (`/frontend`)

- ✅ **Payment Service** (`services/paymentService.js`)
  - Load Razorpay SDK dynamically
  - Create and initiate payments
  - Handle payment callbacks
  - Verify payment on backend

- ✅ **Updated Checkout** (`pages/Checkout.jsx`)
  - Integrated Razorpay payment flow
  - Support for multiple payment methods
  - Payment success/failure handling
  - Order creation after successful payment

## 🧪 Testing the Integration

### Test Mode Features

In test mode, you can use Razorpay's test cards and payment methods:

#### Test Cards (No real money will be charged)

**Success Card:**
- Card Number: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date
- Name: Any name

**Failure Card:**
- Card Number: `4111 1111 1111 1112`
- CVV: Any 3 digits
- Expiry: Any future date

#### Test UPI
- Use any UPI ID like `success@razorpay`
- Choose Success/Failure in the test payment window

#### Test Net Banking
- Select any bank
- Choose Success/Failure

### Testing Flow

1. **Place an Order:**
   - Add products to cart
   - Go to checkout
   - Fill in shipping details
   - Select "Online Payment (Razorpay)"
   - Click "Place Order"

2. **Razorpay Checkout Opens:**
   - You'll see the Razorpay payment modal
   - Amount is displayed in the modal
   - Choose a payment method

3. **Make Test Payment:**
   - Use test card details above
   - Or use test UPI/NetBanking
   - Complete the payment

4. **Verification:**
   - Payment is automatically verified on backend
   - Order is created if payment succeeds
   - You're redirected to order success page

## 🔐 Security Features

- ✅ **Signature Verification:** All payments are verified using HMAC-SHA256
- ✅ **Server-side Validation:** Payment verification happens on backend
- ✅ **Secure Keys:** API keys stored in environment variables
- ✅ **Auto-capture:** Payments are automatically captured
- ✅ **HTTPS:** Use HTTPS in production

## 💳 Payment Methods Supported

1. **Razorpay (Online Payment)**
   - Credit/Debit Cards
   - Net Banking
   - UPI
   - Wallets (Paytm, PhonePe, etc.)
   - EMI
   - Pay Later

2. **Cash on Delivery (COD)**
   - ₹40 additional charges
   - Payment collected at delivery

## 📁 File Structure

```
backend/
├── controllers/
│   └── paymentController.js      # Razorpay integration logic
├── routes/
│   └── payment.js                # Payment API routes
└── .env.example                  # Environment variables template

frontend/
├── src/
│   ├── services/
│   │   └── paymentService.js    # Razorpay SDK integration
│   └── pages/
│       └── Checkout.jsx         # Updated checkout with Razorpay
```

## 🚀 Going Live (Production)

### When ready to go live:

1. **Switch to Live Mode** in Razorpay Dashboard
2. **Generate Live API Keys**
3. **Update `.env` with live keys:**
   ```env
   RAZORPAY_KEY_ID=rzp_live_your_live_key_id
   RAZORPAY_KEY_SECRET=your_live_key_secret
   ```
4. **Enable Webhooks** for payment notifications
5. **KYC Verification** required for settlements
6. **Update Environment:**
   ```env
   NODE_ENV=production
   ```

## 📊 Razorpay Dashboard

Access your dashboard at: https://dashboard.razorpay.com/

**Dashboard Features:**
- View all transactions
- Download reports
- Manage settlements
- Configure webhooks
- View analytics

## 🐛 Troubleshooting

### Issue: Payment modal doesn't open
- **Solution:** Check if Razorpay script is loaded
- Verify `RAZORPAY_KEY_ID` in backend `.env`
- Check browser console for errors

### Issue: Payment verification fails
- **Solution:** Verify `RAZORPAY_KEY_SECRET` is correct
- Check backend logs for signature verification errors
- Ensure all three parameters are sent: order_id, payment_id, signature

### Issue: "Invalid key" error
- **Solution:** Confirm you're using test keys in test mode
- Don't mix test/live keys
- Regenerate keys if needed

## 📞 Support

- **Razorpay Docs:** https://razorpay.com/docs/
- **Razorpay Support:** support@razorpay.com
- **Test Mode Guide:** https://razorpay.com/docs/payments/payments/test-card-details/

## ⚠️ Important Notes

1. **Test Mode:** Currently in TEST MODE - no real money is charged
2. **Test Credentials:** Never use real card details in test mode
3. **Production:** Complete KYC before going live
4. **Webhooks:** Set up webhooks for production to handle payment notifications
5. **Refunds:** Test refunds work in test mode without actual money transfer

## 🎯 Next Steps

- [ ] Add your Razorpay test keys to `.env`
- [ ] Test the complete payment flow
- [ ] Test with different payment methods
- [ ] Set up webhooks for payment status updates
- [ ] Complete KYC for live mode
- [ ] Add order confirmation emails
- [ ] Implement refund functionality in admin panel

---

**Happy Testing! 🎉**

For any issues or questions, please refer to the Razorpay documentation or create an issue in the repository.
