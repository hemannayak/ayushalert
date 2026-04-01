import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '../../../../lib/mongodb.js';
import mongoose from 'mongoose';
import Hospital from '../../../../models/Hospital.js';
import { sendEmail } from '../../../../lib/mailer.js';

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
      api_key:        'PENDING_' + hospital_id, // Placeholder to prevent unique index collision
    });

    const emailHtml = `
      <div style="font-family: system-ui, -apple-system, sans-serif; padding: 30px; max-width: 600px; margin: 0 auto; background-color: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb;">
        <h2 style="color: #0d9488; margin-bottom: 24px;">Registration Received</h2>
        <p style="color: #374151; font-size: 16px; line-height: 1.5;">Dear Hospital Administrator,</p>
        <p style="color: #374151; font-size: 16px; line-height: 1.5;">Your application for <strong>${name}</strong> has been successfully registered on the AyushAlert platform. It is currently under verification.</p>
        
        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 30px 0; text-align: center;">
          <p style="color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Your Unique Hospital Code</p>
          <p style="color: #0f172a; font-size: 24px; font-weight: 800; font-family: monospace; letter-spacing: 2px; margin: 0;">${hospital_id}</p>
        </div>

        <p style="color: #374151; font-size: 16px; line-height: 1.5;">Please keep this code secure, as it is required alongside your admin credentials to log into the hospital terminal once verification is complete.</p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 40px;">Best regards,<br/><strong>AyushAlert Core System</strong></p>
      </div>
    `;

    // Fire and forget email (don't block the API response for the user)
    sendEmail({
      to: admin_email,
      subject: 'AyushAlert Hospital Registration - Welcome!',
      html: emailHtml,
    }).catch(console.error);

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
