import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '../../../../lib/mongodb.js';
import Hospital from '../../../../models/Hospital.js';

export async function POST(req) {
  try {
    await dbConnect();
    const { name, registration_id, license_number, address, city, phone, logo_url, admin_email, password } = await req.json();

    if (!name || !registration_id || !address || !admin_email || !password) {
      return NextResponse.json({ error: 'Name, registration ID, address, email, and password are required.' }, { status: 400 });
    }

    const existing = await Hospital.findOne({
      $or: [{ registration_id }, { admin_email }]
    });
    if (existing) {
      return NextResponse.json({ error: 'A hospital with this Registration ID or Email already exists.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const hospital_id    = 'HOSP_' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const hospital = await Hospital.create({
      hospital_id,
      name,
      registration_id,
      license_number: license_number || '',
      address,
      city:           city           || '',
      phone:          phone          || '',
      logo_url:       logo_url       || '',
      admin_email,
      password:       hashedPassword,
      status:         'pending',
    });

    return NextResponse.json({
      message: 'Hospital registration submitted successfully. Your application is under review. You will receive access credentials once verified by AyushAlert.',
      hospital_id:     hospital.hospital_id,
      name:            hospital.name,
      logo_url:        hospital.logo_url,
      status:          hospital.status,
    }, { status: 201 });

  } catch (error) {
    console.error('[Hospital Register] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
