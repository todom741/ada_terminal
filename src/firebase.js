// firebase.js (or add directly in your script)
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';

// Your Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyCRjti9wnWsCHeJaSa_iRXk9ZPsY4KShNo",
  authDomain: "pixelterminal.firebaseapp.com",
  databaseURL: "https://pixelterminal-default-rtdb.firebaseio.com",
  projectId: "pixelterminal",
  storageBucket: "pixelterminal.firebasestorage.app",
  messagingSenderId: "388079158871",
  appId: "1:388079158871:web:bb8135efccdd388eb0c512",
  measurementId: "G-TF0T7N39Q3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Realtime Database
const database = getDatabase(app);

function listenForUserData() {
  const userRef = ref(database, 'users/');
  onValue(userRef, (snapshot) => {
    const data = snapshot.val();
    console.log("Real-time user data:", data);
  });
}

// Example usage
listenForUserData('anotherUserId');