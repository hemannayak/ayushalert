import mongoose from 'mongoose';

const AppointmentSchema = new mongoose.Schema({
  hospital_id: { type: String, required: true, index: true },
  doctor_id: { type: String, required: true, index: true },
  patient_id: { type: String, required: true },
  patient_name: { type: String, required: true },
  appointment_time: { type: String, required: true }, // Format: "HH:mm"
  reason: { type: String, default: 'General Consultation' },
  status: { type: String, enum: ['scheduled', 'waiting', 'in-consult', 'completed', 'emergency'], default: 'scheduled' },
  priority: { type: Number, default: 0 }, // 1 = High, 2 = Critical
  created_at: { type: Date, default: Date.now }
});

export default mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);
