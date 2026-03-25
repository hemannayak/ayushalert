import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb.js';
import Hospital from '../../../../models/Hospital.js';

// GET /api/hospital/list — returns only verified hospitals (safe, public fields only)
export async function GET() {
  try {
    await dbConnect();
    const hospitals = await Hospital.find({ status: 'verified' })
      .select('hospital_id name city address registration_id verified_at')
      .sort({ verified_at: -1 });

    return NextResponse.json({ hospitals }, { status: 200 });
  } catch (err) {
    console.error('[Hospital List] Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
