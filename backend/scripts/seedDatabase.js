const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🍃 Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Order.deleteMany({});

    // Create Categories
    console.log('📂 Creating categories...');
    const categories = [
      {
        name: 'Strong Tea',
        slug: 'strong',
        description: 'Bold and robust teas for those who love intensity',
        image: {
          url: 'https://res.cloudinary.com/bestea/image/upload/v1/categories/strong-tea.jpg',
          alt: 'Strong Tea Collection'
        },
        isActive: true,
        sortOrder: 1
      },
      {
        name: 'Green Tea',
        slug: 'green',
        description: 'Fresh and healthy green tea varieties',
        image: {
          url: 'https://res.cloudinary.com/bestea/image/upload/v1/categories/green-tea.jpg',
          alt: 'Green Tea Collection'
        },
        isActive: true,
        sortOrder: 2
      },
      {
        name: 'Herbal Tea',
        slug: 'herbal',
        description: 'Caffeine-free herbal blends for wellness',
        image: {
          url: 'https://res.cloudinary.com/bestea/image/upload/v1/categories/herbal-tea.jpg',
          alt: 'Herbal Tea Collection'
        },
        isActive: true,
        sortOrder: 3
      },
      {
        name: 'Cardamom Tea',
        slug: 'cardamom',
        description: 'Aromatic cardamom-infused tea blends',
        image: {
          url: 'https://res.cloudinary.com/bestea/image/upload/v1/categories/cardamom-tea.jpg',
          alt: 'Cardamom Tea Collection'
        },
        isActive: true,
        sortOrder: 4
      },
      {
        name: 'Premium Assam',
        slug: 'premium-assam',
        description: 'Authentic Assam tea from the finest gardens',
        image: {
          url: 'https://res.cloudinary.com/bestea/image/upload/v1/categories/assam-tea.jpg',
          alt: 'Premium Assam Collection'
        },
        isActive: true,
        sortOrder: 5
      }
    ];

    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} categories`);

    // Create Admin User
    console.log('👤 Creating admin user...');
    const adminUser = new User({
      name: 'BESTEA Admin',
      email: 'admin@bestea.com',
      password: 'admin123456',
      phone: '9876543210',
      role: 'admin',
      emailVerified: true,
      isActive: true,
      avatar: {
        url: 'https://res.cloudinary.com/bestea/image/upload/v1/avatars/admin-avatar.jpg'
      }
    });

    await adminUser.save();
    console.log('✅ Admin user created');

    // Create Sample Users
    console.log('👥 Creating sample users...');
    const users = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        phone: '9876543210',
        role: 'user',
        emailVerified: true,
        addresses: [{
          type: 'home',
          name: 'John Doe',
          phone: '9876543210',
          addressLine1: '123 Tea Garden Street',
          city: 'Kolkata',
          state: 'West Bengal',
          pincode: '700001',
          isDefault: true
        }]
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        phone: '9876543211',
        role: 'user',
        emailVerified: true,
        addresses: [{
          type: 'home',
          name: 'Jane Smith',
          phone: '9876543211',
          addressLine1: '456 Business District',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          isDefault: true
        }]
      },
      {
        name: 'Mike Johnson',
        email: 'mike@example.com',
        password: 'password123',
        phone: '9876543212',
        role: 'user',
        emailVerified: true,
        addresses: [{
          type: 'home',
          name: 'Mike Johnson',
          phone: '9876543212',
          addressLine1: '789 Residential Area',
          city: 'Chennai',
          state: 'Tamil Nadu',
          pincode: '600001',
          isDefault: true
        }]
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} sample users`);

    // Create Products
    console.log('🫖 Creating products...');
    const products = [
      {
        name: 'Strong Assam Premium',
        slug: 'strong-assam-premium',
        description: 'Bold and malty Assam tea with robust flavor profile, perfect for morning brew.',
        shortDescription: 'Bold Assam tea for morning energy',
        category: createdCategories.find(c => c.slug === 'strong')._id,
        blendType: 'BOP',
        strength: 'Strong',
        price: 299,
        originalPrice: 349,
        images: [
          {
            publicId: 'strong-assam-premium-1',
            url: 'https://res.cloudinary.com/bestea/image/upload/v1/products/strong-assam-premium-1.jpg',
            alt: 'Strong Assam Premium Tea'
          },
          {
            publicId: 'strong-assam-premium-2',
            url: 'https://res.cloudinary.com/bestea/image/upload/v1/products/strong-assam-premium-2.jpg',
            alt: 'Strong Assam Premium Tea Leaves'
          }
        ],
        variants: [
          { name: '250g', price: 299, originalPrice: 349, stock: 100 },
          { name: '500g', price: 549, originalPrice: 649, stock: 50 },
          { name: '1kg', price: 999, originalPrice: 1199, stock: 25 }
        ],
        stock: 175,
        averageRating: 4.7,
        totalReviews: 128,
        isActive: true,
        isFeatured: true,
        isBestseller: true,
        tags: ['strong', 'assam', 'morning', 'premium'],
        nutritionFacts: {
          caffeine: 'High (40-60mg per cup)',
          calories: '0 per cup',
          antioxidants: 'Rich in theaflavins'
        },
        brewingInstructions: {
          temperature: '95-100°C',
          steepTime: '3-5 minutes',
          teaQuantity: '1 tsp per cup'
        },
        createdBy: adminUser._id
      },
      {
        name: 'Cardamom Special Blend',
        slug: 'cardamom-special-blend',
        description: 'Aromatic blend of premium tea with authentic cardamom pods, delivering a fragrant and flavorful experience.',
        shortDescription: 'Aromatic cardamom-infused tea blend',
        category: createdCategories.find(c => c.slug === 'cardamom')._id,
        blendType: 'Orthodox',
        strength: 'Medium',
        price: 349,
        originalPrice: 399,
        images: [
          {
            publicId: 'cardamom-special-1',
            url: 'https://res.cloudinary.com/bestea/image/upload/v1/products/cardamom-special-1.jpg',
            alt: 'Cardamom Special Blend Tea'
          },
          {
            publicId: 'cardamom-special-2',
            url: 'https://res.cloudinary.com/bestea/image/upload/v1/products/cardamom-special-2.jpg',
            alt: 'Cardamom Tea with Pods'
          }
        ],
        variants: [
          { name: '250g', price: 349, originalPrice: 399, stock: 80 },
          { name: '500g', price: 649, originalPrice: 749, stock: 40 }
        ],
        stock: 120,
        averageRating: 4.5,
        totalReviews: 89,
        isActive: true,
        isFeatured: true,
        tags: ['cardamom', 'aromatic', 'spiced', 'premium'],
        nutritionFacts: {
          caffeine: 'Medium (30-40mg per cup)',
          calories: '0 per cup',
          benefits: 'Digestive support, aromatic therapy'
        },
        brewingInstructions: {
          temperature: '95°C',
          steepTime: '4-6 minutes',
          teaQuantity: '1.5 tsp per cup'
        },
        createdBy: adminUser._id
      },
      {
        name: 'Green Tea Classic',
        slug: 'green-tea-classic',
        description: 'Pure and refreshing green tea with delicate flavor and natural antioxidants for daily wellness.',
        shortDescription: 'Pure green tea for daily wellness',
        category: createdCategories.find(c => c.slug === 'green')._id,
        blendType: 'Green',
        strength: 'Light',
        price: 249,
        originalPrice: 299,
        images: [
          {
            publicId: 'green-tea-premium-1',
            url: 'https://res.cloudinary.com/bestea/image/upload/v1/products/green-tea-classic-1.jpg',
            alt: 'Green Tea Classic'
          }
        ],
        variants: [
          { name: '250g', price: 249, originalPrice: 299, stock: 150 }
        ],
        stock: 150,
        averageRating: 4.3,
        totalReviews: 76,
        isActive: true,
        tags: ['green', 'antioxidants', 'healthy', 'wellness'],
        nutritionFacts: {
          caffeine: 'Low (20-30mg per cup)',
          calories: '0 per cup',
          antioxidants: 'High in catechins and EGCG'
        },
        brewingInstructions: {
          temperature: '75-80°C',
          steepTime: '2-3 minutes',
          teaQuantity: '1 tsp per cup'
        },
        createdBy: adminUser._id
      },
      {
        name: 'Herbal Wellness Blend',
        slug: 'herbal-wellness-blend',
        description: 'Caffeine-free herbal blend with chamomile, peppermint, and natural herbs for relaxation and wellness.',
        shortDescription: 'Caffeine-free herbal wellness blend',
        category: createdCategories.find(c => c.slug === 'herbal')._id,
        blendType: 'Orthodox',
        strength: 'Light',
        price: 199,
        originalPrice: 249,
        images: [
          {
            publicId: 'herbal-wellness-1',
            url: 'https://res.cloudinary.com/bestea/image/upload/v1/products/herbal-wellness-1.jpg',
            alt: 'Herbal Wellness Blend'
          }
        ],
        variants: [
          { name: '100g', price: 199, originalPrice: 249, stock: 200 }
        ],
        stock: 200,
        averageRating: 4.8,
        totalReviews: 145,
        isActive: true,
        tags: ['herbal', 'caffeine-free', 'wellness', 'relaxation'],
        nutritionFacts: {
          caffeine: 'Caffeine-free',
          calories: '0 per cup',
          benefits: 'Relaxation, digestive support, stress relief'
        },
        brewingInstructions: {
          temperature: '95°C',
          steepTime: '5-7 minutes',
          teaQuantity: '1.5 tsp per cup'
        },
        createdBy: adminUser._id
      },
      {
        name: 'Premium Assam Gold',
        slug: 'premium-assam-gold',
        description: 'Finest quality Assam tea with golden tips, offering rich malty flavor and exceptional aroma.',
        shortDescription: 'Finest Assam tea with golden tips',
        category: createdCategories.find(c => c.slug === 'premium-assam')._id,
        blendType: 'BOPSM',
        strength: 'Extra Strong',
        price: 499,
        originalPrice: 599,
        images: [
          {
            publicId: 'assam-gold-1',
            url: 'https://res.cloudinary.com/bestea/image/upload/v1/products/assam-gold-1.jpg',
            alt: 'Premium Assam Gold Tea'
          }
        ],
        variants: [
          { name: '250g', price: 499, originalPrice: 599, stock: 50 }
        ],
        stock: 50,
        averageRating: 4.9,
        totalReviews: 67,
        isActive: true,
        isFeatured: true,
        tags: ['premium', 'assam', 'gold-tips', 'luxury'],
        nutritionFacts: {
          caffeine: 'High (45-65mg per cup)',
          calories: '0 per cup',
          quality: 'Premium grade with golden tips'
        },
        brewingInstructions: {
          temperature: '95-100°C',
          steepTime: '4-5 minutes',
          teaQuantity: '1 tsp per cup'
        },
        createdBy: adminUser._id
      }
    ];

    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Created ${createdProducts.length} products`);

    // Create Sample Orders
    console.log('📦 Creating sample orders...');
    const orders = [
      {
        orderNumber: 'ORD-2024-001',
        user: createdUsers[0]._id,
        items: [
          {
            product: createdProducts[0]._id,
            variant: '250g',
            quantity: 2,
            price: createdProducts[0].price,
            total: createdProducts[0].price * 2
          }
        ],
        subtotal: createdProducts[0].price * 2,
        total: createdProducts[0].price * 2,
        payment: {
          method: 'razorpay',
          status: 'completed'
        },
        status: 'delivered',
        shippingAddress: {
          name: 'John Doe',
          phone: '9876543210',
          addressLine1: '123 Tea Garden Street',
          city: 'Kolkata',
          state: 'West Bengal',
          pincode: '700001'
        },
        orderDate: new Date('2024-01-15'),
        deliveryDate: new Date('2024-01-18')
      },
      {
        orderNumber: 'ORD-2024-002',
        user: createdUsers[1]._id,
        items: [
          {
            product: createdProducts[1]._id,
            variant: '250g',
            quantity: 1,
            price: createdProducts[1].price,
            total: createdProducts[1].price
          },
          {
            product: createdProducts[2]._id,
            variant: '250g',
            quantity: 1,
            price: createdProducts[2].price,
            total: createdProducts[2].price
          }
        ],
        subtotal: createdProducts[1].price + createdProducts[2].price,
        total: createdProducts[1].price + createdProducts[2].price,
        payment: {
          method: 'cod',
          status: 'pending'
        },
        status: 'processing',
        shippingAddress: {
          name: 'Jane Smith',
          phone: '9876543211',
          addressLine1: '456 Business District',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001'
        },
        orderDate: new Date('2024-01-20')
      }
    ];

    const createdOrders = await Order.insertMany(orders);
    console.log(`✅ Created ${createdOrders.length} sample orders`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Summary:');
    console.log(`Categories: ${createdCategories.length}`);
    console.log(`Products: ${createdProducts.length}`);
    console.log(`Users: ${createdUsers.length + 1} (including admin)`);
    console.log(`Orders: ${createdOrders.length}`);
    
    console.log('\n🔐 Admin Credentials:');
    console.log('Email: admin@bestea.com');
    console.log('Password: admin123456');

    console.log('\n👤 Sample User Credentials:');
    console.log('Email: john@example.com | Password: password123');
    console.log('Email: jane@example.com | Password: password123');
    console.log('Email: mike@example.com | Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

// Run the script
seedDatabase();
