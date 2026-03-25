import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb.js';
import Doctor from '../../../../models/Doctor.js';
import { signToken } from '../../../../utils/jwt.js';
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
    const { doctor_id } = await req.json();

    if (!doctor_id) {
      return NextResponse.json({ error: 'Doctor ID is required' }, { status: 400 });
    }

    await dbConnect();
    const doctor = await Doctor.findOne({ doctor_id });

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    doctor.login_otp = otp;
    doctor.login_otp_expiry = expiry;
    await doctor.save();

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: doctor.email,
      subject: 'AyushAlert - Doctor Portal Login OTP',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
          <h2 style="color: #10b981;">AyushAlert Doctor Login</h2>
          <p>Dr. <b>${doctor.name}</b>,</p>
          <p>You requested to log into the clinical portal using an OTP.</p>
          <div style="background: #f3f4f6; padding: 15px; text-align: center; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1f2937;">
            ${otp}
          </div>
          <p style="color: #6b7280; font-size: 14px; mt-4">This OTP is valid for 10 minutes. Do not share it with unauthorized personnel.</p>
        </div>
      `
    });

    return NextResponse.json({ message: 'OTP sent successfully' }, { status: 200 });

  } catch (error) {
    console.error('Send Doctor Login OTP error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT: Verify OTP and log in
export async function PUT(req) {
  try {
    const { doctor_id, otp } = await req.json();

    if (!doctor_id || !otp) {
      return NextResponse.json({ error: 'Doctor ID and OTP are required' }, { status: 400 });
    }

    await dbConnect();
    const doctor = await Doctor.findOne({ doctor_id });

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    if (!doctor.login_otp || doctor.login_otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    if (new Date() > doctor.login_otp_expiry) {
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
    }

    // Clear OTP after successful login
    doctor.login_otp = undefined;
    doctor.login_otp_expiry = undefined;
    await doctor.save();

    // Generate JWT
    const token = signToken({
      doctor_id: doctor.doctor_id,
      name: doctor.name,
      hospital_id: doctor.hospital_id,
      role: 'doctor'
    });

    return NextResponse.json({
      message: 'Login successful',
      token,
      doctor_id: doctor.doctor_id,
      name: doctor.name,
      hospital_id: doctor.hospital_id
    }, { status: 200 });

  } catch (error) {
    console.error('Verify Doctor Login OTP error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
