/**
 * AyushAlert Demo Seed Script
 * 
 * Seeds the database with:
 * - Sample analytics events (including outbreak spike for demo)
 * - Pre-defined hospital records
 * 
 * Usage:
 *   node scripts/seed_demo.js
 * 
 * Requires MONGODB_URI in .env.local
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error('❌ MONGODB_URI not set in .env.local'); process.exit(1); }

// ─── Schemas (inline to avoid Next.js bundling issues) ───────
const AnalyticsEventSchema = new mongoose.Schema({
  region_pincode: String,
  diagnosis: [String],
  severity: { type: String, default: 'mild' },
  timestamp: { type: Date, default: Date.now }
});

const AnalyticsEvent = mongoose.models.AnalyticsEvent || mongoose.model('AnalyticsEvent', AnalyticsEventSchema);

// ─── Seed Data ───────────────────────────────────────────────
const SEED_EVENTS = [
  // Cholera outbreak spike in 500032
  ...Array.from({ length: 12 }, () => ({
    region_pincode: '500032',
    diagnosis: ['cholera', 'acute gastroenteritis', 'severe dehydration'],
    severity: 'severe',
    timestamp: new Date(Date.now() - Math.random() * 20 * 60 * 60 * 1000) // within last 20h
  })),

  // Dengue cluster in 500001
  ...Array.from({ length: 7 }, () => ({
    region_pincode: '500001',
    diagnosis: ['dengue fever', 'viral hemorrhagic fever'],
    severity: 'severe',
    timestamp: new Date(Date.now() - Math.random() * 22 * 60 * 60 * 1000)
  })),

  // Normal flu cases scattered across regions
  ...Array.from({ length: 4 }, () => ({
    region_pincode: '500072',
    diagnosis: ['viral fever', 'upper respiratory tract infection'],
    severity: 'mild',
    timestamp: new Date(Date.now() - Math.random() * 23 * 60 * 60 * 1000)
  })),
  {
    region_pincode: '500018',
    diagnosis: ['migraine', 'general weakness'],
    severity: 'mild',
    timestamp: new Date()
  },
  {
    region_pincode: '500018',
    diagnosis: ['viral fever', 'bronchitis'],
    severity: 'mild',
    timestamp: new Date()
  }
];

async function seed() {
  console.log('🌱 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected.');

  // Clear existing analytics
  const deleted = await AnalyticsEvent.deleteMany({});
  console.log(`🗑️  Cleared ${deleted.deletedCount} existing analytics events.`);

  // Insert seed data
  await AnalyticsEvent.insertMany(SEED_EVENTS);
  console.log(`✅ Inserted ${SEED_EVENTS.length} analytics events.`);
  console.log('');
  console.log('📊 Seed Summary:');
  console.log('  500032 → Cholera OUTBREAK (12 cases)');
  console.log('  500001 → Dengue  OUTBREAK (7 cases)');
  console.log('  500072 → Flu     Normal   (4 cases)');
  console.log('  500018 → Misc    Normal   (2 cases)');
  console.log('');
  console.log('🎯 Visit http://localhost:3000/dashboard to see outbreak alerts!');

  await mongoose.connection.close();
  console.log('✅ Done. Connection closed.');
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
