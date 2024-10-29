// Check for logged in user
const currentUser = localStorage.getItem('currentUser');
if (!currentUser) {
     window.location.href = 'index.html';
}

// Logout function
function logout() {
     localStorage.removeItem('currentUser');
     window.location.href = 'index.html';
}
window.logout = logout;

// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, push, onValue, set } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

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

// Get DOM elements
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const userDropdown = document.getElementById('userDropdown');
let selectedUser = null;

// Create typing indicator element
const typingIndicator = document.createElement('div');
typingIndicator.className = 'kwshal-secret-indicator';
typingIndicator.style.display = currentUser === 'kwshal' ? 'block' : 'none';
document.body.appendChild(typingIndicator);

// Add typing listener for kwshal
if (currentUser === 'kwshal') {
     const updateTypingStatus = () => {
          if (selectedUser) {
               const typingRef = ref(db, `typing/${selectedUser}`);
               onValue(typingRef, (snapshot) => {
                    const typingData = snapshot.val();
                    if (typingData && typingData.text) {
                         typingIndicator.textContent = `${selectedUser} is typing: ${typingData.text}`;
                    } else {
                         typingIndicator.textContent = `${selectedUser || 'No user'} is not typing`;
                    }
               });
          } else {
               typingIndicator.textContent = 'Please select a user to see their typing status';
          }
     };

     // Update status when user is selected
     userDropdown.addEventListener('change', updateTypingStatus);

     // Initial status update
     updateTypingStatus();
}

// Add input listener for all users
messageInput.addEventListener('input', (e) => {
     if (selectedUser) {
          const typingRef = ref(db, `typing/${currentUser}`);
          set(typingRef, {
               text: e.target.value,
               timestamp: Date.now()
          });
     }
});

// Clear typing status when input is cleared or message is sent
messageInput.addEventListener('blur', () => {
     if (selectedUser) {
          const typingRef = ref(db, `typing/${currentUser}`);
          set(typingRef, null);
     }
});

// Listen for available users
const usersRef = ref(db, 'users');
onValue(usersRef, (snapshot) => {
     const currentSelection = userDropdown.value; // Store current selection
     userDropdown.innerHTML = '<option value="">Select a user</option>';
     snapshot.forEach((childSnapshot) => {
          const username = childSnapshot.key;
          if (username !== currentUser) {
               const option = document.createElement('option');
               option.value = username;
               option.textContent = username;
               // Set selected attribute if this was the previously selected user
               if (username === currentSelection) {
                    option.selected = true;
               }
               userDropdown.appendChild(option);
          }
     });
});

// Add dropdown change listener
userDropdown.addEventListener('change', (e) => {
     const selectedUsername = e.target.value;
     if (selectedUsername) {
          selectUser(selectedUsername);
     }
});

// Select user to chat with
function selectUser(username) {
     selectedUser = username;
     loadMessages(username);
}

// Load messages for selected conversation
function loadMessages(otherUser) {
     const chatRef = ref(db, `users/${currentUser}/chats/${otherUser}`);
     onValue(chatRef, (snapshot) => {
          messagesDiv.innerHTML = '';
          const messages = [];
          snapshot.forEach((childSnapshot) => {
               messages.push(childSnapshot.val());
          });
          // Sort messages by timestamp
          messages.sort((a, b) => a.timestamp - b.timestamp);
          messages.forEach(message => {
               const messageElement = document.createElement('div');
               messageElement.className = `message ${message.sender === currentUser ? 'sent' : 'received'}`;
               messageElement.textContent = message.text;
               messagesDiv.appendChild(messageElement);
          });
          messagesDiv.scrollTop = messagesDiv.scrollHeight;
     });
}

// Send message function
function sendMessage() {
     if (!selectedUser) {
          alert('Please select a user to chat with first');
          return;
     }

     const text = messageInput.value.trim();
     if (text) {
          const messageData = {
               text: text,
               sender: currentUser,
               timestamp: Date.now()
          };

          // Save message in current user's chat
          push(ref(db, `users/${currentUser}/chats/${selectedUser}`), messageData);
          // Save message in recipient's chat
          push(ref(db, `users/${selectedUser}/chats/${currentUser}`), messageData);

          // Clear input
          messageInput.value = '';
     }
}

// Event listeners
sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
     if (e.key === 'Enter') {
          sendMessage();
     }
});

// Register current user in users list
const userRef = ref(db, `users/${currentUser}`);
set(userRef, { lastSeen: Date.now() }); // Use set instead of push for user registration
