import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb.js';
import AnalyticsEvent from '../../../../models/AnalyticsEvent.js';

const HYDERABAD_PINCODES = ['500032', '500016', '500028', '500072', '500081', '500034', '500003', '500026', '500038', '500049'];
const SYMPTOMS = ['fever', 'dengue', 'typhoid', 'malaria', 'cough', 'headache', 'vomiting', 'rash'];
const SEVERITIES = ['mild', 'moderate', 'severe'];

export async function POST() {
  try {
    await dbConnect();

    // Flood one pincode with outbreak-level data
    const outbreakPincode = HYDERABAD_PINCODES[Math.floor(Math.random() * 3)]; // first 3 = main city areas
    const outbreakSymptom = SYMPTOMS[Math.floor(Math.random() * 3)]; // fever/dengue/typhoid

    const docs = [];

    // 15 outbreak events in one pincode (triggers thresholds clearly)
    for (let i = 0; i < 15; i++) {
      docs.push({
        region_pincode: outbreakPincode,
        diagnosis: [outbreakSymptom, Math.random() > 0.5 ? 'fever' : 'headache'],
        severity: SEVERITIES[i % 3],
        timestamp: new Date(Date.now() - Math.random() * 20 * 60 * 60 * 1000), // within last 20h
      });
    }

    // 10 scattered events across other pincodes
    for (let i = 0; i < 10; i++) {
      const pincode = HYDERABAD_PINCODES[Math.floor(Math.random() * HYDERABAD_PINCODES.length)];
      docs.push({
        region_pincode: pincode,
        diagnosis: [SYMPTOMS[Math.floor(Math.random() * SYMPTOMS.length)]],
        severity: SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)],
        timestamp: new Date(Date.now() - Math.random() * 22 * 60 * 60 * 1000),
      });
    }

    await AnalyticsEvent.insertMany(docs);

    return NextResponse.json({
      ok: true,
      inserted: docs.length,
      outbreakPincode,
      outbreakSymptom,
      message: `Simulated ${docs.length} events. Outbreak seeded in ${outbreakPincode} (${outbreakSymptom})`,
    }, { status: 201 });

  } catch (err) {
    console.error('[Simulate] Error:', err);
    return NextResponse.json({ error: 'Simulation failed' }, { status: 500 });
  }
}
