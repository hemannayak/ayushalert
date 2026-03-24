import mongoose from 'mongoose';

// PRIVACY: This schema intentionally contains NO patient identifiers.
// Only anonymized region + symptom data is stored for outbreak analytics.
const AnalyticsEventSchema = new mongoose.Schema({
  region_pincode: {
    type: String,
    required: true,
    index: true
  },
  diagnosis: {
    type: [String],
    required: true
  },
  severity: {
    type: String,
    enum: ['mild', 'moderate', 'severe', 'unknown'],
    default: 'unknown'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

export default mongoose.models.AnalyticsEvent || mongoose.model('AnalyticsEvent', AnalyticsEventSchema);
