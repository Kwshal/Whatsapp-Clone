function loadMessages(otherUser) {
     const chatRef = ref(db, `users/${currentUser}/chats/${otherUser}`);

     // Remove any existing listener before adding a new one
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

async function sendMessage() {
     if (!selectedUser) {
          alert('Please select a user to chat with first');
          return;
     }

     const text = messageInput.value.trim();
     if (text) {
          try {
               const messageData = {
                    text: text,
                    sender: currentUser,
                    timestamp: Date.now()
               };

               // Save message in both users' chats
               await Promise.all([
                    push(ref(db, `users/${currentUser}/chats/${selectedUser}`), messageData),
                    push(ref(db, `users/${selectedUser}/chats/${currentUser}`), messageData)
               ]);

               // Clear input
               messageInput.value = '';
          } catch (error) {
               console.error('Error sending message:', error);
               alert('Failed to send message. Please try again.');
          }
     }
}
