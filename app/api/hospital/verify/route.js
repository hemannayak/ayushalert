import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb.js';
import Hospital from '../../../../models/Hospital.js';

const ADMIN_KEY = process.env.ADMIN_SECRET_KEY || 'admin_secret_ayushalert_2024';

// POST /api/hospital/verify  { hospital_id, action: "verify" | "reject" }
// Requires admin header: x-admin-key
export async function POST(req) {
  try {
    const adminKey = req.headers.get('x-admin-key');
    if (adminKey !== ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized: Admin key required' }, { status: 401 });
    }

    await dbConnect();
    const { hospital_id, action } = await req.json();

    if (!hospital_id || !['verify', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'hospital_id and action (verify|reject) are required' }, { status: 400 });
    }

    const hospital = await Hospital.findOne({ hospital_id });
    if (!hospital) {
      return NextResponse.json({ error: 'Hospital not found' }, { status: 404 });
    }

    if (action === 'verify') {
      hospital.status      = 'verified';
      hospital.verified_at = new Date();
      hospital.verified_by = 'AyushAlert Admin';
      // Generate unique API key if not already issued
      if (!hospital.api_key) {
        hospital.generateApiKey();
      }
      await hospital.save();

      return NextResponse.json({
        message: `Hospital "${hospital.name}" verified and API key issued.`,
        hospital_id: hospital.hospital_id,
        api_key: hospital.api_key,   // returned once so admin can hand it to hospital
        status: hospital.status
      }, { status: 200 });

    } else {
      hospital.status  = 'rejected';
      hospital.api_key = null;
      await hospital.save();

      return NextResponse.json({
        message: `Hospital "${hospital.name}" rejected.`,
        hospital_id: hospital.hospital_id,
        status: hospital.status
      }, { status: 200 });
    }

  } catch (err) {
    console.error('[Hospital Verify] Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// GET /api/hospital/verify — list ALL hospitals for admin review (pending + verified)
export async function GET(req) {
  try {
    const adminKey = req.headers.get('x-admin-key');
    if (adminKey !== ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const hospitals = await Hospital.find()
      .select('hospital_id name city registration_id license_number admin_email status verified_at created_at')
      .sort({ created_at: -1 });

    return NextResponse.json({ hospitals }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
