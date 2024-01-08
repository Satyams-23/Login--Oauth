// Server-side (Node.js)
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
// Handle WebSocket connections
io.on('connection', (socket) => {
    console.log('Brand connected:', socket.id);

    // Simulate real-time updates
    setInterval(() => {
        const randomFollowerCount = Math.floor(Math.random() * 100000);
        io.emit('instagramUpdate', { followerCount: randomFollowerCount });
    }, 5000); // Update every 5 seconds
});

server.listen(3000, () => {
    console.log('Server listening on port 3000');
});
