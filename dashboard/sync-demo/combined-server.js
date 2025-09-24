const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());

// Serve static files for local
app.use('/local', express.static(path.join(__dirname, 'local-build')));
app.use('/deployed', express.static(path.join(__dirname, 'deployed-build')));

// Local dashboard route
app.get('/local', (req, res) => {
  res.sendFile(path.join(__dirname, 'local-build', 'index.html'));
});

// Deployed dashboard route
app.get('/deployed', (req, res) => {
  res.sendFile(path.join(__dirname, 'deployed-build', 'index.html'));
});

// Sync API endpoints
app.post('/api/sync-status', (req, res) => {
  const { environment } = req.body;
  res.json({
    environment: environment || 'unknown',
    status: 'connected',
    timestamp: new Date().toISOString(),
    serverTime: new Date().toISOString(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
    data: {
      port: process.env.PORT || 4000,
      nodeEnv: process.env.NODE_ENV || 'development',
      isLocal: environment === 'local',
      isDeployed: environment === 'deployed'
    }
  });
});

app.post('/api/sync-toggle', (req, res) => {
  const { environment, action } = req.body;
  console.log(`🔄 Sync toggle: ${environment} - ${action}`);
  res.json({
    environment: environment || 'unknown',
    action: action || 'unknown',
    timestamp: new Date().toISOString(),
    status: 'acknowledged',
    message: `Sync ${action} received from ${environment}`,
    targetEnvironment: environment === 'local' ? 'deployed' : 'local'
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Combined sync server running on http://localhost:${PORT}`);
  console.log(`🏠 Local dashboard: http://localhost:${PORT}/local`);
  console.log(`☁️  Deployed dashboard: http://localhost:${PORT}/deployed`);
  console.log('🔄 Real-time sync toggle enabled');
});
