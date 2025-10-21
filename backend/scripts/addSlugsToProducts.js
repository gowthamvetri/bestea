const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

// Function to generate slug from product name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')       // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '');  // Remove leading/trailing hyphens
};

// Function to ensure unique slug
const ensureUniqueSlug = async (baseSlug, excludeId = null) => {
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    const query = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    
    const existing = await Product.findOne(query);
    if (!existing) {
      return slug;
    }
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};

async function addSlugsToProducts() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bestea');
    console.log('Connected to MongoDB');

    // Find all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const product of products) {
      if (!product.slug || product.slug === '') {
        console.log(`\nProcessing: ${product.name}`);
        
        // Generate slug from name
        const baseSlug = generateSlug(product.name);
        console.log(`  Base slug: ${baseSlug}`);
        
        // Ensure it's unique
        const uniqueSlug = await ensureUniqueSlug(baseSlug, product._id);
        console.log(`  Unique slug: ${uniqueSlug}`);
        
        // Update the product
        product.slug = uniqueSlug;
        await product.save();
        
        console.log(`  ✅ Updated`);
        updatedCount++;
      } else {
        console.log(`Skipping "${product.name}" - already has slug: ${product.slug}`);
        skippedCount++;
      }
    }

    console.log('\n=================================');
    console.log('Migration Complete!');
    console.log(`Total products: ${products.length}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log('=================================\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the script
addSlugsToProducts();
