const mongoose = require('mongoose');
const Category = require('../models/Category');
require('dotenv').config();

async function checkCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const categories = await Category.find().sort({ name: 1 });
    console.log('\n=== DATABASE CATEGORIES ===');
    console.log(`Total categories: ${categories.length}\n`);
    
    categories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name}`);
      console.log(`   Slug: ${cat.slug}`);
      console.log(`   Active: ${cat.isActive}`);
      console.log(`   Color: ${cat.colorTheme || 'Default'}`);
      console.log(`   Has Image: ${cat.image?.url ? '✅ YES' : '❌ NO'}`);
      if (cat.image?.url) {
        console.log(`   Image URL: ${cat.image.url}`);
        console.log(`   Public ID: ${cat.image.public_id}`);
      }
      console.log('---');
    });

    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkCategories();