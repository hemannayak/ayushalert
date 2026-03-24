import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb.js';
import Patient from '../../../../models/Patient.js';
import { verifyToken } from '../../../../utils/jwt.js';

export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || !decoded.patient_id) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    await dbConnect();

    const patient = await Patient.findOne({ patient_id: decoded.patient_id }).select('-password_hash -face_embedding');
    
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json({
      patient_id: patient.patient_id,
      name: patient.name,
      email: patient.email,
      mobile: patient.mobile,
      abha_id: patient.abha_id,
      gender: patient.gender,
      dob: patient.dob,
      pincode: patient.pincode,
      created_at: patient.created_at
    }, { status: 200 });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || !decoded.patient_id) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const body = await req.json();
    const { gender, dob, pincode } = body;

    await dbConnect();

    const patient = await Patient.findOneAndUpdate(
      { patient_id: decoded.patient_id },
      { $set: { gender, dob, pincode } },
      { new: true, runValidators: true }
    ).select('-password_hash -face_embedding');

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      patient_id: patient.patient_id,
      name: patient.name,
      email: patient.email,
      mobile: patient.mobile,
      abha_id: patient.abha_id,
      gender: patient.gender,
      dob: patient.dob,
      pincode: patient.pincode,
      created_at: patient.created_at
    }, { status: 200 });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
