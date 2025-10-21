const mongoose = require('mongoose');
const Category = require('../models/Category');
require('dotenv').config();

async function fixCategoryImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find the problematic Demo category
    const demoCategory = await Category.findOne({ name: 'Demo' });
    
    if (demoCategory) {
      console.log('🔍 Found problematic Demo category:', {
        name: demoCategory.name,
        slug: demoCategory.slug,
        hasImage: !!demoCategory.image?.url
      });
      
      // Delete the malformed Demo category
      await Category.findByIdAndDelete(demoCategory._id);
      console.log('🗑️ Deleted problematic Demo category');
    }
    
    // Check all categories and their images
    const categories = await Category.find().sort({ name: 1 });
    console.log('\n📋 Current Categories Status:');
    
    let needsUpdate = false;
    
    for (const category of categories) {
      const hasImage = !!category.image?.url;
      console.log(`\n${category.name}:`);
      console.log(`  Slug: ${category.slug}`);
      console.log(`  Image: ${hasImage ? '✅ YES' : '❌ NO'}`);
      
      if (hasImage) {
        console.log(`  Image URL: ${category.image.url}`);
        console.log(`  Public ID: ${category.image.public_id}`);
        
        // Test if image URL is accessible
        try {
          const response = await fetch(category.image.url, { method: 'HEAD' });
          if (response.ok) {
            console.log(`  Status: ✅ Image accessible`);
          } else {
            console.log(`  Status: ⚠️ Image may not be accessible (${response.status})`);
          }
        } catch (error) {
          console.log(`  Status: ❌ Image not accessible`);
        }
      }
      
      // Fix any categories without proper slugs
      if (!category.slug || category.slug.includes('http')) {
        console.log(`  🔧 Fixing slug for ${category.name}`);
        category.slug = category.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
        await category.save();
        needsUpdate = true;
      }
    }
    
    if (needsUpdate) {
      console.log('\n✅ Updated categories with fixed slugs');
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`Total categories: ${categories.length}`);
    console.log(`Categories with images: ${categories.filter(c => c.image?.url).length}`);
    console.log(`Categories without images: ${categories.filter(c => !c.image?.url).length}`);

    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixCategoryImages();