import admin from 'firebase-admin';
import { config } from 'dotenv';

// Load environment variables
config();

// Load service account
if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is required');
}

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
console.log('Connected to Firestore project:', serviceAccount.project_id);

export { db };