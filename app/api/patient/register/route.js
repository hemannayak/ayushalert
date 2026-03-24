import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '../../../../lib/mongodb.js';
import Patient from '../../../../models/Patient.js';

export async function POST(req) {
  try {
    await dbConnect();
    const data = await req.json();

    const { name, email, mobile, gender, dob, abha_id, password, face_embedding, pincode } = data;

    if (!name || !email || !mobile || !password || !face_embedding || !Array.isArray(face_embedding)) {
      return NextResponse.json({ error: 'Missing required fields including facial scan' }, { status: 400 });
    }

    // Check if patient with this email already exists
    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return NextResponse.json({ error: 'Patient with this email already exists' }, { status: 409 });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt); // keep for backup admins

    const randomNumbers = Math.floor(100000 + Math.random() * 900000);
    const patient_id = `PAT_${randomNumbers}`;

    // Auto-generate a dummy ABHA ID if not provided (Format: XX-XXXX-XXXX-XXXX)
    let final_abha_id = abha_id;
    if (!final_abha_id) {
      const p1 = Math.floor(10 + Math.random() * 90);
      const p2 = Math.floor(1000 + Math.random() * 9000);
      const p3 = Math.floor(1000 + Math.random() * 9000);
      const p4 = Math.floor(1000 + Math.random() * 9000);
      final_abha_id = `${p1}-${p2}-${p3}-${p4}`;
    }

    const newPatient = new Patient({
      patient_id,
      name,
      email,
      mobile,
      gender,
      dob,
      abha_id: final_abha_id,
      pincode: pincode || '',
      password_hash,
      face_embedding
    });

    await newPatient.save();

    // ----------------------------------------------------
    // REAL EMAIL DELIVERY VIA NODEMAILER
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
          subject: 'Welcome to the AyushAlert Portal!',
          text: `Hello ${name},\n\nYour digital health account has been successfully created!\n\nYour unique Patient ID is: ${patient_id}\nYour backup password is: ${password}\n\nYou can now log in securely using your Patient ID and Face ID.\n\nThank you!`
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${email}`);
      } catch (mailErr) {
        console.error("Failed to send email to patient:", mailErr);
      }
    } else {
      console.log(`[WARNING] Real email not sent to ${email} because SMTP_EMAIL or SMTP_PASSWORD is not set in .env.local.`);
    }

    return NextResponse.json({
      message: 'Patient registered successfully. Check your email for login details!',
      patient_id
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
