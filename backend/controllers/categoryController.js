const Category = require('../models/Category');
const cloudinary = require('../config/cloudinary');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 });

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get category by slug
// @route   GET /api/categories/:slug
// @access  Public
const getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ 
      slug: req.params.slug,
      isActive: true 
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create category (Admin only)
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Debug logging
    console.log('Create category request body:', req.body);
    console.log('Create category file:', req.file);

    const { name, description, slug, isActive = true, colorTheme } = req.body;

    // Convert string "true"/"false" to boolean for isActive
    const isActiveBoolean = isActive === 'true' || isActive === true;

    // Check if category already exists
    const existingCategory = await Category.findOne({
      $or: [{ name }, { slug }]
    });

    if (existingCategory) {
      return res.status(400).json({ 
        message: 'Category with this name or slug already exists' 
      });
    }

    const categoryData = {
      name,
      description,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      isActive: isActiveBoolean
    };

    // Add color theme if provided
    if (colorTheme) {
      categoryData.colorTheme = colorTheme;
    }

    // Handle image upload if present (already processed by multer)
    if (req.file) {
      console.log('File uploaded successfully:', {
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size
      });
      
      categoryData.image = {
        public_id: req.file.filename,
        url: req.file.path
      };
    } else {
      console.log('No file uploaded');
    }

    const category = new Category(categoryData);
    await category.save();

    console.log('Category created successfully:', category);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update category (Admin only)
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Debug logging
    console.log('Update category request body:', req.body);
    console.log('Update category file:', req.file);
    console.log('Category ID:', req.params.id);

    const { name, description, slug, isActive, colorTheme } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Update fields
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (slug) category.slug = slug;
    if (isActive !== undefined) {
      // Convert string "true"/"false" to boolean
      category.isActive = isActive === 'true' || isActive === true;
    }
    if (colorTheme) category.colorTheme = colorTheme;

    // Handle image update if present (already processed by multer)
    if (req.file) {
      console.log('New file uploaded for update:', {
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size
      });

      // Delete old image if exists
      if (category.image?.public_id) {
        try {
          await cloudinary.uploader.destroy(category.image.public_id);
        } catch (deleteError) {
          console.error('Error deleting old image:', deleteError);
          // Continue with update even if delete fails
        }
      }

      // Set new image data
      category.image = {
        public_id: req.file.filename,
        url: req.file.path
      };
    }

    await category.save();

    res.json({
      success: true,
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete category (Admin only)
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Delete associated image from cloudinary if exists
    if (category.image?.public_id) {
      try {
        await cloudinary.uploader.destroy(category.image.public_id);
      } catch (imageError) {
        console.error('Error deleting category image:', imageError);
        // Continue with category deletion even if image deletion fails
      }
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
};
