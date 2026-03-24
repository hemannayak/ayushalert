import mongoose from 'mongoose';

const RecordSchema = new mongoose.Schema({
  record_id: {
    type: String,
    required: true,
    unique: true
  },
  patient_id: {
    type: String,
    required: true
  },
  file_name: {
    type: String,
    required: true
  },
  file_url: {
    type: String,
    required: true
  },
  ocr_status: {
    type: String,
    default: 'pending'
  },
  fhir_status: {
    type: String,
    default: 'pending'
  },
  structured_data: {
    type: Object,
    default: null
  },
  confidence_score: {
    type: Number,
    default: 0
  },
  verified: {
    type: Boolean,
    default: false
  },
  document_type: {
    type: String,
    enum: ['Prescription', 'Lab Report', 'Scan', 'Diagnosis', 'Other'],
    default: 'Prescription'
  },
  source: {
    type: String,
    enum: ['phr', 'hospital'],
    default: 'phr'
  },
  data_origin: {
    type: String,
    enum: ['ocr', 'hospital'],
    default: 'ocr'
  },
  last_verified_at: {
    type: Date
  },
  uploaded_at: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Record || mongoose.model('Record', RecordSchema);
