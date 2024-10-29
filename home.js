import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Check for logged in user
const currentUser = localStorage.getItem('currentUser');
if (!currentUser) {
     window.location.href = 'index.html';
}

// Firebase configuration
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

// Logout function
window.logout = function () {
     localStorage.removeItem('currentUser');
     window.location.href = 'index.html';
}

// Function to start chat with user
function startChat(username) {
     localStorage.setItem('selectedUser', username);
     window.location.href = 'chat.html';
}

// Populate users list
const usersList = document.getElementById('usersList');
const usersRef = ref(db, 'users');

onValue(usersRef, (snapshot) => {
     usersList.innerHTML = '';

     // Add bots first
     const bots = [
          { name: 'Cat', emoji: '🐈' },
          { name: 'Mockingbird', emoji: '🐦' },
          { name: 'Bino', emoji: '🤖' },
          { name: "Ulti Khopdi", emoji: '🙃' }
     ];

     bots.forEach(bot => {
          const userItem = document.createElement('div');
          userItem.className = 'user-item';
          userItem.innerHTML = `
            <div class="user-avatar">${bot.emoji}</div>
            <div>${bot.name} Bot</div>
        `;
          userItem.addEventListener('click', () => startChat(bot.name));
          usersList.appendChild(userItem);
     });

     // Add separator
     const separator = document.createElement('div');
     separator.style.padding = '10px';
     separator.style.borderBottom = '1px solid #e0e0e0';
     separator.textContent = 'Users';
     usersList.appendChild(separator);

     // Add real users
     snapshot.forEach((childSnapshot) => {
          const username = childSnapshot.key;
          if (username !== currentUser) {
               const userItem = document.createElement('div');
               userItem.className = 'user-item';
               userItem.innerHTML = `
                <div class="user-avatar">${username.charAt(0).toUpperCase()}</div>
                <div>${username}</div>
            `;
               userItem.addEventListener('click', () => startChat(username));
               usersList.appendChild(userItem);
          }
     });
}); 