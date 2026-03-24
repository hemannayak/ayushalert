import mongoose from 'mongoose';

const ConsentSchema = new mongoose.Schema({
  request_id: {
    type: String,
    required: true,
    unique: true
  },
  patient_id: {
    type: String,
    required: true
  },
  hospital_id: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approved_records: {
    type: [String],
    default: []
  },
  otp: {
    type: String
  },
  otp_expires_at: {
    type: Date
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  access_expires_at: {
    type: Date
  }
});

export default mongoose.models.Consent || mongoose.model('Consent', ConsentSchema);
