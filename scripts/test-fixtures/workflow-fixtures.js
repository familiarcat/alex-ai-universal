/**
 * 🧪 Test Fixtures for Workflows
 * 
 * Common test data and fixtures for E2E tests.
 * Allows tests to run without requiring live n8n instance.
 */

const fixtures = {
  // Knowledge Ingest workflow fixture
  knowledgeIngestWorkflow: {
    id: 'c0HYTqTFtktCE3Fk',
    name: 'Alex AI Knowledge Base RAG Ingestion',
    active: true,
    nodes: [
      {
        id: 'webhook-node',
        type: 'n8n-nodes-base.webhook',
        name: 'Webhook Trigger',
        parameters: {
          path: 'ingest-knowledge',
          httpMethod: 'POST'
        }
      }
    ]
  },

  // Test payloads
  payloads: {
    knowledgeIngest: {
      body: {
        title: 'Test Ingestion',
        text: 'This is a test ingestion payload.',
        content: 'Test content for ingestion verification',
        tags: ['test', 'fixture'],
        source: 'test-fixture',
        doc_id: `TEST_FIXTURE_${Date.now()}`,
        crewMember: 'data',
        knowledgeType: 'test',
        priority: 'low',
        platform: 'test-fixture',
        sessionId: `fixture-test-${Date.now()}`,
        metadata: {
          date: new Date().toISOString().split('T')[0],
          type: 'test',
          test: true,
          fixture: true
        }
      }
    },
    knowledgeQuery: {
      query: 'test query from fixture',
      limit: 5,
      crewMember: 'data'
    },
    knowledgeEmbed: {
      text: 'Test text for embedding generation from fixture',
      model: 'text-embedding-ada-002'
    },
    knowledgeArchive: {
      doc_id: `TEST_DOC_FIXTURE_${Date.now()}`,
      soft_delete: true
    }
  },

  // Expected webhook responses
  responses: {
    knowledgeIngest: {
      success: {
        status: 200,
        body: {
          success: true,
          message: 'Knowledge ingested successfully',
          doc_id: 'TEST_FIXTURE_123'
        }
      },
      notRegistered: {
        status: 404,
        body: {
          code: 404,
          message: 'The requested webhook "POST ingest-knowledge" is not registered.'
        }
      }
    },
    knowledgeQuery: {
      success: {
        status: 200,
        body: {
          results: [
            { doc_id: '1', content: 'Test result 1', score: 0.95 },
            { doc_id: '2', content: 'Test result 2', score: 0.90 }
          ]
        }
      }
    }
  },

  // Workflow status fixtures
  workflowStatus: {
    active: {
      id: 'c0HYTqTFtktCE3Fk',
      name: 'Alex AI Knowledge Base RAG Ingestion',
      active: true,
      updatedAt: new Date().toISOString()
    },
    inactive: {
      id: 'c0HYTqTFtktCE3Fk',
      name: 'Alex AI Knowledge Base RAG Ingestion',
      active: false,
      updatedAt: new Date().toISOString()
    }
  }
};

/**
 * Get fixture by name
 */
function getFixture(name) {
  return fixtures[name] || null;
}

/**
 * Get test payload by type
 */
function getPayload(type) {
  return fixtures.payloads[type] || null;
}

/**
 * Get expected response by webhook type
 */
function getExpectedResponse(webhookType, scenario = 'success') {
  return fixtures.responses[webhookType]?.[scenario] || null;
}

/**
 * Create a mock workflow response
 */
function createMockWorkflowResponse(workflowId, active = true) {
  return {
    id: workflowId,
    name: 'Alex AI Knowledge Base RAG Ingestion',
    active: active,
    nodes: fixtures.knowledgeIngestWorkflow.nodes,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };
}

/**
 * Create a mock webhook response
 */
function createMockWebhookResponse(status, body, headers = {}) {
  return {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: typeof body === 'string' ? body : JSON.stringify(body)
  };
}

module.exports = {
  fixtures,
  getFixture,
  getPayload,
  getExpectedResponse,
  createMockWorkflowResponse,
  createMockWebhookResponse
};

