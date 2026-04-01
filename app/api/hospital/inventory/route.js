import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb.js';
import Hospital from '../../../../models/Hospital.js';
import Inventory from '../../../../models/Inventory.js';

export async function GET(req) {
  try {
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const hospital = await Hospital.findOne({ api_key: apiKey });
    if (!hospital) return NextResponse.json({ error: 'Invalid Identity' }, { status: 401 });

    const inventory = await Inventory.find({ hospital_id: hospital.hospital_id });
    return NextResponse.json(inventory);
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const hospital = await Hospital.findOne({ api_key: apiKey });
    if (!hospital) return NextResponse.json({ error: 'Invalid Identity' }, { status: 401 });

    const body = await req.json();
    const { 
      item_name, category, stock_count, unit, min_threshold,
      invoice_id, intake_stock, intake_time, unit_cost, total_amount
    } = body;

    const updateData = { 
      category, 
      unit, 
      min_threshold, 
      last_updated: new Date() 
    };

    if (invoice_id) updateData.invoice_id = invoice_id;
    if (intake_time) updateData.intake_time = intake_time;
    if (unit_cost) updateData.unit_cost = unit_cost;
    if (total_amount) updateData.total_amount = total_amount;

    const newItem = await Inventory.findOneAndUpdate(
      { hospital_id: hospital.hospital_id, item_name },
      { 
        $set: updateData,
        $inc: { stock_count: intake_stock || stock_count || 0 }
      },
      { upsert: true, new: true }
    );

    return NextResponse.json(newItem);
  } catch (err) {
    console.error('Inventory Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
