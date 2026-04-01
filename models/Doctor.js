import mongoose from 'mongoose';

const DoctorSchema = new mongoose.Schema({
  doctor_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  license_number: { type: String, required: true, unique: true },
  specialization: { type: String, required: true },
  hospital_id: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  face_embedding: { type: [Number], required: true },
  login_otp: { type: String },
  login_otp_expiry: { type: Date },
  verified: { type: Boolean, default: true },
  status: { type: String, enum: ['online', 'offline', 'consulting'], default: 'offline' },
  last_active: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.models.Doctor || mongoose.model('Doctor', DoctorSchema);
