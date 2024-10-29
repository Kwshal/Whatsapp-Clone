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
               window.location.href = 'chat.html';
          } else {
               alert('Please enter a username');
          }
     });

     registerButton.addEventListener('click', () => {
          const username = usernameInput.value.trim();
          if (username) {
               // For now, just do the same as login
               localStorage.setItem('currentUser', username);
               window.location.href = 'chat.html';
          } else {
               alert('Please enter a username');
          }
     });

     // Allow Enter key to trigger login
     passwordInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
               loginButton.click();
          }
     });
});

