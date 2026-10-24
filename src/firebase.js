import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: 'AIzaSyCJhui9KXgeVvkojwgfiDhNVJCrKO2cqYc',
  authDomain: 'vintage-8d691.firebaseapp.com',
  databaseURL: 'https://vintage-8d691-default-rtdb.firebaseio.com',
  projectId: 'vintage-8d691',
  storageBucket: 'vintage-8d691.firebasestorage.app',
  messagingSenderId: '633042637582',
  appId: '1:633042637582:web:2ef3857d2859603ab37d5f',
  measurementId: 'G-EPCZ8BZ293',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getDatabase(app)

isSupported()
  .then((supported) => {
    if (supported) getAnalytics(app)
  })
  .catch(() => {})
