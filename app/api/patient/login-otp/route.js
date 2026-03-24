import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb.js';
import Patient from '../../../../models/Patient.js';
import { generateToken } from '../../../../utils/jwt.js';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  }
});

// POST: Generate and send OTP for login
export async function POST(req) {
  try {
    const { patient_id } = await req.json();

    if (!patient_id) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
    }

    await dbConnect();
    const patient = await Patient.findOne({ patient_id });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    patient.login_otp = otp;
    patient.login_otp_expiry = expiry;
    await patient.save();

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: patient.email,
      subject: 'AyushAlert - Your Login OTP',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
          <h2 style="color: #2563eb;">AyushAlert Login Verification</h2>
          <p>Hello <b>${patient.name}</b>,</p>
          <p>You requested to log in using an OTP. Please use the verification code below:</p>
          <div style="background: #f3f4f6; padding: 15px; text-align: center; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1f2937;">
            ${otp}
          </div>
          <p style="color: #6b7280; font-size: 14px; mt-4">This OTP is valid for 10 minutes. Do not share it with anyone.</p>
        </div>
      `
    });

    return NextResponse.json({ message: 'OTP sent successfully' }, { status: 200 });

  } catch (error) {
    console.error('Send Patient Login OTP error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT: Verify OTP and log in
export async function PUT(req) {
  try {
    const { patient_id, otp } = await req.json();

    if (!patient_id || !otp) {
      return NextResponse.json({ error: 'Patient ID and OTP are required' }, { status: 400 });
    }

    await dbConnect();
    const patient = await Patient.findOne({ patient_id });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    if (!patient.login_otp || patient.login_otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    if (new Date() > patient.login_otp_expiry) {
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
    }

    // Clear OTP after successful login
    patient.login_otp = undefined;
    patient.login_otp_expiry = undefined;
    await patient.save();

    // Generate JWT
    const token = generateToken({
      patient_id: patient.patient_id,
      name: patient.name,
      role: 'patient'
    });

    return NextResponse.json({
      message: 'Login successful',
      token,
      patient_id: patient.patient_id,
      name: patient.name
    }, { status: 200 });

  } catch (error) {
    console.error('Verify Patient Login OTP error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
