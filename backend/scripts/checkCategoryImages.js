const Category = require('../models/Category');
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const cats = await Category.find();
  console.log('All categories in database:');
  cats.forEach(c => {
    console.log(`\nName: ${c.name}`);
    console.log(`  Has Image: ${c.image?.url ? 'YES' : 'NO'}`);
    if(c.image?.url) console.log(`  Image URL: ${c.image.url}`);
  });
  process.exit();
});
