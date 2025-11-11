#!/usr/bin/env node
"use strict";

const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");
const axios = require("axios");

const N8N_URL = process.env.N8N_URL || "https://n8n.pbradygeorgen.com";
const N8N_EMAIL = process.env.N8N_EMAIL;
const N8N_PASSWORD = process.env.N8N_PASSWORD;
const OUTPUT_DIR = process.env.TEST_PAYLOAD_OUTPUT || path.join(process.cwd(), "captured-test-payloads");
const WORKFLOW_IDS = process.env.N8N_WORKFLOW_IDS ? process.env.N8N_WORKFLOW_IDS.split(",") : [];

if (!N8N_EMAIL || !N8N_PASSWORD) {
  console.error("❌ N8N_EMAIL and N8N_PASSWORD are required");
  process.exit(1);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function fetchSessionCookies() {
  const response = await axios.post(
    `${N8N_URL.replace(/\/$/, "")}/rest/login`,
    {
      emailOrLdapLoginId: N8N_EMAIL,
      password: N8N_PASSWORD,
    },
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  const cookieHeader = response.headers["set-cookie"];
  if (!cookieHeader || cookieHeader.length === 0) {
    throw new Error("No session cookie returned from /rest/login");
  }
  return cookieHeader.map((cookie) => cookie.split(";")[0]);
}

async function captureTestPayload(workflowId, browser, cookies) {
  const page = await browser.newPage();
  const capturedRequests = [];

  const urlMeta = new URL(N8N_URL);
  const cookieObjects = cookies.map((cookie) => {
    const separatorIndex = cookie.indexOf("=");
    const name = cookie.slice(0, separatorIndex);
    const value = cookie.slice(separatorIndex + 1);
    return {
      name,
      value,
      domain: urlMeta.hostname,
      path: "/",
      httpOnly: true,
      secure: urlMeta.protocol === "https:",
    };
  });
  await page.setCookie(...cookieObjects);

  page.on("request", (request) => {
    const url = request.url();
    if (url.includes(`/rest/workflows/${workflowId}/run`) && request.method() === "POST") {
      capturedRequests.push({
        url,
        method: request.method(),
        headers: request.headers(),
        postData: request.postData(),
      });
    }
  });

  try {
    await page.goto(`${N8N_URL}/workflow/${workflowId}`, { waitUntil: "networkidle2" });

    await page.waitForSelector('[data-test-id="run-data-mode-selector"]', { timeout: 30000 });
    await page.click('[data-test-id="run-data-mode-selector"]');

    await page.waitForSelector('[data-test-id="run-data-mode-manual"]', { timeout: 10000 });
    await page.click('[data-test-id="run-data-mode-manual"]');

    await page.waitForSelector('[data-test-id="run-workflow-button"]', { timeout: 10000 });

    await Promise.all([
      page.click('[data-test-id="run-workflow-button"]'),
      page.waitForResponse((response) =>
        response.url().includes(`/rest/workflows/${workflowId}/run`) && response.status() === 200
      ),
    ]);

    if (capturedRequests.length === 0) {
      console.warn(`⚠️  No run payload captured for workflow ${workflowId}`);
    } else {
      const outputPath = path.join(OUTPUT_DIR, `${workflowId}-run-payload.json`);
      ensureDir(OUTPUT_DIR);
      fs.writeFileSync(outputPath, JSON.stringify(capturedRequests, null, 2));
      console.log(`✅ Captured payload for workflow ${workflowId}: ${outputPath}`);
    }
  } catch (error) {
    console.error(`❌ Failed to capture payload for workflow ${workflowId}:`, error.message || error);
  } finally {
    await page.close();
  }
}

async function main() {
  ensureDir(OUTPUT_DIR);

  const launchOptions = {
    headless: process.env.HEADLESS !== "false",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  };

  const browser = await puppeteer.launch(launchOptions);

  try {
    if (WORKFLOW_IDS.length === 0) {
      console.error("❌ Set N8N_WORKFLOW_IDS with a comma-separated list of workflow IDs to capture.");
      process.exit(1);
    }

    const cookies = await fetchSessionCookies();

    for (const workflowId of WORKFLOW_IDS) {
      await captureTestPayload(workflowId.trim(), browser, cookies);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error("❌ Fatal error:", error.message || error);
  process.exit(1);
});
