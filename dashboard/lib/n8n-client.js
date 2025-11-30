const axios = require('axios');

function getConfig() {
  const url = process.env.N8N_URL || process.env.N8N_BASE_URL || process.env.NEXT_PUBLIC_N8N_URL || 'https://n8n.pbradygeorgen.com';
  const apiUrl = process.env.N8N_API_URL || `${url.replace(/\/$/, '')}/api/v1`;
  const webhookUrl = process.env.N8N_WEBHOOK_URL || `${url.replace(/\/$/, '')}/webhook`;
  const apiKey = process.env.N8N_API_KEY || process.env.N8N_API_TOKEN || '';
  return { url, apiUrl, webhookUrl, apiKey };
}

function getHttp(baseURL, apiKey) {
  const headers = {};
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
  return axios.create({ baseURL, headers, timeout: 10000 });
}

async function testN8nConnection() {
  const { url } = getConfig();
  try {
    const res = await axios.get(`${url.replace(/\/$/, '')}/healthz`, { timeout: 7000 });
    return { ok: true, status: res.status, url };
  } catch (error) {
    const message = error?.response?.status
      ? `HTTP ${error.response.status}`
      : (error?.message || 'Unknown error');
    return { ok: false, url, error: message };
  }
}

async function listWorkflows() {
  const { apiUrl, apiKey } = getConfig();
  const http = getHttp(apiUrl, apiKey);
  const res = await http.get('/workflows');
  return res.data;
}

async function triggerWebhook(path, payload) {
  const { webhookUrl } = getConfig();
  const url = `${webhookUrl.replace(/\/$/, '')}/${String(path).replace(/^\//, '')}`;
  const res = await axios.post(url, payload || {}, { timeout: 10000 });
  return res.data;
}

async function triggerWebhookWithHeaders(path, payload, headers) {
  const { webhookUrl } = getConfig();
  const url = `${webhookUrl.replace(/\/$/, '')}/${String(path).replace(/^\//, '')}`;
  const res = await axios.post(url, payload || {}, { timeout: 10000, headers: headers || {} });
  return res.data;
}

module.exports = {
  getConfig,
  testN8nConnection,
  listWorkflows,
  triggerWebhook,
  triggerWebhookWithHeaders,
};



