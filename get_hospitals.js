import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://health_admin:pP6c5nPa1uinf4LF@health.vrvyn8t.mongodb.net/health-consent-demo';

async function getHospitals() {
    try {
        await mongoose.connect(MONGODB_URI);
        const hospitals = await mongoose.connection.collection('hospitals').find({}).toArray();
        console.log("----- REGISTERED HOSPITALS -----");
        hospitals.forEach(h => console.log(`Name: ${h.name}\nHOSPITAL_ID: ${h.hospital_id}\nEmail: ${h.admin_email}\n----------------------------`));
        mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
}
getHospitals();
