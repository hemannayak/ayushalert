import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb.js';
import Patient from '../../../../models/Patient.js';

function cosineDistance(u, v) {
  let dotProduct = 0;
  let normU = 0;
  let normV = 0;
  for (let i = 0; i < u.length; i++) {
    dotProduct += u[i] * v[i];
    normU += u[i] * u[i];
    normV += v[i] * v[i];
  }
  if (normU === 0 || normV === 0) return 1.0;
  return 1.0 - (dotProduct / (Math.sqrt(normU) * Math.sqrt(normV)));
}

export async function POST(req) {
  try {
    await dbConnect();
    const { face_embedding } = await req.json();

    if (!face_embedding || !Array.isArray(face_embedding)) {
      return NextResponse.json({ error: 'Valid face scan required' }, { status: 400 });
    }

    // Find all patients with face embeddings
    const patients = await Patient.find({ face_embedding: { $exists: true, $not: { $size: 0 } } });

    let bestMatch = null;
    let minDistance = 0.45; // Threshold for identity

    for (const p of patients) {
      if (!p.face_embedding || p.face_embedding.length === 0) continue;
      
      const distance = cosineDistance(face_embedding, p.face_embedding);
      
      if (distance < minDistance) {
        minDistance = distance;
        bestMatch = p;
      }
    }

    if (bestMatch) {
       // Only return safe non-sensitive data
       return NextResponse.json({
           success: true,
           patient_id: bestMatch.patient_id,
           name: bestMatch.name,
           email: bestMatch.email
       });
    }

    return NextResponse.json({ error: 'No matching patient found in biometric database' }, { status: 404 });

  } catch (err) {
    console.error('Doctor Scan API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
