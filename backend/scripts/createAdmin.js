const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🍃 Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@bestea.com' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('Email: admin@bestea.com');
      console.log('Password: admin123456');
      process.exit(0);
    }

    // Create admin user (password will be hashed by the pre-save hook)
    const adminUser = new User({
      name: 'Admin',
      email: 'admin@bestea.com',
      password: 'admin123456', // Plain password - will be hashed by pre-save hook
      phone: '9999999999',
      address: {
        street: 'Admin Office',
        city: 'Guwahati',
        state: 'Assam',
        zipCode: '781001',
        country: 'India'
      },
      role: 'admin'
    });

    await adminUser.save();

    console.log('🎉 Admin user created successfully!');
    console.log('Email: admin@bestea.com');
    console.log('Password: admin123456');
    console.log('Role: admin');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
};

// Run the script
createAdminUser();
