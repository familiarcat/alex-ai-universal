const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Alex AI Sync Demo');
console.log('=============================');
console.log('');
console.log('📊 This demo will start both local and deployed versions');
console.log('🔄 Real-time sync toggle will demonstrate interaction');
console.log('');

// Start local server
console.log('🏠 Starting local dashboard...');
const localServer = spawn('node', ['local-server.js'], {
  cwd: path.join(__dirname, 'local-build'),
  stdio: 'inherit'
});

// Start deployed server
console.log('☁️  Starting deployed dashboard...');
const deployedServer = spawn('node', ['deployed-server.js'], {
  cwd: path.join(__dirname, 'deployed-build'),
  stdio: 'inherit'
});

// Handle process cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping sync demo...');
  localServer.kill();
  deployedServer.kill();
  process.exit(0);
});

console.log('');
console.log('✅ Sync demo started successfully!');
console.log('🏠 Local dashboard: http://localhost:3000');
console.log('☁️  Deployed dashboard: http://localhost:3001');
console.log('');
console.log('🔄 Use the sync toggles to demonstrate real-time interaction');
console.log('📊 Both dashboards will show sync status and activity');
console.log('');
console.log('Press Ctrl+C to stop the demo');
