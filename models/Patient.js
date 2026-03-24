import mongoose from 'mongoose';

const PatientSchema = new mongoose.Schema({
  patient_id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  mobile: {
    type: String,
    required: true
  },
  gender: {
    type: String
  },
  dob: {
    type: Date
  },
  abha_id: {
    type: String
  },
  pincode: {
    type: String
  },
  password_hash: {
    type: String,
    required: true
  },
  face_embedding: {
    type: [Number]
  },
  login_otp: {
    type: String
  },
  login_otp_expiry: {
    type: Date
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Patient || mongoose.model('Patient', PatientSchema);
