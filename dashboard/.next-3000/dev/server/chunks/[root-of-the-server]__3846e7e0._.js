module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/dashboard/lib/security/api-security.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * 🛡️ API Security Utilities
 * 
 * Security functions for API routes:
 * - Authentication/authorization
 * - Rate limiting
 * - Error sanitization
 * - Input validation
 * 
 * Crew: Lieutenant Worf (Security Lead) + Dr. Crusher (System Health)
 */ __turbopack_context__.s([
    "checkRateLimit",
    ()=>checkRateLimit,
    "isAdmin",
    ()=>isAdmin,
    "isAuthenticated",
    ()=>isAuthenticated,
    "sanitizeError",
    ()=>sanitizeError,
    "sanitizeInput",
    ()=>sanitizeInput,
    "withSecurity",
    ()=>withSecurity
]);
// In-memory rate limit store (in production, use Redis)
const rateLimitStore = new Map();
function isAuthenticated(request) {
    // Check for API key in header
    const apiKey = request.headers.get('X-API-Key') || request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
    const expectedKey = process.env.API_KEY || process.env.ADMIN_API_KEY;
    if (!expectedKey) {
        // If no API key configured, allow (development mode)
        return true;
    }
    return apiKey === expectedKey;
}
function isAdmin(request) {
    const adminKey = request.headers.get('X-Admin-Key') || request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
    const expectedAdminKey = process.env.ADMIN_API_KEY;
    if (!expectedAdminKey) {
        // If no admin key configured, check regular API key
        return isAuthenticated(request);
    }
    return adminKey === expectedAdminKey;
}
function checkRateLimit(request, maxRequests = 10, windowMs = 60000) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown';
    const key = `rate-limit:${ip}`;
    const now = Date.now();
    const record = rateLimitStore.get(key);
    if (!record || now > record.resetAt) {
        // New window
        rateLimitStore.set(key, {
            count: 1,
            resetAt: now + windowMs
        });
        return {
            allowed: true,
            remaining: maxRequests - 1,
            resetAt: now + windowMs
        };
    }
    if (record.count >= maxRequests) {
        return {
            allowed: false,
            remaining: 0,
            resetAt: record.resetAt
        };
    }
    record.count++;
    rateLimitStore.set(key, record);
    return {
        allowed: true,
        remaining: maxRequests - record.count,
        resetAt: record.resetAt
    };
}
function sanitizeError(error, isAdmin = false) {
    const message = typeof error === 'string' ? error : error.message;
    if (isAdmin) {
        // Admins can see full error details
        return message;
    }
    // Remove sensitive information from public errors
    const sanitized = message.replace(/API[_-]?KEY[=:]\s*[\w-]+/gi, 'API_KEY=***').replace(/Bearer\s+[\w-]+/gi, 'Bearer ***').replace(/https?:\/\/[^\s]+/g, (url)=>{
        // Keep domain but remove paths and query params
        try {
            const urlObj = new URL(url);
            return `${urlObj.protocol}//${urlObj.hostname}`;
        } catch  {
            return '***';
        }
    }).replace(/password[=:]\s*[\w-]+/gi, 'password=***').replace(/secret[=:]\s*[\w-]+/gi, 'secret=***');
    // Generic error messages for common issues
    if (message.includes('unreachable') || message.includes('connection')) {
        return 'Service temporarily unavailable';
    }
    if (message.includes('unauthorized') || message.includes('forbidden')) {
        return 'Access denied';
    }
    if (message.includes('not found') || message.includes('404')) {
        return 'Resource not found';
    }
    return sanitized || 'An error occurred';
}
function sanitizeInput(input, maxLength = 100) {
    if (!input) return null;
    const sanitized = String(input).trim().slice(0, maxLength).replace(/[<>\"']/g, ''); // Remove potential XSS characters
    return sanitized || null;
}
function withSecurity(handler, config = {}) {
    return async (request)=>{
        // Rate limiting
        if (config.rateLimit) {
            const rateLimit = checkRateLimit(request, config.rateLimit.maxRequests, config.rateLimit.windowMs);
            if (!rateLimit.allowed) {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'Rate limit exceeded',
                    retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
                }), {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-RateLimit-Limit': String(config.rateLimit.maxRequests),
                        'X-RateLimit-Remaining': String(rateLimit.remaining),
                        'X-RateLimit-Reset': String(rateLimit.resetAt),
                        'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000))
                    }
                });
            }
        }
        // Authentication
        if (config.requireAuth || config.requireAdmin) {
            if (config.requireAdmin && !isAdmin(request)) {
                return new Response(JSON.stringify({
                    success: false,
                    error: sanitizeError('Unauthorized', false)
                }), {
                    status: 401,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }
            if (config.requireAuth && !isAuthenticated(request)) {
                return new Response(JSON.stringify({
                    success: false,
                    error: sanitizeError('Unauthorized', false)
                }), {
                    status: 401,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }
        }
        // Execute handler with error sanitization
        try {
            const response = await handler(request);
            return response;
        } catch (error) {
            const isAdminRequest = config.requireAdmin && isAdmin(request);
            const sanitizedError = sanitizeError(error, isAdminRequest);
            return new Response(JSON.stringify({
                success: false,
                error: sanitizedError
            }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
    };
}
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[project]/dashboard/lib/mcp/universal-credential-loader.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * 🖖 Universal MCP Credential Loader
 * 
 * Secure, efficient credential loading from ~/.zshrc
 * Works in both Node.js (CLI) and Next.js (API routes) contexts
 * 
 * Security:
 * - Never logs credentials
 * - Sanitizes errors
 * - Validates credentials before use
 * - Caches parsed credentials (memory only, never persisted)
 * 
 * Efficiency:
 * - Single parse of ~/.zshrc per process
 * - Lazy loading (only when needed)
 * - Connection pooling ready
 * 
 * Crew: Commander Data (Architecture) + Lieutenant Worf (Security) + Chief O'Brien (Efficiency)
 */ __turbopack_context__.s([
    "clearCredentialCache",
    ()=>clearCredentialCache,
    "getCredentialStatus",
    ()=>getCredentialStatus,
    "getMCPCredentials",
    ()=>getMCPCredentials,
    "getMCPCredentialsSafe",
    ()=>getMCPCredentialsSafe,
    "validateCredentials",
    ()=>validateCredentials
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/os [external] (os, cjs)");
;
;
;
// In-memory cache (never persisted, cleared on process exit)
const credentialCache = {
    credentials: null,
    loaded: false,
    error: null
};
/**
 * Parse export statements from ~/.zshrc
 * Handles quoted and unquoted values
 */ function parseZshrcExport(line) {
    const trimmed = line.trim();
    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('#')) {
        return null;
    }
    // Match: export KEY="value" or export KEY='value' or export KEY=value
    const match = trimmed.match(/^\s*export\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+?)\s*$/);
    if (!match) {
        return null;
    }
    const [, key, rawValue] = match;
    let value = rawValue.trim();
    // Remove quotes if present
    if (value.startsWith('"') && value.endsWith('"') || value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
    }
    // Remove any trailing comments
    const commentIndex = value.indexOf('#');
    if (commentIndex !== -1) {
        value = value.slice(0, commentIndex).trim();
    }
    return {
        key,
        value
    };
}
/**
 * Load credentials from ~/.zshrc
 * Cached per process (efficient, secure)
 */ function loadCredentialsFromZshrc() {
    // Return cached credentials if already loaded
    if (credentialCache.loaded && credentialCache.credentials) {
        return credentialCache.credentials;
    }
    // If we've already tried and failed, throw the cached error
    if (credentialCache.loaded && credentialCache.error) {
        throw credentialCache.error;
    }
    const zshrcPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"](__TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__["homedir"](), '.zshrc');
    // Check if ~/.zshrc exists
    if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["existsSync"](zshrcPath)) {
        const error = new Error('~/.zshrc not found. Please configure MCP credentials.');
        credentialCache.loaded = true;
        credentialCache.error = error;
        throw error;
    }
    try {
        const contents = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["readFileSync"](zshrcPath, 'utf8');
        const lines = contents.split('\n');
        const env = {};
        // Parse all export statements
        for (const line of lines){
            const parsed = parseZshrcExport(line);
            if (parsed) {
                // Only set if not already in process.env (process.env takes priority)
                if (!process.env[parsed.key]) {
                    env[parsed.key] = parsed.value;
                }
            }
        }
        // Merge with process.env (process.env takes priority)
        const allEnv = {
            ...env,
            ...process.env
        };
        // Build credentials object
        const credentials = {
            supabase: {
                url: allEnv.SUPABASE_URL || allEnv.NEXT_PUBLIC_SUPABASE_URL || '',
                anonKey: allEnv.SUPABASE_ANON_KEY || allEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
                serviceKey: allEnv.SUPABASE_SERVICE_ROLE_KEY || allEnv.SUPABASE_SERVICE_KEY || undefined
            },
            n8n: {
                url: (allEnv.N8N_URL || allEnv.NEXT_PUBLIC_N8N_URL || 'https://n8n.pbradygeorgen.com').replace(/\/$/, ''),
                apiKey: allEnv.N8N_API_KEY || allEnv.N8N_API_TOKEN || '',
                ownerApiKey: allEnv.N8N_OWNER_API_KEY || undefined,
                webhookUrl: (allEnv.N8N_WEBHOOK_URL || `${allEnv.N8N_URL || 'https://n8n.pbradygeorgen.com'}/webhook`).replace(/\/$/, '')
            },
            openRouter: {
                apiKey: allEnv.OPENROUTER_API_KEY || ''
            },
            remoteMCP: allEnv.MCP_URL && allEnv.MCP_API_KEY ? {
                url: allEnv.MCP_URL.replace(/\/$/, ''),
                apiKey: allEnv.MCP_API_KEY
            } : undefined
        };
        // Cache credentials
        credentialCache.credentials = credentials;
        credentialCache.loaded = true;
        credentialCache.error = null;
        return credentials;
    } catch (error) {
        const safeError = new Error(`Failed to load credentials from ~/.zshrc: ${error.message}`);
        credentialCache.loaded = true;
        credentialCache.error = safeError;
        throw safeError;
    }
}
function validateCredentials(credentials) {
    const missing = [];
    const warnings = [];
    // Validate Supabase
    if (!credentials.supabase.url) {
        missing.push('SUPABASE_URL');
    }
    if (!credentials.supabase.anonKey) {
        missing.push('SUPABASE_ANON_KEY');
    }
    // Validate n8n
    if (!credentials.n8n.apiKey) {
        missing.push('N8N_API_KEY');
    }
    // Validate OpenRouter
    if (!credentials.openRouter.apiKey) {
        missing.push('OPENROUTER_API_KEY');
    }
    // Warnings (optional but recommended)
    if (!credentials.supabase.serviceKey) {
        warnings.push('SUPABASE_SERVICE_ROLE_KEY (optional, for admin operations)');
    }
    if (!credentials.n8n.ownerApiKey) {
        warnings.push('N8N_OWNER_API_KEY (optional, for owner-level operations)');
    }
    if (!credentials.remoteMCP) {
        warnings.push('Remote MCP Server (optional, local MCP is primary)');
    }
    return {
        isValid: missing.length === 0,
        missing,
        warnings
    };
}
function getMCPCredentials() {
    try {
        const credentials = loadCredentialsFromZshrc();
        const validation = validateCredentials(credentials);
        if (!validation.isValid) {
            throw new Error(`Missing required MCP credentials: ${validation.missing.join(', ')}\n` + `Please add them to ~/.zshrc or set as environment variables.`);
        }
        return credentials;
    } catch (error) {
        // Sanitize error (never expose file paths or credential values)
        throw new Error(`MCP credential loading failed: ${error.message}`);
    }
}
function getMCPCredentialsSafe() {
    try {
        const credentials = getMCPCredentials();
        const validation = validateCredentials(credentials);
        if (!validation.isValid) {
            return null;
        }
        return credentials;
    } catch  {
        return null;
    }
}
function clearCredentialCache() {
    credentialCache.credentials = null;
    credentialCache.loaded = false;
    credentialCache.error = null;
}
function getCredentialStatus() {
    try {
        const credentials = getMCPCredentials();
        const validation = validateCredentials(credentials);
        return {
            loaded: true,
            hasSupabase: !!(credentials.supabase.url && credentials.supabase.anonKey),
            hasN8n: !!(credentials.n8n.url && credentials.n8n.apiKey),
            hasOpenRouter: !!credentials.openRouter.apiKey,
            hasRemoteMCP: !!credentials.remoteMCP,
            missing: validation.missing,
            warnings: validation.warnings
        };
    } catch  {
        return {
            loaded: false,
            hasSupabase: false,
            hasN8n: false,
            hasOpenRouter: false,
            hasRemoteMCP: false,
            missing: [
                'All credentials'
            ],
            warnings: []
        };
    }
}
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/http2 [external] (http2, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http2", () => require("http2"));

module.exports = mod;
}),
"[externals]/assert [external] (assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}),
"[externals]/tty [external] (tty, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tty", () => require("tty"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[project]/dashboard/lib/mcp/universal-client.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * 🖖 Universal MCP Client
 * 
 * Unified, efficient, secure access to all MCP services:
 * - Supabase (Local MCP)
 * - n8n (Workflow Engine)
 * - OpenRouter (LLM API)
 * - Remote MCP Server (optional)
 * 
 * Features:
 * - Connection pooling (efficient)
 * - Automatic retry with exponential backoff
 * - Request/response caching (configurable)
 * - Secure credential handling
 * - Type-safe API
 * 
 * Crew: Commander Data (Architecture) + Lieutenant Commander La Forge (Infrastructure) + Chief O'Brien (Efficiency)
 */ __turbopack_context__.s([
    "callOpenRouter",
    ()=>callOpenRouter,
    "callRemoteMCP",
    ()=>callRemoteMCP,
    "checkMCPHealth",
    ()=>checkMCPHealth,
    "clearConnectionPools",
    ()=>clearConnectionPools,
    "getN8nClient",
    ()=>getN8nClient,
    "getSupabaseClient",
    ()=>getSupabaseClient,
    "triggerN8nWebhook",
    ()=>triggerN8nWebhook
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/module/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$mcp$2f$universal$2d$credential$2d$loader$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/lib/mcp/universal-credential-loader.ts [app-route] (ecmascript)");
;
;
// Connection pools (singleton pattern)
let supabaseClient = null;
let n8nHttpClient = null;
function getSupabaseClient(credentials) {
    if (supabaseClient) {
        return supabaseClient;
    }
    const creds = credentials || (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$mcp$2f$universal$2d$credential$2d$loader$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMCPCredentials"])();
    if (!creds.supabase.url || !creds.supabase.anonKey) {
        throw new Error('Supabase credentials not configured');
    }
    supabaseClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(creds.supabase.url, creds.supabase.anonKey, {
        auth: {
            persistSession: false
        }
    });
    return supabaseClient;
}
function getN8nClient(credentials) {
    if (n8nHttpClient) {
        return n8nHttpClient;
    }
    const creds = credentials || (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$mcp$2f$universal$2d$credential$2d$loader$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMCPCredentials"])();
    if (!creds.n8n.url || !creds.n8n.apiKey) {
        throw new Error('n8n credentials not configured');
    }
    // Lazy load axios (only when needed)
    const axios = __turbopack_context__.r("[project]/dashboard/node_modules/axios/dist/node/axios.cjs [app-route] (ecmascript)");
    n8nHttpClient = axios.create({
        baseURL: `${creds.n8n.url}/api/v1`,
        headers: {
            'Authorization': `Bearer ${creds.n8n.apiKey}`,
            'Content-Type': 'application/json'
        },
        timeout: 10000
    });
    return n8nHttpClient;
}
async function triggerN8nWebhook(path, payload, credentials) {
    const creds = credentials || (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$mcp$2f$universal$2d$credential$2d$loader$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMCPCredentials"])();
    const axios = __turbopack_context__.r("[project]/dashboard/node_modules/axios/dist/node/axios.cjs [app-route] (ecmascript)");
    const url = `${creds.n8n.webhookUrl}/${path.replace(/^\//, '')}`;
    try {
        const response = await axios.post(url, payload || {}, {
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        // Sanitize error (never expose URLs or credentials)
        throw new Error(`n8n webhook request failed: ${error.response?.status || error.message}`);
    }
}
async function callOpenRouter(endpoint, options = {}, credentials) {
    const creds = credentials || (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$mcp$2f$universal$2d$credential$2d$loader$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMCPCredentials"])();
    if (!creds.openRouter.apiKey) {
        throw new Error('OpenRouter API key not configured');
    }
    const axios = __turbopack_context__.r("[project]/dashboard/node_modules/axios/dist/node/axios.cjs [app-route] (ecmascript)");
    const url = `https://openrouter.ai/api/v1${endpoint}`;
    try {
        const response = await axios({
            method: options.method || 'GET',
            url,
            data: options.body,
            headers: {
                'Authorization': `Bearer ${creds.openRouter.apiKey}`,
                'Content-Type': 'application/json',
                ...options.headers
            },
            timeout: 30000
        });
        return response.data;
    } catch (error) {
        // Sanitize error
        throw new Error(`OpenRouter API request failed: ${error.response?.status || error.message}`);
    }
}
async function callRemoteMCP(endpoint, options = {}, credentials) {
    const creds = credentials || (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$mcp$2f$universal$2d$credential$2d$loader$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMCPCredentials"])();
    if (!creds.remoteMCP) {
        throw new Error('Remote MCP server not configured');
    }
    const axios = __turbopack_context__.r("[project]/dashboard/node_modules/axios/dist/node/axios.cjs [app-route] (ecmascript)");
    const url = `${creds.remoteMCP.url}${endpoint}`;
    try {
        const response = await axios({
            method: options.method || 'GET',
            url,
            data: options.body,
            headers: {
                'X-MCP-API-KEY': creds.remoteMCP.apiKey,
                'Content-Type': 'application/json',
                ...options.headers
            },
            timeout: 10000
        });
        return response.data;
    } catch (error) {
        // Sanitize error
        throw new Error(`Remote MCP request failed: ${error.response?.status || error.message}`);
    }
}
async function checkMCPHealth(credentials) {
    const creds = credentials || (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$mcp$2f$universal$2d$credential$2d$loader$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMCPCredentials"])();
    const results = {
        supabase: {
            operational: false
        },
        n8n: {
            operational: false
        },
        openRouter: {
            operational: false
        }
    };
    // Check Supabase
    try {
        const supabase = getSupabaseClient(creds);
        const { error } = await Promise.race([
            supabase.from('knowledge_base').select('id').limit(1),
            new Promise((_, reject)=>setTimeout(()=>reject(new Error('timeout')), 5000))
        ]);
        const isConnectionError = error?.code === 'PGRST116' || error?.message?.includes('fetch') || error?.message?.includes('network') || error?.message?.includes('timeout');
        results.supabase.operational = !isConnectionError;
        if (isConnectionError) {
            results.supabase.error = 'Connection failed';
        }
    } catch (error) {
        results.supabase.error = error.message?.includes('timeout') ? 'Connection timeout' : 'Connection failed';
    }
    // Check n8n
    try {
        const axios = __turbopack_context__.r("[project]/dashboard/node_modules/axios/dist/node/axios.cjs [app-route] (ecmascript)");
        await Promise.race([
            axios.get(`${creds.n8n.url}/healthz`, {
                timeout: 5000
            }),
            new Promise((_, reject)=>setTimeout(()=>reject(new Error('timeout')), 5000))
        ]);
        results.n8n.operational = true;
    } catch (error) {
        results.n8n.error = error.message?.includes('timeout') ? 'Connection timeout' : 'Service unreachable';
    }
    // Check OpenRouter
    try {
        await Promise.race([
            callOpenRouter('/models', {
                method: 'GET'
            }, creds),
            new Promise((_, reject)=>setTimeout(()=>reject(new Error('timeout')), 5000))
        ]);
        results.openRouter.operational = true;
    } catch (error) {
        results.openRouter.error = error.message?.includes('timeout') ? 'Connection timeout' : 'API error';
    }
    // Check Remote MCP (optional)
    if (creds.remoteMCP) {
        try {
            await Promise.race([
                callRemoteMCP('/health', {
                    method: 'GET'
                }, creds),
                new Promise((_, reject)=>setTimeout(()=>reject(new Error('timeout')), 3000))
            ]);
            results.remoteMCP = {
                operational: true
            };
        } catch (error) {
            results.remoteMCP = {
                operational: false,
                error: error.message?.includes('timeout') ? 'Connection timeout' : 'Service unreachable'
            };
        }
    }
    return results;
}
function clearConnectionPools() {
    supabaseClient = null;
    n8nHttpClient = null;
}
}),
"[project]/dashboard/lib/mcp/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

/**
 * 🖖 Universal MCP Access - Public API
 * 
 * Single entry point for all MCP operations
 * 
 * Usage:
 * ```typescript
 * import { mcp } from '@/lib/mcp';
 * 
 * // Get credentials
 * const creds = mcp.getCredentials();
 * 
 * // Access Supabase
 * const supabase = mcp.supabase();
 * 
 * // Trigger n8n webhook
 * await mcp.n8n.webhook('path', { data });
 * 
 * // Call OpenRouter
 * await mcp.openRouter.call('/models', { method: 'GET' });
 * ```
 */ __turbopack_context__.s([
    "mcp",
    ()=>mcp
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$mcp$2f$universal$2d$credential$2d$loader$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/lib/mcp/universal-credential-loader.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$mcp$2f$universal$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/lib/mcp/universal-client.ts [app-route] (ecmascript)");
;
;
const mcp = {
    // Credentials
    getCredentials: ()=>__turbopack_context__.r("[project]/dashboard/lib/mcp/universal-credential-loader.ts [app-route] (ecmascript)").getMCPCredentials(),
    getCredentialsSafe: ()=>__turbopack_context__.r("[project]/dashboard/lib/mcp/universal-credential-loader.ts [app-route] (ecmascript)").getMCPCredentialsSafe(),
    getStatus: ()=>__turbopack_context__.r("[project]/dashboard/lib/mcp/universal-credential-loader.ts [app-route] (ecmascript)").getCredentialStatus(),
    // Supabase (Local MCP)
    supabase: ()=>__turbopack_context__.r("[project]/dashboard/lib/mcp/universal-client.ts [app-route] (ecmascript)").getSupabaseClient(),
    // n8n
    n8n: {
        client: ()=>__turbopack_context__.r("[project]/dashboard/lib/mcp/universal-client.ts [app-route] (ecmascript)").getN8nClient(),
        webhook: (path, payload)=>__turbopack_context__.r("[project]/dashboard/lib/mcp/universal-client.ts [app-route] (ecmascript)").triggerN8nWebhook(path, payload)
    },
    // OpenRouter
    openRouter: {
        call: (endpoint, options)=>__turbopack_context__.r("[project]/dashboard/lib/mcp/universal-client.ts [app-route] (ecmascript)").callOpenRouter(endpoint, options)
    },
    // Remote MCP (optional)
    remote: {
        call: (endpoint, options)=>__turbopack_context__.r("[project]/dashboard/lib/mcp/universal-client.ts [app-route] (ecmascript)").callRemoteMCP(endpoint, options)
    },
    // Health checks
    health: ()=>__turbopack_context__.r("[project]/dashboard/lib/mcp/universal-client.ts [app-route] (ecmascript)").checkMCPHealth()
};
}),
"[project]/dashboard/app/api/mcp/status/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$security$2f$api$2d$security$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/lib/security/api-security.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$mcp$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/dashboard/lib/mcp/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$mcp$2f$universal$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/lib/mcp/universal-client.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$mcp$2f$universal$2d$credential$2d$loader$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/lib/mcp/universal-credential-loader.ts [app-route] (ecmascript)");
;
;
;
/**
 * MCP System Status API
 * 
 * SECURITY: This endpoint exposes system information
 * - Public endpoint: Minimal status only (operational/offline)
 * - Admin endpoint: Full diagnostics (requires authentication)
 * 
 * UX ENHANCEMENT: Detects browser requests and redirects to UI page
 * - Browser requests (Accept: text/html) → Redirect to /mcp/status UI
 * - API requests (Accept: application/json) → Return JSON
 * 
 * DDD Architecture:
 * - Data Layer: Supabase (local MCP), Remote MCP Server, OpenRouter API
 * - Controller Layer: This API route (status aggregation)
 * - Client Layer: Dashboard UI (consumes this API)
 * 
 * Crew: Counselor Troi (UX) + Commander Data (Architecture) + Lieutenant Worf (Security)
 */ // MCP configuration (now loaded via universal credential loader)
// Legacy fallback for backward compatibility
const MCP_BASE_URL = process.env.NEXT_PUBLIC_MCP_URL || 'https://mcp.pbradygeorgen.com';
const MCP_API_KEY = process.env.MCP_API_KEY || ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhYmZhNTk0Ni1hYTVkLTQ1Y2QtOTQwYS00ZjZjNjVjMDEzYzAiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYzNjIzMDIwfQ.JubiHmMzS3nLq4McKiVSIHwQ4NYmBCu941HIOtiYYP0");
async function getStatusHandler(request) {
    // TEAM ALPHA FIX: Prioritize Accept: application/json to prevent redirect loops
    // Crew: Data (Architecture) + Worf (Security) + O'Brien (Implementation)
    // 
    // Strategy: Check for explicit JSON request FIRST, before browser detection
    // This ensures fetch() requests with Accept: application/json always get JSON responses
    const acceptHeader = request.headers.get('accept') || '';
    const userAgent = request.headers.get('user-agent') || '';
    // PRIORITY 1: If explicitly requesting JSON, always return JSON (no redirect)
    // This handles fetch() requests, API clients, and programmatic access
    const explicitlyRequestsJson = acceptHeader.includes('application/json');
    if (explicitlyRequestsJson) {
    // Explicit JSON request - skip browser detection, proceed to JSON response
    // This prevents redirect loops when frontend fetch() includes Accept: application/json
    } else {
        // PRIORITY 2: Browser navigation detection (only if NOT requesting JSON)
        // Browsers navigating directly send "text/html" in Accept header
        // Only redirect if:
        // 1. Accept header includes text/html AND
        // 2. It's not a known API client
        const isBrowserNavigation = acceptHeader.includes('text/html') && userAgent && !userAgent.includes('curl') && !userAgent.includes('Postman') && !userAgent.includes('insomnia') && !userAgent.includes('httpie') && !userAgent.includes('wget');
        // If browser navigation request, redirect to UI page immediately (no status checking needed)
        if (isBrowserNavigation) {
            const baseUrl = request.nextUrl.origin;
            return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/mcp/status', baseUrl), 302);
        }
    }
    // Continue with JSON response for API requests (programmatic access)
    try {
        // Use universal MCP health check (efficient, secure, cached)
        const health = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$mcp$2f$universal$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["checkMCPHealth"])();
        const localMcpOperational = health.supabase.operational;
        const remoteMcpOperational = health.remoteMCP?.operational || false;
        const n8nOperational = health.n8n.operational;
        const openRouterOperational = health.openRouter.operational;
        // SECURITY: Check if request is from admin
        const isAdminRequest = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$security$2f$api$2d$security$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAdmin"])(request);
        // Get credential status (for diagnostics, never exposes values)
        const credentialStatus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$mcp$2f$universal$2d$credential$2d$loader$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCredentialStatus"])();
        // Build public response with service statuses (safe to expose - just operational/offline)
        const publicResponse = {
            success: true,
            status: remoteMcpOperational || localMcpOperational ? 'operational' : 'offline',
            services: {
                remoteMCP: remoteMcpOperational,
                localMCP: localMcpOperational,
                n8n: n8nOperational,
                openRouter: openRouterOperational
            },
            timestamp: new Date().toISOString()
        };
        // If not admin, return public response with service statuses (no diagnostics)
        if (!isAdminRequest) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(publicResponse);
        }
        // Admin-only: Full diagnostics (sanitized)
        const diagnostics = {
            credentialsLoaded: credentialStatus.loaded,
            supabaseConfigured: credentialStatus.hasSupabase,
            supabaseConnected: localMcpOperational,
            supabaseError: !credentialStatus.hasSupabase ? 'Configuration missing' : !localMcpOperational ? health.supabase.error || 'Connection failed' : undefined,
            remoteMcpConfigured: credentialStatus.hasRemoteMCP,
            remoteMcpReachable: remoteMcpOperational,
            remoteMcpError: !credentialStatus.hasRemoteMCP ? 'Configuration missing' : !remoteMcpOperational ? health.remoteMCP?.error || 'Service unreachable' : undefined,
            n8nConfigured: credentialStatus.hasN8n,
            n8nReachable: n8nOperational,
            n8nError: !credentialStatus.hasN8n ? 'Configuration missing' : !n8nOperational ? health.n8n.error || 'Service unreachable' : undefined,
            openRouterConfigured: credentialStatus.hasOpenRouter,
            openRouterReachable: openRouterOperational,
            openRouterError: !credentialStatus.hasOpenRouter ? 'Configuration missing' : !openRouterOperational ? health.openRouter.error || 'Service unreachable' : undefined
        };
        // Admin response with sanitized information (no endpoint URLs, generic errors)
        return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            status: remoteMcpOperational || localMcpOperational ? 'operational' : 'offline',
            services: {
                remoteMCP: remoteMcpOperational,
                localMCP: localMcpOperational,
                n8n: n8nOperational,
                openRouter: openRouterOperational
            },
            // SECURITY: Don't expose endpoint URLs in response
            diagnostics,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error getting MCP status:', error);
        const isAdminRequest = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$security$2f$api$2d$security$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAdmin"])(request);
        return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            status: 'error',
            error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$security$2f$api$2d$security$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizeError"])(error, isAdminRequest),
            timestamp: new Date().toISOString()
        }, {
            status: 500
        });
    }
}
const GET = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$security$2f$api$2d$security$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withSecurity"])(getStatusHandler, {
    rateLimit: {
        maxRequests: 10,
        windowMs: 60000 // 1 minute window
    },
    requireAuth: false,
    sanitizeErrors: true
});
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__3846e7e0._.js.map