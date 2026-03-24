import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '../../../../lib/mongodb.js';
import Hospital from '../../../../models/Hospital.js';
import { signToken } from '../../../../utils/jwt.js';

export async function POST(req) {
  try {
    await dbConnect();
    const { admin_email, password } = await req.json();

    if (!admin_email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const hospital = await Hospital.findOne({ admin_email });
    if (!hospital) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, hospital.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = signToken({ hospital_id: hospital.hospital_id, email: hospital.admin_email, role: 'hospital' });

    return NextResponse.json({
      token,
      hospital_id: hospital.hospital_id,
      name: hospital.name
    }, { status: 200 });

  } catch (error) {
    console.error('Hospital Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
