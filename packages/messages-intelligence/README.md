# 🖖 Alex AI Messages Intelligence

**Apple Messages conversation analysis and export with Star Trek crew-based intelligence**

## 🎯 Prime Directive Compliance

**ZERO-ARTIFACT GUARANTEE:** This system maintains complete local processing with no external data transmission, ensuring your Messages data remains private and secure.

## 🚀 Features

### ✅ **Core Capabilities**
- **Natural Language Interface** - Ask questions in plain English
- **Crew-Based Analysis** - 9 specialized AI crew members with unique expertise
- **Dual Format Export** - Markdown and PDF with embedded images
- **Conversation Intelligence** - Sentiment analysis, topic extraction, action items
- **Date Range Selection** - Export specific time periods
- **Image Processing** - Automatic image optimization and organization

### ✅ **Alex AI Crew Integration**
- **Captain Picard** - Strategic leadership and diplomatic analysis
- **Commander Data** - Technical data analysis and pattern recognition
- **Worf** - Security assessment and risk analysis
- **Geordi La Forge** - Engineering solutions and innovation
- **Beverly Crusher** - Quality assurance and comprehensive analysis
- **Deanna Troi** - Psychological and communication analysis
- **William Riker** - Operations and workflow management
- **Tasha Yar** - Performance optimization and efficiency
- **Quark** - Business intelligence and cost analysis

## 📦 Installation

### Prerequisites
- macOS (required - uses Apple Messages database)
- Node.js 18 or higher
- Terminal with Full Disk Access

### Step 1: Install Package
```bash
cd /path/to/alex-ai-universal/packages/messages-intelligence
npm install
```

### Step 2: Grant Full Disk Access
**CRITICAL** - The system needs access to your Messages database:

1. Open **System Preferences** → **Security & Privacy** → **Privacy**
2. Select **Full Disk Access** from the left sidebar
3. Click the lock icon and authenticate
4. Click the **+** button
5. Navigate to `/Applications/Utilities/` and add **Terminal.app**
6. Restart Terminal

### Step 3: Build Package
```bash
npm run build
```

## 🖖 Usage

### Natural Language Interface
```bash
# Start the interactive interface
npm start

# Or run directly
node dist/index.js
```

### Example Commands
```
Alex AI > list conversations
Alex AI > Captain Picard, analyze my conversation with John from last month
Alex AI > Commander Data, extract technical specifications from my engineering chat
Alex AI > export conversation with Sarah from 2024-01-01 to 2024-12-31
Alex AI > Quark, analyze my business negotiations for cost efficiency
```

### Programmatic Usage
```typescript
import { AlexAIMessagesIntelligence } from '@alex-ai/messages-intelligence';

const messagesIntelligence = new AlexAIMessagesIntelligence();

// Get conversations
const conversations = await messagesIntelligence.getExporter().getConversations();

// Export conversation
const result = await messagesIntelligence.getExporter().exportConversation({
  conversationId: 'conversation-id',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
  outputDirectory: '/path/to/output',
  includeImages: true,
  format: 'both'
});

// Analyze conversation
const analysis = await messagesIntelligence.getAnalyzer().analyzeConversation(
  conversation, 
  messages
);
```

## 🧠 Crew Analysis Examples

### Strategic Analysis (Captain Picard)
```
Captain Picard, analyze my conversation with the client and provide strategic insights for our next meeting.

Output: Strategic assessment including:
- Communication effectiveness metrics
- Key topics and themes
- Sentiment analysis
- Strategic recommendations
- Risk assessment
```

### Technical Analysis (Commander Data)
```
Commander Data, extract all technical specifications and requirements mentioned in my engineering discussions from last month.

Output: Technical analysis including:
- Data metrics and patterns
- Technical specifications extracted
- Pattern recognition results
- Technical recommendations
```

### Security Analysis (Worf)
```
Worf, review my security-related conversations and identify any potential vulnerabilities or concerns.

Output: Security assessment including:
- Threat analysis
- Security observations
- Risk factors
- Security recommendations
```

### Business Analysis (Quark)
```
Quark, analyze my business negotiations and provide cost-benefit recommendations for the proposed deals.

Output: Business intelligence including:
- Cost-benefit assessment
- Profit optimization opportunities
- Revenue stream analysis
- Cost efficiency recommendations
```

## 🔧 N8N Integration

### Workflow Templates
The package includes N8N workflow templates for:
- **Automated Conversation Analysis** - Scheduled analysis of conversations
- **Trigger-Based Export** - Export conversations based on specific triggers
- **Crew Response Integration** - Automatic crew member analysis
- **RAG System Integration** - Feed conversation insights into RAG system

### Example N8N Workflow
```json
{
  "name": "Alex AI Messages Analysis",
  "nodes": [
    {
      "name": "Trigger",
      "type": "n8n-nodes-base.scheduleTrigger"
    },
    {
      "name": "Messages Intelligence",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "http://localhost:3000/api/messages-intelligence",
        "method": "POST",
        "body": {
          "crewMember": "Captain Picard",
          "analysisType": "strategic",
          "conversationId": "{{$json.conversationId}}"
        }
      }
    }
  ]
}
```

## 🏗️ Architecture

### Core Components
```
src/
├── messages-exporter.ts      # Core export functionality
├── conversation-analyzer.ts  # Analysis and insights
├── natural-language-interface.ts # NLI for user interaction
├── crew-integration.ts       # Crew member integration
├── types.ts                  # TypeScript interfaces
└── index.ts                  # Main entry point
```

### Integration Points
- **Alex AI Universal Core** - Seamless integration with existing crew system
- **RAG System** - Conversation insights feed into knowledge base
- **N8N Workflows** - Automation and workflow integration
- **Natural Language Processing** - Intent recognition and parsing

## 🔒 Privacy & Security

### Data Protection
- **Local Processing Only** - No data leaves your machine
- **Read-Only Database Access** - Messages database accessed read-only
- **Temporary File Cleanup** - All temporary files automatically removed
- **User-Controlled Exports** - You control where data is saved

### Security Features
- **Permission-Based Access** - Requires explicit Full Disk Access
- **Secure File Handling** - Encrypted temporary file processing
- **Audit Trail** - Complete logging of all operations
- **Data Isolation** - Conversation data isolated from other processes

## 📊 Analysis Capabilities

### Conversation Intelligence
- **Sentiment Analysis** - Positive, negative, neutral, mixed sentiment detection
- **Topic Extraction** - Key topics and themes identification
- **Communication Patterns** - Response time and engagement analysis
- **Action Items** - Automatic extraction of tasks and commitments
- **Decision Tracking** - Identification of decisions made in conversations

### Crew-Specific Insights
- **Strategic Leadership** - Captain Picard's diplomatic and strategic analysis
- **Technical Precision** - Commander Data's logical and data-driven insights
- **Security Assessment** - Worf's security and risk analysis
- **Business Intelligence** - Quark's cost-benefit and profit analysis

## 🚀 Advanced Features

### Natural Language Processing
- **Intent Recognition** - Understands natural language requests
- **Context Awareness** - Maintains conversation context
- **Multi-Intent Processing** - Handles complex requests
- **Error Recovery** - Graceful handling of ambiguous requests

### Export Options
- **Multiple Formats** - Markdown, PDF, HTML
- **Image Optimization** - Automatic image compression and organization
- **Custom Date Ranges** - Flexible time period selection
- **Batch Processing** - Export multiple conversations simultaneously

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suite
npm test -- --grep "MessagesExporter"
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Troubleshooting

### Common Issues

**"Error accessing Messages database"**
- Ensure Terminal has Full Disk Access
- Restart Terminal after granting permissions
- Close Messages app before running

**"Cannot find module 'better-sqlite3'"**
- Run `npm install` in the package directory
- Ensure Node.js 18+ is installed

**"No conversations showing up"**
- Verify Messages app has conversations
- Check database path: `~/Library/Messages/chat.db`

**"Images not exporting"**
- Check attachment path: `~/Library/Messages/Attachments`
- Some older attachments may have been deleted

## 🖖 Alex AI Universal Integration

This package is designed to integrate seamlessly with the Alex AI Universal ecosystem:

- **Crew System Integration** - All 9 crew members can analyze conversations
- **RAG System Enhancement** - Conversation insights feed into knowledge base
- **N8N Workflow Automation** - Automated conversation analysis workflows
- **Natural Language Interface** - Consistent with Alex AI Universal NLI

---

**"Make it so, Number One."** - Captain Picard

*Alex AI Messages Intelligence - Engaging conversation analysis with Star Trek crew expertise.*
