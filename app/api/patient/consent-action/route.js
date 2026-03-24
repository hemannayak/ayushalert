import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb.js';
import Consent from '../../../../models/Consent.js';
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

    const { request_id, action, approved_records, otp } = await req.json();

    if (!request_id || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Valid request_id and action (approve/reject) are required' }, { status: 400 });
    }

    await dbConnect();

    const consent = await Consent.findOne({ request_id });

    if (!consent) {
      return NextResponse.json({ error: 'Consent request not found' }, { status: 404 });
    }

    if (consent.patient_id !== decoded.patient_id) {
      return NextResponse.json({ error: 'Unauthorized to act on this consent request' }, { status: 403 });
    }

    if (action === 'approve') {
      if (!otp) {
        return NextResponse.json({ error: 'OTP is required to approve access' }, { status: 400 });
      }
      if (consent.otp !== otp) {
        return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
      }
      if (new Date() > new Date(consent.otp_expires_at)) {
        return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
      }

      consent.status = 'approved';
      consent.approved_records = Array.isArray(approved_records) ? approved_records : [];
      consent.access_expires_at = new Date(Date.now() + 15 * 60 * 1000); // 15 mins validity
      
      // Clear OTP
      consent.otp = undefined;
      consent.otp_expires_at = undefined;

    } else if (action === 'reject') {
      consent.status = 'rejected';
      consent.approved_records = [];
    }

    await consent.save();

    return NextResponse.json({
      message: 'Consent updated',
      status: consent.status
    }, { status: 200 });

  } catch (error) {
    console.error('Consent action error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
