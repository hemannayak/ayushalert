import dbConnect from './lib/mongodb.js';
import Record from './models/Record.js';
async function test() {
  await dbConnect();
  const recs = await Record.find({ patient_id: 'PAT_376682' });
  console.log("Records length:", recs.length);
  if(recs.length > 0) console.log(recs[0]);
  
  const allRecs = await Record.find();
  console.log("All records length:", allRecs.length);
  if(allRecs.length > 0) {
     console.log("Random record mapped patient_id:", allRecs[0].patient_id);
  }
}
test().then(() => process.exit());
