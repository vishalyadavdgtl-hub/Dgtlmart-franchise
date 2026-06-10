const TrainingModule = require('../models/TrainingModule');

// Create a new training module
exports.createTrainingModule = async (req, res) => {
  try {
    const { title, description, content, videoUrl, duration, category, difficulty, order } = req.body;

    if (!title || !description || !content || !category) {
      return res.status(400).json({ error: 'Title, description, content, and category are required' });
    }

    const newModule = new TrainingModule({
      title,
      description,
      content,
      videoUrl: videoUrl || null,
      duration: duration || 0,
      category,
      difficulty: difficulty || 'Beginner',
      order: order || 0,
      createdBy: req.user.id
    });

    const savedModule = await newModule.save();

    res.status(201).json({
      message: 'Training module created successfully',
      module: savedModule
    });
  } catch (error) {
    console.error('Error creating training module:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Get all training modules
exports.getTrainingModules = async (req, res) => {
  try {
    const { category, difficulty, isActive = true } = req.query;

    const query = {};
    if (isActive === 'true') {
      query.isActive = true;
    } else if (isActive === 'false') {
      query.isActive = false;
    }
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;

    const modules = await TrainingModule.find(query)
      .populate('createdBy', 'username email')
      .sort({ order: 1, createdAt: -1 });

    res.json({
      modules,
      total: modules.length
    });
  } catch (error) {
    console.error('Error fetching training modules:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Get training module by ID
exports.getTrainingModuleById = async (req, res) => {
  try {
    const { id } = req.params;

    const module = await TrainingModule.findById(id)
      .populate('createdBy', 'username email');

    if (!module) {
      return res.status(404).json({ error: 'Training module not found' });
    }

    res.json(module);
  } catch (error) {
    console.error('Error fetching training module:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Update training module
exports.updateTrainingModule = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, content, videoUrl, duration, category, difficulty, order, isActive } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (content) updateData.content = content;
    if (videoUrl) updateData.videoUrl = videoUrl;
    if (duration !== undefined) updateData.duration = duration;
    if (category) updateData.category = category;
    if (difficulty) updateData.difficulty = difficulty;
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedModule = await TrainingModule.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('createdBy', 'username email');

    if (!updatedModule) {
      return res.status(404).json({ error: 'Training module not found' });
    }

    res.json({
      message: 'Training module updated successfully',
      module: updatedModule
    });
  } catch (error) {
    console.error('Error updating training module:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Delete training module
exports.deleteTrainingModule = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedModule = await TrainingModule.findByIdAndDelete(id);

    if (!deletedModule) {
      return res.status(404).json({ error: 'Training module not found' });
    }

    res.json({
      message: 'Training module deleted successfully',
      module: deletedModule
    });
  } catch (error) {
    console.error('Error deleting training module:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};
