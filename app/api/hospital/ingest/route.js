import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb.js';
import Patient from '../../../../models/Patient.js';
import Record from '../../../../models/Record.js';
import { anonymizeAndStore } from '../../../../lib/anonymizer.js';

const HOSPITAL_API_KEY = process.env.HOSPITAL_API_KEY || 'demo_hospital_key_2024';

export async function POST(req) {
  try {
    // API Key Authentication
    const apiKey = req.headers.get('x-api-key');
    if (apiKey !== HOSPITAL_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized: Invalid API Key' }, { status: 401 });
    }

    const body = await req.json();
    const { abha_id, patient_email, records } = body;

    if (!records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ error: 'records array is required' }, { status: 400 });
    }

    await dbConnect();

    // Match patient by abha_id or email
    let patient = null;
    if (abha_id) patient = await Patient.findOne({ abha_id });
    if (!patient && patient_email) patient = await Patient.findOne({ email: patient_email });

    if (!patient) {
      return NextResponse.json({ error: 'No matching patient found for given ABHA ID or email.' }, { status: 404 });
    }

    const created = [];

    for (const rec of records) {
      const record_id = `REC_HOSP_${Date.now()}_${Math.floor(Math.random() * 9999)}`;

      const structured_data = {
        medicines: rec.medicines || [],
        dosage:    rec.dosage    || [],
        symptoms:  rec.symptoms  || [],
        diagnosis: rec.diagnosis || [],
        doctor:    rec.doctor    || 'Hospital System',
        date:      rec.date      || new Date().toISOString().split('T')[0]
      };

      const newRecord = new Record({
        record_id,
        patient_id:       patient.patient_id,
        file_name:        rec.file_name || 'hospital_record.json',
        file_url:         rec.file_url  || 'https://hospital.local/secure-ehr-record.pdf',
        ocr_status:       'N/A',
        fhir_status:      'pending',
        structured_data,
        confidence_score: 100,   // Hospital data is pre-structured — full confidence
        verified:         true,  // Hospital data is auto-verified
        last_verified_at: new Date(),
        source:           'hospital',
        data_origin:      'hospital'
      });

      await newRecord.save();
      created.push(record_id);

      // Anonymize and push to analytics
      anonymizeAndStore({
        patient,
        diagnosis: structured_data.diagnosis,
        timestamp: new Date()
      }).catch(err => console.error('[Anonymizer] Failed:', err));
    }

    return NextResponse.json({
      message: `${created.length} hospital record(s) ingested successfully for patient ${patient.patient_id}.`,
      record_ids: created
    }, { status: 201 });

  } catch (err) {
    console.error('[Hospital Ingest] Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
