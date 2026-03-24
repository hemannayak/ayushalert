import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://health_admin:pP6c5nPa1uinf4LF@health.vrvyn8t.mongodb.net/health-consent-demo';

async function getUsers() {
    try {
        await mongoose.connect(MONGODB_URI);
        const patients = await mongoose.connection.collection('patients').find({}).toArray();
        console.log("----- REGISTERED PATIENTS -----");
        patients.forEach(p => console.log(`Name: ${p.name}\nEmail: ${p.email}\nPATIENT_ID: ${p.patient_id}\nHas Face Data: ${!!p.face_embedding}\n----------------------------`));
        mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
}
getUsers();
