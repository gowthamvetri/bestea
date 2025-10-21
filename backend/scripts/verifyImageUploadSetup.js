const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Category = require('../models/Category');

async function verifyImageUploadSetup() {
  console.log('\n🔍 CATEGORY IMAGE UPLOAD - SYSTEM VERIFICATION\n');
  console.log('='.repeat(70));

  try {
    // 1. Check MongoDB connection
    console.log('\n📦 1. Checking MongoDB Connection...');
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      console.log('   ❌ MONGODB_URI not found in environment variables');
      return;
    }
    await mongoose.connect(mongoUri);
    console.log('   ✅ MongoDB connected successfully');

    // 2. Check Cloudinary configuration
    console.log('\n☁️  2. Checking Cloudinary Configuration...');
    const cloudinaryChecks = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY ? '***' + process.env.CLOUDINARY_API_KEY.slice(-4) : null,
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set (hidden)' : null
    };

    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      console.log('   ❌ CLOUDINARY_CLOUD_NAME not set');
    } else {
      console.log('   ✅ Cloud Name:', cloudinaryChecks.cloud_name);
    }

    if (!process.env.CLOUDINARY_API_KEY) {
      console.log('   ❌ CLOUDINARY_API_KEY not set');
    } else {
      console.log('   ✅ API Key:', cloudinaryChecks.api_key);
    }

    if (!process.env.CLOUDINARY_API_SECRET) {
      console.log('   ❌ CLOUDINARY_API_SECRET not set');
    } else {
      console.log('   ✅ API Secret:', cloudinaryChecks.api_secret);
    }

    const cloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                                  process.env.CLOUDINARY_API_KEY && 
                                  process.env.CLOUDINARY_API_SECRET;

    // 3. Check Category Model
    console.log('\n🗄️  3. Checking Category Model Schema...');
    const categorySchema = Category.schema.obj;
    if (categorySchema.image) {
      console.log('   ✅ Category model has "image" field');
      console.log('   ✅ Image schema:', JSON.stringify(categorySchema.image, null, 2));
    } else {
      console.log('   ❌ Category model missing "image" field');
    }

    // 4. Check existing categories
    console.log('\n📊 4. Checking Existing Categories...');
    const categories = await Category.find({});
    console.log(`   Found ${categories.length} categor${categories.length === 1 ? 'y' : 'ies'} in database\n`);

    if (categories.length === 0) {
      console.log('   ℹ️  No categories found. Create one to test image upload.');
    } else {
      categories.forEach((cat, index) => {
        console.log(`   ${index + 1}. ${cat.name}`);
        console.log(`      - Slug: ${cat.slug}`);
        console.log(`      - Active: ${cat.isActive ? 'Yes' : 'No'}`);
        console.log(`      - Has Image: ${cat.image ? 'YES ✅' : 'NO ❌'}`);
        if (cat.image) {
          console.log(`      - Image URL: ${cat.image.url}`);
          console.log(`      - Public ID: ${cat.image.public_id}`);
        }
        console.log('');
      });
    }

    // 5. Route configuration check (informational)
    console.log('\n🛣️  5. Upload Route Configuration (Manual Check Required)');
    console.log('   File: backend/routes/admin.js');
    console.log('   Required middleware: uploadCategory.single(\'image\')');
    console.log('   Routes that need it:');
    console.log('   - POST /api/admin/categories (create)');
    console.log('   - PUT /api/admin/categories/:id (update)');

    // 6. Controller check (informational)
    console.log('\n⚙️  6. Controller Implementation (Manual Check Required)');
    console.log('   File: backend/controllers/adminController.js');
    console.log('   Function: createAdminCategory');
    console.log('   Function: updateAdminCategory');
    console.log('   Must include:');
    console.log('   - if (req.file) { categoryData.image = { ... } }');

    // Final Summary
    console.log('\n' + '='.repeat(70));
    console.log('📋 VERIFICATION SUMMARY');
    console.log('='.repeat(70));

    const checks = [
      { name: 'MongoDB Connection', pass: true },
      { name: 'Cloudinary Configuration', pass: cloudinaryConfigured },
      { name: 'Category Model has image field', pass: !!categorySchema.image },
      { name: 'Upload middleware configured', pass: null, manual: true },
      { name: 'Controller saves image data', pass: null, manual: true }
    ];

    checks.forEach(check => {
      if (check.manual) {
        console.log(`   ⚠️  ${check.name} - MANUAL CHECK REQUIRED`);
      } else if (check.pass) {
        console.log(`   ✅ ${check.name}`);
      } else {
        console.log(`   ❌ ${check.name}`);
      }
    });

    console.log('\n💡 NEXT STEPS:');
    if (!cloudinaryConfigured) {
      console.log('   1. Configure Cloudinary credentials in .env file');
      console.log('      - CLOUDINARY_CLOUD_NAME=your_cloud_name');
      console.log('      - CLOUDINARY_API_KEY=your_api_key');
      console.log('      - CLOUDINARY_API_SECRET=your_api_secret');
    } else {
      console.log('   1. ✅ Configuration looks good!');
    }

    if (categories.length === 0 || !categories.some(c => c.image)) {
      console.log('   2. Test image upload by:');
      console.log('      a) Go to admin panel: http://localhost:5173/admin/categories');
      console.log('      b) Create new category or edit existing one');
      console.log('      c) Upload an image file');
      console.log('      d) Save the category');
      console.log('      e) Re-run this script to verify image was saved');
    } else {
      console.log('   2. ✅ Categories with images found!');
      console.log('      - Verify images display correctly on:');
      console.log('        * Home page: http://localhost:5173');
      console.log('        * Admin panel: http://localhost:5173/admin/categories');
    }

    console.log('\n📚 For detailed documentation, see:');
    console.log('   - CATEGORY_IMAGE_UPLOAD_VERIFICATION.md');
    console.log('');

  } catch (error) {
    console.error('\n❌ Error during verification:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed\n');
  }
}

verifyImageUploadSetup();
