const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3003;

// Serve static files
app.use(express.static(path.join(__dirname)));
app.use(express.json());

// Sync API endpoints
app.post('/api/sync-status', (req, res) => {
  res.json({
    environment: 'deployed',
    status: 'connected',
    timestamp: new Date().toISOString(),
    serverTime: new Date().toISOString(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
    deployedData: {
      region: 'us-east-2',
      cloudProvider: 'AWS',
      isDeployed: true
    }
  });
});

app.post('/api/sync-toggle', (req, res) => {
  console.log('🔄 Deployed sync toggle:', req.body);
  res.json({
    environment: 'deployed',
    action: req.body.action,
    timestamp: new Date().toISOString(),
    status: 'acknowledged',
    message: `Deployed sync ${req.body.action} received`,
    targetEnvironment: 'local'
  });
});

app.listen(PORT, () => {
  console.log(`☁️  Deployed dashboard running on http://localhost:${PORT}`);
  console.log('🔄 Real-time sync toggle enabled');
});
