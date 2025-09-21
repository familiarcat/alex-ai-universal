const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(__dirname));

// Main route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API route for Alex AI
app.get('/api/alex-ai', (req, res) => {
  res.json({
    status: 'active',
    version: '1.0.0-private',
    crew: [
      'Captain Picard',
      'Commander Data',
      'Commander Riker',
      'Lieutenant Commander Geordi',
      'Lieutenant Worf',
      'Counselor Troi',
      'Dr. Crusher',
      'Lieutenant Uhura',
      'Quark'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Alex AI Web Platform running on http://localhost:${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api/alex-ai`);
});
