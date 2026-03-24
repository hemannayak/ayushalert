import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb.js';
import Record from '../../../../models/Record.js';

export async function GET(req, { params }) {
  try {
    const { record_id } = await params;

    await dbConnect();

    const record = await Record.findOne({ record_id });

    if (!record) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json({
      record_id: record.record_id,
      patient_id: record.patient_id,
      file_url: record.file_url,
      ocr_status: record.ocr_status
    }, { status: 200 });

  } catch (error) {
    console.error('Fetch record error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
