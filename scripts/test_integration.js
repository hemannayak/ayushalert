/**
 * AyushAlert Integration Verification Script
 *
 * Sequentially tests:
 * 1. Hospital registration & admin verification (HAK_ key generation)
 * 2. Doctor registration
 * 3. Patient registration
 * 4. Patient login OTP generation & DB retrieval
 * 5. Patient login verification (JWT acquisition)
 * 6. Record upload (Local fallback verification)
 * 7. VLM/OCR process endpoint execution
 * 8. Consent request, OTP approval, and Doctor record retrieval
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;
const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('🧪 Starting end-to-end integration tests...');
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB.\n');

  // Define Inline Mongoose schemas to query directly
  const Hospital = mongoose.models.Hospital || mongoose.model('Hospital', new mongoose.Schema({}, { strict: false }));
  const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', new mongoose.Schema({}, { strict: false }));
  const Patient = mongoose.models.Patient || mongoose.model('Patient', new mongoose.Schema({}, { strict: false }));
  const Record = mongoose.models.Record || mongoose.model('Record', new mongoose.Schema({}, { strict: false }));
  const Consent = mongoose.models.Consent || mongoose.model('Consent', new mongoose.Schema({}, { strict: false }));

  // Clean up any old test data
  await Hospital.deleteMany({ admin_email: 'test_hospital@audit.com' });
  await Doctor.deleteMany({ email: 'test_doctor@audit.com' });
  await Patient.deleteMany({ email: 'test_patient@audit.com' });
  console.log('🧹 Cleaned up old test data.');

  let hospital_id = 'HOSP_TEST';
  let doctor_id = '';
  let patient_id = '';
  let record_id = '';
  let request_id = '';
  let patientToken = '';
  let doctorToken = '';

  // 1. HOSPITAL REGISTRATION
  console.log('\n--- 1. Hospital Registration ---');
  const hospRegRes = await fetch(`${BASE_URL}/api/hospital/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      hospital_id,
      name: 'Audit Test Hospital',
      registration_id: 'REG-AUDIT-999',
      license_number: 'LIC-AUDIT-999',
      address: 'Hyderabad',
      city: 'Hyderabad',
      phone: '040-99999999',
      admin_email: 'test_hospital@audit.com',
      password: 'HospitalPassword123'
    })
  });
  const hospRegData = await hospRegRes.json();
  if (hospRegRes.status !== 201) throw new Error(`Hospital registration failed: ${hospRegData.error}`);
  hospital_id = hospRegData.hospital_id;
  console.log('✅ Hospital registered. ID:', hospital_id);

  // 2. HOSPITAL VERIFICATION (Admin x-admin-key)
  console.log('\n--- 2. Hospital Verification (Admin Key) ---');
  const hospVerifyRes = await fetch(`${BASE_URL}/api/hospital/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': process.env.ADMIN_SECRET_KEY || 'admin_secret_ayushalert_2024'
    },
    body: JSON.stringify({
      hospital_id,
      action: 'verify'
    })
  });
  const hospVerifyData = await hospVerifyRes.json();
  if (hospVerifyRes.status !== 200) throw new Error(`Hospital verification failed: ${hospVerifyData.error}`);
  console.log('✅ Hospital verified. API Key generated:', hospVerifyData.api_key);

  // 3. DOCTOR REGISTRATION
  console.log('\n--- 3. Doctor Registration ---');
  const docRegRes = await fetch(`${BASE_URL}/api/doctor/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Dr. Test Audit',
      license_number: 'LIC-DOC-999',
      specialization: 'General Medicine',
      hospital_id,
      email: 'test_doctor@audit.com',
      face_embedding: Array.from({ length: 128 }, () => Math.random()) // mock embedding
    })
  });
  const docRegData = await docRegRes.json();
  if (docRegRes.status !== 201) throw new Error(`Doctor registration failed: ${docRegData.error}`);
  doctor_id = docRegData.doctor_id;
  doctorToken = docRegData.token;
  console.log('✅ Doctor registered. ID:', doctor_id);

  // 4. PATIENT REGISTRATION
  console.log('\n--- 4. Patient Registration ---');
  const patRegRes = await fetch(`${BASE_URL}/api/patient/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Audit Patient',
      email: 'test_patient@audit.com',
      mobile: '9876543210',
      gender: 'Male',
      dob: '1990-01-01',
      pincode: '500032',
      password: 'PatientPassword123',
      face_embedding: Array.from({ length: 128 }, () => Math.random())
    })
  });
  const patRegData = await patRegRes.json();
  if (patRegRes.status !== 201) throw new Error(`Patient registration failed: ${patRegData.error}`);
  patient_id = patRegData.patient_id;
  console.log('✅ Patient registered. ID:', patient_id, 'ABHA ID:', patRegData.abha_id);

  // 5. PATIENT LOGIN OTP GENERATION
  console.log('\n--- 5. Patient Login OTP Generation ---');
  const otpGenRes = await fetch(`${BASE_URL}/api/patient/login-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patient_id })
  });
  const otpGenData = await otpGenRes.json();
  if (otpGenRes.status !== 200) throw new Error(`Patient login OTP generation failed: ${otpGenData.error}`);
  console.log('✅ OTP generation initiated.');

  // Fetch OTP directly from MongoDB Atlas to continue programmatic test
  const patientRecord = await Patient.findOne({ patient_id });
  const otp = patientRecord.login_otp;
  console.log('🔍 Retrieved OTP from database:', otp);

  // 6. PATIENT LOGIN VERIFICATION (JWT)
  console.log('\n--- 6. Patient Login Verification ---');
  const loginRes = await fetch(`${BASE_URL}/api/patient/login-otp`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patient_id, otp })
  });
  const loginData = await loginRes.json();
  if (loginRes.status !== 200) throw new Error(`Patient login verification failed: ${loginData.error}`);
  patientToken = loginData.token;
  console.log('✅ Patient logged in. Session JWT acquired.');

  // 7. MEDICAL RECORD UPLOAD (Testing local storage fallback)
  console.log('\n--- 7. Medical Record Upload ---');
  const dummyFileContent = 'Prescription: Tab Paracetamol 650mg once daily for fever. Symptoms: Fever, headache.';
  const formData = new FormData();
  formData.append('file', new Blob([dummyFileContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }), 'prescription.docx');
  formData.append('document_type', 'Prescription');

  const uploadRes = await fetch(`${BASE_URL}/api/records/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${patientToken}`
    },
    body: formData
  });
  const uploadData = await uploadRes.json();
  if (uploadRes.status !== 201) throw new Error(`Record upload failed: ${uploadData.error}`);
  record_id = uploadData.record_id;
  console.log('✅ Record uploaded. Record ID:', record_id, 'File URL:', uploadData.file_url);

  // 8. OCR / VLM PROCESSING
  console.log('\n--- 8. OCR / VLM Processing ---');
  const processRes = await fetch(`${BASE_URL}/api/records/process`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${patientToken}`
    },
    body: JSON.stringify({ record_id, demo_bypass: false })
  });
  const processData = await processRes.json();
  if (processRes.status !== 200) throw new Error(`OCR processing failed: ${processData.error}`);
  console.log('✅ OCR processing completed.');
  console.log('   Confidence score:', processData.confidence_score);
  console.log('   Structured data:', JSON.stringify(processData.structured_data));

  // 9. DOCTOR REQUESTS DATA ACCESS CONSENT
  console.log('\n--- 9. Doctor Requests Consent ---');
  const consentReqRes = await fetch(`${BASE_URL}/api/doctor/request-access`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${doctorToken}`
    },
    body: JSON.stringify({ patient_id, hospital_id })
  });
  const consentReqData = await consentReqRes.json();
  if (consentReqRes.status !== 200 && consentReqRes.status !== 201) throw new Error(`Doctor consent request failed: ${consentReqData.error}`);
  request_id = consentReqData.request_id;
  console.log('✅ Consent access requested. Request ID:', request_id);

  // 10. PATIENT APPROVES CONSENT FLOW WITH OTP
  console.log('\n--- 10. Patient Approves Consent Flow ---');
  const consentOtpRes = await fetch(`${BASE_URL}/api/patient/consent-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${patientToken}`
    },
    body: JSON.stringify({ request_id })
  });
  const consentOtpData = await consentOtpRes.json();
  if (consentOtpRes.status !== 200) throw new Error(`Patient consent OTP request failed: ${consentOtpData.error}`);

  // Fetch Consent OTP from Database
  const consentRecord = await Consent.findOne({ request_id });
  const consentOtp = consentRecord.otp;
  console.log('🔍 Retrieved Consent OTP from DB:', consentOtp);

  // Approve consent request
  const consentApproveRes = await fetch(`${BASE_URL}/api/patient/consent-action`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${patientToken}`
    },
    body: JSON.stringify({
      request_id,
      action: 'approve',
      otp: consentOtp,
      approved_records: [record_id]
    })
  });
  const consentApproveData = await consentApproveRes.json();
  if (consentApproveRes.status !== 200) throw new Error(`Consent approval failed: ${consentApproveData.error}`);
  console.log('✅ Consent approved successfully.');

  // 11. DOCTOR RETRIEVES THE PATIENT RECORDS
  console.log('\n--- 11. Doctor Retrieves Approved Records ---');
  const docFetchRes = await fetch(`${BASE_URL}/api/doctor/records?patient_id=${patient_id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${doctorToken}`
    }
  });
  const docFetchData = await docFetchRes.json();
  if (docFetchRes.status !== 200) throw new Error(`Doctor record fetch failed: ${docFetchData.error}`);
  console.log('✅ Doctor accessed patient records. Records count:', docFetchData.length);
  console.log('   Access authorized records list:', JSON.stringify(docFetchData));

  console.log('\n🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY! The flow of events works perfectly end-to-end.');

  // Clean up
  await Hospital.deleteMany({ admin_email: 'test_hospital@audit.com' });
  await Doctor.deleteMany({ email: 'test_doctor@audit.com' });
  await Patient.deleteMany({ email: 'test_patient@audit.com' });
  await Record.deleteMany({ record_id });
  await Consent.deleteMany({ request_id });
  await mongoose.connection.close();
  console.log('🔌 Closed connection and cleaned databases.');
  process.exit(0);
}

runTests().catch(async (err) => {
  console.error('\n❌ INTEGRATION TEST FAILED:', err);
  await mongoose.connection.close();
  process.exit(1);
});
