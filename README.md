# BESTEA - Premium Assam Tea E-commerce Platform

A full-stack MERN (MongoDB, Express.js, React, Node.js) e-commerce platform for premium Assam tea blends. Features modern design, comprehensive product management, and seamless user experience.

## 🚀 Features

### Frontend
- **Modern React 18** with functional components and hooks
- **Redux Toolkit** for state management
- **Tailwind CSS** for responsive, beautiful UI
- **Framer Motion** for smooth animations
- **React Router** for seamless navigation
- **Helmet Async** for SEO optimization

### Backend
- **Express.js** RESTful API
- **MongoDB** with Mongoose ODM
- **JWT Authentication** with bcrypt encryption
- **Email Services** with Nodemailer
- **Payment Integration** (Razorpay & Stripe ready)
- **Comprehensive Security** middleware

### Key Functionality
- 🛍️ **Product Catalog** with advanced filtering and search
- 🛒 **Shopping Cart** with persistent state
- ❤️ **Wishlist** functionality
- 🔐 **User Authentication** (register, login, password reset)
- 📱 **Responsive Design** for all devices
- 💳 **Payment Gateway** integration ready
- 📧 **Email Notifications** system
- ⭐ **Product Reviews** and ratings
- 🎯 **SEO Optimized** pages

## 📁 Project Structure

```
Bestea/
├── backend/                 # Node.js/Express server
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   ├── middleware/         # Authentication & validation
│   ├── utils/              # Helper functions
│   ├── server.js           # Main server file
│   └── package.json
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Redux store & slices
│   │   ├── styles/         # CSS and Tailwind config
│   │   └── App.jsx         # Main app component
│   └── package.json
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Bestea
```

### 2. Backend Setup
```bash
cd backend
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration

# Start the server
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Start the development server
npm run dev
```

### 4. Environment Configuration

#### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/bestea
JWT_SECRET=your_secure_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
RAZORPAY_KEY_ID=your_razorpay_key
STRIPE_SECRET_KEY=your_stripe_secret
```

#### Frontend
The frontend will run on `http://localhost:5173` and connect to the backend API.

## 🎨 Design System

### Brand Colors
- **Primary Green**: `#9ACB3C` - Fresh, natural tea essence
- **Royal Blue**: `#083350` - Premium, sophisticated feel  
- **Special Green**: `#268C43` - Traditional tea heritage
- **Cardamom Yellow**: `#FDC112` - Warm, inviting spice

### Component Structure
- **Responsive Layout** with mobile-first approach
- **Modular Components** for reusability
- **Consistent Spacing** using Tailwind utilities
- **Accessible Design** with proper contrast ratios

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset
- `POST /api/auth/verify-email` - Email verification

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `GET /api/products/bestsellers` - Get bestselling products
- `GET /api/products/featured` - Get featured products
- `POST /api/products/:id/reviews` - Add product review

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:slug` - Get category by slug

## 🔧 Available Scripts

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or use your preferred MongoDB hosting
2. Configure environment variables for production
3. Deploy to platforms like Heroku, Railway, or DigitalOcean

### Frontend Deployment
1. Build the project: `npm run build`
2. Deploy to Vercel, Netlify, or any static hosting service
3. Update API endpoints in production

## 🛡️ Security Features

- **JWT Authentication** with secure token handling
- **Password Hashing** using bcrypt
- **Rate Limiting** to prevent abuse
- **CORS Configuration** for cross-origin requests
- **Input Validation** and sanitization
- **Helmet.js** for security headers

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📈 Performance Optimizations

- **Code Splitting** with React.lazy()
- **Image Optimization** with lazy loading
- **Bundle Analysis** and optimization
- **Caching Strategies** for API responses
- **Compressed Assets** for faster loading

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@bestea.com or join our Slack channel.

## 🙏 Acknowledgments

- **Assam Tea Gardens** for inspiration
- **Tamil Nadu Heritage** for traditional blending techniques
- **Modern Web Technologies** for powerful development tools
- **Open Source Community** for amazing libraries and frameworks

---

**BESTEA** - From Assam Gardens to Tamil Nadu Hearts ❤️🍃
# bestea
