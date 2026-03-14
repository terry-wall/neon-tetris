const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve the game
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Neon Tetris server is running!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎮 Neon Tetris server running on http://localhost:${PORT}`);
});

module.exports = app;