import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb.js';
import Consent from '../../../../models/Consent.js';
import Patient from '../../../../models/Patient.js';

export async function POST(req) {
  try {
    await dbConnect();
    const { hospital_id, patient_id, reason } = await req.json();

    if (!hospital_id || !patient_id || !reason) {
      return NextResponse.json({ error: 'hospital_id, patient_id, and reason are required' }, { status: 400 });
    }

    const patient = await Patient.findOne({ patient_id });
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const request_id = `CONS_${Date.now()}`;

    const newConsent = new Consent({
      request_id,
      patient_id,
      hospital_id,
      status: 'pending',
      approved_records: []
    });

    await newConsent.save();

    return NextResponse.json({
      message: 'Consent request created',
      request_id
    }, { status: 201 });

  } catch (error) {
    console.error('Request access error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
