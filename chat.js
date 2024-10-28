// Function to get or create a chat room between two users
async function getChatRoomId(user1, user2) {
     // Sort IDs to ensure consistent chat room ID
     const sortedUsers = [user1, user2].sort();
     const chatRoomId = `${sortedUsers[0]}_${sortedUsers[1]}`;

     // Check if chat room exists, if not create it
     const chatRef = ref(db, `chats/${chatRoomId}`);
     const snapshot = await get(chatRef);

     if (!snapshot.exists()) {
          // Create new chat room with participants
          await set(ref(db, `chats/${chatRoomId}/participants`), {
               [user1]: true,
               [user2]: true
          });

          // Add chat reference to both users
          await Promise.all([
               set(ref(db, `users/${user1}/chatRooms/${chatRoomId}`), true),
               set(ref(db, `users/${user2}/chatRooms/${chatRoomId}`), true)
          ]);
     }

     return chatRoomId;
}

// Updated loadMessages function
async function loadMessages(otherUser) {
     const chatRoomId = await getChatRoomId(currentUser, otherUser);
     const chatRef = ref(db, `chats/${chatRoomId}/messages`);

     // Remove any existing listener
     if (window.currentMessageListener) {
          window.currentMessageListener();
     }

     window.currentMessageListener = onValue(chatRef, (snapshot) => {
          console.log('Loading messages');
          messagesDiv.innerHTML = '';

          snapshot.forEach((childSnapshot) => {
               const message = childSnapshot.val();
               const messageElement = document.createElement('div');
               messageElement.className = `message ${message.sender === currentUser ? 'sent' : 'received'}`;

               // Create message content
               const messageText = document.createElement('div');
               messageText.className = 'message-text';
               messageText.textContent = message.text;

               // Create timestamp
               const timestamp = document.createElement('div');
               timestamp.className = 'message-timestamp';
               timestamp.textContent = new Date(message.timestamp).toLocaleTimeString();

               // Append elements
               messageElement.appendChild(messageText);
               messageElement.appendChild(timestamp);
               messagesDiv.appendChild(messageElement);
          });

          // Scroll to bottom after new messages
          messagesDiv.scrollTop = messagesDiv.scrollHeight;
     });
}

// Updated sendMessage function
async function sendMessage() {
     if (!selectedUser) {
          alert('Please select a user to chat with first');
          return;
     }

     const text = messageInput.value.trim();
     if (text) {
          try {
               const chatRoomId = await getChatRoomId(currentUser, selectedUser);
               const messageData = {
                    text: text,
                    sender: currentUser,
                    timestamp: Date.now()
               };

               // Save message in the chat room
               await push(ref(db, `chats/${chatRoomId}/messages`), messageData);

               // Clear input
               messageInput.value = '';
          } catch (error) {
               console.error('Error sending message:', error);
               alert('Failed to send message. Please try again.');
          }
     }
}
