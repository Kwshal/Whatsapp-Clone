// Firebase imports
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";

// Your Firebase configuration (copy from chat.js)
const firebaseConfig = {
     // Add your Firebase config here
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

     loginButton.addEventListener('click', () => {
          const username = usernameInput.value.trim();
          if (username) {
               // Should add password validation here
               localStorage.setItem('currentUser', username);
               window.location.href = 'home.html';
          } else {
               alert('Please enter a username');
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

