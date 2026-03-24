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

    if (!decoded || !decoded.patient_id) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    await dbConnect();

    const consentRequests = await Consent.find({ patient_id: decoded.patient_id })
      .select('request_id hospital_id status created_at')
      .sort({ created_at: -1 });

    return NextResponse.json(consentRequests, { status: 200 });

  } catch (error) {
    console.error('Fetch consent requests error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
