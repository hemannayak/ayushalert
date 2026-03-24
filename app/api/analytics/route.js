import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb.js';
import AnalyticsEvent from '../../../models/AnalyticsEvent.js';

const OUTBREAK_THRESHOLD = 5; // Cases per pincode in 24h to trigger alert

export async function GET() {
  try {
    await dbConnect();

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24h

    // Group events by region + diagnosis
    const pipeline = [
      { $match: { timestamp: { $gte: since } } },
      { $unwind: '$diagnosis' },
      {
        $group: {
          _id: { region: '$region_pincode', diagnosis: '$diagnosis' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ];

    const events = await AnalyticsEvent.aggregate(pipeline);

    // Mark outbreaks
    const results = events.map(e => ({
      region:   e._id.region,
      diagnosis:  e._id.diagnosis,
      count:    e.count,
      outbreak: e.count >= OUTBREAK_THRESHOLD
    }));

    // Overall region count for pie/bar charts
    const regionPipeline = [
      { $match: { timestamp: { $gte: since } } },
      { $group: { _id: '$region_pincode', total: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ];
    const regionTotals = await AnalyticsEvent.aggregate(regionPipeline);

    return NextResponse.json({
      threshold:    OUTBREAK_THRESHOLD,
      period:       '24h',
      events:       results,
      regionTotals: regionTotals.map(r => ({ region: r._id, total: r.total })),
      outbreaks:    results.filter(r => r.outbreak)
    }, { status: 200 });

  } catch (err) {
    console.error('[Analytics] Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
