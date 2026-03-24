require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const RecordSchema = new mongoose.Schema({}, { strict: false, collection: 'records' });
  const Record = mongoose.model('Record', RecordSchema);
  
  const recs = await Record.find({ patient_id: 'PAT_376682' });
  console.log("Records for PAT_376682:", recs.length);
  if(recs.length > 0) console.log(recs[0]);
  
  const allRecs = await Record.find().limit(2);
  console.log("All records sample:", allRecs.map(r => r.patient_id));
}
test().then(() => process.exit()).catch(console.error);
