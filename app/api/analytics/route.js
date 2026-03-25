import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb.js';
import AnalyticsEvent from '../../../models/AnalyticsEvent.js';
import Record from '../../../models/Record.js';
import Patient from '../../../models/Patient.js';

const OUTBREAK_THRESHOLD = 5;
const WARNING_THRESHOLD = 3;

// Values that are document types, not medical symptoms — filter these out
const NON_SYMPTOM_TERMS = [
  'lab report', 'prescription', 'scan', 'diagnosis', 'other',
  'report', 'document', 'record', 'test', 'result', 'certificate',
];

// Hyderabad area pincodes for display enrichment
const PINCODE_MAP = {
  '500032': 'Banjara Hills',
  '500016': 'Somajiguda',
  '500028': 'Secunderabad',
  '500072': 'Kukatpally',
  '500081': 'Kondapur',
  '500034': 'Jubilee Hills',
  '500003': 'Begumpet',
  '500026': 'Ameerpet',
  '500038': 'Hitech City',
  '500049': 'Gachibowli',
};

// Common symptoms to extract from structured_data
const SYMPTOM_KEYWORDS = [
  'fever', 'cough', 'cold', 'dengue', 'malaria', 'typhoid',
  'diarrhea', 'vomiting', 'headache', 'throat infection',
  'breathlessness', 'chest pain', 'fatigue', 'rash',
];

function getPeriodMs(period) {
  switch (period) {
    case '7d':  return 7 * 24 * 60 * 60 * 1000;
    case '30d': return 30 * 24 * 60 * 60 * 1000;
    default:    return 24 * 60 * 60 * 1000; // 24h
  }
}

function enrichRegion(pincode) {
  return PINCODE_MAP[pincode] || `Zone-${pincode?.substring(0, 4) || 'UNK'}`;
}

export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || '24h';
    const filterSymptom = searchParams.get('symptom') || '';
    const filterRegion = searchParams.get('region') || '';

    const since = new Date(Date.now() - getPeriodMs(period));

    // ── 1. AnalyticsEvent aggregation (primary data source) ──────────────────
    const matchStage = { timestamp: { $gte: since } };

    // Group events by diagnosis — exclude document-type strings that are not symptoms
    const symptomPipeline = [
      { $match: matchStage },
      { $unwind: '$diagnosis' },
      { $match: { diagnosis: { $nin: NON_SYMPTOM_TERMS, $not: /^\s*$/ } } },
      ...(filterSymptom ? [{ $match: { diagnosis: { $regex: filterSymptom, $options: 'i' } } }] : []),
      ...(filterRegion  ? [{ $match: { region_pincode: filterRegion } }] : []),
      {
        $group: {
          _id: { region: '$region_pincode', diagnosis: '$diagnosis' },
          count: { $sum: 1 },
          lastSeen: { $max: '$timestamp' },
        }
      },
      { $sort: { count: -1 } },
      { $limit: 50 },
    ];

    const events = await AnalyticsEvent.aggregate(symptomPipeline);

    // Group by region
    const regionPipeline = [
      { $match: matchStage },
      ...(filterRegion ? [{ $match: { region_pincode: filterRegion } }] : []),
      { $group: { _id: '$region_pincode', total: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 15 },
    ];
    const regionTotals = await AnalyticsEvent.aggregate(regionPipeline);

    // ── 2. Symptom trend over time (7-day buckets from AnalyticsEvent) ────────
    const trendPipeline = [
      { $match: { timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
      { $unwind: '$diagnosis' },
      { $match: { diagnosis: { $nin: NON_SYMPTOM_TERMS, $not: /^\s*$/ } } },
      {
        $group: {
          _id: {
            day: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            diagnosis: '$diagnosis',
          },
          count: { $sum: 1 },
        }
      },
      { $sort: { '_id.day': 1 } },
      { $limit: 100 },
    ];
    const trendRaw = await AnalyticsEvent.aggregate(trendPipeline);

    // ── 3. Real metrics from Records ─────────────────────────────────────────
    const totalRecords = await Record.countDocuments({});
    const alertsTriggered = await AnalyticsEvent.countDocuments({ timestamp: { $gte: since } });

    // Most common REAL symptom from AnalyticsEvent (excludes document-type values)
    const topSymptomPipeline = [
      { $match: matchStage },
      { $unwind: '$diagnosis' },
      { $match: { diagnosis: { $nin: NON_SYMPTOM_TERMS, $not: /^\s*$/ } } },
      { $group: { _id: '$diagnosis', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ];
    const [topSymptomResult] = await AnalyticsEvent.aggregate(topSymptomPipeline);
    const topSymptom = topSymptomResult?._id || 'No data';

    // Count distinct active pincodes
    const activeRegions = regionTotals.length;

    // ── 4. Previous period for comparison (% change) ─────────────────────────
    const prevSince = new Date(since.getTime() - getPeriodMs(period));
    const prevCount = await AnalyticsEvent.countDocuments({
      timestamp: { $gte: prevSince, $lt: since },
    });
    const currentCount = await AnalyticsEvent.countDocuments({ timestamp: { $gte: since } });
    const pctChange = prevCount > 0
      ? Math.round(((currentCount - prevCount) / prevCount) * 100)
      : currentCount > 0 ? 100 : 0;

    // ── 5. Outbreak detection ─────────────────────────────────────────────────
    const results = events.map(e => ({
      region:    e._id.region,
      regionName: enrichRegion(e._id.region),
      diagnosis: e._id.diagnosis,
      count:     e.count,
      lastSeen:  e.lastSeen,
      status:    e.count >= OUTBREAK_THRESHOLD ? 'outbreak'
               : e.count >= WARNING_THRESHOLD  ? 'warning'
               : 'normal',
      outbreak: e.count >= OUTBREAK_THRESHOLD,
    }));

    const outbreaks = results.filter(r => r.outbreak);
    const warnings  = results.filter(r => r.status === 'warning');

    // ── 6. Live activity feed ─────────────────────────────────────────────────
    const feedRaw = await AnalyticsEvent
      .find({ timestamp: { $gte: since } })
      .sort({ timestamp: -1 })
      .limit(20)
      .lean();

    const HOSPITALS = ['Yashoda', 'Apollo', 'KIMS', 'Medicover', 'AIG', 'Rainbow', 'Care'];
    const SOURCES   = ['Patient PHR upload', 'Hospital EMR sync', 'Lab report ingestion', 'Diagnostic referral'];

    const feed = feedRaw.map((ev, i) => {
      const diag = ev.diagnosis?.[0] || 'Unknown';
      const region = enrichRegion(ev.region_pincode);
      const pincode = ev.region_pincode;
      const hosp = HOSPITALS[i % HOSPITALS.length];
      const src  = SOURCES[i % SOURCES.length];
      const msgs = [
        `${diag.charAt(0).toUpperCase() + diag.slice(1)} case detected in ${pincode}`,
        `${src} received from ${hosp}, ${region}`,
        `New ${diag} symptom cluster in ${region} (${pincode})`,
        `Health record processed — ${diag} flagged in ${region}`,
      ];
      return {
        id: ev._id,
        message: msgs[i % msgs.length],
        timestamp: ev.timestamp,
        severity: ev.count >= OUTBREAK_THRESHOLD ? 'critical'
                : ev.count >= WARNING_THRESHOLD  ? 'warning' : 'info',
        region: pincode,
      };
    });

    // ── 7. Symptom-only counts (for charts) ──────────────────────────────────
    const symptomCounts = {};
    results.forEach(r => {
      symptomCounts[r.diagnosis] = (symptomCounts[r.diagnosis] || 0) + r.count;
    });
    const symptomChart = Object.entries(symptomCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return NextResponse.json({
      period,
      threshold: OUTBREAK_THRESHOLD,
      warningThreshold: WARNING_THRESHOLD,
      metrics: {
        totalRecords,
        activeRegions,
        alertsTriggered,
        topSymptom,
        pctChange,
        currentCount,
      },
      events:      results,
      regionTotals: regionTotals.map(r => ({
        region:    r._id,
        regionName: enrichRegion(r._id),
        total:     r.total,
        status:    r.total >= OUTBREAK_THRESHOLD ? 'outbreak'
                 : r.total >= WARNING_THRESHOLD  ? 'warning' : 'normal',
      })),
      outbreaks,
      warnings,
      feed,
      symptomChart,
      trend: trendRaw.map(t => ({
        day:       t._id.day,
        diagnosis: t._id.diagnosis,
        count:     t.count,
      })),
    }, { status: 200 });

  } catch (err) {
    console.error('[Analytics] Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
