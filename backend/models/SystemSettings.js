const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
  brandingKitUrl: {
    type: String,
    default: 'https://drive.google.com/drive/folders/dgtlmart-branding'
  },
  proposalsUrl: {
    type: String,
    default: 'https://drive.google.com/drive/folders/dgtlmart-proposals'
  },
  driveUrl: {
    type: String,
    default: 'https://drive.google.com/drive/folders/dgtlmart-drive'
  },
  crmUrl: {
    type: String,
    default: 'https://crm.zoho.com'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
