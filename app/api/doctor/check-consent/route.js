import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb.js';
import Consent from '../../../../models/Consent.js';
import { verifyToken } from '../../../../utils/jwt.js';

export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || !decoded.doctor_id) {
      return NextResponse.json({ error: 'Invalid or expired doctor token' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const request_id = searchParams.get('request_id');

    if (!request_id) {
      return NextResponse.json({ error: 'request_id is required' }, { status: 400 });
    }

    await dbConnect();

    const consent = await Consent.findOne({ request_id });
    if (!consent) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({
      status: consent.status,   // 'pending', 'approved', 'rejected'
      approved_records: consent.approved_records,
      access_expires_at: consent.access_expires_at
    }, { status: 200 });

  } catch (error) {
    console.error('Check Consent error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
