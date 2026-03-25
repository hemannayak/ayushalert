import mongoose from 'mongoose';
import crypto from 'crypto';

const HospitalSchema = new mongoose.Schema({
  hospital_id:     { type: String, required: true, unique: true },
  name:            { type: String, required: true },
  registration_id: { type: String, required: true, unique: true },
  license_number:  { type: String, default: '' },
  address:         { type: String, required: true },
  city:            { type: String, default: '' },
  phone:           { type: String, default: '' },
  logo_url:        { type: String, default: '' },   // base64 data URL or hosted URL
  admin_email:     { type: String, required: true, unique: true },
  password:        { type: String, required: true },

  // Verification
  status:          { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  verified_at:     { type: Date, default: null },
  verified_by:     { type: String, default: null }, // admin user or system

  // API Key (generated only after verification)
  api_key:         { type: String, default: null, unique: true, sparse: true },

  created_at:      { type: Date, default: Date.now },
});

// Generate a secure API key for the hospital
HospitalSchema.methods.generateApiKey = function () {
  this.api_key = 'HAK_' + crypto.randomBytes(24).toString('hex');
  return this.api_key;
};

export default mongoose.models.Hospital || mongoose.model('Hospital', HospitalSchema);
