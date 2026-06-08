import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Parse the JSON from the environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);

// FIX: Force Node.js to format the hidden newline characters correctly
const formattedPrivateKey = serviceAccount.private_key.replace(/\\n/g, '\n');

if (!getApps().length) {
  initializeApp({
    credential: cert({
      ...serviceAccount,
      private_key: formattedPrivateKey
    }),
  });
}

const db = getFirestore();
export { db };