import mongoose from 'mongoose';

const HospitalSchema = new mongoose.Schema({
  hospital_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  registration_id: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  admin_email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.models.Hospital || mongoose.model('Hospital', HospitalSchema);
