#!/usr/bin/env node
"use strict";

const axios = require("axios");

const N8N_URL = process.env.N8N_URL || "https://n8n.pbradygeorgen.com";
const N8N_API_KEY = process.env.N8N_API_KEY;
const N8N_EMAIL = process.env.N8N_EMAIL;
const N8N_PASSWORD = process.env.N8N_PASSWORD;

if (!N8N_API_KEY || !N8N_EMAIL || !N8N_PASSWORD) {
  console.error("❌ N8N_API_KEY, N8N_EMAIL, and N8N_PASSWORD are required");
  process.exit(1);
}

function urlJoin(base, path) {
  const sanitizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const sanitizedPath = path.startsWith("/") ? path.slice(1) : path;
  return `${sanitizedBase}/${sanitizedPath}`;
}

async function fetchWorkflows() {
  const response = await axios.get(urlJoin(N8N_URL, "api/v1/workflows"), {
    headers: { "X-N8N-API-KEY": N8N_API_KEY },
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
    headers: { "X-N8N-API-KEY": N8N_API_KEY },
  });
  return response.data;
}

async function login() {
  const response = await axios.post(
    urlJoin(N8N_URL, "rest/login"),
    {
      emailOrLdapLoginId: N8N_EMAIL,
      password: N8N_PASSWORD,
    },
    {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    }
  );
  const setCookie = response.headers["set-cookie"];
  if (!setCookie || setCookie.length === 0) {
    throw new Error("Failed to obtain session cookie");
  }
  return setCookie.map((cookie) => cookie.split(";")[0]).join("; ");
}

async function runWorkflow(cookie, workflowData) {
  const payload = {
    workflowData,
    startNodes: [],
    manual: true,
  };

  const endpoint = urlJoin(N8N_URL, `rest/workflows/${workflowData.id}/run`);
  const response = await axios.post(endpoint, payload, {
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    withCredentials: true,
    timeout: 20000,
  });
  return response.data;
}

async function main() {
  console.log("🔐 Logging into n8n...");
  const cookie = await login();
  console.log("   Session established");

  console.log("🔍 Fetching crew workflows...");
  const workflows = await fetchWorkflows();
  console.log(`   Found ${workflows.length} workflows`);

  let successCount = 0;
  let failureCount = 0;

  for (const workflow of workflows) {
    try {
      const detail = await fetchWorkflowDetail(workflow.id);
      console.log(`▶️  Running workflow: ${detail.name}`);
      const result = await runWorkflow(cookie, detail);
      successCount += 1;
      console.log(
        `   ✅ Execution started (executionId: ${result.executionId || "unknown"})`
      );
    } catch (error) {
      failureCount += 1;
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;
      console.log(`   ❌ Failed: ${status || ""} ${message}`);
    }
  }

  console.log("\nSummary:");
  console.log(`   Successful executions: ${successCount}`);
  console.log(`   Failed executions: ${failureCount}`);

  if (failureCount > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("❌ Fatal error:", error.message || error);
  process.exit(1);
});
