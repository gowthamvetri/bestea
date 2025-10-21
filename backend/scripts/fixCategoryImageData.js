const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Category = require('../models/Category');

async function fixCategoryImages() {
  try {
    console.log('\n🔧 FIXING CATEGORY IMAGE DATA\n');
    console.log('=' .repeat(60));

    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Find all categories
    const categories = await Category.find({});
    console.log(`Found ${categories.length} categor${categories.length === 1 ? 'y' : 'ies'}\n`);

    for (const category of categories) {
      console.log(`Checking: ${category.name}`);
      console.log(`  Current image value:`, category.image);

      // Check if image is an empty object or has invalid data
      if (category.image) {
        if (!category.image.url || !category.image.public_id) {
          console.log(`  ⚠️  Image object exists but missing url or public_id`);
          console.log(`  🔧 Setting image to undefined...`);
          
          category.image = undefined;
          await category.save();
          
          console.log(`  ✅ Fixed! Image set to undefined\n`);
        } else {
          console.log(`  ✅ Image data is valid`);
          console.log(`     - URL: ${category.image.url}`);
          console.log(`     - Public ID: ${category.image.public_id}\n`);
        }
      } else {
        console.log(`  ℹ️  No image (this is OK)\n`);
      }
    }

    console.log('='.repeat(60));
    console.log('✅ Category image data check complete!\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed\n');
  }
}

fixCategoryImages();
