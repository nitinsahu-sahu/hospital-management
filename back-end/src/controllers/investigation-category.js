const InvestigationCategory = require('../models/InvestigationCategory');
const mongoose = require('mongoose');

// Create new investigation category
exports.createInvestigation = async (req, res) => {
  try {
    const { name, code, category, price, isActive, description } = req.body;

    // Check if investigation with same name or code exists
    const existingInvestigation = await InvestigationCategory.findOne({
      $or: [
        { name: name.trim() },
        { code: code.trim() }
      ]
    });

    if (existingInvestigation) {
      return res.status(400).json({
        success: false,
        message: 'Investigation with same name or code already exists',
        data: existingInvestigation
      });
    }

    // Prepare investigation object
    const investigationData = {
      name: name.trim(),
      code: code.trim(),
      category: category.trim(),
      price,
      isActive: isActive !== undefined ? isActive : true
    };

    // Add description only if provided (for procedure category)
    if (description && description.trim()) {
      investigationData.description = description.trim();
    }

    const investigation = new InvestigationCategory(investigationData);
    await investigation.save();

    res.status(201).json({
      success: true,
      message: 'Investigation created successfully',
      data: investigation
    });
  } catch (error) {
    console.error('Error creating investigation:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate key error. Name or code already exists',
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating investigation',
      error: error.message
    });
  }
};

// Update investigation
exports.updateInvestigation = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid investigation ID'
      });
    }

    // Convert code to uppercase if provided
    if (updateData.code) {
      updateData.code = updateData.code.trim().toUpperCase();
    }
    
    // Trim name if provided
    if (updateData.name) {
      updateData.name = updateData.name.trim();
    }
    
    // Trim category if provided
    if (updateData.category) {
      updateData.category = updateData.category.trim();
    }

    // Handle description - if empty string is sent, remove it (for non-procedure categories)
    if (updateData.hasOwnProperty('description')) {
      if (updateData.description === null || updateData.description === undefined || updateData.description.trim() === '') {
        // If category is procedure, don't allow empty description
        const currentInvestigation = await InvestigationCategory.findById(id);
        if (currentInvestigation && currentInvestigation.category === 'procedure') {
          return res.status(400).json({
            success: false,
            message: 'Description is required for procedure tests'
          });
        }
        // For non-procedure, remove description field
        delete updateData.description;
      } else {
        updateData.description = updateData.description.trim();
      }
    }

    // Check if name or code already exists (excluding current document)
    if (updateData.name || updateData.code) {
      const existingInvestigation = await InvestigationCategory.findOne({
        $and: [
          { _id: { $ne: id } },
          {
            $or: [
              ...(updateData.name ? [{ name: updateData.name }] : []),
              ...(updateData.code ? [{ code: updateData.code }] : [])
            ]
          }
        ]
      });

      if (existingInvestigation) {
        return res.status(400).json({
          success: false,
          message: 'Investigation with same name or code already exists'
        });
      }
    }

    // If category is being updated to 'procedure', ensure description is provided
    if (updateData.category === 'procedure' && !updateData.description) {
      return res.status(400).json({
        success: false,
        message: 'Description is required for procedure tests'
      });
    }

    const investigation = await InvestigationCategory.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    );

    if (!investigation) {
      return res.status(404).json({
        success: false,
        message: 'Investigation not found'
      });
    }

    res.json({
      success: true,
      message: 'Investigation updated successfully',
      investigation
    });
  } catch (error) {
    console.error('Error updating investigation:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate key error. Name or code already exists',
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating investigation',
      error: error.message
    });
  }
};

// Get all investigations with filters (without pagination)
exports.getInvestigations = async (req, res) => {
  try {
    const { 
      category, 
      search,
      isActive
    } = req.query;

    // Build filter object
    const filter = {};
    
    // Only add category filter if it's provided and not 'all'
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    // Only add isActive filter if explicitly provided in query
    if (isActive !== undefined && isActive !== '') {
      filter.isActive = isActive === 'true';
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    // Get all investigations matching filter
    const investigations = await InvestigationCategory.find(filter)
      .sort({ createdAt: -1 }); // Sort by newest first

    // Get total count
    const totalCount = await InvestigationCategory.countDocuments(filter);

    res.json({
      success: true,
      count: totalCount,
      data: investigations
    });
  } catch (error) {
    console.error('Error fetching investigations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching investigations',
      error: error.message
    });
  }
};

// Get investigation by ID
exports.getInvestigationById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid investigation ID'
      });
    }

    const investigation = await InvestigationCategory.findById(id);

    if (!investigation) {
      return res.status(404).json({
        success: false,
        message: 'Investigation not found'
      });
    }

    res.json({
      success: true,
      data: investigation
    });
  } catch (error) {
    console.error('Error fetching investigation:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching investigation',
      error: error.message
    });
  }
};



// Delete investigation (soft delete)
exports.deleteInvestigation = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid investigation ID'
      });
    }

    // Soft delete - set isActive to false
    const investigation = await InvestigationCategory.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!investigation) {
      return res.status(404).json({
        success: false,
        message: 'Investigation not found'
      });
    }

    res.json({
      success: true,
      message: 'Investigation deleted successfully',
      data: investigation
    });
  } catch (error) {
    console.error('Error deleting investigation:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting investigation',
      error: error.message
    });
  }
};

// Hard delete investigation
exports.hardDeleteInvestigation = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid investigation ID'
      });
    }

    const investigation = await InvestigationCategory.findByIdAndDelete(id);

    if (!investigation) {
      return res.status(404).json({
        success: false,
        message: 'Investigation not found'
      });
    }

    res.json({
      success: true,
      message: 'Investigation permanently deleted',
      data: investigation
    });
  } catch (error) {
    console.error('Error hard deleting investigation:', error);
    res.status(500).json({
      success: false,
      message: 'Error hard deleting investigation',
      error: error.message
    });
  }
};

// Get investigations by category
exports.getInvestigationsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const investigations = await InvestigationCategory.find({
      category: category,
      isActive: true
    }).sort({ name: 1 });

    if (!investigations.length) {
      return res.status(404).json({
        success: false,
        message: 'No investigations found for this category'
      });
    }

    res.json({
      success: true,
      count: investigations.length,
      data: investigations
    });
  } catch (error) {
    console.error('Error fetching investigations by category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching investigations by category',
      error: error.message
    });
  }
};

// Get all unique categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await InvestigationCategory.distinct('category');

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};