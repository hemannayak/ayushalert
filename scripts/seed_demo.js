/**
 * AyushAlert Demo Seed Script
 *
 * Seeds the database with:
 * - Sample analytics events (outbreak spike for demo)
 * - Verified hospitals with API keys (for hospital EMR sync demo)
 *
 * Usage:
 *   node scripts/seed_demo.js
 *
 * Requires MONGODB_URI in .env.local
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error('❌ MONGODB_URI not set in .env.local'); process.exit(1); }

// ─── Inline Schemas (avoid Next.js bundling issues) ───────────────────────────
const AnalyticsEventSchema = new mongoose.Schema({
  region_pincode: String,
  diagnosis:      [String],
  severity:       { type: String, default: 'mild' },
  timestamp:      { type: Date, default: Date.now }
});

const HospitalSchema = new mongoose.Schema({
  hospital_id:     { type: String, required: true, unique: true },
  name:            String,
  registration_id: { type: String, unique: true },
  license_number:  String,
  address:         String,
  city:            String,
  phone:           String,
  admin_email:     { type: String, unique: true },
  password:        String,
  status:          { type: String, default: 'pending' },
  verified_at:     Date,
  verified_by:     String,
  api_key:         { type: String, default: null, sparse: true },
  created_at:      { type: Date, default: Date.now },
});

const AnalyticsEvent = mongoose.models.AnalyticsEvent || mongoose.model('AnalyticsEvent', AnalyticsEventSchema);
const Hospital       = mongoose.models.Hospital        || mongoose.model('Hospital', HospitalSchema);

// ─── Analytics Seed Data ──────────────────────────────────────────────────────
const SEED_EVENTS = [
  ...Array.from({ length: 12 }, () => ({
    region_pincode: '500032',
    diagnosis:      ['cholera', 'acute gastroenteritis', 'severe dehydration'],
    severity:       'severe',
    timestamp:      new Date(Date.now() - Math.random() * 20 * 60 * 60 * 1000)
  })),
  ...Array.from({ length: 7 }, () => ({
    region_pincode: '500001',
    diagnosis:      ['dengue fever', 'viral hemorrhagic fever'],
    severity:       'severe',
    timestamp:      new Date(Date.now() - Math.random() * 22 * 60 * 60 * 1000)
  })),
  ...Array.from({ length: 4 }, () => ({
    region_pincode: '500072',
    diagnosis:      ['viral fever', 'upper respiratory tract infection'],
    severity:       'mild',
    timestamp:      new Date(Date.now() - Math.random() * 23 * 60 * 60 * 1000)
  })),
  { region_pincode: '500018', diagnosis: ['migraine', 'general weakness'],  severity: 'mild', timestamp: new Date() },
  { region_pincode: '500018', diagnosis: ['viral fever', 'bronchitis'],     severity: 'mild', timestamp: new Date() },
];

// ─── Hospital Seed Data ───────────────────────────────────────────────────────
// These are pre-verified demo hospitals with stable API keys for the demo.
// In production, hospitals self-register and are verified by an admin.
const SEED_HOSPITALS = [
  {
    hospital_id:     'HOSP_YASHODA',
    name:            'Yashoda Hospitals',
    registration_id: 'TSMC/REG/2005/001',
    license_number:  'LIC-YASHODA-2005',
    address:         'Malakpet, Hyderabad - 500036',
    city:            'Hyderabad',
    phone:           '+91-40-4567-8900',
    logo_url:        'https://ui-avatars.com/api/?name=Yashoda&background=1e40af&color=fff&bold=true&size=128&rounded=true',
    admin_email:     'admin@yashodahospitals.com',
    password:        'YashodaAdmin@2024',
    status:          'verified',
    verified_at:     new Date('2024-01-15'),
    verified_by:     'AyushAlert Admin (Seeded)',
    api_key:         'demo_hospital_key_2024',  // fixed demo key
  },
  {
    hospital_id:     'HOSP_APOLLO',
    name:            'Apollo Hospitals',
    registration_id: 'TSMC/REG/2002/048',
    license_number:  'LIC-APOLLO-2002',
    address:         'Jubilee Hills, Hyderabad - 500033',
    city:            'Hyderabad',
    phone:           '+91-40-2360-7777',
    logo_url:        'https://ui-avatars.com/api/?name=Apollo&background=1a56db&color=fff&bold=true&size=128&rounded=true',
    admin_email:     'admin@apollohospitals.com',
    password:        'ApolloAdmin@2024',
    status:          'verified',
    verified_at:     new Date('2024-02-20'),
    verified_by:     'AyushAlert Admin (Seeded)',
    api_key:         'HAK_apollo_demo_key_2024abc',
  },
  {
    hospital_id:     'HOSP_KIMS',
    name:            'KIMS Hospital',
    registration_id: 'TSMC/REG/2011/112',
    license_number:  'LIC-KIMS-2011',
    address:         'Secunderabad, Hyderabad - 500003',
    city:            'Hyderabad',
    phone:           '+91-40-4488-5000',
    logo_url:        'https://ui-avatars.com/api/?name=KIMS&background=15803d&color=fff&bold=true&size=128&rounded=true',
    admin_email:     'admin@kimshospitals.com',
    password:        'KIMSAdmin@2024',
    status:          'verified',
    verified_at:     new Date('2024-03-10'),
    verified_by:     'AyushAlert Admin (Seeded)',
    api_key:         'HAK_kims_demo_key_2024xyz',
  },
  {
    hospital_id:     'HOSP_MEDICOVER',
    name:            'Medicover Hospitals',
    registration_id: 'TSMC/REG/2015/220',
    license_number:  'LIC-MEDICOVER-2015',
    address:         'Hitec City, Hyderabad - 500081',
    city:            'Hyderabad',
    phone:           '+91-40-6810-7000',
    admin_email:     'admin@medicoverhospitals.com',
    password:        'MedicoverAdmin@2024',
    status:          'pending',   // ← intentionally pending, to demo the "not verified" state
    verified_at:     null,
    verified_by:     null,
    api_key:         null,
  },
];

// ─── Seed ─────────────────────────────────────────────────────────────────────
async function seed() {
  console.log('🌱 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected.\n');

  // ── Analytics events ──
  const deletedEvents = await AnalyticsEvent.deleteMany({});
  console.log(`🗑️  Cleared ${deletedEvents.deletedCount} analytics events.`);
  await AnalyticsEvent.insertMany(SEED_EVENTS);
  console.log(`✅ Inserted ${SEED_EVENTS.length} analytics events.`);

  // ── Hospitals ──
  let hospitalResults = { upserted: 0, skipped: 0 };
  for (const h of SEED_HOSPITALS) {
    const { password, ...rest } = h;
    const hashedPwd = await bcrypt.hash(password, 10);
    const existing  = await Hospital.findOne({ hospital_id: h.hospital_id });
    if (existing) {
      console.log(`  ⏭️  Hospital already exists: ${h.name} — skipping`);
      hospitalResults.skipped++;
    } else {
      await Hospital.create({ ...rest, password: hashedPwd });
      console.log(`  ✅ Seeded: ${h.name} (${h.status}) ${h.api_key ? '🔑' : '⏳'}`);
      hospitalResults.upserted++;
    }
  }

  console.log('\n📊 Seed Summary:');
  console.log('  Analytics:');
  console.log('    500032 → Cholera  OUTBREAK (12 cases)');
  console.log('    500001 → Dengue   OUTBREAK (7 cases)');
  console.log('    500072 → Flu      Normal   (4 cases)');
  console.log('    500018 → Misc     Normal   (2 cases)');
  console.log('  Hospitals:');
  console.log(`    Seeded: ${hospitalResults.upserted} | Skipped: ${hospitalResults.skipped}`);
  console.log('    🔑 Yashoda   → API key: demo_hospital_key_2024  (verified)');
  console.log('    🔑 Apollo    → API key: HAK_apollo_demo_key_2024abc  (verified)');
  console.log('    🔑 KIMS      → API key: HAK_kims_demo_key_2024xyz   (verified)');
  console.log('    ⏳ Medicover → No key (pending verification)');
  console.log('\n🎯 Visit http://localhost:3000/dashboard → analytics');
  console.log('🎯 Visit http://localhost:3000/hospital/portal → enter "demo_hospital_key_2024"');

  await mongoose.connection.close();
  console.log('\n✅ Done.');
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
