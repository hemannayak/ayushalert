import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb.js';
import Record from '../../../../models/Record.js';
import { verifyToken } from '../../../../utils/jwt.js';

export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || !decoded.patient_id) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const queryPatientId = searchParams.get('patient_id');

    // Security check: Only allow a patient to fetch their own records
    if (queryPatientId !== decoded.patient_id) {
       return NextResponse.json({ error: 'Forbidden: You can only view your own records.' }, { status: 403 });
    }

    await dbConnect();

    // Fetch all records belonging to the patient, sorted by newest first
    const records = await Record.find({ patient_id: decoded.patient_id })
      .sort({ uploaded_at: -1 })
      .lean();

    return NextResponse.json(records, { status: 200 });

  } catch (error) {
    console.error('Fetch patient records error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || !decoded.patient_id) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const record_id = searchParams.get('record_id');

    if (!record_id) {
      return NextResponse.json({ error: 'record_id parameter is required' }, { status: 400 });
    }

    await dbConnect();
    
    const targetRecord = await Record.findOne({ record_id });

    if (!targetRecord) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    if (targetRecord.patient_id !== decoded.patient_id) {
      return NextResponse.json({ error: 'Forbidden: You do not own this record' }, { status: 403 });
    }

    await Record.deleteOne({ record_id });

    return NextResponse.json({ message: 'Record securely deleted' }, { status: 200 });
  } catch (error) {
    console.error('Delete patient record error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
