const ExplorePackage = require('../models/ExplorePackage');

// ── GET ALL — grouped by category (matches old franchiseAPI format) ──────────
exports.getPackages = async (req, res) => {
  try {
    const { category, status } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;

    const packages = await ExplorePackage.find(filter).sort({ category: 1, createdAt: 1 });


    console.log("🔥 DB PACKAGES:", packages);

    // Group by category so frontend works the same as before
    const grouped = packages.reduce((acc, pkg) => {
      const cat = pkg.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(pkg);
      return acc;
    }, {});

    console.log("🔥 GROUPED:", grouped);

    res.json({ success: true, data: grouped });
  } catch (err) {
    console.error('getPackages error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// ── GET BY ID ────────────────────────────────────────────────────────────────
exports.getPackageById = async (req, res) => {
  try {
    const pkg = await ExplorePackage.findById(req.params.id);
    if (!pkg) return res.status(404).json({ success: false, error: 'Package not found' });
    res.json({ success: true, data: pkg });
  } catch (err) {
    console.error('getPackageById error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// ── CREATE ───────────────────────────────────────────────────────────────────
exports.createPackage = async (req, res) => {
  try {
    const { Name, description, price, category, buttonText, features, status } = req.body;

    if (!Name || !description || !price || !category) {
      return res.status(400).json({ success: false, error: 'Name, description, price and category are required' });
    }

    const pkg = await ExplorePackage.create({
      Name,
      description,
      price,
      category,
      buttonText: buttonText || 'Get Started',
      features: Array.isArray(features) ? features : [],
      status: status || 'Active',
      createdBy: req.admin?.id || req.user?.id,
    });

    res.status(201).json({ success: true, data: pkg, message: 'Package created successfully' });
  } catch (err) {
    console.error('createPackage error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// ── UPDATE ───────────────────────────────────────────────────────────────────
exports.updatePackage = async (req, res) => {
  try {
    const { Name, description, price, category, buttonText, features, status } = req.body;

    const pkg = await ExplorePackage.findByIdAndUpdate(
      req.params.id,
      {
        Name,
        description,
        price,
        category,
        buttonText,
        features: Array.isArray(features) ? features : [],
        status,
        updatedBy: req.admin?.id || req.user?.id,
      },
      { new: true, runValidators: true }
    );

    if (!pkg) return res.status(404).json({ success: false, error: 'Package not found' });

    res.json({ success: true, data: pkg, message: 'Package updated successfully' });
  } catch (err) {
    console.error('updatePackage error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// ── DELETE ───────────────────────────────────────────────────────────────────
exports.deletePackage = async (req, res) => {
  try {
    const pkg = await ExplorePackage.findByIdAndDelete(req.params.id);
    if (!pkg) return res.status(404).json({ success: false, error: 'Package not found' });
    res.json({ success: true, message: 'Package deleted successfully' });
  } catch (err) {
    console.error('deletePackage error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};