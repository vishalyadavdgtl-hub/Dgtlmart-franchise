const Package = require('../models/Package');

// Create a new package
exports.createPackage = async (req, res) => {
  try {
    const { name, category, description, price, features, validityDays } = req.body;

    if (!name || !category || !description || price === undefined) {
      return res.status(400).json({ error: 'Name, category, description, and price are required' });
    }

    const newPackage = new Package({
      name,
      category,
      description,
      price,
      features: features || [],
      validityDays: validityDays || 365,
      createdBy: req.user.id
    });

    const savedPackage = await newPackage.save();

    res.status(201).json({
      message: 'Package created successfully',
      package: savedPackage
    });
  } catch (error) {
    console.error('Error creating package:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Get all packages
exports.getPackages = async (req, res) => {
  try {
    // Query parameter can be 'true', 'false', or 'all'
    const { isActive } = req.query;
    
    const query = {};
    // If isActive is explicitly set to 'false', find inactive packages
    // If isActive is 'true' or not provided, find active packages
    // If isActive is 'all', get all packages (no filter)
    if (isActive !== 'all' && isActive !== undefined) {
      query.isActive = isActive === 'true';
    } else if (isActive === undefined) {
      // Default: show only active packages
      query.isActive = true;
    }

    const packages = await Package.find(query)
      .populate('createdBy', 'username email')
      .populate('updatedBy', 'username email')
      .sort({ createdAt: -1 });

   res.json({
  success: true,
  data: packages
});
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Get package by ID
exports.getPackageById = async (req, res) => {
  try {
    const { id } = req.params;

    const package_ = await Package.findById(id)
      .populate('createdBy', 'username email')
      .populate('updatedBy', 'username email');

    if (!package_) {
      return res.status(404).json({ error: 'Package not found' });
    }

    res.json(package_);
  } catch (error) {
    console.error('Error fetching package:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Update package
exports.updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description, price, features, validityDays, isActive } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (category) updateData.category = category;
    if (description) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (features) updateData.features = features;
    if (validityDays) updateData.validityDays = validityDays;
    if (isActive !== undefined) updateData.isActive = isActive;
    updateData.updatedBy = req.user.id;

    const updatedPackage = await Package.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('createdBy', 'username email')
     .populate('updatedBy', 'username email');

    if (!updatedPackage) {
      return res.status(404).json({ error: 'Package not found' });
    }

    res.json({
      message: 'Package updated successfully',
      package: updatedPackage
    });
  } catch (error) {
    console.error('Error updating package:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Delete package
exports.deletePackage = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPackage = await Package.findByIdAndDelete(id);

    if (!deletedPackage) {
      return res.status(404).json({ error: 'Package not found' });
    }

    res.json({
      message: 'Package deleted successfully',
      package: deletedPackage
    });
  } catch (error) {
    console.error('Error deleting package:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};
