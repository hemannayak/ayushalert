import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb.js';
import Patient from '../../../../models/Patient.js';
import Record from '../../../../models/Record.js';
import Hospital from '../../../../models/Hospital.js';
import { anonymizeAndStore } from '../../../../lib/anonymizer.js';

export async function POST(req) {
  try {
    // ── Step 1: Extract API Key ──────────────────────────────────────────
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) {
      return NextResponse.json({
        error: 'Unauthorized: No API key provided. Only registered and verified hospitals can push data.'
      }, { status: 401 });
    }

    await dbConnect();

    // ── Step 2: Validate API Key against DB (zero-trust) ────────────────
    const hospital = await Hospital.findOne({ api_key: apiKey, status: 'verified' });
    if (!hospital) {
      return NextResponse.json({
        error: 'Unauthorized: Invalid or unverified hospital API key. Ensure your hospital is registered and verified by AyushAlert before pushing records.'
      }, { status: 401 });
    }

    // ── Step 3: Parse body ───────────────────────────────────────────────
    const body = await req.json();
    const { abha_id, patient_email, records } = body;

    if (!records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ error: 'records array is required' }, { status: 400 });
    }

    // ── Step 4: Match patient ────────────────────────────────────────────
    let patient = null;
    if (abha_id)       patient = await Patient.findOne({ abha_id });
    if (!patient && patient_email) patient = await Patient.findOne({ email: patient_email });

    if (!patient) {
      return NextResponse.json({ error: 'No matching patient found for given ABHA ID or email.' }, { status: 404 });
    }

    // ── Step 5: Store records — tagged with verified hospital identity ────
    const created = [];

    for (const rec of records) {
      const record_id = `REC_HOSP_${Date.now()}_${Math.floor(Math.random() * 9999)}`;

      const structured_data = {
        medicines: rec.medicines || [],
        dosage:    rec.dosage    || [],
        symptoms:  rec.symptoms  || [],
        diagnosis: rec.diagnosis || [],
        doctor:    rec.doctor    || hospital.name,
        date:      rec.date      || new Date().toISOString().split('T')[0],
      };

      const newRecord = new Record({
        record_id,
        patient_id:       patient.patient_id,
        file_name:        rec.file_name || 'hospital_record.pdf',
        file_url:         rec.file_url  || `https://${hospital.hospital_id}.hospital.ayushalert.in/records/${record_id}.pdf`,
        ocr_status:       'N/A',
        fhir_status:      'pending',
        structured_data,
        confidence_score: 100,    // hospital-provided = full confidence
        verified:         true,   // pre-verified; hospital is registered and authenticated
        last_verified_at: new Date(),
        source:           'hospital',
        data_origin:      'hospital',
        // Traceability — who pushed this record
        hospital_id:      hospital.hospital_id,
        hospital_name:    hospital.name,
      });

      await newRecord.save();
      created.push(record_id);

      anonymizeAndStore({
        patient,
        diagnosis: structured_data.diagnosis,
        timestamp: new Date()
      }).catch(err => console.error('[Anonymizer] Failed:', err));
    }

    return NextResponse.json({
      message: `${created.length} verified record(s) linked to patient ${patient.patient_id} by ${hospital.name}.`,
      record_ids: created,
      hospital_id: hospital.hospital_id,
      hospital_name: hospital.name,
      verified: true,
    }, { status: 201 });

  } catch (err) {
    console.error('[Hospital Ingest] Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
