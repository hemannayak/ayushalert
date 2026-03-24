import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '../../../../lib/mongodb.js';
import Hospital from '../../../../models/Hospital.js';
import { signToken } from '../../../../utils/jwt.js';

export async function POST(req) {
  try {
    await dbConnect();
    const { name, registration_id, address, admin_email, password } = await req.json();

    if (!name || !registration_id || !address || !admin_email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const existing = await Hospital.findOne({ 
      $or: [{ registration_id }, { admin_email }]
    });

    if (existing) {
      return NextResponse.json({ error: 'Hospital with this Registration ID or Email already exists' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate a unique Hospital ID
    const hospital_id = 'HOSP_' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const hospital = await Hospital.create({
      hospital_id,
      name,
      registration_id,
      address,
      admin_email,
      password: hashedPassword
    });

    const token = signToken({ hospital_id: hospital.hospital_id, email: hospital.admin_email, role: 'hospital' });

    return NextResponse.json({
      message: 'Hospital registered successfully',
      hospital_id: hospital.hospital_id,
      token
    }, { status: 201 });

  } catch (error) {
    console.error('Hospital Registration error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
