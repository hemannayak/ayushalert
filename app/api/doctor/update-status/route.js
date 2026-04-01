import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb.js';
import Doctor from '../../../../models/Doctor.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ayush-secret-2024';

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const body = await req.json();
    const { status } = body;

    if (!['online', 'offline', 'consulting'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await dbConnect();

    const doctor = await Doctor.findOneAndUpdate(
      { doctor_id: decoded.doctor_id },
      { status, last_active: new Date() },
      { new: true }
    );

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, status: doctor.status });

  } catch (err) {
    console.error('[Update Status API] Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
