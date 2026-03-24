import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '../../../../lib/mongodb.js';
import Consent from '../../../../models/Consent.js';
import Patient from '../../../../models/Patient.js';
import Doctor from '../../../../models/Doctor.js';
import { verifyToken } from '../../../../utils/jwt.js';

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || !decoded.doctor_id) {
      return NextResponse.json({ error: 'Invalid or expired doctor token' }, { status: 401 });
    }

    const { patient_id } = await req.json();

    if (!patient_id) {
      return NextResponse.json({ error: 'patient_id is required' }, { status: 400 });
    }

    await dbConnect();

    // Verify Patient exists
    const patient = await Patient.findOne({ patient_id });
    if (!patient) {
      return NextResponse.json({ error: 'Invalid patient_id' }, { status: 404 });
    }

    const doctor = await Doctor.findOne({ doctor_id: decoded.doctor_id });
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    // Generate unique request ID
    const request_id = 'REQ_' + crypto.randomBytes(4).toString('hex').toUpperCase();

    const newConsent = new Consent({
      request_id,
      patient_id,
      hospital_id: doctor.hospital_id,
      status: 'pending'
    });

    await newConsent.save();

    return NextResponse.json({
      message: 'Access request sent successfully',
      request_id,
      status: 'pending'
    }, { status: 201 });

  } catch (error) {
    console.error('Consent Request error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
