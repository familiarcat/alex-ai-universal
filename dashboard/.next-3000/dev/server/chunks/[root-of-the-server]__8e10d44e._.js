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
"[project]/scripts/utils/mcp-context-cache.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

/**
 * 🖖 MCP Context Cache - JavaScript Implementation
 * 
 * In-memory context cache for MCP layer efficiency.
 * Provides context sharing and embedding caching to reduce API calls.
 */ class MCPContextCache {
    constructor(){
        this.cache = new Map();
        this.embeddingCache = new Map();
        this.DEFAULT_TTL = 3600000; // 1 hour
    }
    /**
   * Generate cache key from content
   */ generateCacheKey(content, metadata = {}) {
        const contentHash = this.hashString(content);
        const metadataHash = this.hashString(JSON.stringify(metadata));
        return `mcp:${contentHash}:${metadataHash}`;
    }
    /**
   * Simple string hash function
   */ hashString(str) {
        let hash = 0;
        for(let i = 0; i < str.length; i++){
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }
    /**
   * Store context in cache
   */ storeContext(content, embeddings, metadata) {
        const cacheKey = this.generateCacheKey(content, metadata);
        const timestamp = Date.now();
        const context = {
            id: `mcp-${timestamp}-${Math.random().toString(36).substring(7)}`,
            content,
            embeddings: embeddings || null,
            metadata: {
                sessionId: metadata.sessionId || `session-${timestamp}`,
                crewMembers: metadata.crewMembers || [],
                tags: metadata.tags || [],
                timestamp: new Date().toISOString()
            },
            cacheKey,
            ttl: metadata.ttl || this.DEFAULT_TTL,
            createdAt: timestamp
        };
        this.cache.set(cacheKey, context);
        // Also cache embeddings separately for quick lookup
        if (embeddings) {
            const embeddingKey = this.hashString(content);
            this.embeddingCache.set(embeddingKey, {
                embeddings,
                timestamp,
                ttl: this.DEFAULT_TTL
            });
        }
        return context;
    }
    /**
   * Get context from cache
   */ getContext(cacheKey) {
        const context = this.cache.get(cacheKey);
        if (context && this.isValid(context)) {
            return context;
        }
        return null;
    }
    /**
   * Get cached embeddings (avoids regeneration)
   */ getCachedEmbeddings(content) {
        const embeddingKey = this.hashString(content);
        const cached = this.embeddingCache.get(embeddingKey);
        if (cached && this.isValidTimestamp(cached.timestamp, cached.ttl)) {
            return cached.embeddings;
        }
        return null;
    }
    /**
   * Check if context is still valid
   */ isValid(context) {
        const age = Date.now() - context.createdAt;
        return age < context.ttl;
    }
    /**
   * Check if timestamp is still valid
   */ isValidTimestamp(timestamp, ttl) {
        const age = Date.now() - timestamp;
        return age < ttl;
    }
    /**
   * Share context with crew members
   */ shareContextWithCrew(contextId, crewMembers) {
        // Find context by ID
        let context = null;
        for (const [key, value] of this.cache.entries()){
            if (value.id === contextId && this.isValid(value)) {
                context = value;
                break;
            }
        }
        if (!context) {
            return null;
        }
        // Update crew members list
        context.metadata.crewMembers = [
            ...new Set([
                ...context.metadata.crewMembers,
                ...crewMembers
            ])
        ];
        // Update cache
        this.cache.set(context.cacheKey, context);
        return context;
    }
    /**
   * Cleanup expired entries
   */ cleanup() {
        let cleaned = 0;
        // Clean context cache
        for (const [key, value] of this.cache.entries()){
            if (!this.isValid(value)) {
                this.cache.delete(key);
                cleaned++;
            }
        }
        // Clean embedding cache
        for (const [key, value] of this.embeddingCache.entries()){
            if (!this.isValidTimestamp(value.timestamp, value.ttl)) {
                this.embeddingCache.delete(key);
                cleaned++;
            }
        }
        return cleaned;
    }
    /**
   * Get cache statistics
   */ getStats() {
        const contexts = Array.from(this.cache.values());
        const validContexts = contexts.filter((c)=>this.isValid(c));
        const expiredContexts = contexts.filter((c)=>!this.isValid(c));
        const withEmbeddings = contexts.filter((c)=>c.embeddings);
        return {
            totalContexts: contexts.length,
            validContexts: validContexts.length,
            expiredContexts: expiredContexts.length,
            totalEmbeddings: withEmbeddings.length,
            embeddingCacheSize: this.embeddingCache.size
        };
    }
    /**
   * Clear all caches
   */ clear() {
        this.cache.clear();
        this.embeddingCache.clear();
    }
}
// Singleton instance
let mcpCacheInstance = null;
function getMCPCache() {
    if (!mcpCacheInstance) {
        mcpCacheInstance = new MCPContextCache();
        // Auto-cleanup every 30 minutes
        setInterval(()=>{
            const cleaned = mcpCacheInstance.cleanup();
            if (cleaned > 0) {
                console.log(`🧹 MCP Cache: Cleaned ${cleaned} expired entries`);
            }
        }, 30 * 60 * 1000);
    }
    return mcpCacheInstance;
}
module.exports = {
    getMCPCache,
    MCPContextCache
};
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/scripts/utils/load-crew-credentials.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Shared credential loader for crew automation.
 *
 * Priorities:
 * 1. Owner-level API key (N8N_OWNER_API_KEY)
 * 2. Service-level API key (N8N_API_KEY)
 * 3. Optional login credentials (N8N_EMAIL / N8N_PASSWORD) for future session cookies
 *
 * Also exposes Supabase credentials so callers can inject RAG context.
 */ const fs = __turbopack_context__.r("[externals]/fs [external] (fs, cjs)");
const os = __turbopack_context__.r("[externals]/os [external] (os, cjs)");
const path = __turbopack_context__.r("[externals]/path [external] (path, cjs)");
try {
    __turbopack_context__.r("[project]/node_modules/dotenv/lib/main.js [app-route] (ecmascript)").config({
        path: path.join(process.cwd(), '.env')
    });
} catch (_) {
// dotenv is optional; ignore if not installed
}
function hydrateFromZshrc() {
    const zshrcPath = path.join(os.homedir(), '.zshrc');
    if (!fs.existsSync(zshrcPath)) {
        return;
    }
    try {
        const contents = fs.readFileSync(zshrcPath, 'utf8');
        const exportRegex = /^\s*export\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/gm;
        let match;
        while((match = exportRegex.exec(contents)) !== null){
            const [, key, rawValue] = match;
            if (process.env[key]) continue;
            let value = rawValue.trim();
            if (value.startsWith('"') && value.endsWith('"') || value.startsWith('\'') && value.endsWith('\'')) {
                value = value.slice(1, -1);
            }
            if (value.length === 0) continue;
            process.env[key] = value;
        }
    } catch (error) {
    // If parsing fails, fall back silently; the caller will handle missing envs.
    }
}
hydrateFromZshrc();
function normalize(value) {
    if (!value) return undefined;
    const trimmed = value.toString().trim();
    return trimmed.length === 0 ? undefined : trimmed;
}
function loadCrewCredentials() {
    const baseUrl = normalize(("TURBOPACK compile-time value", "https://n8n.pbradygeorgen.com")) || 'https://n8n.pbradygeorgen.com';
    const ownerApiKey = normalize(process.env.N8N_OWNER_API_KEY);
    const serviceApiKey = normalize(("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhYmZhNTk0Ni1hYTVkLTQ1Y2QtOTQwYS00ZjZjNjVjMDEzYzAiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYzNjIzMDIwfQ.JubiHmMzS3nLq4McKiVSIHwQ4NYmBCu941HIOtiYYP0"));
    const email = normalize(process.env.N8N_EMAIL);
    const password = normalize(process.env.N8N_PASSWORD);
    const supabaseUrl = normalize(process.env.SUPABASE_URL);
    const supabaseKey = normalize(process.env.SUPABASE_SERVICE_ROLE_KEY) || normalize(process.env.SUPABASE_ANON_KEY);
    return {
        n8n: {
            baseUrl: baseUrl.replace(/\/$/, ''),
            ownerApiKey,
            serviceApiKey,
            apiKey: ownerApiKey || serviceApiKey,
            email,
            password
        },
        supabase: {
            url: supabaseUrl,
            key: supabaseKey,
            serviceKey: supabaseKey
        }
    };
}
module.exports = {
    loadCrewCredentials
};
}),
"[project]/scripts/utils/secure-credential-loader.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

/**
 * 🖖 Secure Credential Loader
 * 
 * Unified, secure credential loading system for Alex AI scripts.
 * Automatically loads credentials from ~/.zshrc with security best practices.
 * 
 * Security Features:
 * - Never logs secrets
 * - Prioritizes process.env (most secure)
 * - Falls back to ~/.zshrc for local development
 * - Handles errors gracefully
 * - Supports all credential types
 * 
 * Usage:
 *   const { loadCredentials, getCredential } = require('./utils/secure-credential-loader');
 *   
 *   // Load all credentials
 *   const creds = loadCredentials();
 *   
 *   // Or get specific credential
 *   const apiKey = getCredential('OPENROUTER_API_KEY');
 */ const fs = __turbopack_context__.r("[externals]/fs [external] (fs, cjs)");
const os = __turbopack_context__.r("[externals]/os [external] (os, cjs)");
const path = __turbopack_context__.r("[externals]/path [external] (path, cjs)");
// Cache for parsed zshrc to avoid repeated file reads
let zshrcCache = null;
let zshrcCacheTimestamp = null;
const CACHE_TTL = 60000; // 1 minute cache
/**
 * Parse ~/.zshrc and extract environment variables
 * Supports multiple formats:
 * - export KEY="value"
 * - export KEY='value'
 * - export KEY=value
 * - export KEY=$OTHER_VAR
 */ function parseZshrc(content) {
    const secrets = {};
    // Pattern 1: export KEY="value" or export KEY='value'
    const quotedPattern = /^\s*export\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*["']([^"']*)["']\s*$/gm;
    let match;
    while((match = quotedPattern.exec(content)) !== null){
        const [, key, value] = match;
        secrets[key] = value.trim();
    }
    // Pattern 2: export KEY=value (unquoted, no spaces)
    const unquotedPattern = /^\s*export\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([^\s#\n]+)\s*$/gm;
    while((match = unquotedPattern.exec(content)) !== null){
        const [, key, value] = match;
        // Skip if already found (quoted takes precedence)
        if (!secrets[key]) {
            secrets[key] = value.trim();
        }
    }
    // Pattern 3: export KEY=value (with spaces, unquoted - less common)
    const spacedPattern = /^\s*export\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+?)(?:\s*#|\s*$)/gm;
    while((match = spacedPattern.exec(content)) !== null){
        const [, key, value] = match;
        // Only use if not already found and value doesn't contain special chars
        if (!secrets[key] && !value.includes('$') && !value.includes('`')) {
            secrets[key] = value.trim();
        }
    }
    return secrets;
}
/**
 * Load credentials from ~/.zshrc with caching
 */ function loadFromZshrc() {
    const now = Date.now();
    // Return cached if still valid
    if (zshrcCache && zshrcCacheTimestamp && now - zshrcCacheTimestamp < CACHE_TTL) {
        return zshrcCache;
    }
    const zshrcPath = path.join(os.homedir(), '.zshrc');
    if (!fs.existsSync(zshrcPath)) {
        zshrcCache = {};
        zshrcCacheTimestamp = now;
        return zshrcCache;
    }
    try {
        const content = fs.readFileSync(zshrcPath, 'utf8');
        zshrcCache = parseZshrc(content);
        zshrcCacheTimestamp = now;
        return zshrcCache;
    } catch (error) {
        // Silently fail - don't expose file system errors
        zshrcCache = {};
        zshrcCacheTimestamp = now;
        return zshrcCache;
    }
}
/**
 * Get a specific credential
 * Priority: process.env > ~/.zshrc
 * 
 * @param {string} key - Environment variable name
 * @param {string} defaultValue - Optional default value
 * @returns {string|undefined} - The credential value or undefined
 */ function getCredential(key, defaultValue = undefined) {
    // First check process.env (highest priority, most secure)
    if (process.env[key]) {
        return process.env[key];
    }
    // Fall back to ~/.zshrc
    const zshrcCreds = loadFromZshrc();
    if (zshrcCreds[key]) {
        // Also populate process.env for downstream libraries
        process.env[key] = zshrcCreds[key];
        return zshrcCreds[key];
    }
    return defaultValue;
}
/**
 * Load multiple credentials at once
 * 
 * @param {string[]} keys - Array of credential keys to load
 * @returns {Object} - Object with credential keys and values
 */ function loadCredentials(keys = []) {
    const credentials = {};
    const zshrcCreds = loadFromZshrc();
    // If no keys specified, load common Alex AI credentials
    const keysToLoad = keys.length > 0 ? keys : [
        'SUPABASE_URL',
        'SUPABASE_SERVICE_ROLE_KEY',
        'SUPABASE_ANON_KEY',
        'OPENROUTER_API_KEY',
        'N8N_API_KEY',
        'N8N_OWNER_API_KEY',
        'N8N_BASE_URL',
        'N8N_URL',
        'OPENAI_API_KEY',
        'ANTHROPIC_API_KEY'
    ];
    keysToLoad.forEach((key)=>{
        const value = getCredential(key);
        if (value) {
            credentials[key] = value;
        }
    });
    return credentials;
}
/**
 * Load Supabase credentials specifically
 * 
 * @returns {Object} - { url, serviceKey, anonKey }
 */ function loadSupabaseCredentials() {
    return {
        url: getCredential('SUPABASE_URL'),
        serviceKey: getCredential('SUPABASE_SERVICE_ROLE_KEY') || getCredential('SUPABASE_SERVICE_KEY'),
        anonKey: getCredential('SUPABASE_ANON_KEY')
    };
}
/**
 * Load OpenRouter credentials specifically
 * 
 * @returns {string|undefined} - OpenRouter API key
 */ function loadOpenRouterCredentials() {
    return getCredential('OPENROUTER_API_KEY');
}
/**
 * Load n8n credentials specifically
 * 
 * @returns {Object} - { baseUrl, apiKey, ownerApiKey }
 */ function loadN8NCredentials() {
    return {
        baseUrl: getCredential('N8N_BASE_URL') || getCredential('N8N_URL') || 'https://n8n.pbradygeorgen.com',
        apiKey: getCredential('N8N_API_KEY'),
        ownerApiKey: getCredential('N8N_OWNER_API_KEY')
    };
}
/**
 * Verify credentials are available (without exposing values)
 * 
 * @param {string[]} requiredKeys - Keys that must be present
 * @returns {Object} - { valid: boolean, missing: string[] }
 */ function verifyCredentials(requiredKeys) {
    const missing = [];
    requiredKeys.forEach((key)=>{
        if (!getCredential(key)) {
            missing.push(key);
        }
    });
    return {
        valid: missing.length === 0,
        missing
    };
}
module.exports = {
    getCredential,
    loadCredentials,
    loadSupabaseCredentials,
    loadOpenRouterCredentials,
    loadN8NCredentials,
    verifyCredentials,
    // Expose for testing/debugging (use carefully)
    _parseZshrc: parseZshrc,
    _clearCache: ()=>{
        zshrcCache = null;
        zshrcCacheTimestamp = null;
    }
};
}),
"[project]/scripts/utils/mcp-openrouter-optimizer.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

/**
 * 🖖 MCP OpenRouter Optimizer
 * 
 * Context-aware, cost-effective OpenRouter model selection with MCP caching.
 * Enhanced version of the n8n optimizer with caching for even better efficiency.
 * 
 * DDD Architecture: Client => MCP => OpenRouter API (with caching)
 */ const { getMCPCache } = __turbopack_context__.r("[project]/scripts/utils/mcp-context-cache.js [app-route] (ecmascript)");
const https = __turbopack_context__.r("[externals]/https [external] (https, cjs)");
const { getCredential } = __turbopack_context__.r("[project]/scripts/utils/secure-credential-loader.js [app-route] (ecmascript)");
/**
 * OpenRouter Model Configuration
 * Cost per 1M tokens (input + output average)
 */ const OPENROUTER_MODELS = {
    // High-performance models
    'anthropic/claude-3.5-sonnet': {
        name: 'Claude 3.5 Sonnet',
        costPer1M: 3.00,
        specialization: [
            'strategic_analysis',
            'reasoning',
            'coding',
            'writing'
        ],
        strengths: [
            'complex_reasoning',
            'code_generation',
            'analysis'
        ],
        bestFor: [
            'strategic_planning',
            'complex_analysis',
            'system_architecture'
        ],
        crewMember: [
            'picard',
            'data',
            'geordi'
        ]
    },
    'openai/gpt-4o': {
        name: 'GPT-4o',
        costPer1M: 5.00,
        specialization: [
            'research',
            'multimodal',
            'general_purpose'
        ],
        strengths: [
            'multimodal',
            'creativity',
            'general_purpose'
        ],
        bestFor: [
            'research',
            'multimodal_tasks',
            'creative_work'
        ],
        crewMember: [
            'troi',
            'uhura'
        ]
    },
    // Cost-effective models
    'anthropic/claude-3-haiku': {
        name: 'Claude 3 Haiku',
        costPer1M: 0.25,
        specialization: [
            'quick_analysis',
            'simple_tasks',
            'business_analysis'
        ],
        strengths: [
            'speed',
            'cost_effective',
            'simple_reasoning',
            'business_logic'
        ],
        bestFor: [
            'quick_analysis',
            'simple_tasks',
            'low_complexity',
            'cost_optimization'
        ],
        crewMember: [
            'obrien',
            'quark'
        ] // Quark uses Haiku for cost-effective business analysis
    },
    // Quark uses Claude Haiku for cost-effective business analysis (works well with Riker's Llama)
    // Note: Gemini models not consistently available on OpenRouter, using proven cost-effective alternative
    'meta-llama/llama-3-70b-instruct': {
        name: 'Llama 3 70B',
        costPer1M: 1.00,
        specialization: [
            'code_implementation',
            'cost_effective'
        ],
        strengths: [
            'open_source',
            'cost_effective',
            'coding'
        ],
        bestFor: [
            'code_implementation',
            'simple_coding',
            'budget_constrained'
        ],
        crewMember: [
            'obrien',
            'riker'
        ]
    },
    // Specialized models
    'openai/gpt-4o-mini': {
        name: 'GPT-4o Mini',
        costPer1M: 0.60,
        specialization: [
            'general_purpose',
            'cost_effective'
        ],
        strengths: [
            'general_purpose',
            'cost_effective',
            'balanced'
        ],
        bestFor: [
            'general_tasks',
            'balanced_performance'
        ],
        crewMember: [
            'crusher',
            'worf'
        ]
    }
};
/**
 * Task Type to Model Affinity Scoring
 */ const TASK_AFFINITIES = {
    'strategic_planning': {
        'anthropic/claude-3.5-sonnet': 0.98,
        'openai/gpt-4o': 0.90,
        'google/gemini-pro-1.5': 0.75,
        'meta-llama/llama-3-70b-instruct': 0.65
    },
    'complex_analysis': {
        'anthropic/claude-3.5-sonnet': 0.95,
        'openai/gpt-4o': 0.88,
        'google/gemini-pro-1.5': 0.80,
        'meta-llama/llama-3-70b-instruct': 0.70
    },
    'code_generation': {
        'anthropic/claude-3.5-sonnet': 0.92,
        'meta-llama/llama-3-70b-instruct': 0.90,
        'google/gemini-pro-1.5': 0.85,
        'openai/gpt-4o': 0.82
    },
    'quick_analysis': {
        'anthropic/claude-3-haiku': 0.95,
        'openai/gpt-4o-mini': 0.90,
        'meta-llama/llama-3-70b-instruct': 0.85,
        'google/gemini-pro-1.5': 0.80
    },
    'optimization': {
        'anthropic/claude-3-haiku': 0.95,
        'meta-llama/llama-3-70b-instruct': 0.85,
        'anthropic/claude-3.5-sonnet': 0.80,
        'openai/gpt-4o': 0.75
    },
    'business_analysis': {
        'anthropic/claude-3-haiku': 0.95,
        'anthropic/claude-3.5-sonnet': 0.90,
        'openai/gpt-4o': 0.85,
        'meta-llama/llama-3-70b-instruct': 0.75
    },
    'task_optimization': {
        'anthropic/claude-3-haiku': 0.98,
        'meta-llama/llama-3-70b-instruct': 0.92,
        'anthropic/claude-3.5-sonnet': 0.88,
        'openai/gpt-4o': 0.80
    }
};
/**
 * Crew Member to Task Type Mapping
 */ const CREW_TASK_TYPES = {
    'picard': 'strategic_planning',
    'data': 'complex_analysis',
    'geordi': 'code_generation',
    'riker': 'operations',
    'worf': 'security_review',
    'crusher': 'health_monitoring',
    'troi': 'user_experience',
    'uhura': 'user_experience',
    'quark': 'business_analysis',
    'obrien': 'operations',
    'quark_riker_collaboration': 'task_optimization' // Special collaboration mode
};
class MCPOpenRouterOptimizer {
    constructor(){
        this.mcpCache = getMCPCache();
        this.apiKey = null;
    }
    /**
   * Initialize OpenRouter API key using secure credential loader
   */ initialize() {
        this.apiKey = getCredential('OPENROUTER_API_KEY');
        if (!this.apiKey) {
            throw new Error('OPENROUTER_API_KEY not found. Set in ~/.zshrc or environment variables. Run: npm run openrouter:get-key');
        }
        this.openRouterApiKey = this.apiKey; // Alias for consistency
        return true;
    }
    /**
   * Generate embedding using OpenRouter
   */ async generateEmbedding(text, options = {}) {
        if (!this.apiKey) {
            this.initialize();
        }
        const { model = 'openai/text-embedding-3-small', crewMember = null } = options;
        // Check cache first
        const cached = this.mcpCache.getCachedEmbeddings(text);
        if (cached) {
            return cached;
        }
        return new Promise((resolve, reject)=>{
            const req = https.request({
                hostname: 'openrouter.ai',
                port: 443,
                path: '/api/v1/embeddings',
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://github.com/pbradygeorgen/alex-ai-universal',
                    'X-Title': 'Alex AI RAG'
                }
            }, (res)=>{
                let body = '';
                res.on('data', (chunk)=>body += chunk);
                res.on('end', ()=>{
                    try {
                        const data = JSON.parse(body);
                        if (res.statusCode !== 200) {
                            reject(new Error(`API error ${res.statusCode}: ${JSON.stringify(data).substring(0, 200)}`));
                            return;
                        }
                        if (data.data && data.data[0] && data.data[0].embedding) {
                            const embedding = data.data[0].embedding;
                            // Cache embedding
                            this.mcpCache.storeContext(text, embedding, {
                                sessionId: `embedding-${Date.now()}`,
                                tags: [
                                    'embedding',
                                    model,
                                    crewMember
                                ].filter(Boolean)
                            });
                            resolve(embedding);
                        } else {
                            reject(new Error(`No embedding in response: ${JSON.stringify(data).substring(0, 200)}`));
                        }
                    } catch (e) {
                        reject(new Error(`Parse error: ${e.message} - Response: ${body.substring(0, 200)}`));
                    }
                });
            });
            req.on('error', reject);
            req.write(JSON.stringify({
                model: model,
                input: text
            }));
            req.end();
        });
    }
    /**
   * Generate embedding using OpenRouter
   */ async generateEmbedding(text, options = {}) {
        if (!this.apiKey) {
            this.initialize();
        }
        const { model = 'openai/text-embedding-3-small', crewMember = null, context = null } = options;
        // Check cache first
        const cached = this.mcpCache.getCachedEmbeddings(text);
        if (cached) {
            return cached;
        }
        return new Promise((resolve, reject)=>{
            const req = https.request({
                hostname: 'openrouter.ai',
                port: 443,
                path: '/api/v1/embeddings',
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://github.com/pbradygeorgen/alex-ai-universal',
                    'X-Title': 'Alex AI RAG'
                }
            }, (res)=>{
                let body = '';
                res.on('data', (chunk)=>body += chunk);
                res.on('end', ()=>{
                    try {
                        const data = JSON.parse(body);
                        if (res.statusCode !== 200) {
                            reject(new Error(`API error ${res.statusCode}: ${JSON.stringify(data).substring(0, 200)}`));
                            return;
                        }
                        if (data.data && data.data[0] && data.data[0].embedding) {
                            const embedding = data.data[0].embedding;
                            // Cache embedding
                            this.mcpCache.storeContext(text, embedding, {
                                sessionId: `embedding-${Date.now()}`,
                                tags: [
                                    'embedding',
                                    model,
                                    crewMember
                                ].filter(Boolean)
                            });
                            resolve(embedding);
                        } else {
                            reject(new Error(`No embedding in response: ${JSON.stringify(data).substring(0, 200)}`));
                        }
                    } catch (e) {
                        reject(new Error(`Parse error: ${e.message} - Response: ${body.substring(0, 200)}`));
                    }
                });
            });
            req.on('error', reject);
            req.write(JSON.stringify({
                model: model,
                input: text
            }));
            req.end();
        });
    }
    /**
   * Select optimal model with MCP caching
   */ selectOptimalModel(context, options = {}) {
        const { taskType, complexity = 'medium', crewMember, budgetConstraint = null, estimatedTokens = 1500, useCache = true } = {
            ...context,
            ...options
        };
        // Check cache first (MCP efficiency gain!)
        if (useCache) {
            const cacheKey = this.mcpCache.generateCacheKey(JSON.stringify({
                taskType,
                complexity,
                crewMember,
                budgetConstraint,
                estimatedTokens
            }), {});
            const cached = this.mcpCache.getContext(cacheKey);
            if (cached) {
                console.log('   ✅ Using cached model selection (MCP efficiency)');
                return JSON.parse(cached.content);
            }
        }
        // Determine task type from crew member if not provided
        const actualTaskType = taskType || CREW_TASK_TYPES[crewMember] || 'general';
        // Get affinity scores for this task type
        const affinities = TASK_AFFINITIES[actualTaskType] || {};
        // Calculate scores for all models
        const scores = {};
        Object.keys(OPENROUTER_MODELS).forEach((modelId)=>{
            const model = OPENROUTER_MODELS[modelId];
            let score = affinities[modelId] || 0.7; // Default neutral score
            // Adjust for complexity
            const complexityMultiplier = {
                'low': 0.9,
                'medium': 1.0,
                'high': 1.1
            }[complexity] || 1.0;
            score *= complexityMultiplier;
            // Cost efficiency bonus (lower cost = higher bonus)
            const costEfficiency = 1 / (model.costPer1M * 1000); // Normalize
            score += costEfficiency * 0.1;
            // Crew member alignment bonus
            if (crewMember && model.crewMember && model.crewMember.includes(crewMember)) {
                score += 0.15;
            }
            // Budget constraint adjustment
            if (budgetConstraint) {
                const estimatedCost = estimatedTokens / 1000000 * model.costPer1M;
                if (estimatedCost > budgetConstraint) {
                    score *= 0.5; // Penalize expensive models if over budget
                }
            }
            scores[modelId] = score;
        });
        // Select best model
        const bestModel = Object.entries(scores).sort(([, a], [, b])=>b - a)[0];
        const selectedModel = OPENROUTER_MODELS[bestModel[0]];
        const estimatedCost = estimatedTokens / 1000000 * selectedModel.costPer1M;
        const result = {
            modelId: bestModel[0],
            model: selectedModel,
            confidence: bestModel[1],
            estimatedCost,
            estimatedTokens,
            scores,
            reasoning: {
                taskType: actualTaskType,
                complexity,
                crewMember,
                budgetConstraint
            }
        };
        // Cache result (MCP efficiency!)
        if (useCache) {
            const cacheKey = this.mcpCache.generateCacheKey(JSON.stringify({
                taskType,
                complexity,
                crewMember,
                budgetConstraint,
                estimatedTokens
            }), {});
            this.mcpCache.storeContext(JSON.stringify(result), null, {
                sessionId: `openrouter-selection-${Date.now()}`,
                tags: [
                    'openrouter',
                    'model-selection',
                    taskType,
                    crewMember
                ].filter(Boolean)
            });
        }
        return result;
    }
    /**
   * Call OpenRouter API with optimized model selection
   */ async callOpenRouter(prompt, context = {}, options = {}) {
        if (!this.apiKey) {
            this.initialize();
        }
        // Select optimal model
        const modelSelection = this.selectOptimalModel(context, options);
        console.log(`🤖 Selected model: ${modelSelection.model.name}`);
        console.log(`   Cost: $${modelSelection.estimatedCost.toFixed(4)}`);
        console.log(`   Confidence: ${(modelSelection.confidence * 100).toFixed(1)}%`);
        // Make API call
        return new Promise((resolve, reject)=>{
            const data = JSON.stringify({
                model: modelSelection.modelId,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                ...options.apiOptions || {}
            });
            const httpOptions = {
                hostname: 'openrouter.ai',
                port: 443,
                path: '/api/v1/chat/completions',
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://alex-ai-universal.com',
                    'X-Title': 'Alex AI Universal'
                },
                timeout: 30000
            };
            const req = https.request(httpOptions, (res)=>{
                let body = '';
                res.on('data', (chunk)=>body += chunk);
                res.on('end', ()=>{
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            const result = JSON.parse(body);
                            resolve({
                                ...result,
                                modelSelection,
                                cost: modelSelection.estimatedCost
                            });
                        } catch (e) {
                            resolve({
                                body,
                                modelSelection
                            });
                        }
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${body}`));
                    }
                });
            });
            req.on('error', reject);
            req.on('timeout', ()=>{
                req.destroy();
                reject(new Error('Request timeout'));
            });
            req.write(data);
            req.end();
        });
    }
    /**
   * Optimize and make LLM call (wrapper for callOpenRouter with crew context)
   */ async optimizeAndCall(prompt, options = {}) {
        const { crewMember = null, specialization = null, preferredModels = null, context = {}, budget = 'balanced', complexity = 'medium' } = options;
        // Build context for model selection
        const selectionContext = {
            crewMember: crewMember,
            taskType: CREW_TASK_TYPES[crewMember] || 'general',
            complexity: complexity,
            budgetConstraint: budget === 'low' ? 0.001 : budget === 'high' ? null : 0.01,
            ...context
        };
        // If preferred models specified, adjust selection
        if (preferredModels && preferredModels.length > 0) {
            // Override model selection to use preferred models
            const preferredModelId = preferredModels[0];
            if (OPENROUTER_MODELS[preferredModelId]) {
                selectionContext.preferredModel = preferredModelId;
            }
        }
        return await this.callOpenRouter(prompt, selectionContext, options);
    }
    /**
   * Get optimization statistics
   */ getStats() {
        const cacheStats = this.mcpCache.getStats();
        return {
            cache: cacheStats,
            models: Object.keys(OPENROUTER_MODELS).length,
            taskTypes: Object.keys(TASK_AFFINITIES).length
        };
    }
}
// Singleton instance
let mcpOpenRouterOptimizerInstance = null;
function getMCPOpenRouterOptimizer() {
    if (!mcpOpenRouterOptimizerInstance) {
        mcpOpenRouterOptimizerInstance = new MCPOpenRouterOptimizer();
    }
    return mcpOpenRouterOptimizerInstance;
}
module.exports = {
    getMCPOpenRouterOptimizer,
    MCPOpenRouterOptimizer,
    OPENROUTER_MODELS
};
}),
"[project]/scripts/rag-smart-ingestion.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

/**
 * 🖖 RAG Smart Ingestion System
 * 
 * Intelligent knowledge ingestion that prevents bloat by:
 * 1. Checking for redundancy before storing
 * 2. Only storing truly new/valuable knowledge
 * 3. Adding proper context and metadata
 * 4. Cost-aware: cheap checks, expensive only for hard problems
 * 
 * Crew Coordination:
 * - Data: Semantic similarity analysis
 * - Quark: Cost-benefit analysis
 * - Riker: Decision coordination
 * - Dr. Crusher: Knowledge health monitoring
 * 
 * Usage:
 *   node scripts/rag-smart-ingestion.js --title "Title" --content "Content" [--crew=data] [--force]
 */ const { createClient } = __turbopack_context__.r("[project]/node_modules/@supabase/supabase-js/dist/module/index.js [app-route] (ecmascript)");
const { loadSupabaseCredentials } = __turbopack_context__.r("[project]/scripts/utils/secure-credential-loader.js [app-route] (ecmascript)");
const { getMCPOpenRouterOptimizer } = __turbopack_context__.r("[project]/scripts/utils/mcp-openrouter-optimizer.js [app-route] (ecmascript)");
class SmartRAGIngestion {
    constructor(){
        this.supabase = null;
        this.optimizer = null;
        this.similarityThreshold = 0.85; // High threshold to avoid false positives
        this.costThreshold = 0.01; // $0.01 for expensive operations
    }
    async initialize() {
        const creds = loadSupabaseCredentials();
        if (!creds.url || !creds.serviceKey) {
            throw new Error('Supabase credentials not found');
        }
        this.supabase = createClient(creds.url, creds.serviceKey);
        this.optimizer = getMCPOpenRouterOptimizer();
        this.optimizer.initialize();
    }
    /**
   * Quick redundancy check (cheap - no LLM calls)
   */ async quickRedundancyCheck(title, content) {
        // Check for exact title match
        const { data: titleMatches } = await this.supabase.from('knowledge_base').select('id, title, content, created_at').ilike('title', title).limit(5);
        if (titleMatches && titleMatches.length > 0) {
            // Check content similarity (simple Jaccard)
            for (const match of titleMatches){
                const similarity = this.jaccardSimilarity(content.toLowerCase().substring(0, 500), (this.getContent(match) || '').toLowerCase().substring(0, 500));
                if (similarity > 0.9) {
                    return {
                        redundant: true,
                        reason: 'exact_duplicate',
                        existing: match,
                        similarity,
                        cost: 0 // Free check
                    };
                }
            }
        }
        return {
            redundant: false,
            cost: 0
        };
    }
    /**
   * Semantic similarity check (moderate cost - uses embeddings if available)
   */ async semanticRedundancyCheck(title, content, maxCost = 0.001) {
        // First, try to use existing embeddings for similarity
        const { data: recentMemories } = await this.supabase.from('knowledge_base').select('id, title, content, embedding, created_at').order('created_at', {
            ascending: false
        }).limit(20); // Check recent 20 memories
        if (!recentMemories || recentMemories.length === 0) {
            return {
                redundant: false,
                cost: 0
            };
        }
        // Simple content-based similarity (no embedding generation)
        let highestSimilarity = 0;
        let mostSimilar = null;
        for (const memory of recentMemories){
            const similarity = this.calculateContentSimilarity(content, memory);
            if (similarity > highestSimilarity) {
                highestSimilarity = similarity;
                mostSimilar = memory;
            }
        }
        if (highestSimilarity > this.similarityThreshold) {
            return {
                redundant: true,
                reason: 'high_semantic_overlap',
                existing: mostSimilar,
                similarity: highestSimilarity,
                cost: 0 // Free - used existing data
            };
        }
        return {
            redundant: false,
            cost: 0
        };
    }
    /**
   * Crew evaluation for hard problems (expensive - uses LLM)
   * Only called when quick checks pass but we need crew judgment
   */ async crewEvaluation(title, content, context = {}) {
        const isHardProblem = context.isHardProblem || false;
        const crewWorkingTogether = context.crewWorkingTogether || false;
        // Only use expensive LLM evaluation for hard problems with crew coordination
        if (!isHardProblem || !crewWorkingTogether) {
            return {
                shouldStore: true,
                reason: 'standard_ingestion',
                cost: 0,
                crewRecommendation: null
            };
        }
        console.log('🤖 Crew evaluating knowledge for hard problem...\n');
        // Data: Technical value assessment
        const dataPrompt = `You are Commander Data. Evaluate this knowledge for technical value:

Title: ${title}
Content: ${content.substring(0, 1000)}...

Assess:
1. Is this truly new knowledge or redundant?
2. What technical value does it add?
3. Should it be stored?

Respond with: STORE or SKIP, then brief reasoning.`;
        const dataAnalysis = await this.optimizer.optimizeAndCall(dataPrompt, {
            crewMember: 'data',
            complexity: 'medium',
            taskType: 'quick_analysis',
            temperature: 0.7,
            maxTokens: 200
        });
        // Quark: Cost-benefit analysis
        const quarkPrompt = `You are Quark. Evaluate cost-benefit of storing this knowledge:

Title: ${title}
Content: ${content.substring(0, 500)}...

Assess:
1. Storage cost vs value
2. Will this prevent future redundant storage?
3. ROI of storing this knowledge

Respond with: STORE or SKIP, then brief reasoning.`;
        const quarkAnalysis = await this.optimizer.optimizeAndCall(quarkPrompt, {
            crewMember: 'quark',
            complexity: 'low',
            taskType: 'business_analysis',
            temperature: 0.7,
            maxTokens: 200
        });
        // Parse responses
        const dataDecision = this.parseCrewDecision(dataAnalysis);
        const quarkDecision = this.parseCrewDecision(quarkAnalysis);
        const shouldStore = dataDecision === 'STORE' && quarkDecision === 'STORE';
        const cost = 0.0004 + 0.0004; // ~$0.0008 for both crew members
        return {
            shouldStore,
            reason: shouldStore ? 'crew_approved' : 'crew_rejected',
            cost,
            crewRecommendation: {
                data: dataDecision,
                quark: quarkDecision
            }
        };
    }
    /**
   * Parse crew decision from LLM response
   */ parseCrewDecision(response) {
        const text = response.choices?.[0]?.message?.content || response.body || response || '';
        const upper = text.toUpperCase();
        if (upper.includes('STORE')) return 'STORE';
        if (upper.includes('SKIP')) return 'SKIP';
        return 'STORE'; // Default to store if unclear
    }
    /**
   * Calculate content similarity
   */ calculateContentSimilarity(content1, memory) {
        const content2 = this.getContent(memory);
        const title1 = content1.substring(0, 100).toLowerCase();
        const title2 = (memory.title || '').toLowerCase();
        // Title similarity
        const titleSim = this.jaccardSimilarity(title1, title2);
        // Content similarity
        const contentSim = this.jaccardSimilarity(content1.toLowerCase().substring(0, 500), content2.toLowerCase().substring(0, 500));
        return titleSim * 0.4 + contentSim * 0.6;
    }
    /**
   * Jaccard similarity
   */ jaccardSimilarity(str1, str2) {
        const words1 = new Set(str1.split(/\s+/).filter((w)=>w.length > 2));
        const words2 = new Set(str2.split(/\s+/).filter((w)=>w.length > 2));
        if (words1.size === 0 && words2.size === 0) return 1.0;
        if (words1.size === 0 || words2.size === 0) return 0.0;
        const intersection = new Set([
            ...words1
        ].filter((x)=>words2.has(x)));
        const union = new Set([
            ...words1,
            ...words2
        ]);
        return intersection.size / union.size;
    }
    /**
   * Get content from memory record
   */ getContent(record) {
        if (typeof record.content === 'string') {
            return record.content;
        } else if (typeof record.content === 'object') {
            return JSON.stringify(record.content);
        } else if (record.detailed_analysis) {
            return record.detailed_analysis;
        } else if (record.summary) {
            return record.summary;
        }
        return '';
    }
    /**
   * Add context to knowledge before storing
   */ async addContext(title, content, metadata = {}) {
        const context = {
            ingestionDate: new Date().toISOString(),
            crewMember: metadata.crewMember || null,
            category: metadata.category || 'knowledge',
            tags: metadata.tags || [],
            source: metadata.source || 'manual',
            problemComplexity: metadata.isHardProblem ? 'high' : 'standard',
            crewCoordination: metadata.crewWorkingTogether || false,
            ...metadata
        };
        // If crew member provided, add their perspective
        if (metadata.crewMember) {
            const crewContext = this.getCrewContext(metadata.crewMember);
            context.crewPerspective = crewContext;
        }
        return context;
    }
    /**
   * Get crew member context
   */ getCrewContext(crewMember) {
        const contexts = {
            data: 'Technical analysis and logical reasoning',
            quark: 'Cost optimization and business value',
            riker: 'Tactical coordination and operations',
            picard: 'Strategic leadership and vision',
            crusher: 'System health and diagnostics',
            la_forge: 'Infrastructure and engineering',
            worf: 'Security and threat assessment',
            troi: 'User experience and psychology',
            uhura: 'Communication and networking',
            obrien: 'Pragmatic solutions and quick fixes'
        };
        return contexts[crewMember] || 'General knowledge';
    }
    /**
   * Store knowledge with proper context
   */ async storeKnowledge(title, content, metadata = {}) {
        const context = await this.addContext(title, content, metadata);
        // Match knowledge_base schema (no metadata column, use JSONB fields)
        const payload = {
            session_id: `smart-ingestion-${Date.now()}`,
            title: title,
            content: typeof content === 'string' ? content : JSON.stringify(content),
            category: context.category,
            tags: Array.isArray(context.tags) ? context.tags : [],
            executive_summary: context.crewPerspective || null,
            // Store context in content as JSONB if content is object
            ...typeof content === 'object' ? {
                content: JSON.stringify(content)
            } : {}
        };
        const { data, error } = await this.supabase.from('knowledge_base').insert([
            payload
        ]).select().single();
        if (error) throw error;
        return {
            success: true,
            id: data.id,
            context: context
        };
    }
    /**
   * Main ingestion flow
   */ async ingest(title, content, options = {}) {
        const { crewMember = null, category = 'knowledge', tags = [], force = false, isHardProblem = false, crewWorkingTogether = false, source = 'manual' } = options;
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🖖 SMART RAG INGESTION');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log(`Title: ${title}`);
        console.log(`Content: ${content.substring(0, 100)}...\n`);
        let totalCost = 0;
        // Step 1: Quick redundancy check (free)
        console.log('🔍 Step 1: Quick redundancy check (free)...');
        const quickCheck = await this.quickRedundancyCheck(title, content);
        totalCost += quickCheck.cost;
        if (quickCheck.redundant && !force) {
            console.log(`   ⚠️  Redundant: ${quickCheck.reason}`);
            console.log(`   📋 Existing: ${quickCheck.existing.title} (similarity: ${(quickCheck.similarity * 100).toFixed(1)}%)\n`);
            return {
                stored: false,
                reason: quickCheck.reason,
                existing: quickCheck.existing,
                cost: totalCost
            };
        }
        console.log('   ✅ Not an exact duplicate\n');
        // Step 2: Semantic redundancy check (free - uses existing data)
        console.log('🔍 Step 2: Semantic similarity check (free)...');
        const semanticCheck = await this.semanticRedundancyCheck(title, content);
        totalCost += semanticCheck.cost;
        if (semanticCheck.redundant && !force) {
            console.log(`   ⚠️  High semantic overlap: ${(semanticCheck.similarity * 100).toFixed(1)}%`);
            console.log(`   📋 Similar to: ${semanticCheck.existing.title}\n`);
            return {
                stored: false,
                reason: semanticCheck.reason,
                existing: semanticCheck.existing,
                cost: totalCost
            };
        }
        console.log('   ✅ No high semantic overlap\n');
        // Step 3: Crew evaluation (only for hard problems with crew coordination)
        let crewEval = null;
        if (isHardProblem && crewWorkingTogether) {
            console.log('🤖 Step 3: Crew evaluation (cost: ~$0.0008)...');
            crewEval = await this.crewEvaluation(title, content, {
                isHardProblem,
                crewWorkingTogether
            });
            totalCost += crewEval.cost;
            if (!crewEval.shouldStore && !force) {
                console.log(`   ⚠️  Crew recommendation: ${crewEval.reason}`);
                console.log(`   📋 Data: ${crewEval.crewRecommendation?.data}`);
                console.log(`   📋 Quark: ${crewEval.crewRecommendation?.quark}\n`);
                return {
                    stored: false,
                    reason: crewEval.reason,
                    crewRecommendation: crewEval.crewRecommendation,
                    cost: totalCost
                };
            }
            console.log('   ✅ Crew approved storage\n');
        } else {
            console.log('   ℹ️  Standard ingestion (no crew evaluation needed)\n');
        }
        // Step 4: Store with context
        console.log('💾 Step 4: Storing with context...');
        const result = await this.storeKnowledge(title, content, {
            crewMember,
            category,
            tags,
            isHardProblem,
            crewWorkingTogether,
            source
        });
        console.log(`   ✅ Stored successfully (ID: ${result.id})`);
        console.log(`   📋 Category: ${result.context.category}`);
        console.log(`   🏷️  Tags: ${result.context.tags.join(', ') || 'none'}`);
        console.log(`   💰 Total cost: $${totalCost.toFixed(6)}\n`);
        return {
            stored: true,
            id: result.id,
            context: result.context,
            cost: totalCost
        };
    }
}
async function main() {
    const args = process.argv.slice(2);
    // Parse arguments
    let title = null;
    let content = null;
    let crewMember = null;
    let category = 'knowledge';
    let tags = [];
    let force = false;
    let isHardProblem = false;
    let crewWorkingTogether = false;
    for(let i = 0; i < args.length; i++){
        if (args[i] === '--title' && args[i + 1]) {
            title = args[i + 1];
            i++;
        } else if (args[i] === '--content' && args[i + 1]) {
            content = args[i + 1];
            i++;
        } else if (args[i] === '--crew' && args[i + 1]) {
            crewMember = args[i + 1];
            i++;
        } else if (args[i] === '--category' && args[i + 1]) {
            category = args[i + 1];
            i++;
        } else if (args[i] === '--tags' && args[i + 1]) {
            tags = args[i + 1].split(',');
            i++;
        } else if (args[i] === '--force') {
            force = true;
        } else if (args[i] === '--hard-problem') {
            isHardProblem = true;
        } else if (args[i] === '--crew-together') {
            crewWorkingTogether = true;
        }
    }
    if (!title || !content) {
        console.error('Usage: node scripts/rag-smart-ingestion.js --title "Title" --content "Content" [options]');
        console.error('Options:');
        console.error('  --crew <member>        Crew member (data, quark, riker, etc.)');
        console.error('  --category <cat>       Category (default: knowledge)');
        console.error('  --tags <tag1,tag2>     Comma-separated tags');
        console.error('  --force                Force storage even if redundant');
        console.error('  --hard-problem         Mark as hard problem (enables crew evaluation)');
        console.error('  --crew-together        Crew working together (enables crew evaluation)');
        process.exit(1);
    }
    const ingestion = new SmartRAGIngestion();
    await ingestion.initialize();
    const result = await ingestion.ingest(title, content, {
        crewMember,
        category,
        tags,
        force,
        isHardProblem,
        crewWorkingTogether
    });
    if (result.stored) {
        console.log('✅ Knowledge ingested successfully!\n');
    } else {
        console.log(`⚠️  Knowledge not stored: ${result.reason}\n`);
    }
}
if (/*TURBOPACK member replacement*/ __turbopack_context__.t.main === module) {
    main().catch((err)=>{
        console.error('\n❌ Error:', err.message);
        process.exit(1);
    });
}
module.exports = {
    SmartRAGIngestion
};
}),
"[project]/scripts/utils/mcp-memory-storage.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

/**
 * 🖖 MCP Memory Storage Service
 * 
 * Direct Supabase integration for memory storage using MCP context caching.
 * Bypasses n8n webhooks entirely for reliable memory storage.
 */ const https = __turbopack_context__.r("[externals]/https [external] (https, cjs)");
const { loadCrewCredentials } = __turbopack_context__.r("[project]/scripts/utils/load-crew-credentials.js [app-route] (ecmascript)");
const { getMCPCache } = __turbopack_context__.r("[project]/scripts/utils/mcp-context-cache.js [app-route] (ecmascript)");
class MCPMemoryStorage {
    constructor(){
        this.supabaseUrl = null;
        this.supabaseKey = null;
        this.mcpCache = getMCPCache();
    }
    /**
   * Initialize Supabase credentials
   */ initialize() {
        const { supabase } = loadCrewCredentials();
        this.supabaseUrl = supabase.url;
        this.supabaseKey = supabase.serviceKey || supabase.key;
        if (!this.supabaseUrl || !this.supabaseKey) {
            throw new Error('Supabase credentials not found. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in ~/.zshrc');
        }
        return true;
    }
    /**
   * Store memory with MCP context caching and smart redundancy checking
   */ async storeMemory(memoryData) {
        if (!this.supabaseUrl || !this.supabaseKey) {
            this.initialize();
        }
        const { content, title, category = 'memory', tags = [], crewMember, sessionId, metadata = {} } = memoryData;
        // Check MCP cache first (avoid duplicate storage)
        const cacheKey = this.mcpCache.generateCacheKey(content, {
            title,
            category,
            sessionId
        });
        const cached = this.mcpCache.getContext(cacheKey);
        if (cached) {
            console.log('   ✅ Using cached MCP context (avoiding duplicate storage)');
            return {
                success: true,
                cached: true,
                contextId: cached.id,
                message: 'Memory already cached in MCP system'
            };
        }
        // Smart redundancy check (if smart ingestion available)
        try {
            const { SmartRAGIngestion } = __turbopack_context__.r("[project]/scripts/rag-smart-ingestion.js [app-route] (ecmascript)");
            const smartIngestion = new SmartRAGIngestion();
            await smartIngestion.initialize();
            // Quick redundancy check (free)
            const quickCheck = await smartIngestion.quickRedundancyCheck(title, content);
            if (quickCheck.redundant && !metadata.force) {
                console.log(`   ⚠️  Redundant knowledge detected: ${quickCheck.reason}`);
                console.log(`   📋 Similar to: ${quickCheck.existing.title}`);
                return {
                    success: false,
                    cached: false,
                    redundant: true,
                    existing: quickCheck.existing,
                    message: `Knowledge is redundant: ${quickCheck.reason}`
                };
            }
            // Semantic redundancy check (free - uses existing data)
            const semanticCheck = await smartIngestion.semanticRedundancyCheck(title, content);
            if (semanticCheck.redundant && !metadata.force) {
                console.log(`   ⚠️  High semantic overlap: ${(semanticCheck.similarity * 100).toFixed(1)}%`);
                console.log(`   📋 Similar to: ${semanticCheck.existing.title}`);
                return {
                    success: false,
                    cached: false,
                    redundant: true,
                    existing: semanticCheck.existing,
                    message: `High semantic overlap: ${(semanticCheck.similarity * 100).toFixed(1)}%`
                };
            }
        } catch (error) {
            // If smart ingestion not available, continue with normal flow
            console.log('   ℹ️  Smart ingestion check skipped (continuing with normal storage)');
        }
        // Check for cached embeddings
        const cachedEmbeddings = this.mcpCache.getCachedEmbeddings(content);
        // Prepare payload (match working simple-direct-rag-push.js pattern exactly)
        // Schema: id, title, content, embedding, metadata, session_id, created_at, updated_at
        // Note: simple-direct-rag-push.js doesn't include metadata due to schema cache issues
        const payload = {
            session_id: sessionId || `memory-${Date.now()}`,
            title: title || 'Untitled Memory',
            content: content,
            category: category || 'memory'
        };
        // Only add embedding if we have one (format as string like simple-direct-rag-push.js)
        if (cachedEmbeddings && Array.isArray(cachedEmbeddings) && cachedEmbeddings.length > 0) {
            payload.embedding = `[${cachedEmbeddings.join(',')}]`;
        }
        // Store in Supabase
        try {
            const result = await this.insertToSupabase(payload);
            // Cache the context for future use
            this.mcpCache.storeContext(content, cachedEmbeddings, {
                sessionId: payload.session_id,
                crewMembers: crewMember ? [
                    crewMember
                ] : [],
                tags: tags
            });
            return {
                success: true,
                cached: false,
                result: result,
                message: 'Memory stored successfully via MCP system'
            };
        } catch (error) {
            throw new Error(`Failed to store memory: ${error.message}`);
        }
    }
    /**
   * Insert data into Supabase
   */ async insertToSupabase(payload) {
        return new Promise((resolve, reject)=>{
            const url = new URL('/rest/v1/knowledge_base', this.supabaseUrl);
            const data = JSON.stringify([
                payload
            ]); // Supabase expects array
            const options = {
                hostname: url.hostname,
                port: url.port || 443,
                path: url.pathname,
                method: 'POST',
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                timeout: 30000
            };
            const req = https.request(options, (res)=>{
                let body = '';
                res.on('data', (chunk)=>body += chunk);
                res.on('end', ()=>{
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            const result = JSON.parse(body);
                            resolve(result);
                        } catch (e) {
                            resolve(body);
                        }
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${body}`));
                    }
                });
            });
            req.on('error', reject);
            req.on('timeout', ()=>{
                req.destroy();
                reject(new Error('Request timeout'));
            });
            req.write(data);
            req.end();
        });
    }
    /**
   * Query memories with MCP caching
   */ async queryMemories(query, options = {}) {
        if (!this.supabaseUrl || !this.supabaseKey) {
            this.initialize();
        }
        const { limit = 10, category = null, crewMember = null, useCache = true } = options;
        // Check cache first
        if (useCache) {
            const cacheKey = this.mcpCache.generateCacheKey(query, options);
            const cached = this.mcpCache.getContext(cacheKey);
            if (cached) {
                console.log('   ✅ Using cached query results (MCP efficiency)');
                return {
                    success: true,
                    cached: true,
                    results: JSON.parse(cached.content),
                    contextId: cached.id
                };
            }
        }
        // Build Supabase query
        // Schema columns: id, title, content, embedding, metadata, session_id, created_at, updated_at
        let queryPath = `/rest/v1/knowledge_base?select=*&limit=${limit}`;
        // Category and tags are in metadata JSONB, filter after fetching
        // For semantic search, we'd use pgvector, but for now use text search
        // Note: content is JSONB, so we need to cast it or use a different approach
        // Using or filter with title search instead
        if (query) {
            // Search in title field (text) instead of content (JSONB)
            queryPath += `&title=ilike.%25${encodeURIComponent(query)}%25`;
        }
        try {
            let results = await this.querySupabase(queryPath);
            // Filter by category if specified (from metadata)
            if (category) {
                results = results.filter((r)=>r.metadata && r.metadata.category === category);
            }
            // Filter by crew member if specified (from metadata)
            if (crewMember) {
                results = results.filter((r)=>r.metadata && r.metadata.crew_member === crewMember);
            }
            // Cache results
            if (useCache && results.length > 0) {
                this.mcpCache.storeContext(JSON.stringify(results), null, {
                    sessionId: `query-${Date.now()}`,
                    tags: [
                        'query',
                        'memory-search'
                    ]
                });
            }
            return {
                success: true,
                cached: false,
                results: results,
                count: results.length
            };
        } catch (error) {
            throw new Error(`Failed to query memories: ${error.message}`);
        }
    }
    /**
   * Query Supabase
   */ async querySupabase(queryPath) {
        return new Promise((resolve, reject)=>{
            const url = new URL(queryPath, this.supabaseUrl);
            const options = {
                hostname: url.hostname,
                port: url.port || 443,
                path: url.pathname + url.search,
                method: 'GET',
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            };
            const req = https.request(options, (res)=>{
                let body = '';
                res.on('data', (chunk)=>body += chunk);
                res.on('end', ()=>{
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            const result = JSON.parse(body);
                            resolve(result);
                        } catch (e) {
                            resolve(body);
                        }
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${body}`));
                    }
                });
            });
            req.on('error', reject);
            req.on('timeout', ()=>{
                req.destroy();
                reject(new Error('Request timeout'));
            });
            req.end();
        });
    }
    /**
   * Get cache statistics
   */ getCacheStats() {
        return this.mcpCache.getStats();
    }
}
// Singleton instance
let mcpMemoryStorageInstance = null;
function getMCPMemoryStorage() {
    if (!mcpMemoryStorageInstance) {
        mcpMemoryStorageInstance = new MCPMemoryStorage();
    }
    return mcpMemoryStorageInstance;
}
module.exports = {
    getMCPMemoryStorage,
    MCPMemoryStorage
};
}),
"[project]/scripts/utils/mcp-monitoring.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

/**
 * 🖖 MCP Monitoring & Logging
 * 
 * Execution history, performance metrics, and error tracking for MCP workflows.
 */ const { getMCPMemoryStorage } = __turbopack_context__.r("[project]/scripts/utils/mcp-memory-storage.js [app-route] (ecmascript)");
const fs = __turbopack_context__.r("[externals]/fs [external] (fs, cjs)");
const path = __turbopack_context__.r("[externals]/path [external] (path, cjs)");
class MCPMonitoring {
    constructor(){
        this.executionHistory = [];
        this.performanceMetrics = [];
        this.errors = [];
        this.memoryStorage = null;
        this.maxHistorySize = 1000;
    }
    /**
   * Initialize monitoring
   */ initialize() {
        try {
            this.memoryStorage = getMCPMemoryStorage();
            this.memoryStorage.initialize();
        } catch (e) {
        // Memory storage optional
        }
        return true;
    }
    /**
   * Log workflow execution
   */ logExecution(execution) {
        const logEntry = {
            id: `exec-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            timestamp: new Date().toISOString(),
            workflow: execution.workflow,
            status: execution.success ? 'success' : 'failed',
            duration: execution.duration || 0,
            result: execution.result,
            error: execution.error,
            metadata: execution.metadata || {}
        };
        this.executionHistory.push(logEntry);
        // Limit history size
        if (this.executionHistory.length > this.maxHistorySize) {
            this.executionHistory.shift();
        }
        // Store in memory storage if available
        if (this.memoryStorage && execution.persist) {
            this.memoryStorage.storeMemory({
                title: `Workflow Execution: ${execution.workflow}`,
                content: JSON.stringify(logEntry, null, 2),
                category: 'workflow-execution',
                tags: [
                    'monitoring',
                    'execution',
                    execution.workflow
                ],
                sessionId: logEntry.id,
                metadata: {
                    source: 'mcp-monitoring',
                    ...logEntry.metadata
                }
            }).catch((e)=>{
            // Silent fail for monitoring
            });
        }
        return logEntry;
    }
    /**
   * Log performance metric
   */ logPerformance(metric) {
        const perfEntry = {
            id: `perf-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            timestamp: new Date().toISOString(),
            workflow: metric.workflow,
            metric: metric.metric,
            value: metric.value,
            unit: metric.unit || 'ms',
            metadata: metric.metadata || {}
        };
        this.performanceMetrics.push(perfEntry);
        // Limit metrics size
        if (this.performanceMetrics.length > this.maxHistorySize) {
            this.performanceMetrics.shift();
        }
        return perfEntry;
    }
    /**
   * Log error
   */ logError(error) {
        const errorEntry = {
            id: `error-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            timestamp: new Date().toISOString(),
            workflow: error.workflow || 'unknown',
            error: error.message || error.error,
            stack: error.stack,
            context: error.context || {},
            metadata: error.metadata || {}
        };
        this.errors.push(errorEntry);
        // Limit errors size
        if (this.errors.length > 500) {
            this.errors.shift();
        }
        // Store critical errors in memory storage
        if (this.memoryStorage && error.critical) {
            this.memoryStorage.storeMemory({
                title: `Error: ${error.workflow || 'Unknown'}`,
                content: JSON.stringify(errorEntry, null, 2),
                category: 'error',
                tags: [
                    'monitoring',
                    'error',
                    error.workflow || 'unknown'
                ],
                sessionId: errorEntry.id,
                metadata: {
                    source: 'mcp-monitoring',
                    critical: true,
                    ...errorEntry.metadata
                }
            }).catch((e)=>{
            // Silent fail for monitoring
            });
        }
        return errorEntry;
    }
    /**
   * Get execution history
   */ getExecutionHistory(filters = {}) {
        let history = [
            ...this.executionHistory
        ];
        if (filters.workflow) {
            history = history.filter((h)=>h.workflow === filters.workflow);
        }
        if (filters.status) {
            history = history.filter((h)=>h.status === filters.status);
        }
        if (filters.startDate) {
            history = history.filter((h)=>h.timestamp >= filters.startDate);
        }
        if (filters.endDate) {
            history = history.filter((h)=>h.timestamp <= filters.endDate);
        }
        if (filters.limit) {
            history = history.slice(-filters.limit);
        }
        return history;
    }
    /**
   * Get performance metrics
   */ getPerformanceMetrics(filters = {}) {
        let metrics = [
            ...this.performanceMetrics
        ];
        if (filters.workflow) {
            metrics = metrics.filter((m)=>m.workflow === filters.workflow);
        }
        if (filters.metric) {
            metrics = metrics.filter((m)=>m.metric === filters.metric);
        }
        if (filters.limit) {
            metrics = metrics.slice(-filters.limit);
        }
        return metrics;
    }
    /**
   * Get errors
   */ getErrors(filters = {}) {
        let errors = [
            ...this.errors
        ];
        if (filters.workflow) {
            errors = errors.filter((e)=>e.workflow === filters.workflow);
        }
        if (filters.critical) {
            errors = errors.filter((e)=>e.critical);
        }
        if (filters.startDate) {
            errors = errors.filter((e)=>e.timestamp >= filters.startDate);
        }
        if (filters.limit) {
            errors = errors.slice(-filters.limit);
        }
        return errors;
    }
    /**
   * Get statistics
   */ getStats() {
        const totalExecutions = this.executionHistory.length;
        const successfulExecutions = this.executionHistory.filter((h)=>h.status === 'success').length;
        const failedExecutions = this.executionHistory.filter((h)=>h.status === 'failed').length;
        const avgDuration = this.executionHistory.length > 0 ? this.executionHistory.reduce((sum, h)=>sum + (h.duration || 0), 0) / this.executionHistory.length : 0;
        const totalErrors = this.errors.length;
        const criticalErrors = this.errors.filter((e)=>e.critical).length;
        return {
            executions: {
                total: totalExecutions,
                successful: successfulExecutions,
                failed: failedExecutions,
                successRate: totalExecutions > 0 ? (successfulExecutions / totalExecutions * 100).toFixed(1) + '%' : '0%',
                averageDuration: avgDuration.toFixed(2) + 'ms'
            },
            errors: {
                total: totalErrors,
                critical: criticalErrors
            },
            performance: {
                metricsCount: this.performanceMetrics.length
            }
        };
    }
    /**
   * Export execution history
   */ exportHistory(filePath) {
        const data = {
            timestamp: new Date().toISOString(),
            executions: this.executionHistory,
            performance: this.performanceMetrics,
            errors: this.errors
        };
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return filePath;
    }
}
// Singleton instance
let mcpMonitoringInstance = null;
function getMCPMonitoring() {
    if (!mcpMonitoringInstance) {
        mcpMonitoringInstance = new MCPMonitoring();
    }
    return mcpMonitoringInstance;
}
module.exports = {
    getMCPMonitoring,
    MCPMonitoring
};
}),
"[externals]/child_process [external] (child_process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("child_process", () => require("child_process"));

module.exports = mod;
}),
"[project]/scripts/utils/mcp-workflow-service.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

/**
 * 🖖 MCP Workflow Service
 * 
 * Provides workflow orchestration using MCP context caching instead of n8n.
 * Handles workflow state, API calls, and context sharing.
 */ const { getMCPCache } = __turbopack_context__.r("[project]/scripts/utils/mcp-context-cache.js [app-route] (ecmascript)");
const { getMCPMemoryStorage } = __turbopack_context__.r("[project]/scripts/utils/mcp-memory-storage.js [app-route] (ecmascript)");
const { getMCPOpenRouterOptimizer } = __turbopack_context__.r("[project]/scripts/utils/mcp-openrouter-optimizer.js [app-route] (ecmascript)");
const { getMCPMonitoring } = __turbopack_context__.r("[project]/scripts/utils/mcp-monitoring.js [app-route] (ecmascript)");
const https = __turbopack_context__.r("[externals]/https [external] (https, cjs)");
class MCPWorkflowService {
    constructor(){
        this.mcpCache = getMCPCache();
        this.memoryStorage = null;
        this.openRouterOptimizer = null;
        this.monitoring = null;
    }
    /**
   * Initialize workflow service
   */ initialize() {
        this.memoryStorage = getMCPMemoryStorage();
        try {
            this.memoryStorage.initialize();
        } catch (e) {
        // Memory storage optional for some workflows
        }
        // Initialize OpenRouter optimizer
        this.openRouterOptimizer = getMCPOpenRouterOptimizer();
        try {
            this.openRouterOptimizer.initialize();
        } catch (e) {
        // OpenRouter optional for some workflows
        }
        // Initialize monitoring
        this.monitoring = getMCPMonitoring();
        try {
            this.monitoring.initialize();
        } catch (e) {
        // Monitoring optional
        }
        return true;
    }
    /**
   * Execute workflow with MCP caching and monitoring
   */ async executeWorkflow(workflowName, workflowData, options = {}) {
        const { useCache = true, cacheTTL = 3600000, retries = 3 } = options;
        const startTime = Date.now();
        // Check cache first
        if (useCache) {
            const cacheKey = this.mcpCache.generateCacheKey(JSON.stringify({
                workflow: workflowName,
                data: workflowData
            }), options);
            const cached = this.mcpCache.getContext(cacheKey);
            if (cached && this.isValidCache(cached, cacheTTL)) {
                console.log(`   ✅ Using cached workflow result (MCP efficiency)`);
                const result = JSON.parse(cached.content);
                // Log execution (cached)
                if (this.monitoring) {
                    this.monitoring.logExecution({
                        workflow: workflowName,
                        success: true,
                        duration: Date.now() - startTime,
                        result: result,
                        metadata: {
                            cached: true
                        }
                    });
                }
                return result;
            }
        }
        // Execute workflow
        let result;
        let error = null;
        let attempts = 0;
        while(attempts < retries){
            try {
                result = await this.runWorkflow(workflowName, workflowData);
                break;
            } catch (err) {
                error = err;
                attempts++;
                if (attempts >= retries) {
                    break;
                }
                // Exponential backoff
                await this.sleep(Math.pow(2, attempts) * 1000);
            }
        }
        const duration = Date.now() - startTime;
        // Log execution
        if (this.monitoring) {
            this.monitoring.logExecution({
                workflow: workflowName,
                success: !error,
                duration: duration,
                result: result,
                error: error ? error.message : null,
                metadata: {
                    attempts,
                    retries
                }
            });
            // Log performance
            this.monitoring.logPerformance({
                workflow: workflowName,
                metric: 'execution_time',
                value: duration,
                unit: 'ms'
            });
            // Log error if any
            if (error) {
                this.monitoring.logError({
                    workflow: workflowName,
                    message: error.message,
                    stack: error.stack,
                    context: {
                        workflowData,
                        attempts,
                        retries
                    }
                });
            }
        }
        if (error) {
            throw error;
        }
        // Cache result
        if (useCache && result) {
            this.mcpCache.storeContext(JSON.stringify(result), null, {
                sessionId: `workflow-${workflowName}-${Date.now()}`,
                tags: [
                    'workflow',
                    workflowName
                ]
            });
        }
        return result;
    }
    /**
   * Run specific workflow
   */ async runWorkflow(workflowName, workflowData) {
        switch(workflowName){
            case 'knowledge-ingest':
                return await this.knowledgeIngestWorkflow(workflowData);
            case 'milestone-push':
                return await this.milestonePushWorkflow(workflowData);
            case 'memory-store':
                return await this.memoryStoreWorkflow(workflowData);
            case 'crew-analysis':
                return await this.crewAnalysisWorkflow(workflowData);
            case 'llm-call':
                return await this.llmCallWorkflow(workflowData);
            default:
                throw new Error(`Unknown workflow: ${workflowName}`);
        }
    }
    /**
   * Knowledge Ingest Workflow (replaces n8n webhook)
   */ async knowledgeIngestWorkflow(data) {
        if (!this.memoryStorage) {
            this.initialize();
        }
        const { content, title, category = 'knowledge', tags = [], metadata = {} } = data;
        // Store via MCP memory storage
        const result = await this.memoryStorage.storeMemory({
            title: title || 'Knowledge Entry',
            content,
            category,
            tags,
            sessionId: metadata.sessionId || `knowledge-${Date.now()}`,
            metadata
        });
        return {
            success: true,
            workflow: 'knowledge-ingest',
            result: result,
            method: 'mcp-direct'
        };
    }
    /**
   * Milestone Push Workflow (enhanced MCP version)
   */ async milestonePushWorkflow(data) {
        const { milestonePath, milestoneData } = data;
        // Use MCP-enhanced milestone push
        const { execSync } = __turbopack_context__.r("[externals]/child_process [external] (child_process, cjs)");
        const path = __turbopack_context__.r("[externals]/path [external] (path, cjs)");
        const scriptPath = path.join(("TURBOPACK compile-time value", "/ROOT/scripts/utils"), '..', 'push-milestone-to-rag.js');
        try {
            const output = execSync(`node "${scriptPath}" "${milestonePath}"`, {
                encoding: 'utf8',
                cwd: path.dirname(scriptPath)
            });
            return {
                success: true,
                workflow: 'milestone-push',
                output: output,
                method: 'mcp-enhanced'
            };
        } catch (error) {
            throw new Error(`Milestone push failed: ${error.message}`);
        }
    }
    /**
   * Memory Store Workflow (uses MCP memory storage)
   */ async memoryStoreWorkflow(data) {
        if (!this.memoryStorage) {
            this.initialize();
        }
        return await this.memoryStorage.storeMemory(data);
    }
    /**
   * LLM Call Workflow (with OpenRouter optimization)
   */ async llmCallWorkflow(data) {
        const { prompt, taskType, complexity = 'medium', crewMember, budgetConstraint = null, estimatedTokens = 1500 } = data;
        if (!this.openRouterOptimizer) {
            this.initialize();
        }
        // Use OpenRouter optimizer with MCP caching
        const result = await this.openRouterOptimizer.callOpenRouter(prompt, {
            taskType,
            complexity,
            crewMember,
            budgetConstraint,
            estimatedTokens
        }, {
            useCache: true
        });
        return {
            success: true,
            workflow: 'llm-call',
            result: result,
            modelSelection: result.modelSelection,
            method: 'mcp-openrouter-optimized'
        };
    }
    /**
   * Crew Analysis Workflow (MCP-enhanced)
   */ async crewAnalysisWorkflow(data) {
        const { query, crewMembers = [], sessionId } = data;
        // Check cache for crew analysis
        const cacheKey = this.mcpCache.generateCacheKey(JSON.stringify({
            query,
            crewMembers
        }), {
            sessionId
        });
        const cached = this.mcpCache.getContext(cacheKey);
        if (cached) {
            return JSON.parse(cached.content);
        }
        // Perform crew analysis (simplified - would integrate with actual crew system)
        const analysis = {
            query,
            crewMembers,
            analysis: 'Crew analysis performed via MCP',
            timestamp: new Date().toISOString(),
            cached: false
        };
        // Cache analysis
        this.mcpCache.storeContext(JSON.stringify(analysis), null, {
            sessionId: sessionId || `crew-analysis-${Date.now()}`,
            crewMembers,
            tags: [
                'crew-analysis',
                ...crewMembers
            ]
        });
        return analysis;
    }
    /**
   * Check if cache is valid
   */ isValidCache(context, ttl) {
        const age = Date.now() - new Date(context.metadata.timestamp).getTime();
        return age < (ttl || context.ttl || 3600000);
    }
    /**
   * Sleep utility
   */ sleep(ms) {
        return new Promise((resolve)=>setTimeout(resolve, ms));
    }
    /**
   * Get workflow statistics
   */ getStats() {
        const cacheStats = this.mcpCache.getStats();
        return {
            cache: cacheStats,
            workflows: {
                'knowledge-ingest': 'Available',
                'milestone-push': 'Available',
                'memory-store': 'Available',
                'crew-analysis': 'Available',
                'llm-call': 'Available (with OpenRouter optimization)'
            },
            openRouter: this.openRouterOptimizer ? this.openRouterOptimizer.getStats() : null
        };
    }
}
// Singleton instance
let mcpWorkflowServiceInstance = null;
function getMCPWorkflowService() {
    if (!mcpWorkflowServiceInstance) {
        mcpWorkflowServiceInstance = new MCPWorkflowService();
    }
    return mcpWorkflowServiceInstance;
}
module.exports = {
    getMCPWorkflowService,
    MCPWorkflowService
};
}),
"[project]/scripts/utils/mcp-workflow-orchestrator.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

/**
 * 🖖 MCP Workflow Orchestrator
 * 
 * Advanced workflow orchestration engine for MCP system.
 * Supports sequential, parallel, and conditional workflow execution.
 */ const { getMCPCache } = __turbopack_context__.r("[project]/scripts/utils/mcp-context-cache.js [app-route] (ecmascript)");
const { getMCPWorkflowService } = __turbopack_context__.r("[project]/scripts/utils/mcp-workflow-service.js [app-route] (ecmascript)");
class MCPWorkflowOrchestrator {
    constructor(){
        this.mcpCache = getMCPCache();
        this.workflowService = null;
        this.executionHistory = [];
    }
    /**
   * Initialize orchestrator
   */ initialize() {
        this.workflowService = getMCPWorkflowService();
        this.workflowService.initialize();
        return true;
    }
    /**
   * Execute workflow sequence (sequential)
   */ async executeSequence(workflows, options = {}) {
        const { useCache = true, stopOnError = true, context = {} } = options;
        const results = [];
        const executionContext = {
            ...context
        };
        console.log(`📋 Executing ${workflows.length} workflows sequentially...\n`);
        for(let i = 0; i < workflows.length; i++){
            const workflow = workflows[i];
            console.log(`[${i + 1}/${workflows.length}] Executing: ${workflow.name || workflow.workflow}\n`);
            try {
                const result = await this.workflowService.executeWorkflow(workflow.workflow, {
                    ...workflow.data,
                    ...executionContext
                }, {
                    useCache
                });
                results.push({
                    workflow: workflow.name || workflow.workflow,
                    success: true,
                    result: result,
                    index: i
                });
                // Update execution context with result
                if (workflow.outputKey) {
                    executionContext[workflow.outputKey] = result;
                }
                console.log(`✅ [${i + 1}/${workflows.length}] Completed: ${workflow.name || workflow.workflow}\n`);
            } catch (error) {
                const errorResult = {
                    workflow: workflow.name || workflow.workflow,
                    success: false,
                    error: error.message,
                    index: i
                };
                results.push(errorResult);
                console.error(`❌ [${i + 1}/${workflows.length}] Failed: ${workflow.name || workflow.workflow}`);
                console.error(`   Error: ${error.message}\n`);
                if (stopOnError) {
                    throw new Error(`Workflow sequence failed at step ${i + 1}: ${error.message}`);
                }
            }
        }
        // Store execution history
        this.executionHistory.push({
            type: 'sequence',
            workflows: workflows.map((w)=>w.name || w.workflow),
            results,
            timestamp: new Date().toISOString()
        });
        return {
            success: results.every((r)=>r.success),
            results,
            context: executionContext
        };
    }
    /**
   * Execute workflows in parallel
   */ async executeParallel(workflows, options = {}) {
        const { useCache = true, context = {} } = options;
        console.log(`📋 Executing ${workflows.length} workflows in parallel...\n`);
        const promises = workflows.map(async (workflow, index)=>{
            console.log(`[${index + 1}/${workflows.length}] Starting: ${workflow.name || workflow.workflow}\n`);
            try {
                const result = await this.workflowService.executeWorkflow(workflow.workflow, {
                    ...workflow.data,
                    ...context
                }, {
                    useCache
                });
                console.log(`✅ [${index + 1}/${workflows.length}] Completed: ${workflow.name || workflow.workflow}\n`);
                return {
                    workflow: workflow.name || workflow.workflow,
                    success: true,
                    result: result,
                    index
                };
            } catch (error) {
                console.error(`❌ [${index + 1}/${workflows.length}] Failed: ${workflow.name || workflow.workflow}`);
                console.error(`   Error: ${error.message}\n`);
                return {
                    workflow: workflow.name || workflow.workflow,
                    success: false,
                    error: error.message,
                    index
                };
            }
        });
        const results = await Promise.all(promises);
        // Store execution history
        this.executionHistory.push({
            type: 'parallel',
            workflows: workflows.map((w)=>w.name || w.workflow),
            results,
            timestamp: new Date().toISOString()
        });
        return {
            success: results.every((r)=>r.success),
            results
        };
    }
    /**
   * Execute workflow with conditional branching
   */ async executeConditional(condition, workflows, options = {}) {
        const { context = {}, useCache = true } = options;
        console.log(`🔀 Evaluating condition: ${condition.type}\n`);
        let conditionResult = false;
        // Evaluate condition
        switch(condition.type){
            case 'equals':
                conditionResult = context[condition.field] === condition.value;
                break;
            case 'notEquals':
                conditionResult = context[condition.field] !== condition.value;
                break;
            case 'greaterThan':
                conditionResult = context[condition.field] > condition.value;
                break;
            case 'lessThan':
                conditionResult = context[condition.field] < condition.value;
                break;
            case 'contains':
                conditionResult = (context[condition.field] || '').includes(condition.value);
                break;
            case 'custom':
                // Custom function evaluation
                conditionResult = condition.function(context);
                break;
            default:
                throw new Error(`Unknown condition type: ${condition.type}`);
        }
        console.log(`   Condition result: ${conditionResult ? 'TRUE' : 'FALSE'}\n`);
        // Execute appropriate workflow branch
        const branch = conditionResult ? workflows.ifTrue : workflows.ifFalse;
        if (!branch) {
            return {
                success: true,
                conditionResult,
                executed: null,
                message: 'No branch to execute'
            };
        }
        console.log(`📋 Executing ${conditionResult ? 'TRUE' : 'FALSE'} branch...\n`);
        if (Array.isArray(branch)) {
            // Execute sequence
            const result = await this.executeSequence(branch, {
                useCache,
                context
            });
            return {
                success: result.success,
                conditionResult,
                executed: 'sequence',
                result
            };
        } else {
            // Execute single workflow
            const result = await this.workflowService.executeWorkflow(branch.workflow, {
                ...branch.data,
                ...context
            }, {
                useCache
            });
            return {
                success: true,
                conditionResult,
                executed: 'single',
                result
            };
        }
    }
    /**
   * Get execution history
   */ getExecutionHistory(limit = 50) {
        return this.executionHistory.slice(-limit);
    }
    /**
   * Get statistics
   */ getStats() {
        const total = this.executionHistory.length;
        const successful = this.executionHistory.filter((h)=>h.results && h.results.every((r)=>r.success !== false)).length;
        return {
            totalExecutions: total,
            successfulExecutions: successful,
            successRate: total > 0 ? (successful / total * 100).toFixed(1) + '%' : '0%',
            recentExecutions: this.executionHistory.slice(-10).map((h)=>({
                    type: h.type,
                    timestamp: h.timestamp,
                    workflows: h.workflows
                }))
        };
    }
}
// Singleton instance
let mcpWorkflowOrchestratorInstance = null;
function getMCPWorkflowOrchestrator() {
    if (!mcpWorkflowOrchestratorInstance) {
        mcpWorkflowOrchestratorInstance = new MCPWorkflowOrchestrator();
    }
    return mcpWorkflowOrchestratorInstance;
}
module.exports = {
    getMCPWorkflowOrchestrator,
    MCPWorkflowOrchestrator
};
}),
"[project]/scripts/utils/mcp-scheduler.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

/**
 * 🖖 MCP Scheduler
 * 
 * Cron-based and event-driven scheduling system for MCP workflows.
 */ const { getMCPWorkflowService } = __turbopack_context__.r("[project]/scripts/utils/mcp-workflow-service.js [app-route] (ecmascript)");
const { getMCPWorkflowOrchestrator } = __turbopack_context__.r("[project]/scripts/utils/mcp-workflow-orchestrator.js [app-route] (ecmascript)");
class MCPScheduler {
    constructor(){
        this.scheduledJobs = new Map();
        this.eventListeners = new Map();
        this.workflowService = null;
        this.orchestrator = null;
        this.running = false;
    }
    /**
   * Initialize scheduler
   */ initialize() {
        this.workflowService = getMCPWorkflowService();
        this.workflowService.initialize();
        this.orchestrator = getMCPWorkflowOrchestrator();
        this.orchestrator.initialize();
        return true;
    }
    /**
   * Schedule workflow with cron expression
   */ scheduleCron(jobName, cronExpression, workflowName, workflowData, options = {}) {
        const job = {
            name: jobName,
            type: 'cron',
            cron: cronExpression,
            workflow: workflowName,
            data: workflowData,
            options: options,
            nextRun: this.calculateNextRun(cronExpression),
            enabled: true
        };
        this.scheduledJobs.set(jobName, job);
        console.log(`📅 Scheduled: ${jobName} (${cronExpression})`);
        console.log(`   Next run: ${job.nextRun.toISOString()}\n`);
        return job;
    }
    /**
   * Schedule workflow at specific time
   */ scheduleAt(jobName, dateTime, workflowName, workflowData, options = {}) {
        const job = {
            name: jobName,
            type: 'once',
            scheduledTime: new Date(dateTime),
            workflow: workflowName,
            data: workflowData,
            options: options,
            enabled: true
        };
        this.scheduledJobs.set(jobName, job);
        console.log(`📅 Scheduled: ${jobName} at ${job.scheduledTime.toISOString()}\n`);
        return job;
    }
    /**
   * Register event listener
   */ onEvent(eventName, workflowName, workflowData, options = {}) {
        if (!this.eventListeners.has(eventName)) {
            this.eventListeners.set(eventName, []);
        }
        const listener = {
            workflow: workflowName,
            data: workflowData,
            options: options
        };
        this.eventListeners.get(eventName).push(listener);
        console.log(`👂 Registered event listener: ${eventName} → ${workflowName}\n`);
        return listener;
    }
    /**
   * Trigger event
   */ async triggerEvent(eventName, eventData = {}) {
        const listeners = this.eventListeners.get(eventName) || [];
        if (listeners.length === 0) {
            console.log(`⚠️  No listeners for event: ${eventName}\n`);
            return {
                triggered: 0
            };
        }
        console.log(`🔔 Triggering event: ${eventName} (${listeners.length} listeners)\n`);
        const results = await Promise.all(listeners.map(async (listener, index)=>{
            try {
                console.log(`[${index + 1}/${listeners.length}] Executing: ${listener.workflow}\n`);
                const result = await this.workflowService.executeWorkflow(listener.workflow, {
                    ...listener.data,
                    eventData
                }, listener.options);
                console.log(`✅ [${index + 1}/${listeners.length}] Completed: ${listener.workflow}\n`);
                return {
                    success: true,
                    result
                };
            } catch (error) {
                console.error(`❌ [${index + 1}/${listeners.length}] Failed: ${listener.workflow}`);
                console.error(`   Error: ${error.message}\n`);
                return {
                    success: false,
                    error: error.message
                };
            }
        }));
        return {
            triggered: listeners.length,
            results
        };
    }
    /**
   * Start scheduler
   */ start() {
        if (this.running) {
            console.log('⚠️  Scheduler already running\n');
            return;
        }
        this.running = true;
        console.log('🚀 MCP Scheduler started\n');
        // Start cron job checker
        this.cronInterval = setInterval(()=>{
            this.checkCronJobs();
        }, 60000); // Check every minute
        // Start one-time job checker
        this.onceInterval = setInterval(()=>{
            this.checkOnceJobs();
        }, 10000); // Check every 10 seconds
    }
    /**
   * Stop scheduler
   */ stop() {
        if (!this.running) {
            return;
        }
        this.running = false;
        if (this.cronInterval) {
            clearInterval(this.cronInterval);
        }
        if (this.onceInterval) {
            clearInterval(this.onceInterval);
        }
        console.log('🛑 MCP Scheduler stopped\n');
    }
    /**
   * Check and execute cron jobs
   */ async checkCronJobs() {
        const now = new Date();
        for (const [jobName, job] of this.scheduledJobs.entries()){
            if (job.type === 'cron' && job.enabled && job.nextRun <= now) {
                console.log(`⏰ Executing scheduled job: ${jobName}\n`);
                try {
                    await this.workflowService.executeWorkflow(job.workflow, job.data, job.options);
                    console.log(`✅ Scheduled job completed: ${jobName}\n`);
                    // Calculate next run
                    job.nextRun = this.calculateNextRun(job.cron);
                    console.log(`   Next run: ${job.nextRun.toISOString()}\n`);
                } catch (error) {
                    console.error(`❌ Scheduled job failed: ${jobName}`);
                    console.error(`   Error: ${error.message}\n`);
                    // Retry logic
                    if (job.options.retries && job.options.retryCount < job.options.retries) {
                        job.options.retryCount = (job.options.retryCount || 0) + 1;
                        console.log(`   Retrying (${job.options.retryCount}/${job.options.retries})...\n`);
                    }
                }
            }
        }
    }
    /**
   * Check and execute one-time jobs
   */ async checkOnceJobs() {
        const now = new Date();
        for (const [jobName, job] of this.scheduledJobs.entries()){
            if (job.type === 'once' && job.enabled && job.scheduledTime <= now) {
                console.log(`⏰ Executing one-time job: ${jobName}\n`);
                try {
                    await this.workflowService.executeWorkflow(job.workflow, job.data, job.options);
                    console.log(`✅ One-time job completed: ${jobName}\n`);
                    // Remove one-time job after execution
                    this.scheduledJobs.delete(jobName);
                } catch (error) {
                    console.error(`❌ One-time job failed: ${jobName}`);
                    console.error(`   Error: ${error.message}\n`);
                }
            }
        }
    }
    /**
   * Calculate next run time from cron expression
   * Simple implementation - supports: minute hour day month dayOfWeek
   */ calculateNextRun(cronExpression) {
        // Simple cron parser (supports: "0 9 * * *" = daily at 9 AM)
        const parts = cronExpression.split(' ');
        if (parts.length !== 5) {
            throw new Error(`Invalid cron expression: ${cronExpression}`);
        }
        const [minute, hour, day, month, dayOfWeek] = parts;
        const now = new Date();
        const next = new Date(now);
        // Simple calculation - next occurrence
        if (minute !== '*') {
            next.setMinutes(parseInt(minute));
            if (next <= now) {
                next.setHours(next.getHours() + 1);
            }
        }
        if (hour !== '*') {
            next.setHours(parseInt(hour));
            if (next <= now) {
                next.setDate(next.getDate() + 1);
            }
        }
        return next;
    }
    /**
   * Get scheduled jobs
   */ getScheduledJobs() {
        return Array.from(this.scheduledJobs.values());
    }
    /**
   * Get event listeners
   */ getEventListeners() {
        const listeners = {};
        for (const [eventName, eventListeners] of this.eventListeners.entries()){
            listeners[eventName] = eventListeners.map((l)=>l.workflow);
        }
        return listeners;
    }
}
// Singleton instance
let mcpSchedulerInstance = null;
function getMCPScheduler() {
    if (!mcpSchedulerInstance) {
        mcpSchedulerInstance = new MCPScheduler();
    }
    return mcpSchedulerInstance;
}
module.exports = {
    getMCPScheduler,
    MCPScheduler
};
}),
"[project]/scripts/utils/unified-service-accessor.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

/**
 * 🖖 Unified Service Accessor
 * 
 * Provides unified access to both MCP and n8n services in the same scope.
 * Allows seamless switching between MCP (preferred) and n8n (fallback).
 */ const { getMCPWorkflowService } = __turbopack_context__.r("[project]/scripts/utils/mcp-workflow-service.js [app-route] (ecmascript)");
const { getMCPMemoryStorage } = __turbopack_context__.r("[project]/scripts/utils/mcp-memory-storage.js [app-route] (ecmascript)");
const { getMCPCache } = __turbopack_context__.r("[project]/scripts/utils/mcp-context-cache.js [app-route] (ecmascript)");
const { getMCPOpenRouterOptimizer } = __turbopack_context__.r("[project]/scripts/utils/mcp-openrouter-optimizer.js [app-route] (ecmascript)");
const { getMCPMonitoring } = __turbopack_context__.r("[project]/scripts/utils/mcp-monitoring.js [app-route] (ecmascript)");
const { getMCPScheduler } = __turbopack_context__.r("[project]/scripts/utils/mcp-scheduler.js [app-route] (ecmascript)");
const { loadCrewCredentials } = __turbopack_context__.r("[project]/scripts/utils/load-crew-credentials.js [app-route] (ecmascript)");
// For remote MCP, use HTTP client
const https = __turbopack_context__.r("[externals]/https [external] (https, cjs)");
class UnifiedServiceAccessor {
    constructor(){
        this.mcpServices = {
            workflow: null,
            memory: null,
            cache: null,
            optimizer: null,
            monitoring: null,
            scheduler: null
        };
        this.mcpRemote = {
            baseUrl: null,
            apiKey: null,
            client: null,
            enabled: false
        };
        this.n8nConfig = {
            baseUrl: null,
            apiKey: null,
            client: null
        };
        this.initialized = false;
        this.useRemoteMCP = false; // Toggle between local and remote MCP
    }
    /**
   * Initialize all MCP services
   */ initializeMCP() {
        try {
            // Initialize workflow service
            this.mcpServices.workflow = getMCPWorkflowService();
            this.mcpServices.workflow.initialize();
            // Initialize memory storage
            this.mcpServices.memory = getMCPMemoryStorage();
            this.mcpServices.memory.initialize();
            // Initialize context cache
            this.mcpServices.cache = getMCPCache();
            // Initialize OpenRouter optimizer
            this.mcpServices.optimizer = getMCPOpenRouterOptimizer();
            try {
                this.mcpServices.optimizer.initialize();
            } catch (e) {
            // Optional service
            }
            // Initialize monitoring
            this.mcpServices.monitoring = getMCPMonitoring();
            try {
                this.mcpServices.monitoring.initialize();
            } catch (e) {
            // Optional service
            }
            // Initialize scheduler
            this.mcpServices.scheduler = getMCPScheduler();
            try {
                this.mcpServices.scheduler.initialize();
            } catch (e) {
            // Optional service
            }
            console.log('✅ MCP services initialized');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize MCP services:', error.message);
            return false;
        }
    }
    /**
   * Initialize remote MCP client
   */ initializeRemoteMCP(config = null) {
        try {
            if (!config) {
                const { n8n } = loadCrewCredentials();
                // Use same base URL as n8n, different port
                config = {
                    baseUrl: 'https://mcp.pbradygeorgen.com',
                    apiKey: n8n.apiKey
                };
            }
            this.mcpRemote.baseUrl = config.baseUrl;
            this.mcpRemote.apiKey = config.apiKey;
            // Create remote MCP client (HTTP wrapper)
            this.mcpRemote.client = {
                baseUrl: config.baseUrl,
                apiKey: config.apiKey
            };
            this.mcpRemote.enabled = true;
            console.log('✅ Remote MCP client initialized');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize remote MCP client:', error.message);
            return false;
        }
    }
    /**
   * Initialize n8n client
   */ initializeN8N(config = null) {
        try {
            if (!config) {
                const { n8n } = loadCrewCredentials();
                config = {
                    baseUrl: n8n.baseUrl,
                    apiKey: n8n.apiKey
                };
            }
            this.n8nConfig.baseUrl = config.baseUrl;
            this.n8nConfig.apiKey = config.apiKey;
            // Create n8n client (simple HTTP wrapper)
            this.n8nConfig.client = {
                baseUrl: config.baseUrl,
                apiKey: config.apiKey
            };
            console.log('✅ n8n client initialized');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize n8n client:', error.message);
            return false;
        }
    }
    /**
   * Initialize all services
   */ initialize(options = {}) {
        const { useRemoteMCP = true } = options; // Default to remote MCP
        this.useRemoteMCP = useRemoteMCP;
        if (useRemoteMCP) {
            this.initializeRemoteMCP();
        } else {
            this.initializeMCP();
        }
        this.initializeN8N();
        this.initialized = true;
        return true;
    }
    /**
   * Get MCP service by name
   */ getMCP(serviceName) {
        return this.mcpServices[serviceName] || null;
    }
    /**
   * Get n8n client
   */ getN8N() {
        return this.n8nConfig.client;
    }
    /**
   * Execute workflow (prefers MCP, falls back to n8n)
   */ async executeWorkflow(workflow, options = {}) {
        const useMCP = options.useMCP !== false; // Default to MCP
        // Try remote MCP first if enabled
        if (useMCP && this.useRemoteMCP && this.mcpRemote.enabled) {
            try {
                return await this.executeRemoteMCPWorkflow(workflow);
            } catch (error) {
                console.warn('⚠️  Remote MCP workflow execution failed, trying local MCP:', error.message);
            // Fall through to local MCP
            }
        }
        // Try local MCP
        if (useMCP && !this.useRemoteMCP && this.mcpServices.workflow) {
            try {
                return await this.mcpServices.workflow.executeWorkflow(workflow);
            } catch (error) {
                console.warn('⚠️  Local MCP workflow execution failed, falling back to n8n:', error.message);
            // Fall through to n8n
            }
        }
        // Fallback to n8n
        if (this.n8nConfig.client) {
            return await this.executeN8NWorkflow(workflow);
        }
        throw new Error('No workflow service available (MCP or n8n)');
    }
    /**
   * Store memory (prefers MCP, falls back to n8n)
   */ async storeMemory(memoryData, options = {}) {
        const useMCP = options.useMCP !== false; // Default to MCP
        // Try remote MCP first if enabled
        if (useMCP && this.useRemoteMCP && this.mcpRemote.enabled) {
            try {
                return await this.storeRemoteMCPMemory(memoryData);
            } catch (error) {
                console.warn('⚠️  Remote MCP memory storage failed, trying local MCP:', error.message);
            // Fall through to local MCP
            }
        }
        // Try local MCP
        if (useMCP && !this.useRemoteMCP && this.mcpServices.memory) {
            try {
                return await this.mcpServices.memory.storeMemory(memoryData);
            } catch (error) {
                console.warn('⚠️  Local MCP memory storage failed, falling back to n8n:', error.message);
            // Fall through to n8n
            }
        }
        // Fallback to n8n webhook
        if (this.n8nConfig.client) {
            return await this.triggerN8NWebhook('knowledge-ingest', memoryData);
        }
        throw new Error('No memory service available (MCP or n8n)');
    }
    /**
   * Query memories (prefers MCP, falls back to n8n)
   */ async queryMemories(query, options = {}) {
        const useMCP = options.useMCP !== false; // Default to MCP
        if (useMCP && this.mcpServices.memory) {
            try {
                return await this.mcpServices.memory.queryMemories(query, options);
            } catch (error) {
                console.warn('⚠️  MCP memory query failed, falling back to n8n:', error.message);
            // Fall through to n8n
            }
        }
        // Fallback to n8n webhook
        if (this.n8nConfig.client) {
            return await this.triggerN8NWebhook('knowledge-query', {
                query,
                ...options
            });
        }
        throw new Error('No memory service available (MCP or n8n)');
    }
    /**
   * Execute remote MCP workflow via HTTP
   */ async executeRemoteMCPWorkflow(workflow) {
        return new Promise((resolve, reject)=>{
            const url = new URL(`${this.mcpRemote.baseUrl}/api/workflows/execute`);
            const options = {
                hostname: url.hostname,
                port: url.port || 443,
                path: url.pathname,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-MCP-API-KEY': this.mcpRemote.apiKey
                },
                timeout: 30000
            };
            const req = https.request(options, (res)=>{
                let body = '';
                res.on('data', (chunk)=>body += chunk);
                res.on('end', ()=>{
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        const parsed = JSON.parse(body);
                        resolve(parsed.result || parsed);
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${body}`));
                    }
                });
            });
            req.on('error', reject);
            req.on('timeout', ()=>{
                req.destroy();
                reject(new Error('Request timeout'));
            });
            req.write(JSON.stringify(workflow));
            req.end();
        });
    }
    /**
   * Store memory via remote MCP
   */ async storeRemoteMCPMemory(memoryData) {
        return new Promise((resolve, reject)=>{
            const url = new URL(`${this.mcpRemote.baseUrl}/api/memory/store`);
            const options = {
                hostname: url.hostname,
                port: url.port || 443,
                path: url.pathname,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-MCP-API-KEY': this.mcpRemote.apiKey
                },
                timeout: 30000
            };
            const req = https.request(options, (res)=>{
                let body = '';
                res.on('data', (chunk)=>body += chunk);
                res.on('end', ()=>{
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        const parsed = JSON.parse(body);
                        resolve(parsed.result || parsed);
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${body}`));
                    }
                });
            });
            req.on('error', reject);
            req.on('timeout', ()=>{
                req.destroy();
                reject(new Error('Request timeout'));
            });
            req.write(JSON.stringify(memoryData));
            req.end();
        });
    }
    /**
   * Execute n8n workflow via HTTP
   */ async executeN8NWorkflow(workflow) {
        return new Promise((resolve, reject)=>{
            const url = new URL(`${this.n8nConfig.baseUrl}/webhook/${workflow.webhook || workflow.id}`);
            const options = {
                hostname: url.hostname,
                port: url.port || 443,
                path: url.pathname,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            };
            const req = https.request(options, (res)=>{
                let body = '';
                res.on('data', (chunk)=>body += chunk);
                res.on('end', ()=>{
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(JSON.parse(body));
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${body}`));
                    }
                });
            });
            req.on('error', reject);
            req.on('timeout', ()=>{
                req.destroy();
                reject(new Error('Request timeout'));
            });
            req.write(JSON.stringify(workflow.data || {}));
            req.end();
        });
    }
    /**
   * Trigger n8n webhook
   */ async triggerN8NWebhook(webhookPath, data) {
        return new Promise((resolve, reject)=>{
            const url = new URL(`${this.n8nConfig.baseUrl}/webhook/${webhookPath}`);
            const options = {
                hostname: url.hostname,
                port: url.port || 443,
                path: url.pathname,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            };
            const req = https.request(options, (res)=>{
                let body = '';
                res.on('data', (chunk)=>body += chunk);
                res.on('end', ()=>{
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            resolve(JSON.parse(body));
                        } catch (e) {
                            resolve({
                                raw: body
                            });
                        }
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${body}`));
                    }
                });
            });
            req.on('error', reject);
            req.on('timeout', ()=>{
                req.destroy();
                reject(new Error('Request timeout'));
            });
            req.write(JSON.stringify(data));
            req.end();
        });
    }
    /**
   * Get service status with health checks
   */ async getStatus() {
        // Check remote MCP health
        let remoteMcpOperational = false;
        if (this.mcpRemote.enabled && this.mcpRemote.baseUrl) {
            try {
                const healthUrl = new URL(`${this.mcpRemote.baseUrl}/health`);
                const response = await new Promise((resolve, reject)=>{
                    const req = https.request({
                        hostname: healthUrl.hostname,
                        port: healthUrl.port || 443,
                        path: healthUrl.pathname,
                        method: 'GET',
                        headers: {
                            'X-MCP-API-KEY': this.mcpRemote.apiKey
                        },
                        timeout: 5000
                    }, (res)=>{
                        resolve(res.statusCode);
                    });
                    req.on('error', ()=>resolve(500));
                    req.on('timeout', ()=>{
                        req.destroy();
                        resolve(500);
                    });
                    req.end();
                });
                remoteMcpOperational = response >= 200 && response < 300;
            } catch (error) {
                remoteMcpOperational = false;
            }
        }
        // Check local MCP health (if services are initialized)
        let localMcpOperational = false;
        if (!this.useRemoteMCP && this.mcpServices.memory) {
            try {
                // Quick test query to verify local MCP is working
                await this.mcpServices.memory.queryMemories('test', {
                    limit: 1
                });
                localMcpOperational = true;
            } catch (error) {
                localMcpOperational = false;
            }
        }
        // Check n8n health
        let n8nOperational = false;
        if (this.n8nConfig.baseUrl) {
            try {
                const n8nUrl = new URL(`${this.n8nConfig.baseUrl}/healthz`);
                const response = await new Promise((resolve, reject)=>{
                    const req = https.request({
                        hostname: n8nUrl.hostname,
                        port: n8nUrl.port || 443,
                        path: n8nUrl.pathname,
                        method: 'GET',
                        timeout: 5000
                    }, (res)=>{
                        resolve(res.statusCode);
                    });
                    req.on('error', ()=>resolve(500));
                    req.on('timeout', ()=>{
                        req.destroy();
                        resolve(500);
                    });
                    req.end();
                });
                n8nOperational = response >= 200 && response < 300;
            } catch (error) {
                n8nOperational = false;
            }
        }
        return {
            initialized: this.initialized,
            useRemoteMCP: this.useRemoteMCP,
            remoteMcpOperational,
            localMcpOperational,
            n8nOperational,
            mcp: {
                local: {
                    workflow: !!this.mcpServices.workflow,
                    memory: !!this.mcpServices.memory,
                    cache: !!this.mcpServices.cache,
                    optimizer: !!this.mcpServices.optimizer,
                    monitoring: !!this.mcpServices.monitoring,
                    scheduler: !!this.mcpServices.scheduler
                },
                remote: {
                    enabled: this.mcpRemote.enabled,
                    baseUrl: this.mcpRemote.baseUrl
                }
            },
            n8n: {
                configured: !!(this.n8nConfig.baseUrl && this.n8nConfig.apiKey),
                baseUrl: this.n8nConfig.baseUrl,
                operational: n8nOperational
            }
        };
    }
}
let instance = null;
function getUnifiedServiceAccessor() {
    if (!instance) {
        instance = new UnifiedServiceAccessor();
    }
    return instance;
}
module.exports = {
    getUnifiedServiceAccessor,
    UnifiedServiceAccessor
};
}),
"[project]/dashboard/app/api/mcp/workflows/executions/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$scripts$2f$utils$2f$unified$2d$service$2d$accessor$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/scripts/utils/unified-service-accessor.js [app-route] (ecmascript)");
;
;
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const workflowId = searchParams.get('workflowId');
        const limit = parseInt(searchParams.get('limit') || '50');
        const services = (0, __TURBOPACK__imported__module__$5b$project$5d2f$scripts$2f$utils$2f$unified$2d$service$2d$accessor$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getUnifiedServiceAccessor"])();
        services.initialize();
        // Get execution history from MCP monitoring service
        try {
            const monitoring = services.getMonitoringStats();
            // For now, return mock data structure
            // TODO: Integrate with actual MCP monitoring service
            const executions = [
                // Mock execution data
                {
                    id: 'exec-1',
                    workflowId: workflowId || 'workflow-1',
                    workflowName: 'Sample Workflow',
                    status: 'success',
                    startTime: new Date(Date.now() - 3600000).toISOString(),
                    endTime: new Date(Date.now() - 3590000).toISOString(),
                    duration: 10000,
                    logs: [
                        'Workflow started',
                        'Node 1 executed',
                        'Node 2 executed',
                        'Workflow completed'
                    ],
                    errors: []
                }
            ];
            return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                executions: executions.filter((e)=>!workflowId || e.workflowId === workflowId).slice(0, limit),
                total: executions.length
            });
        } catch (error) {
            // If monitoring service not available, return empty
            return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                executions: [],
                total: 0,
                message: 'Monitoring service not available'
            });
        }
    } catch (error) {
        console.error('Error in executions GET:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: error.message || 'Failed to load executions'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__8e10d44e._.js.map