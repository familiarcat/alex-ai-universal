/**
 * Test script for live preview updates
 * Demonstrates real-time content updates to the preview dashboard
 */

const http = require('http');

class LivePreviewTester {
  constructor() {
    this.previewUrl = 'http://localhost:3002';
    this.crewMembers = [
      { icon: '🖖', name: 'Captain Picard', role: 'Strategic Commander' },
      { icon: '🖖', name: 'Commander Riker', role: 'Executive Officer' },
      { icon: '🤖', name: 'Commander Data', role: 'Technical Operations' },
      { icon: '🔧', name: 'Commander La Forge', role: 'Chief Engineering' },
      { icon: '🛡️', name: 'Lieutenant Worf', role: 'Security Officer' },
      { icon: '💭', name: 'Counselor Troi', role: 'Ship\'s Counselor' },
      { icon: '🏥', name: 'Dr. Crusher', role: 'Chief Medical Officer' },
      { icon: '📡', name: 'Lieutenant Uhura', role: 'Communications Officer' },
      { icon: '💰', name: 'Quark', role: 'Business Operations' }
    ];
  }

  /**
   * Send HTTP request to preview server
   */
  async sendRequest(path, data) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(data);
      
      const options = {
        hostname: 'localhost',
        port: 3002,
        path: path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = http.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        res.on('end', () => {
          resolve(JSON.parse(responseData));
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * Update content
   */
  async updateContent(title, subtitle) {
    try {
      const result = await this.sendRequest('/api/update', {
        title: title,
        subtitle: subtitle
      });
      console.log('✅ Content updated:', result);
    } catch (error) {
      console.error('❌ Error updating content:', error.message);
    }
  }

  /**
   * Update crew status
   */
  async updateCrewStatus(crewData) {
    try {
      const result = await this.sendRequest('/api/crew', crewData);
      console.log('✅ Crew status updated:', result);
    } catch (error) {
      console.error('❌ Error updating crew:', error.message);
    }
  }

  /**
   * Update status
   */
  async updateStatus(status, message) {
    try {
      const result = await this.sendRequest('/api/status', {
        status: status,
        message: message
      });
      console.log('✅ Status updated:', result);
    } catch (error) {
      console.error('❌ Error updating status:', error.message);
    }
  }

  /**
   * Run demonstration
   */
  async runDemo() {
    console.log('🎯 Starting Live Preview Demo...');
    console.log('🌐 Preview URL: http://localhost:3002');
    console.log('');

    // Wait a moment for server to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Demo 1: Update content
    console.log('📝 Demo 1: Updating content...');
    await this.updateContent(
      '🚀 Alex AI Live Preview - Updated!',
      'Real-time dashboard with instant updates'
    );
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Demo 2: Update crew status
    console.log('👥 Demo 2: Updating crew status...');
    await this.updateCrewStatus(this.crewMembers);
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Demo 3: Update status
    console.log('📊 Demo 3: Updating status...');
    await this.updateStatus('active', 'All systems operational');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Demo 4: Simulate crew member change
    console.log('🔄 Demo 4: Simulating crew member update...');
    const updatedCrew = this.crewMembers.map(member => ({
      ...member,
      role: member.role + ' (Updated)'
    }));
    await this.updateCrewStatus(updatedCrew);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Demo 5: Final status update
    console.log('✅ Demo 5: Final status update...');
    await this.updateStatus('complete', 'Live preview demo completed successfully');

    console.log('');
    console.log('🎉 Live Preview Demo Complete!');
    console.log('🌐 Check http://localhost:3002 to see real-time updates');
  }
}

// Run the demo
if (require.main === module) {
  const tester = new LivePreviewTester();
  tester.runDemo().catch(error => {
    console.error('Demo failed:', error);
    process.exit(1);
  });
}

module.exports = LivePreviewTester;
