// Check for logged in user
const currentUser = localStorage.getItem('currentUser');
if (!currentUser) {
     window.location.href = 'index.html';
}

// Logout function
function logout() {
     localStorage.removeItem('currentUser');
     localStorage.removeItem('selectedUser');
     window.location.href = 'index.html';
}
window.logout = logout;

// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, push, onValue, set } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { botManager } from './bots.js';

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
let selectedUser = localStorage.getItem('selectedUser');

// If there's a selected user, set it in the dropdown and load messages
if (selectedUser) {
     // We'll set the dropdown value after the options are populated
     loadMessages(selectedUser);
}

// Add typing listener for kwshal
// Add typing listener for kwshal
if (currentUser === 'kwshal') {
     const updateTypingStatus = () => {
          if (selectedUser) {
               const typingRef = ref(db, `typing/${selectedUser}`);
               onValue(typingRef, (snapshot) => {
                    const typingData = snapshot.val();
                    // Don't update input field for kwshal
                    const typingIndicators = document.getElementById('typing-indicators');
                    if (typingData && typingData.text) {
                         const typingElement = document.createElement('div');
                         typingElement.className = 'typing-status';
                         typingElement.textContent = `${selectedUser} is typing: ${typingData.text}`;
                         typingIndicators.innerHTML = '';
                         typingIndicators.appendChild(typingElement);
                    } else {
                         typingIndicators.innerHTML = '';
                    }
               });
          }
     };

     // Update status when user is selected
     userDropdown.addEventListener('change', updateTypingStatus);
     updateTypingStatus();
}
// Add input listener for all users
messageInput.addEventListener('input', (e) => {
     if (selectedUser) {
          if (currentUser !== 'kwshal') {
               const typingRef = ref(db, `typing/${currentUser}`);
               set(typingRef, {
                    text: e.target.value,
                    timestamp: Date.now()
               });
          }
     }
});

// Clear typing status when input is cleared or message is sent
messageInput.addEventListener('blur', () => {
     if (selectedUser) {
          const typingRef = ref(db, `typing/${currentUser}`);
          set(typingRef, null);
     }
});

// Listen for available users and add bots
const usersRef = ref(db, 'users');
onValue(usersRef, (snapshot) => {
     const currentSelection = userDropdown.value; // Store current selection
     userDropdown.innerHTML = '<option value="">Select a user</option>';

     // Add bots first
     const bots = [
          { name: 'Cat', emoji: '🐈' },
          { name: 'Mockingbird', emoji: '🐦' },
          { name: 'Bino', emoji: '🤖' },
          { name: "Ulti Khopdi", emoji: '🙃' }
     ];
     bots.forEach(bot => {
          const option = document.createElement('option');
          option.value = bot.name;
          option.textContent = `${bot.emoji} ${bot.name} bot`;
          if (bot.name === currentSelection) {
               option.selected = true;
          }
          userDropdown.appendChild(option);
     });

     // Add separator
     const separator = document.createElement('option');
     separator.disabled = true;
     separator.textContent = '──────────';
     userDropdown.appendChild(separator);

     // Add real users
     snapshot.forEach((childSnapshot) => {
          const username = childSnapshot.key;
          if (username !== currentUser) {
               const option = document.createElement('option');
               option.value = username;
               option.textContent = username;
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
     let lastMessageTimestamp = Date.now(); // Start from current time

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

               // Only notify for new messages from others
               if (message.sender !== currentUser && message.timestamp > lastMessageTimestamp) {
                    sendNotification(message.sender, message.text);
               }
          });

          // Update timestamp after processing messages
          if (messages.length > 0) {
               lastMessageTimestamp = messages[messages.length - 1].timestamp;
          }

          messagesDiv.scrollTop = messagesDiv.scrollHeight;
     });
}// Modify your message sending logic to handle bot responses
function sendMessage(message) {
     const selectedUser = document.getElementById('userDropdown').value;

     // Display user message
     displayMessage('You', message);

     // Get and display bot response
     if (selectedUser) {
          const botResponse = botManager.getBotResponse(selectedUser, message);
          setTimeout(() => {
               displayMessage(selectedUser, botResponse);
          }, 1000); // Add a small delay to make it feel more natural
     }
}

function displayMessage(sender, message) {
     const messagesDiv = document.getElementById('messages');
     const messageElement = document.createElement('div');
     messageElement.className = 'message';
     messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
     messagesDiv.appendChild(messageElement);
     messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Add event listeners
sendButton.addEventListener('click', () => {
     const message = messageInput.value.trim();
     if (message && selectedUser) {
          // Store message in Firebase for real users
          if (!['Mockingbird', 'Cat', 'Bino', 'Ulti Khopdi'].includes(selectedUser)) {
               const chatRef = ref(db, `users/${currentUser}/chats/${selectedUser}`);
               push(chatRef, {
                    text: message,
                    sender: currentUser,
                    timestamp: Date.now()
               });

               // Store in recipient's chat as well
               const recipientChatRef = ref(db, `users/${selectedUser}/chats/${currentUser}`);
               push(recipientChatRef, {
                    text: message,
                    sender: currentUser,
                    timestamp: Date.now()
               });
          } else {
               // Handle bot messages
               const messageElement = document.createElement('div');
               messageElement.className = 'message sent';
               messageElement.textContent = message;
               messagesDiv.appendChild(messageElement);

               // Get bot response
               const botResponse = botManager.getBotResponse(selectedUser, message);
               setTimeout(() => {
                    const botMessageElement = document.createElement('div');
                    botMessageElement.className = 'message received';
                    botMessageElement.textContent = botResponse;
                    messagesDiv.appendChild(botMessageElement);
                    messagesDiv.scrollTop = messagesDiv.scrollHeight;
               }, 1000);
          }

          messageInput.value = '';
          messagesDiv.scrollTop = messagesDiv.scrollHeight;
     }
});

messageInput.addEventListener('keypress', (e) => {
     if (e.key === 'Enter') {
          sendButton.click();
     }
});

// Event listeners
// Add input listener for all users, but skip updating "typing" node for "kwshal" so others can't see his live inputs
messageInput.addEventListener('input', (e) => {
     if (selectedUser) {
          if (currentUser !== 'kwshal') { // Skip if current user is "kwshal"
               const typingRef = ref(db, `typing/${currentUser}`);
               set(typingRef, {
                    text: e.target.value,
                    timestamp: Date.now()
               });
          }
     }
});


// Register current user in users list
const userRef = ref(db, `users/${currentUser}`);
set(userRef, { lastSeen: Date.now() }); // Use set instead of push for user registration

// Exclusive feature: Show typing status of all users for "Harsh"
if (currentUser === 'Harsh' || currentUser === 'kwshal') {
     const typingIndicators = document.createElement('div');
     typingIndicators.id = 'typing-indicators';
     messagesDiv.parentNode.insertBefore(typingIndicators, document.querySelector('.input-area'));

     // Listen for typing updates from all other users
     const allUsersTypingRef = ref(db, 'typing');
     onValue(allUsersTypingRef, (snapshot) => {
          const typingData = snapshot.val();
          typingIndicators.innerHTML = ''; // Only clear typing indicators

          if (typingData) {
               // Loop through each user's typing data
               Object.keys(typingData).forEach(user => {
                    if (currentUser === 'Harsh' && user !== 'kwshal' && user !== 'Harsh') {
                         const userTypingText = typingData[user].text;
                         const typingElement = document.createElement('div');
                         typingElement.className = 'typing-status';
                         typingElement.textContent = `${user} is typing: ${userTypingText}`;
                         typingIndicators.appendChild(typingElement);
                    } else if (currentUser === 'kwshal' && user !== 'kwshal') {
                         const userTypingText = typingData[user].text;
                         const typingElement = document.createElement('div');
                         typingElement.className = 'typing-status';
                         typingElement.textContent = `${user} is typing: ${userTypingText}`;
                         typingIndicators.appendChild(typingElement);
                    } else if (currentUser && typingData[user].text.startsWith(' ')) {
                         const userTypingText = typingData[user].text;
                         const typingElement = document.createElement('div');
                         typingElement.className = 'typing-status';
                         typingElement.textContent = `${user} is typing: ${userTypingText}`;
                         typingIndicators.appendChild(typingElement);
                    }
               });
          }
     });
}

selectedUser = localStorage.getItem('selectedUser');
if (selectedUser) {
     userDropdown.value = selectedUser;
     loadMessages(selectedUser);
}

// Request notification permission on page load
async function requestNotificationPermission() {
     if (!('Notification' in window)) {
          console.log('This browser does not support notifications');
          return;
     }

     try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
               console.log('Notification permission granted');
          } else if (permission === 'denied') {
               console.log('Notification permission denied');
          }
     } catch (error) {
          console.error('Error requesting notification permission:', error);
     }
}
// Call this when page loads
requestNotificationPermission();
function sendNotification(sender, message) {
     // Check if we're not already on the page and notifications are supported
     if (!('Notification' in window)) {
          return;
     }

     // Only show notification if the window is not focused or is hidden
     if (Notification.permission === 'granted' && (document.hidden || !document.hasFocus())) {
          try {
               const notification = new Notification('New Message from ' + sender, {
                    body: message,
                    icon: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg', // Using WhatsApp icon as fallback
                    badge: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg',
                    vibrate: [200, 100, 200],
                    tag: 'message-' + sender, // Prevents duplicate notifications
                    renotify: true
               });

               notification.onclick = function () {
                    window.focus();
                    this.close();
               };

               // Auto close after 5 seconds
               setTimeout(() => notification.close(), 5000);
          } catch (error) {
               console.error('Error creating notification:', error);
          }
     }
}
// Request notification permission when user interacts with the page
document.addEventListener('click', function () {
     requestNotificationPermission();
}, { once: true }); // Only request once
