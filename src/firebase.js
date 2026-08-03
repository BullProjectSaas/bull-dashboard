import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyDeNw2-71rOI4BKekWb1aKY2nX1yXU8GhI',
  authDomain: 'bull-dashboard-e6866.firebaseapp.com',
  projectId: 'bull-dashboard-e6866',
  storageBucket: 'bull-dashboard-e6866.firebasestorage.app',
  messagingSenderId: '824870944222',
  appId: '1:824870944222:web:2f8ac45482c93d4e0c314f',
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
