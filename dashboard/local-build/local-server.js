const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname)));
app.use(express.json());

// Sync API endpoints
app.post('/api/sync-status', (req, res) => {
  res.json({
    environment: 'local',
    status: 'connected',
    timestamp: new Date().toISOString(),
    serverTime: new Date().toISOString(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
    localData: {
      port: PORT,
      nodeEnv: 'development',
      isLocal: true
    }
  });
});

app.post('/api/sync-toggle', (req, res) => {
  console.log('🔄 Local sync toggle:', req.body);
  res.json({
    environment: 'local',
    action: req.body.action,
    timestamp: new Date().toISOString(),
    status: 'acknowledged',
    message: `Local sync ${req.body.action} received`,
    targetEnvironment: 'deployed'
  });
});

app.listen(PORT, () => {
  console.log(`🏠 Local dashboard running on http://localhost:${PORT}`);
  console.log('🔄 Real-time sync toggle enabled');
});
