# 🚀 Quick Start Guide - Razorpay Test Mode

## Step 1: Get Razorpay Test Keys (2 minutes)

1. Visit: https://dashboard.razorpay.com/signup
2. Sign up with your email
3. Click on **"Test Mode"** toggle (top-right corner)
4. Go to **Settings** → **API Keys**
5. Click **"Generate Test Keys"**
6. Copy both:
   - **Key ID** (starts with `rzp_test_`)
   - **Key Secret**

## Step 2: Setup Backend (.env file)

1. Open `backend/.env` file (create if doesn't exist)
2. Add these lines:

```env
# Add your Razorpay test keys here
RAZORPAY_KEY_ID=rzp_test_paste_your_key_id_here
RAZORPAY_KEY_SECRET=paste_your_key_secret_here

# Other required variables
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/bestea
JWT_SECRET=your_jwt_secret_key_change_in_production
```

## Step 3: Start the Application

### Terminal 1 - Backend:
```bash
cd backend
npm install
npm run dev
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm install
npm run dev
```

## Step 4: Test Payment

1. Open browser: http://localhost:5173
2. Add products to cart
3. Go to checkout
4. Fill shipping details
5. Select **"Online Payment"**
6. Click **"Place Order"**

### In Razorpay Test Modal:

**Option 1 - Test Card (Success):**
```
Card Number: 4111 1111 1111 1111
CVV: 123
Expiry: 12/25
Name: Test User
```

**Option 2 - Test UPI:**
```
UPI ID: success@razorpay
Then click "Success" in test window
```

**Option 3 - Test Net Banking:**
```
Select any bank
Click "Success"
```

## ✅ Expected Result

- Payment modal closes
- Payment verification happens
- Order is created
- You're redirected to order success page
- Check backend console for verification logs

## 🧪 Test Card Details

| Purpose | Card Number | Result |
|---------|-------------|--------|
| Success | 4111 1111 1111 1111 | Payment succeeds |
| Failure | 4111 1111 1111 1112 | Payment fails |
| Mastercard | 5555 5555 5555 4444 | Payment succeeds |
| Amex | 3714 4963 5398 431 | Payment succeeds |

**For all cards:**
- CVV: Any 3 digits
- Expiry: Any future date
- Name: Any name

## 🔍 Verify Integration

### Check Backend Logs:
```
✓ Razorpay order created successfully
✓ Payment verified successfully
```

### Check Razorpay Dashboard:
1. Go to: https://dashboard.razorpay.com/
2. Click **"Payments"**
3. You'll see your test payment
4. Status should be **"Captured"**

## 🎯 What Happens Behind the Scenes

```
1. User clicks "Place Order"
   ↓
2. Frontend calls backend API to create Razorpay order
   ↓
3. Backend creates order and returns order_id + key
   ↓
4. Frontend opens Razorpay payment modal
   ↓
5. User completes payment
   ↓
6. Razorpay sends payment_id, order_id, signature
   ↓
7. Frontend sends to backend for verification
   ↓
8. Backend verifies signature using HMAC-SHA256
   ↓
9. If valid → Create order in database
   ↓
10. Redirect to success page
```

## 🐛 Common Issues

### Issue: "Invalid key" error
**Fix:** Make sure you copied the FULL key including `rzp_test_` prefix

### Issue: Payment modal doesn't open
**Fix:** Check browser console, ensure Razorpay SDK is loaded

### Issue: "Payment verification failed"
**Fix:** Verify `RAZORPAY_KEY_SECRET` is correct in `.env`

## 📞 Need Help?

- Razorpay Docs: https://razorpay.com/docs/
- Test Cards: https://razorpay.com/docs/payments/payments/test-card-details/

---

**That's it! You're ready to test Razorpay payments! 🎉**
