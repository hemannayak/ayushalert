import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '../../../../lib/mongodb.js';
import Consent from '../../../../models/Consent.js';
import Patient from '../../../../models/Patient.js';
import { verifyToken } from '../../../../utils/jwt.js';

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || !decoded.patient_id) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const { request_id } = await req.json();

    if (!request_id) {
      return NextResponse.json({ error: 'request_id is required' }, { status: 400 });
    }

    await dbConnect();
    const consent = await Consent.findOne({ request_id });

    if (!consent) {
      return NextResponse.json({ error: 'Consent request not found' }, { status: 404 });
    }

    if (consent.patient_id !== decoded.patient_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Generate a Random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes

    consent.otp = otp;
    consent.otp_expires_at = expiresAt;
    await consent.save();

    const patient = await Patient.findOne({ patient_id: decoded.patient_id });

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
                to: patient.email,
                subject: 'AyushAlert - Approval OTP',
                text: `Hello ${patient.name},\n\nA hospital has requested access to your medical records.\nYour 6-digit OTP to approve Request ID ${request_id} is:\n\n${otp}\n\nThis OTP will expire in 10 minutes.\n\nThank you.`
            };

            await transporter.sendMail(mailOptions);
            console.log(`OTP Email sent successfully to ${patient.email}`);
        } catch (mailErr) {
            console.error("Failed to send OTP email:", mailErr);
        }
    } else {
        console.log(`[WARNING] OTP email not sent because SMTP credentials are not set.`);
    }

    return NextResponse.json({
      message: 'OTP sent successfully to your email.',
      expiresIn: '10m'
    }, { status: 200 });

  } catch (error) {
    console.error('Consent OTP error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
