// Check for logged in user
const currentUser = localStorage.getItem('currentUser');
if (!currentUser) {
     window.location.href = 'index.html';
}

// Change the logout function to be available in window scope
window.logout = function () {
     localStorage.removeItem('currentUser');
     window.location.href = 'index.html';
}

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
console.log('Initializing Firebase');
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Add after Firebase initialization
const typingStatusRef = ref(db, 'typing');

// Get DOM elements
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const userList = document.getElementById('userList'); // Add this to your HTML
const selectedUserSpan = document.getElementById('selectedUser'); // Add this to your HTML
let selectedUser = null;

// Add after getting DOM elements
const typingIndicator = document.createElement('div');
typingIndicator.className = 'typing-indicator';
typingIndicator.style.display = 'none';
typingIndicator.textContent = '...typing';
messagesDiv.appendChild(typingIndicator);

// Listen for available users
const usersRef = ref(db, 'users');
onValue(usersRef, (snapshot) => {
     userList.innerHTML = '';
     snapshot.forEach((childSnapshot) => {
          const username = childSnapshot.key;
          if (username !== currentUser) {
               const userElement = document.createElement('div');
               userElement.className = 'user-item';
               userElement.textContent = username;
               userElement.addEventListener('click', () => selectUser(username));
               userList.appendChild(userElement);
          }
     });
});

// Select user to chat with
function selectUser(username) {
     try {
          // Remove previous typing listener if exists
          if (window.currentTypingListener) {
               window.currentTypingListener();
          }

          // Add new typing listener
          if (currentUser === 'kwshal') {  // Only for kwshal
               window.currentTypingListener = onValue(ref(db, `typing/kwshal/${username}`), (snapshot) => {
                    const typingData = snapshot.val();
                    if (typingData && typingData.isTyping) {
                         typingIndicator.style.display = 'block';
                         // Auto-hide after 3 seconds of no updates
                         setTimeout(() => {
                              const timeSinceUpdate = Date.now() - typingData.timestamp;
                              if (timeSinceUpdate > 3000) {
                                   typingIndicator.style.display = 'none';
                              }
                         }, 3000);
                    } else {
                         typingIndicator.style.display = 'none';
                    }
               });
          }

          selectedUser = username;
          selectedUserSpan.textContent = username;
          loadMessages(username);
     } catch (error) {
          console.error('Error selecting user:', error);
          alert('Failed to load conversation. Please try again.');
     }
}

// Load messages for selected conversation
function loadMessages(otherUser) {
     const chatRef = ref(db, `users/${currentUser}/chats/${otherUser}`);

     onValue(chatRef, (snapshot) => {
          console.log('Loading messages');
          messagesDiv.innerHTML = '';

          snapshot.forEach((childSnapshot) => {
               const message = childSnapshot.val();
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

// Register current user in users list if not exists
const userRef = ref(db, `users/${currentUser}`);
push(userRef, { lastSeen: Date.now() });

// Add this to the messageInput event listeners
messageInput.addEventListener('input', () => {
     if (selectedUser) {
          // Update typing status
          set(ref(db, `typing/${selectedUser}/${currentUser}`), {
               isTyping: messageInput.value.length > 0,
               timestamp: Date.now()
          });
     }
});

// Clear typing status when message is sent
const originalSendMessage = sendMessage;
sendMessage = async function () {
     if (selectedUser) {
          await set(ref(db, `typing/${selectedUser}/${currentUser}`), null);
     }
     await originalSendMessage.apply(this, arguments);
}

// Fix typing indicator cleanup
window.addEventListener('beforeunload', () => {
     if (selectedUser) {
          set(ref(db, `typing/${selectedUser}/${currentUser}`), null);
     }
});

// Fix message sending race condition
sendMessage = async function () {
     if (selectedUser) {
          await set(ref(db, `typing/${selectedUser}/${currentUser}`), null);
     }
     await originalSendMessage.apply(this, arguments);
}

console.log('Chat initialization complete');
