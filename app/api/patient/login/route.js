import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '../../../../lib/mongodb.js';
import Patient from '../../../../models/Patient.js';
import { signToken } from '../../../../utils/jwt.js';

export async function POST(req) {
  try {
    await dbConnect();
    const { patient_id, face_embedding } = await req.json();

    if (!patient_id || !face_embedding || !Array.isArray(face_embedding)) {
      return NextResponse.json({ error: 'patient_id and facial scan are required' }, { status: 400 });
    }

    const patient = await Patient.findOne({ patient_id });
    if (!patient) {
      return NextResponse.json({ error: 'Invalid patient_id or unverified face' }, { status: 401 });
    }

    // Instead of bcrypt.compare(password...), we calculate Euclidean distance
    const storedFace = patient.face_embedding;
    if (!storedFace || storedFace.length === 0) {
       return NextResponse.json({ error: 'Facial data not registered for this patient' }, { status: 400 });
    }
    
    // Calculate Euclidean Distance
    let distance = 0;
    for (let i = 0; i < face_embedding.length; i++) {
        distance += Math.pow((face_embedding[i] || 0) - (storedFace[i] || 0), 2);
    }
    distance = Math.sqrt(distance);
    console.log(`[FaceID] Patient: ${patient_id} | Distance: ${distance}`);

    // Strict Euclidean distance threshold for identical person (0.6 limit based on face-api standard)
    if (distance > 0.6) {
      return NextResponse.json({ error: `Face mismatch. Distance: ${distance.toFixed(3)}` }, { status: 401 });
    }

    const token = signToken({ patient_id: patient.patient_id, email: patient.email });

    return NextResponse.json({
      token,
      patient_id: patient.patient_id
    }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
