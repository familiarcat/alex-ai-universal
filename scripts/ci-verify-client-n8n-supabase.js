#!/usr/bin/env node
"use strict";

const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const { loadCrewCredentials } = require("./utils/load-crew-credentials");

const creds = loadCrewCredentials();
const N8N_URL = creds.n8n.baseUrl;
const N8N_API_KEY = creds.n8n.apiKey;
const N8N_EMAIL = creds.n8n.email;
const N8N_PASSWORD = creds.n8n.password;

if (!N8N_URL) {
  console.error("❌ N8N_URL is not configured. Set N8N_URL in your environment.");
  process.exit(1);
}
if (!N8N_API_KEY) {
  console.error("❌ N8N API key not found. Set N8N_OWNER_API_KEY or N8N_API_KEY.");
  process.exit(1);
}

const VERIFY_WORKFLOW_ID = process.env.N8N_VERIFY_WORKFLOW_ID;

function urlJoin(base, path) {
  const sanitizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const sanitizedPath = path.startsWith("/") ? path.slice(1) : path;
  return `${sanitizedBase}/${sanitizedPath}`;
}

async function fetchCrewWorkflows() {
  const response = await axios.get(urlJoin(N8N_URL, "api/v1/workflows"), {
    headers: {
      "X-N8N-API-KEY": N8N_API_KEY,
    },
  });

  const workflows = response.data.data || response.data || [];
  return workflows.filter((workflow) =>
    /CREW|COORDINATION|KNOWLEDGE INGEST|ANTI-HALLUCINATION|PROJECT/i.test(
      workflow.name
    )
  );
}

async function fetchWorkflowDetail(id) {
  const response = await axios.get(urlJoin(N8N_URL, `api/v1/workflows/${id}`), {
    headers: {
      "X-N8N-API-KEY": N8N_API_KEY,
    },
  });
  return response.data;
}

async function triggerWebhook(path, method, payload) {
  if (!path) throw new Error("Missing webhook path");
  const webhookUrl = urlJoin(N8N_URL, `webhook/${path}`);
  const requestConfig = {
    method,
    url: webhookUrl,
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 10000,
  };
  if (N8N_EMAIL && N8N_PASSWORD) {
    requestConfig.auth = {
      username: N8N_EMAIL,
      password: N8N_PASSWORD,
    };
  }
  if (method === "GET" || method === "DELETE") requestConfig.params = payload;
  else requestConfig.data = payload;
  return axios(requestConfig);
}

async function triggerVerification(testRunId) {
  if (!VERIFY_WORKFLOW_ID) return null;
  try {
    const response = await axios.post(
      urlJoin(N8N_URL, `rest/workflows/${VERIFY_WORKFLOW_ID}/run`),
      {
        manual: true,
        query: { testRunId },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-N8N-API-KEY": N8N_API_KEY,
        },
      }
    );
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: `Verification workflow failed: ${
        error.response?.status || error.message
      }`,
    };
  }
}

async function testWebhook({ workflow, node, testRunId }) {
  const method = (node.parameters?.httpMethod || "POST").toUpperCase();
  const path = node.parameters?.path;
  const payload = {
    testRunId,
    workflowId: workflow.id,
    webhookPath: path,
    timestamp: new Date().toISOString(),
  };

  const result = {
    workflow: workflow.name,
    webhook: path,
    method,
    webhookStatus: {
      success: false,
      responseStatus: 0,
      responseBody: null,
      message: "",
    },
  };

  try {
    const response = await triggerWebhook(path, method, payload);
    result.webhookStatus = {
      success: response.status >= 200 && response.status < 300,
      responseStatus: response.status,
      responseBody: response.data,
      message: `HTTP ${response.status}`,
    };
  } catch (error) {
    const status = error.response?.status ?? 0;
    let message = `Request failed: HTTP ${status}`;
    if (status === 404) {
      message = 'Request failed: HTTP 404 (webhook not registered or workflow inaccessible)';
    } else if (status === 0) {
      message = 'Request failed: No response (network or undefined path)';
    }
    result.webhookStatus = {
      success: false,
      responseStatus: status,
      responseBody: error.response?.data,
      message,
    };
  }

  return result;
}

async function main() {
  console.log("🔍 Gathering crew workflows...");
  const workflows = await fetchCrewWorkflows();
  console.log(`   Found ${workflows.length} workflows to test`);

  const webhookNodes = [];
  for (const workflow of workflows) {
    const detail = await fetchWorkflowDetail(workflow.id);
    (detail.nodes || [])
      .filter((node) => node.type === "n8n-nodes-base.webhook")
      .forEach((node) => {
        webhookNodes.push({ workflow: detail, node });
      });
  }

  console.log(`   Identified ${webhookNodes.length} webhook endpoints`);
  if (webhookNodes.length === 0) {
    console.error("❌ No webhook nodes found to test");
    process.exit(1);
  }

  const testRunId = `${Date.now().toString(36)}-${crypto
    .randomBytes(4)
    .toString("hex")}`;
  console.log(`🧪 Test Run ID: ${testRunId}`);

  const results = [];
  for (const entry of webhookNodes) {
    const result = await testWebhook({
      workflow: entry.workflow,
      node: entry.node,
      testRunId,
    });
    results.push(result);
    const statusEmoji = result.webhookStatus.success ? "✅" : "❌";
    console.log(
      ` ${statusEmoji} ${result.workflow} → ${result.webhook} (${result.webhookStatus.message})`
    );
  }

  let verificationResult = null;
  if (VERIFY_WORKFLOW_ID) {
    console.log("🔁 Triggering verification workflow via n8n controller...");
    verificationResult = await triggerVerification(testRunId);
    if (verificationResult?.success) {
      console.log(`   ✅ Verification workflow succeeded: ${verificationResult.message || "OK"}`);
    } else {
      console.log(
        `   ❌ Verification workflow failed: ${verificationResult?.message || "Unknown error"}`
      );
    }
  } else {
    console.log("ℹ️  No verification workflow configured (set N8N_VERIFY_WORKFLOW_ID to enable)");
  }

  const webhookFailures = results.filter((r) => !r.webhookStatus.success);

  const summary = {
    testRunId,
    totals: {
      endpointsTested: results.length,
      webhookSuccesses: results.length - webhookFailures.length,
      webhookFailures: webhookFailures.length,
      verificationTriggered: Boolean(VERIFY_WORKFLOW_ID),
      verificationResult,
    },
    results,
  };

  const outputPath = process.env.DDD_VERIFY_OUTPUT || null;
  if (outputPath) {
    try {
      fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2));
      console.log(`📄 Detailed report written to ${outputPath}`);
    } catch (error) {
      console.warn(`⚠️  Failed to write report to ${outputPath}: ${error.message}`);
    }
  }

  if (webhookFailures.length === 0 && (verificationResult?.success !== false)) {
    console.log("🎉 Client ⇄ n8n ⇄ Supabase verification passed");
    process.exit(0);
  }

  console.error("❌ Verification failed. Investigate the summary above.");
  process.exit(1);
}

main().catch((error) => {
  console.error("❌ Test harness error:", error.message || error);
  process.exit(1);
});
