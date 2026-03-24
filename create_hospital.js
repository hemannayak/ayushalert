import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://health_admin:pP6c5nPa1uinf4LF@health.vrvyn8t.mongodb.net/health-consent-demo';

async function createHospital() {
    try {
        await mongoose.connect(MONGODB_URI);
        const dict = {
            hospital_id: 'HOSP_DEMO',
            name: 'Apollo Apollo Health City',
            registration_id: 'REG_APOLLO_001',
            address: 'Jubilee Hills, Hyderabad',
            admin_email: 'admin@apollo.com',
            password_hash: 'mock_hash',
            created_at: new Date()
        };
        await mongoose.connection.collection('hospitals').insertOne(dict);
        console.log("HOSP_DEMO Created Successfully.");
        mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
}
createHospital();
