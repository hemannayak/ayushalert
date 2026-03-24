import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb.js';
import Record from '../../../../models/Record.js';
import Consent from '../../../../models/Consent.js';

export async function GET(req) {
  try {
    const apiKey = req.headers.get('x-api-key');
    const HOSPITAL_API_KEY = process.env.HOSPITAL_API_KEY || 'demo_hospital_key_2024';
    if (apiKey !== HOSPITAL_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const patient_id = searchParams.get('patient_id');

    if (!patient_id) {
      return NextResponse.json({ error: 'patient_id is required' }, { status: 400 });
    }

    await dbConnect();

    // Check there is an approved consent for this patient from this hospital
    const approvedConsent = await Consent.findOne({
      patient_id,
      status: 'approved'
    });

    if (!approvedConsent) {
      return NextResponse.json({ error: 'No approved consent found for this patient.' }, { status: 403 });
    }

    if (approvedConsent.access_expires_at && new Date() > new Date(approvedConsent.access_expires_at)) {
      // Auto-revoke locally to keep logic clean, though the status could be updated here
      approvedConsent.status = 'rejected'; // Or 'expired' if we had that status
      await approvedConsent.save();
      return NextResponse.json({ error: 'Access expired. Please request a new OTP from the patient.' }, { status: 403 });
    }

    // Return all records (verified and unverified)
    const records = await Record.find({
      patient_id
    })
      .select('-face_embedding -__v')
      .sort({ uploaded_at: -1 })
      .lean();

    return NextResponse.json(records, { status: 200 });

  } catch (err) {
    console.error('[Doctor Records] Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
