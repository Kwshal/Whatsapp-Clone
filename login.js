// Firebase imports
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";

// Your Firebase configuration (copy from chat.js)
const firebaseConfig = {
     apiKey: "AIzaSyCHKs8Mtt0tH1d0SfBcY8T1_y5DV7DdzLE",
     authDomain: "kloned-whatsapp.firebaseapp.com",
     projectId: "kloned-whatsapp",
     storageBucket: "kloned-whatsapp.appspot.com",
     messagingSenderId: "1023505189291",
     appId: "1:1023505189291:web:badbb63366eeac9e0e2aee",
     databaseURL: "https://kloned-whatsapp-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Basic login handling without authentication
document.addEventListener('DOMContentLoaded', () => {
     const loginButton = document.getElementById('loginButton');
     const registerButton = document.getElementById('registerButton');
     const usernameInput = document.getElementById('username');
     const passwordInput = document.getElementById('password');

     loginButton.addEventListener('click', async () => {
          const username = usernameInput.value.trim();
          const password = passwordInput.value.trim();

          if (!username || !password) {
               alert('Please enter both username and password');
               return;
          }

          try {
               // Check if user exists
               const userRef = ref(db, `users/${username}`);
               const snapshot = await get(userRef);

               if (!snapshot.exists()) {
                    alert('User not found. Please register first.');
                    return;
               }

               // Here you should add proper password validation
               // For now, we'll just check if the user exists
               localStorage.setItem('currentUser', username);
               window.location.href = 'home.html';

          } catch (error) {
               console.error('Login error:', error);
               alert('Login failed. Please try again.');
          }
     });

     registerButton.addEventListener('click', async () => {
          const username = usernameInput.value.trim();
          const password = passwordInput.value.trim();

          if (!username || !password) {
               alert('Please enter both username and password');
               return;
          }

          try {
               // Check if user already exists
               const userRef = ref(db, `users/${username}`);
               const snapshot = await get(userRef);

               if (snapshot.exists()) {
                    alert('Username already exists. Please choose another.');
                    return;
               }

               // Create new user
               await set(userRef, {
                    username: username,
                    createdAt: Date.now(),
                    lastSeen: Date.now()
               });

               // Log user in
               localStorage.setItem('currentUser', username);
               window.location.href = 'home.html';

          } catch (error) {
               console.error('Error during registration:', error);
               alert('Registration failed. Please try again.');
          }
     });

     // Allow Enter key to trigger login
     passwordInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
               loginButton.click();
          }
     });
});

