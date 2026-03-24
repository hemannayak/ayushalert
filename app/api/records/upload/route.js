import { NextResponse } from 'next/server';
import cloudinary from '../../../../lib/cloudinary.js';
import dbConnect from '../../../../lib/mongodb.js';
import Record from '../../../../models/Record.js';
import { verifyToken } from '../../../../utils/jwt.js';

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || (!decoded.patient_id && !decoded.doctor_id)) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const document_type = formData.get('document_type') || 'Prescription';
    const patient_id = formData.get('patient_id') || decoded.patient_id;

    if (!patient_id) {
      return NextResponse.json({ error: 'patient_id is required' }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const ext = file.name.split('.').pop().toLowerCase();
    const allowedExts = ['pdf', 'png', 'jpg', 'jpeg', 'docx', 'doc'];
    
    if (!allowedExts.includes(ext)) {
      return NextResponse.json({ error: 'Invalid file type. Allowed: pdf, png, jpg, jpeg, docx' }, { status: 400 });
    }

    const fileBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(fileBuffer).toString('base64');
    
    // Construct dataURI according to extension
    let mimeType = file.type;
    if (!mimeType) {
        if (ext === 'pdf') mimeType = 'application/pdf';
        else if (ext === 'png') mimeType = 'image/png';
        else if (['jpg', 'jpeg'].includes(ext)) mimeType = 'image/jpeg';
        else mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }
    const dataURI = `data:${mimeType};base64,${base64Data}`;

    const uploadOptions = {
      folder: 'health_records',
      resource_type: ['docx', 'doc'].includes(ext) ? 'raw' : (ext === 'pdf' ? 'image' : 'auto'),
    };

    if (ext === 'pdf') {
       uploadOptions.format = 'pdf';
    }

    const uploadResponse = await cloudinary.uploader.upload(dataURI, uploadOptions);

    const record_id = `REC_${Date.now()}`;

    await dbConnect();

    const newRecord = new Record({
      record_id,
      patient_id,
      file_name: file.name,
      file_url: uploadResponse.secure_url,
      ocr_status: 'pending',
      fhir_status: 'pending',
      document_type,
      source: 'phr',
      data_origin: 'ocr',
      verified: false,
      confidence_score: 0
    });

    await newRecord.save();

    return NextResponse.json({
      message: 'Medical record uploaded successfully',
      record_id,
      file_url: uploadResponse.secure_url
    }, { status: 201 });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
