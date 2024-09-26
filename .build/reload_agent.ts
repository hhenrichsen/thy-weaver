// Create a new WebSocket connection
const socket = new WebSocket('ws://localhost:3000/ws');

// When the WebSocket is open, log a message
socket.addEventListener('open', () => {
    console.log('Connected to WebSocket server');
});

// Listen for messages from the server
socket.addEventListener('message', (event) => {
    console.log('Message from server', event.data);

    // If the message is 'update', reload the page
    if (event.data === 'update') {
        console.log('Received update message. Reloading page...');
        window.location.reload();
    }
});

// Handle WebSocket close event
socket.addEventListener('close', () => {
    console.log('WebSocket connection closed');
});

// Handle WebSocket error event
socket.addEventListener('error', (error) => {
    console.error('WebSocket error:', error);
});