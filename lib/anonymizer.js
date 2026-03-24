import dbConnect from './mongodb.js';
import AnalyticsEvent from '../models/AnalyticsEvent.js';

/**
 * Strips all PII from a patient record and stores only
 * anonymized symptom + region data in the AnalyticsEvent collection.
 *
 * @param {object} options
 * @param {object} options.patient     - Full patient document (for pincode lookup)
 * @param {string[]} options.diagnosis - Array of diagnosis strings
 * @param {Date}   options.timestamp   - When this event occurred
 */
export async function anonymizeAndStore({ patient, diagnosis, timestamp }) {
  if (!diagnosis || diagnosis.length === 0) return;

  // Get the region/pincode — DEFAULT to 'UNKNOWN' so analytics still count
  const region_pincode = patient?.pincode || 'UNKNOWN';

  // Determine severity from diagnosis list (simple heuristic)
  const severeDiagnosis = ['cholera', 'dengue', 'malaria', 'tuberculosis', 'covid-19', 'acute gastroenteritis'];
  const isSevere = diagnosis.some(d => severeDiagnosis.some(sd => d.toLowerCase().includes(sd)));
  const severity  = isSevere ? 'severe' : 'mild';

  await dbConnect();

  await AnalyticsEvent.create({
    region_pincode,
    diagnosis: diagnosis.map(d => d.toLowerCase().trim()),
    severity,
    timestamp: timestamp || new Date()
  });

  console.log(`[Anonymizer] Stored event for region: ${region_pincode}, diagnosis: ${diagnosis.join(', ')}`);
}
