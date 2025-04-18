// firebaseAdmin.js
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), // Or use service account
  });
}

export const authAdmin = admin.auth();
