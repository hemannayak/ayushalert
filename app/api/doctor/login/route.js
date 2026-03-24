import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb.js';
import Doctor from '../../../../models/Doctor.js';
import { signToken } from '../../../../utils/jwt.js';

export async function POST(req) {
  try {
    await dbConnect();
    const { doctor_id, face_embedding } = await req.json();

    if (!doctor_id || !face_embedding || !Array.isArray(face_embedding)) {
      return NextResponse.json({ error: 'doctor_id and facial scan are required' }, { status: 400 });
    }

    const doctor = await Doctor.findOne({ doctor_id });
    if (!doctor) {
      return NextResponse.json({ error: 'Invalid doctor_id or unverified face' }, { status: 401 });
    }

    const storedFace = doctor.face_embedding;
    if (!storedFace || storedFace.length === 0) {
       return NextResponse.json({ error: 'Facial data not registered for this doctor' }, { status: 400 });
    }
    
    // Calculate Euclidean Distance
    let distance = 0;
    for (let i = 0; i < face_embedding.length; i++) {
        distance += Math.pow(face_embedding[i] - storedFace[i], 2);
    }
    distance = Math.sqrt(distance);

    // Using 0.65 threshold to match patient fallback for stable demo performance
    if (distance > 0.65) {
      return NextResponse.json({ error: 'Face mismatch. Access Denied.' }, { status: 401 });
    }

    const token = signToken({ doctor_id: doctor.doctor_id, email: doctor.email, role: 'doctor' });

    return NextResponse.json({
      token,
      doctor_id: doctor.doctor_id,
      name: doctor.name
    }, { status: 200 });

  } catch (error) {
    console.error('Doctor Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
