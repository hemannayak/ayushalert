import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb.js';
import Doctor from '../../../../models/Doctor.js';
import Hospital from '../../../../models/Hospital.js';
import { signToken } from '../../../../utils/jwt.js';

export async function POST(req) {
  try {
    await dbConnect();
    const { name, license_number, specialization, hospital_id, email, face_embedding } = await req.json();

    if (!name || !license_number || !specialization || !hospital_id || !email || !face_embedding) {
      return NextResponse.json({ error: 'All fields and facial scan are required' }, { status: 400 });
    }

    // Check if the hospital actually exists
    const hospital = await Hospital.findOne({ hospital_id });
    if (!hospital) {
      return NextResponse.json({ error: 'Invalid Hospital ID' }, { status: 400 });
    }

    const existingDoctor = await Doctor.findOne({ $or: [{ email }, { license_number }] });
    if (existingDoctor) {
      return NextResponse.json({ error: 'Doctor with this Email or License Number already exists' }, { status: 400 });
    }

    // Generate a unique Doctor ID
    const new_doctor_id = 'DOC_' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const doctor = await Doctor.create({
      doctor_id: new_doctor_id,
      name,
      license_number,
      specialization,
      hospital_id,
      email,
      face_embedding
    });

    // ----------------------------------------------------
    // EMAIL DELIVERY VIA NODEMAILER
    // ----------------------------------------------------
    if (process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
      try {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
          }
        });

        const mailOptions = {
          from: process.env.SMTP_EMAIL,
          to: email,
          subject: 'Welcome to the AyushAlert Doctor Portal!',
          text: `Hello ${name},\n\nYour clinical profile has been successfully registered and bound to Hospital ${hospital_id}.\n\nYour unique Doctor ID is: ${new_doctor_id}\n\nYou can now log in securely using your Face ID at any affiliated terminal.\n\nThank you!`
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to Doctor ${email}`);
      } catch (mailErr) {
        console.error("Failed to send email to doctor:", mailErr);
      }
    }

    const token = signToken({ doctor_id: doctor.doctor_id, email: doctor.email, role: 'doctor' });

    return NextResponse.json({
      message: 'Doctor registered successfully',
      doctor_id: doctor.doctor_id,
      token
    }, { status: 201 });

  } catch (error) {
    console.error('Doctor Registration error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
