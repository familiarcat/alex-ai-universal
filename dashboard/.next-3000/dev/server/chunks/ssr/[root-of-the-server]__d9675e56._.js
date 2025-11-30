module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/dashboard/lib/content-sync.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Content Sync: Proper DDD Flow for User Content
 * Client => Next.js API (Controller) => MCP => n8n => Supabase Database
 * 
 * ⚠️  SEPARATION OF CONCERNS:
 * - Client NEVER accesses Supabase directly
 * - Client NEVER accesses n8n directly
 * - ALL database operations flow through Next.js API routes (controller layer)
 * - Controller layer handles MCP → n8n → Supabase fallback chain
 * 
 * Memory: Stored in n8n => Supabase RAG
 * 
 * Crew: Data (Architecture) + La Forge (Implementation)
 * Updated: 2025-11-27 - Fixed to use API routes instead of direct n8n calls
 */ /**
 * ✅ Proper DDD: Client => Next.js API => MCP => n8n => Supabase
 * ❌ Never: Client => Supabase (violates separation of concerns)
 * ❌ Never: Client => n8n (violates separation of concerns)
 */ __turbopack_context__.s([
    "debouncedContentSync",
    ()=>debouncedContentSync,
    "deleteProjectContent",
    ()=>deleteProjectContent,
    "retrieveProjectContent",
    ()=>retrieveProjectContent,
    "storeProjectContent",
    ()=>storeProjectContent
]);
async function storeProjectContent(content) {
    try {
        const response = await fetch('/api/content/store', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...content,
                action: 'upsert',
                timestamp: new Date().toISOString()
            })
        });
        if (!response.ok) {
            console.warn('Content sync failed (non-blocking):', response.statusText);
            return false;
        }
        console.log(`✅ Content synced: ${content.projectId}`);
        return true;
    } catch (error) {
        console.warn('Content sync error (non-blocking):', error);
        return false;
    }
}
async function retrieveProjectContent(projectId) {
    try {
        const response = await fetch(`/api/content/retrieve?projectId=${projectId}`, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache'
            },
            cache: 'no-store'
        });
        if (!response.ok) {
            console.warn('Content retrieval failed:', response.statusText);
            return null;
        }
        const result = await response.json();
        if (result.success && result.data) {
            console.log(`✅ Content retrieved: ${projectId}`);
            return result.data;
        }
        return null;
    } catch (error) {
        console.warn('Content retrieval error:', error);
        return null;
    }
}
async function deleteProjectContent(projectId) {
    try {
        const response = await fetch('/api/content/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                projectId,
                timestamp: new Date().toISOString()
            })
        });
        if (!response.ok) {
            console.warn('Content deletion failed (non-blocking):', response.statusText);
            return false;
        }
        console.log(`✅ Content deleted: ${projectId}`);
        return true;
    } catch (error) {
        console.warn('Content deletion error (non-blocking):', error);
        return false;
    }
}
/**
 * Debounced sync for frequent updates
 * Prevents excessive n8n calls during rapid editing
 */ let syncTimeout = null;
function debouncedContentSync(content, delayMs = 2000) {
    if (syncTimeout) {
        clearTimeout(syncTimeout);
    }
    syncTimeout = setTimeout(()=>{
        storeProjectContent(content);
        syncTimeout = null;
    }, delayMs);
}
}),
"[project]/dashboard/lib/settings-sync.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * User Settings Sync - DDD Architecture with Proper Controller Layer
 * 
 * FIXED: Now uses Next.js API routes (proper DDD architecture)
 * 
 * Flow: Client => Next.js API => Supabase (Live) => Supabase
 * Fallback: Client => Next.js API => n8n Webhook => Supabase
 * 
 * Architecture: 
 *   PRIMARY: Supabase direct (Live instance) via Next.js API route
 *   FALLBACK: n8n Webhook (if Supabase unavailable)
 * 
 * Crew: Data (Architecture) + La Forge (Implementation) + O'Brien (Pragmatic)
 * Updated: 2025-11-27 - Fixed to use Next.js API routes instead of direct n8n calls
 */ __turbopack_context__.s([
    "debouncedSettingsSync",
    ()=>debouncedSettingsSync,
    "retrieveSettings",
    ()=>retrieveSettings
]);
let saveTimer = null;
function debouncedSettingsSync(settings, delayMs = 1000) {
    if (saveTimer) {
        clearTimeout(saveTimer);
    }
    saveTimer = setTimeout(async ()=>{
        // Use Next.js API route (proper DDD architecture)
        try {
            const response = await fetch('/api/settings/store', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: 'default',
                    globalTheme: settings.globalTheme,
                    preferences: settings.preferences || {}
                })
            });
            if (!response.ok) {
                throw new Error(`Settings API returned ${response.status}`);
            }
            // Success - no console log to reduce noise
            return;
        } catch (error) {
        // Non-blocking: localStorage still works regardless
        // Error is handled silently to prevent console spam
        }
    }, delayMs);
}
async function retrieveSettings(userId = 'default') {
    try {
        const response = await fetch(`/api/settings/retrieve?userId=${userId}`, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache'
            },
            cache: 'no-store'
        });
        if (!response.ok) {
            throw new Error(`Settings API returned ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
            // Only return theme if it's explicitly set (not null/default)
            // This allows localStorage to be the source of truth if Supabase has no saved theme
            if (data.globalTheme !== null && data.globalTheme !== undefined) {
                return {
                    globalTheme: data.globalTheme,
                    preferences: data.preferences || {},
                    source: data.source // Include source to distinguish saved vs default
                };
            }
            // If globalTheme is null, return null to indicate no saved settings
            return null;
        }
        return null;
    } catch (error) {
        // Silent fallback - return null if API unavailable
        return null;
    }
}
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/child_process [external] (child_process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("child_process", () => require("child_process"));

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
"[externals]/tty [external] (tty, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tty", () => require("tty"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[externals]/tls [external] (tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tls", () => require("tls"));

module.exports = mod;
}),
"[project]/dashboard/lib/environment-config.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * 🖖 Environment Configuration for Cross-Platform Deployment
 * 
 * Supports:
 * - Local macOS development (localhost)
 * - EC2 production (remote URLs)
 * - Docker deployments
 * - Terraform-managed infrastructure
 * 
 * Reviewed by: Lieutenant Commander La Forge (Infrastructure)
 */ __turbopack_context__.s([
    "getCurrentServerUrl",
    ()=>getCurrentServerUrl,
    "getEnvironmentConfig",
    ()=>getEnvironmentConfig,
    "getTargetServerUrl",
    ()=>getTargetServerUrl
]);
function getEnvironmentConfig() {
    const isProduction = ("TURBOPACK compile-time value", "development") === 'production';
    const isLocal = !isProduction && (("TURBOPACK compile-time value", "undefined") === 'undefined' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    // Determine URLs based on environment
    let dashboardUrl;
    let liveServerUrl;
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    else {
        // Local development: Use localhost
        dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || `http://localhost:${process.env.PORT || 3000}`;
        liveServerUrl = process.env.NEXT_PUBLIC_LIVE_SERVER_URL || `http://localhost:${process.env.LIVE_SERVER_PORT || 3001}`;
    }
    return {
        isProduction,
        isLocal,
        dashboardUrl,
        liveServerUrl,
        socketPath: process.env.NEXT_PUBLIC_SOCKET_PATH || '/api/socket',
        n8nUrl: ("TURBOPACK compile-time value", "https://n8n.pbradygeorgen.com") || ("TURBOPACK compile-time value", "https://n8n.pbradygeorgen.com") || 'https://n8n.pbradygeorgen.com',
        supabaseUrl: ("TURBOPACK compile-time value", "https://rpkkkbufdwxmjaerbhbn.supabase.co") || ''
    };
}
function getCurrentServerUrl() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    // Server-side: Use environment config
    const config = getEnvironmentConfig();
    return config.dashboardUrl;
}
function getTargetServerUrl() {
    const config = getEnvironmentConfig();
    const currentPort = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : parseInt(process.env.PORT || '3000');
    // If on dashboard port (3000), sync to live server (3001)
    // If on live server port (3001), sync to dashboard (3000)
    if (currentPort === 3000 || currentPort === parseInt(process.env.DASHBOARD_PORT || '3000')) {
        return config.liveServerUrl;
    } else {
        return config.dashboardUrl;
    }
}
}),
"[project]/dashboard/lib/event-driven-sync.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * 🖖 Event-Driven Cross-Server Sync
 * 
 * Replaces polling with WebSocket-based event-driven architecture
 * Updates only on actual changes (not every 2 seconds)
 * 
 * DDD-Compliant: Client => WebSocket => Live Server => n8n => Supabase
 * 
 * Reviewed by: Commander Riker (Tactical) & Quark (Business Optimization)
 */ __turbopack_context__.s([
    "eventDrivenSync",
    ()=>eventDrivenSync,
    "getEventDrivenSync",
    ()=>getEventDrivenSync,
    "useEventDrivenSync",
    ()=>useEventDrivenSync
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$socket$2e$io$2d$client$2f$build$2f$esm$2d$debug$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/dashboard/node_modules/socket.io-client/build/esm-debug/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$environment$2d$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/lib/environment-config.ts [app-ssr] (ecmascript)");
;
;
// Fix React import issue
let React = null;
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
const DASHBOARD_PORT = 3000;
const LIVE_SERVER_PORT = 3001;
class EventDrivenSync {
    dashboardUrl;
    liveServerUrl;
    socket = null;
    syncStatus = {
        connected: false,
        lastSync: null,
        syncCount: 0,
        errors: 0,
        connectionType: 'disconnected'
    };
    listeners = new Map();
    reconnectAttempts = 0;
    maxReconnectAttempts = 5;
    pollingFallback = null;
    constructor(){
        // Use environment-aware configuration
        const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$environment$2d$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEnvironmentConfig"])();
        this.dashboardUrl = config.dashboardUrl;
        this.liveServerUrl = config.liveServerUrl;
        console.log(`🔧 Event-Driven Sync initialized:`);
        console.log(`   Environment: ${config.isProduction ? 'production (EC2)' : 'development (local macOS)'}`);
        console.log(`   Dashboard: ${this.dashboardUrl}`);
        console.log(`   Live Server: ${this.liveServerUrl}`);
        console.log(`   Socket Path: ${config.socketPath}`);
    }
    /**
   * Start event-driven sync (WebSocket with polling fallback)
   */ async startSync() {
        try {
            // Try WebSocket first
            await this.connectWebSocket();
            // If WebSocket fails, fall back to polling
            if (!this.socket?.connected) {
                console.warn('⚠️  WebSocket unavailable, using polling fallback');
                this.startPollingFallback();
            }
        } catch (error) {
            console.error('❌ Failed to start sync:', error);
            this.startPollingFallback();
        }
    }
    /**
   * Connect via WebSocket (event-driven)
   */ async connectWebSocket() {
        return new Promise((resolve, reject)=>{
            // Get target server URL (environment-aware)
            const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$environment$2d$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEnvironmentConfig"])();
            const targetUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$environment$2d$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getTargetServerUrl"])();
            console.log(`🔌 Connecting to: ${targetUrl}${config.socketPath}`);
            this.socket = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$socket$2e$io$2d$client$2f$build$2f$esm$2d$debug$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["io"])(targetUrl, {
                path: config.socketPath,
                transports: [
                    'websocket',
                    'polling'
                ],
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionAttempts: this.maxReconnectAttempts,
                timeout: 5000,
                // Support both local and production
                forceNew: false,
                autoConnect: true
            });
            this.socket.on('connect', ()=>{
                console.log('✅ WebSocket connected');
                this.syncStatus.connected = true;
                this.syncStatus.connectionType = 'websocket';
                this.reconnectAttempts = 0;
                resolve();
            });
            this.socket.on('disconnect', ()=>{
                console.log('⚠️  WebSocket disconnected');
                this.syncStatus.connected = false;
                this.syncStatus.connectionType = 'disconnected';
            });
            this.socket.on('connect_error', (error)=>{
                console.error('❌ WebSocket connection error:', error);
                this.syncStatus.errors++;
                this.reconnectAttempts++;
                if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                    reject(error);
                }
            });
            // Listen for project updates (event-driven)
            this.socket.on('project:updated', (update)=>{
                this.handleUpdate(update);
            });
            // Connection status
            this.socket.on('sync:status', (status)=>{
                console.log('📊 Sync status:', status);
            });
            // Error handling
            this.socket.on('error', (error)=>{
                console.error('❌ WebSocket error:', error);
                this.syncStatus.errors++;
            });
            // Timeout after 5 seconds
            setTimeout(()=>{
                if (!this.socket?.connected) {
                    reject(new Error('WebSocket connection timeout'));
                }
            }, 5000);
        });
    }
    /**
   * Polling fallback (only if WebSocket fails)
   */ startPollingFallback() {
        if (this.pollingFallback) {
            return; // Already running
        }
        console.log('🔄 Starting polling fallback');
        this.syncStatus.connectionType = 'polling';
        this.syncStatus.connected = true;
        this.pollingFallback = setInterval(async ()=>{
            await this.pollForUpdates();
        }, 2000); // Poll every 2 seconds (fallback only)
    }
    /**
   * Poll for updates (fallback method)
   */ async pollForUpdates() {
        try {
            const response = await fetch(`${this.dashboardUrl}/api/sync/pending`);
            if (response.ok) {
                const updates = await response.json();
                updates.forEach((update)=>this.handleUpdate(update));
            }
        } catch (error) {
            console.error('❌ Polling error:', error);
            this.syncStatus.errors++;
        }
    }
    /**
   * Send update via WebSocket (event-driven)
   */ async sendUpdate(update) {
        try {
            if (this.socket?.connected) {
                // Use WebSocket (event-driven)
                this.socket.emit('project:update', update);
                this.syncStatus.syncCount++;
                this.syncStatus.lastSync = Date.now();
                this.notifyListeners(update);
                return true;
            } else {
                // Fallback to API call
                return await this.sendUpdateViaAPI(update);
            }
        } catch (error) {
            console.error('❌ Send update error:', error);
            this.syncStatus.errors++;
            return false;
        }
    }
    /**
   * Send update via API (fallback)
   */ async sendUpdateViaAPI(update) {
        try {
            const response = await fetch(`${this.liveServerUrl}/api/sync/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(update)
            });
            if (response.ok) {
                this.syncStatus.syncCount++;
                this.syncStatus.lastSync = Date.now();
                this.notifyListeners(update);
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ API update error:', error);
            return false;
        }
    }
    /**
   * Handle incoming update
   */ handleUpdate(update) {
        this.syncStatus.syncCount++;
        this.syncStatus.lastSync = Date.now();
        this.notifyListeners(update);
    }
    /**
   * Stop syncing
   */ stopSync() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        if (this.pollingFallback) {
            clearInterval(this.pollingFallback);
            this.pollingFallback = null;
        }
        this.syncStatus.connected = false;
        this.syncStatus.connectionType = 'disconnected';
        console.log('🛑 Sync stopped');
    }
    /**
   * Get current status
   */ getStatus() {
        return {
            ...this.syncStatus
        };
    }
    /**
   * Subscribe to updates
   */ onUpdate(projectId, callback) {
        if (!this.listeners.has(projectId)) {
            this.listeners.set(projectId, new Set());
        }
        this.listeners.get(projectId).add(callback);
        return ()=>{
            const callbacks = this.listeners.get(projectId);
            if (callbacks) {
                callbacks.delete(callback);
            }
        };
    }
    /**
   * Notify listeners
   */ notifyListeners(update) {
        const callbacks = this.listeners.get(update.projectId);
        if (callbacks) {
            callbacks.forEach((callback)=>{
                try {
                    callback(update);
                } catch (error) {
                    console.error('❌ Listener error:', error);
                }
            });
        }
    }
}
// Singleton instance
let syncInstance = null;
function getEventDrivenSync() {
    if (!syncInstance) {
        syncInstance = new EventDrivenSync();
    }
    return syncInstance;
}
function useEventDrivenSync(projectId) {
    if (!React) {
        throw new Error('React is required for useEventDrivenSync. Import React in your component file.');
    }
    const [status, setStatus] = React.useState({
        connected: false,
        lastSync: null,
        syncCount: 0,
        errors: 0,
        connectionType: 'disconnected'
    });
    React.useEffect(()=>{
        const sync1 = getEventDrivenSync();
        // Update status periodically
        const statusInterval = setInterval(()=>{
            setStatus(sync1.getStatus());
        }, 1000);
        // Subscribe to updates
        const unsubscribe = sync1.onUpdate(projectId, (update)=>{
            console.log('📡 Event-driven update received:', update);
            setStatus(sync1.getStatus());
        });
        return ()=>{
            clearInterval(statusInterval);
            unsubscribe();
        };
    }, [
        projectId
    ]);
    return {
        status,
        startSync: ()=>sync.startSync(),
        stopSync: ()=>sync.stopSync(),
        sendUpdate: (update)=>sync.sendUpdate({
                ...update,
                timestamp: Date.now(),
                source: 'dashboard'
            })
    };
}
const eventDrivenSync = getEventDrivenSync();
}),
"[project]/dashboard/lib/state-sync-integration.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * 🖖 State Manager → Event-Driven Sync Integration
 * 
 * Integrates state manager with event-driven sync system
 * Emits WebSocket events only when actual changes occur
 * 
 * DDD-Compliant: State Change => WebSocket Event => Live Server => n8n => Supabase
 */ __turbopack_context__.s([
    "emitComponentUpdate",
    ()=>emitComponentUpdate,
    "emitProjectUpdate",
    ()=>emitProjectUpdate,
    "emitThemeUpdate",
    ()=>emitThemeUpdate,
    "getSyncStatus",
    ()=>getSyncStatus,
    "initializeStateSync",
    ()=>initializeStateSync,
    "startStateSync",
    ()=>startStateSync,
    "stopStateSync",
    ()=>stopStateSync
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$event$2d$driven$2d$sync$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/lib/event-driven-sync.ts [app-ssr] (ecmascript)");
;
let syncInstance = null;
function initializeStateSync() {
    if ("TURBOPACK compile-time truthy", 1) {
        return; // Server-side, skip
    }
    //TURBOPACK unreachable
    ;
}
function emitProjectUpdate(projectId, field, value) {
    if (!syncInstance) {
        initializeStateSync();
        syncInstance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$event$2d$driven$2d$sync$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEventDrivenSync"])();
    }
    const update = {
        projectId,
        field,
        value,
        timestamp: Date.now(),
        source: 'dashboard'
    };
    // Emit via WebSocket (event-driven, not polling)
    syncInstance.sendUpdate(update).catch((error)=>{
        console.warn('⚠️  Sync update failed (non-blocking):', error);
    });
}
function emitThemeUpdate(projectId, themeId) {
    emitProjectUpdate(projectId, 'theme', themeId);
}
function emitComponentUpdate(projectId, componentId, changes) {
    emitProjectUpdate(projectId, `component:${componentId}`, changes);
}
function getSyncStatus() {
    if (!syncInstance) {
        return {
            connected: false,
            lastSync: null,
            syncCount: 0,
            errors: 0,
            connectionType: 'disconnected'
        };
    }
    return syncInstance.getStatus();
}
async function startStateSync() {
    if (!syncInstance) {
        initializeStateSync();
        syncInstance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$event$2d$driven$2d$sync$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEventDrivenSync"])();
    }
    try {
        await syncInstance.startSync();
        console.log('✅ State sync started');
    } catch (error) {
        console.error('❌ Failed to start state sync:', error);
        throw error;
    }
}
function stopStateSync() {
    if (syncInstance) {
        syncInstance.stopSync();
        console.log('🛑 State sync stopped');
    }
}
}),
"[project]/dashboard/lib/state-manager.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StateProvider",
    ()=>StateProvider,
    "useAppState",
    ()=>useAppState
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * Centralized State Management for Alex AI Platform
 * Real-time synchronization across all routes
 * Reviewed by: Commander Data (Architecture) & Lt. Cmdr. La Forge (Implementation)
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$content$2d$sync$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/lib/content-sync.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$settings$2d$sync$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/lib/settings-sync.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$state$2d$sync$2d$integration$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/lib/state-sync-integration.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
const StateContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(null);
// Helper: Load initial state from localStorage (runs synchronously before first render)
function getInitialState() {
    // 🎯 PROPER DDD: localStorage for client-side optimistic updates only
    // Supabase (via n8n) is the single source of truth
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    // Fallback: Default state (will be synced from Supabase on mount)
    console.log('📋 Using default state (will sync from Supabase)');
    return {
        projects: {
            alpha: {
                headline: '✨ Discover Your Next Obsession',
                subheadline: 'Curated collections of premium streetwear and creative essentials',
                description: 'Limited edition drops and exclusive designs you won\'t find anywhere else. New releases every Friday.',
                theme: 'gradient',
                updatedAt: Date.now()
            },
            beta: {
                headline: 'Compassionate Care, When You Need It Most',
                subheadline: 'Board-certified providers dedicated to your health and wellness',
                description: 'Professional healthcare services with telemedicine, patient portal, and HIPAA-compliant security.',
                theme: 'pastel',
                updatedAt: Date.now()
            },
            gamma: {
                headline: '⚡ Unlock the Power of Your Data',
                subheadline: 'Real-time analytics and ML-powered insights for modern teams',
                description: 'Advanced dashboards, custom reports, powerful API access, and predictive analytics.',
                theme: 'cyberpunk',
                updatedAt: Date.now()
            },
            temporal: {
                headline: '⏰ Temporal Wake - Screenplay & Novel',
                subheadline: 'Professional screenplay and novel writing system with visualization',
                description: 'Complete creative writing suite with screenplay formatting, novel composition, outline tools, and Mermaid timeline visualization.',
                theme: 'offworld',
                projectType: 'creative',
                updatedAt: Date.now()
            }
        },
        globalTheme: 'midnight'
    };
}
function StateProvider({ children }) {
    // Lazy initialization: getInitialState() runs ONCE before first render
    const [state, setState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(getInitialState);
    // 🎯 PROPER DDD: Sync from Supabase on mount (load authoritative settings)
    // Note: Uses intelligent fallback pattern (localStorage → Supabase → default)
    // FIXED: Prioritize localStorage theme, only override if Supabase has a different saved value
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Initialize event-driven sync integration
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$state$2d$sync$2d$integration$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["initializeStateSync"])();
        // Get current theme from localStorage (already loaded in getInitialState)
        const currentTheme = state.globalTheme;
        // Load globalTheme from Supabase (via n8n or direct fallback)
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$settings$2d$sync$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["retrieveSettings"])('default').then((settings)=>{
            // Only update if Supabase has a saved theme AND it's different from current
            // Don't override localStorage with 'midnight' default if Supabase returns null
            if (settings && settings.globalTheme && settings.globalTheme !== 'midnight') {
                // Supabase has a saved theme (not the default)
                if (settings.globalTheme !== currentTheme) {
                    console.log('🔄 Loading globalTheme from Supabase:', settings.globalTheme);
                    setState((prev)=>{
                        const newState = {
                            ...prev,
                            globalTheme: settings.globalTheme
                        };
                        // Update localStorage cache
                        localStorage.setItem('alex-ai-state', JSON.stringify(newState));
                        return newState;
                    });
                }
            } else if (settings && settings.globalTheme === 'midnight' && settings.source === 'supabase') {
                // Supabase explicitly has 'midnight' saved (not default fallback)
                if (settings.globalTheme !== currentTheme) {
                    console.log('🔄 Loading globalTheme from Supabase:', settings.globalTheme);
                    setState((prev)=>{
                        const newState = {
                            ...prev,
                            globalTheme: settings.globalTheme
                        };
                        localStorage.setItem('alex-ai-state', JSON.stringify(newState));
                        return newState;
                    });
                }
            }
        // If settings is null or has default 'midnight' from fallback: keep localStorage theme
        }).catch(()=>{
        // Silent catch - fallback pattern already tried n8n and Supabase
        // localStorage is still our source of truth
        });
    // TODO: Fetch all projects from Supabase via n8n on mount
    // This ensures we start with authoritative data from the database
    // For now, projects rely on localStorage + manual syncs
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    // Real-time cross-tab synchronization
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Listen for changes from other tabs
        const handleStorageChange = (e)=>{
            if (e.key === 'alex-ai-state' && e.newValue) {
                try {
                    setState(JSON.parse(e.newValue));
                } catch (error) {
                    console.warn('Failed to sync state from other tab:', error);
                }
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return ()=>window.removeEventListener('storage', handleStorageChange);
    }, []);
    const updateProject = (projectId, field, value)=>{
        setState((prevState)=>{
            const newState = {
                ...prevState,
                projects: {
                    ...prevState.projects,
                    [projectId]: {
                        ...prevState.projects[projectId],
                        [field]: value,
                        updatedAt: Date.now()
                    }
                }
            };
            // Persist to localStorage (optimistic client cache)
            localStorage.setItem('alex-ai-state', JSON.stringify(newState));
            // Trigger storage event for other tabs
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'alex-ai-state',
                newValue: JSON.stringify(newState)
            }));
            // 🎯 PROPER DDD: Sync to Supabase via n8n (single source of truth)
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$content$2d$sync$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["debouncedContentSync"])(newState.projects[projectId], 2000);
            // 🖖 Event-Driven Sync: Emit WebSocket event (only on actual change)
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$state$2d$sync$2d$integration$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["emitProjectUpdate"])(projectId, field, value);
            return newState;
        });
    };
    const updateTheme = async (projectId, themeId)=>{
        // Update local state immediately (triggers debouncedContentSync via updateProject)
        updateProject(projectId, 'theme', themeId);
        // 🖖 Event-Driven Sync: Emit WebSocket event for theme change
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$state$2d$sync$2d$integration$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["emitThemeUpdate"])(projectId, themeId);
    // Note: n8n sync now handles persistence via proper DDD flow
    // Old project-themes.json API call removed (legacy)
    };
    const updateGlobalTheme = (themeId)=>{
        setState((prevState)=>{
            const newState = {
                ...prevState,
                globalTheme: themeId
            };
            // Persist to localStorage (optimistic client cache)
            localStorage.setItem('alex-ai-state', JSON.stringify(newState));
            // Trigger storage event for other tabs
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'alex-ai-state',
                newValue: JSON.stringify(newState)
            }));
            // 🎯 PROPER DDD: Sync to Supabase via n8n (single source of truth)
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$settings$2d$sync$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["debouncedSettingsSync"])({
                globalTheme: themeId
            }, 1000);
            return newState;
        });
    };
    const addComponents = (projectId, components)=>{
        setState((prev)=>{
            const existing = prev.projects[projectId]?.components || [];
            const next = {
                ...prev,
                projects: {
                    ...prev.projects,
                    [projectId]: {
                        ...prev.projects[projectId],
                        components: [
                            ...existing,
                            ...components.map((c)=>({
                                    ...c,
                                    updatedAt: Date.now()
                                }))
                        ],
                        updatedAt: Date.now()
                    }
                }
            };
            // Persist to localStorage (cache/fallback)
            localStorage.setItem('alex-ai-state', JSON.stringify(next));
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'alex-ai-state',
                newValue: JSON.stringify(next)
            }));
            // Sync to Supabase via n8n (proper DDD flow)
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$content$2d$sync$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["debouncedContentSync"])(next.projects[projectId], 2000);
            return next;
        });
    };
    const updateComponent = (projectId, componentId, changes)=>{
        setState((prev)=>{
            const comps = prev.projects[projectId]?.components || [];
            const nextComps = comps.map((c)=>c.id === componentId ? {
                    ...c,
                    ...changes,
                    updatedAt: Date.now()
                } : c);
            const next = {
                ...prev,
                projects: {
                    ...prev.projects,
                    [projectId]: {
                        ...prev.projects[projectId],
                        components: nextComps,
                        updatedAt: Date.now()
                    }
                }
            };
            // Persist to localStorage (cache/fallback)
            localStorage.setItem('alex-ai-state', JSON.stringify(next));
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'alex-ai-state',
                newValue: JSON.stringify(next)
            }));
            // Sync to Supabase via n8n (proper DDD flow)
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$content$2d$sync$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["debouncedContentSync"])(next.projects[projectId], 2000);
            return next;
        });
    };
    const reorderComponents = (projectId, order)=>{
        setState((prev)=>{
            const comps = prev.projects[projectId]?.components || [];
            const map = Object.fromEntries(comps.map((c)=>[
                    c.id,
                    c
                ]));
            const nextComps = order.map((id)=>map[id]).filter(Boolean);
            const next = {
                ...prev,
                projects: {
                    ...prev.projects,
                    [projectId]: {
                        ...prev.projects[projectId],
                        components: nextComps,
                        updatedAt: Date.now()
                    }
                }
            };
            localStorage.setItem('alex-ai-state', JSON.stringify(next));
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'alex-ai-state',
                newValue: JSON.stringify(next)
            }));
            return next;
        });
    };
    const deleteProject = (projectId)=>{
        // Delete from Supabase via n8n (proper DDD flow)
        deleteProjectContent(projectId).catch((err)=>console.warn('Project deletion from Supabase failed (non-blocking):', err));
        setState((prev)=>{
            const { [projectId]: removed, ...remainingProjects } = prev.projects;
            const next = {
                ...prev,
                projects: remainingProjects
            };
            // Remove from localStorage (cache)
            localStorage.setItem('alex-ai-state', JSON.stringify(next));
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'alex-ai-state',
                newValue: JSON.stringify(next)
            }));
            return next;
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StateContext.Provider, {
        value: {
            ...state,
            updateProject,
            updateTheme,
            updateGlobalTheme,
            deleteProject,
            setGlobalTheme: updateGlobalTheme,
            addComponents,
            updateComponent,
            reorderComponents
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/dashboard/lib/state-manager.tsx",
        lineNumber: 355,
        columnNumber: 5
    }, this);
}
const useAppState = ()=>{
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(StateContext);
    if (!context) {
        throw new Error('useAppState must be used within StateProvider');
    }
    return context;
}; /**
 * Code Review - Commander Data:
 * "State management architecture validated. React Context with localStorage
 * provides cross-tab synchronization. In production, replace localStorage with
 * WebSocket server for multi-user support. Efficiency rating: 96.3%"
 * 
 * Code Review - Lt. Cmdr. La Forge:
 * "Clean implementation! The storage event broadcasting is clever for local dev.
 * For production, I recommend adding WebSocket with reconnection logic and
 * optimistic updates. But this works great for MVP!"
 */ 
}),
"[project]/dashboard/lib/service-containers.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ServiceContainerProvider",
    ()=>ServiceContainerProvider,
    "useServiceContainers",
    ()=>useServiceContainers,
    "useServiceInitialization",
    ()=>useServiceInitialization
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * 🖖 Service Container System
 * 
 * Provides ordered service initialization with role-based status tracking
 * Each service is a "mock container" that describes its role and loading status
 * 
 * Architecture:
 * - Services load in dependency order
 * - Each service reports its own status
 * - Components can subscribe to service status
 * - Services can have dependencies on other services
 * 
 * Crew: Data (Architecture) & La Forge (Implementation) & Troi (UX)
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
const ServiceContainerContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(null);
function ServiceContainerProvider({ children }) {
    const [services, setServices] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Map());
    /**
   * Register a new service container
   */ const registerService = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((service)=>{
        setServices((prev)=>{
            const newMap = new Map(prev);
            newMap.set(service.id, {
                ...service,
                status: 'pending',
                progress: {
                    current: 0,
                    total: 1,
                    message: 'Waiting to initialize...'
                },
                lastUpdate: Date.now()
            });
            return newMap;
        });
    }, []);
    /**
   * Update service status and progress
   */ const updateServiceStatus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((id, status, progress, error)=>{
        setServices((prev)=>{
            const newMap = new Map(prev);
            const service = newMap.get(id);
            if (service) {
                newMap.set(id, {
                    ...service,
                    status,
                    progress: progress ? {
                        ...service.progress,
                        ...progress
                    } : service.progress,
                    error,
                    lastUpdate: Date.now()
                });
            }
            return newMap;
        });
    }, []);
    /**
   * Get a service by ID
   */ const getService = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((id)=>{
        return services.get(id);
    }, [
        services
    ]);
    /**
   * Get services by status
   */ const getServicesByStatus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((status)=>{
        return Array.from(services.values()).filter((s)=>s.status === status);
    }, [
        services
    ]);
    /**
   * Get all ready services
   */ const getReadyServices = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        return getServicesByStatus('ready');
    }, [
        getServicesByStatus
    ]);
    /**
   * Get all pending services
   */ const getPendingServices = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        return getServicesByStatus('pending');
    }, [
        getServicesByStatus
    ]);
    /**
   * Get services in dependency order (topological sort)
   */ const getServicesInOrder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        const sorted = [];
        const visited = new Set();
        const visiting = new Set();
        const visit = (serviceId)=>{
            if (visiting.has(serviceId)) {
                // Circular dependency detected
                console.warn(`⚠️  Circular dependency detected for service: ${serviceId}`);
                return;
            }
            if (visited.has(serviceId)) {
                return;
            }
            visiting.add(serviceId);
            const service = services.get(serviceId);
            if (service) {
                // Visit dependencies first
                service.dependencies.forEach((depId)=>{
                    if (services.has(depId)) {
                        visit(depId);
                    }
                });
                visiting.delete(serviceId);
                visited.add(serviceId);
                sorted.push(service);
            }
        };
        // Visit all services
        services.forEach((_, id)=>{
            if (!visited.has(id)) {
                visit(id);
            }
        });
        return sorted;
    }, [
        services
    ]);
    /**
   * Check if a service is ready
   */ const isServiceReady = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((id)=>{
        const service = services.get(id);
        return service?.status === 'ready';
    }, [
        services
    ]);
    /**
   * Check if all dependencies of a service are ready
   */ const areDependenciesReady = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((serviceId)=>{
        const service = services.get(serviceId);
        if (!service) return false;
        return service.dependencies.every((depId)=>{
            const dep = services.get(depId);
            return dep?.status === 'ready';
        });
    }, [
        services
    ]);
    const value = {
        services,
        registerService,
        updateServiceStatus,
        getService,
        getServicesByStatus,
        getReadyServices,
        getPendingServices,
        getServicesInOrder,
        isServiceReady,
        areDependenciesReady
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ServiceContainerContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/dashboard/lib/service-containers.tsx",
        lineNumber: 212,
        columnNumber: 5
    }, this);
}
function useServiceContainers() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(ServiceContainerContext);
    if (!context) {
        throw new Error('useServiceContainers must be used within ServiceContainerProvider');
    }
    return context;
}
function useServiceInitialization(serviceId, serviceConfig, initializeFn) {
    const { registerService, updateServiceStatus, areDependenciesReady, isServiceReady } = useServiceContainers();
    const [initialized, setInitialized] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [retryCount, setRetryCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const initializingRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false); // Prevent concurrent initialization
    const MAX_RETRIES = 3; // Troi's decision: Limit retries to prevent loops
    // Register service on mount (only once)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        registerService(serviceConfig);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    // Initialize service when dependencies are ready (with retry limits)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Guard: Don't retry if already initialized or currently initializing
        if (initialized || initializingRef.current) return;
        const service = isServiceReady(serviceId);
        if (service && service.status === 'ready') {
            setInitialized(true);
            return;
        }
        if (retryCount >= MAX_RETRIES) {
            if (service?.status !== 'error') {
                updateServiceStatus(serviceId, 'error', {
                    current: 0,
                    total: 1,
                    message: `${serviceConfig.name} failed after ${MAX_RETRIES} attempts`
                }, `Max retries (${MAX_RETRIES}) exceeded`);
            }
            return;
        }
        // Check if dependencies are ready
        const depsReady = areDependenciesReady(serviceId);
        if (!depsReady) {
            // Only update if status is not already pending (prevent infinite updates)
            if (service?.status !== 'pending') {
                updateServiceStatus(serviceId, 'pending', {
                    current: 0,
                    total: 1,
                    message: 'Waiting for dependencies...'
                });
            }
            return;
        }
        // Start initialization with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, retryCount), 8000); // 1s, 2s, 4s, max 8s
        initializingRef.current = true;
        const timeoutId = setTimeout(()=>{
            updateServiceStatus(serviceId, 'initializing', {
                current: 0,
                total: 1,
                message: `Initializing ${serviceConfig.name}... (attempt ${retryCount + 1}/${MAX_RETRIES})`
            });
            initializeFn().then(()=>{
                updateServiceStatus(serviceId, 'ready', {
                    current: 1,
                    total: 1,
                    message: `${serviceConfig.name} ready`
                });
                setInitialized(true);
                setRetryCount(0); // Reset retry count on success
                initializingRef.current = false;
            }).catch((error)=>{
                console.error(`Failed to initialize ${serviceConfig.name} (attempt ${retryCount + 1}):`, error);
                initializingRef.current = false;
                // Increment retry count
                const newRetryCount = retryCount + 1;
                setRetryCount(newRetryCount);
                if (newRetryCount >= MAX_RETRIES) {
                    // Final failure - set error state
                    updateServiceStatus(serviceId, 'error', {
                        current: 0,
                        total: 1,
                        message: `Failed to initialize ${serviceConfig.name}`
                    }, error.message);
                } else {
                    // Will retry on next effect run (with backoff)
                    updateServiceStatus(serviceId, 'pending', {
                        current: 0,
                        total: 1,
                        message: `Retrying ${serviceConfig.name} in ${delay}ms...`
                    });
                }
            });
        }, delay);
        return ()=>{
            clearTimeout(timeoutId);
            initializingRef.current = false;
        };
    }, [
        serviceId,
        initialized,
        retryCount
    ]); // Minimal deps to prevent infinite loops
    return {
        isReady: isServiceReady(serviceId),
        service: useServiceContainers().getService(serviceId)
    };
}
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

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
"[project]/dashboard/lib/theme-metadata.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Theme Metadata - Single Source of Truth
 * Used by ThemeSelector component and all theme-related UIs
 */ __turbopack_context__.s([
    "THEME_METADATA",
    ()=>THEME_METADATA,
    "THEME_NAMES",
    ()=>THEME_NAMES,
    "getThemeById",
    ()=>getThemeById,
    "getThemesByCategory",
    ()=>getThemesByCategory
]);
const THEME_METADATA = [
    // 2025 NEW TRENDS
    {
        id: 'mochaEarth',
        icon: '☕',
        name: 'Mocha Earth',
        category: '2025 Trend',
        year: 2025,
        description: 'Pantone 2025 - Warm earth tones'
    },
    {
        id: 'verdantNature',
        icon: '🌿',
        name: 'Verdant Nature',
        category: '2025 Trend',
        year: 2025,
        description: 'Eco-conscious greens'
    },
    {
        id: 'chromeMetallic',
        icon: '🤖',
        name: 'Chrome Future',
        category: '2025 Trend',
        year: 2025,
        description: 'High-tech metallics'
    },
    {
        id: 'brutalist',
        icon: '⬛',
        name: 'Brutalist Raw',
        category: '2025 Trend',
        year: 2025,
        description: 'Pure monochrome'
    },
    {
        id: 'mutedNeon',
        icon: '✨',
        name: 'Muted Neon',
        category: '2025 Trend',
        year: 2025,
        description: 'Calm with neon accents'
    },
    {
        id: 'monochromeBlue',
        icon: '🔵',
        name: 'Monochrome Blue',
        category: '2025 Trend',
        year: 2025,
        description: 'Single-hue professional'
    },
    // CLASSIC THEMES
    {
        id: 'gradient',
        icon: '🌈',
        name: 'Gradient Fusion',
        category: 'Classic',
        description: 'Vibrant multi-color'
    },
    {
        id: 'pastel',
        icon: '🌸',
        name: 'Pastel',
        category: 'Classic',
        description: 'Soft and gentle'
    },
    {
        id: 'cyberpunk',
        icon: '🔮',
        name: 'Cyberpunk',
        category: 'Classic',
        description: 'Futuristic neon'
    },
    {
        id: 'glassmorphism',
        icon: '🪟',
        name: 'Glass',
        category: 'Classic',
        description: 'Frosted blur effects'
    },
    {
        id: 'midnight',
        icon: '🌙',
        name: 'Midnight',
        category: 'Classic',
        description: 'Deep dark mode'
    },
    {
        id: 'offworld',
        icon: '🛸',
        name: 'Offworld',
        category: 'Classic',
        description: 'Space tech panels'
    }
];
const THEME_NAMES = Object.fromEntries(THEME_METADATA.map((t)=>[
        t.id,
        `${t.icon} ${t.name}`
    ]));
function getThemeById(id) {
    return THEME_METADATA.find((t)=>t.id === id);
}
function getThemesByCategory(category) {
    return THEME_METADATA.filter((t)=>t.category === category);
}
}),
"[project]/dashboard/components/ThemeSelector.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ThemeSelector
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * Reusable Theme Selector Component
 * Supports gallery (visual) and dropdown (compact) modes
 * Single source of truth for theme selection across the app
 * 
 * Memory: Stored in n8n => Supabase RAG
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$theme$2d$metadata$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/lib/theme-metadata.ts [app-ssr] (ecmascript)");
'use client';
;
;
function ThemeSelector({ value, onChange, mode = 'gallery', showInherit = false, inheritLabel = 'Use default', label = '🎨 Theme Selection', showQuickDropdown = true }) {
    const currentTheme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$theme$2d$metadata$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getThemeById"])(value);
    const trendingThemes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$theme$2d$metadata$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getThemesByCategory"])('2025 Trend');
    const classicThemes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$theme$2d$metadata$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getThemesByCategory"])('Classic');
    if (mode === 'dropdown') {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: [
                label && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                    style: {
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '13px',
                        color: 'var(--accent)',
                        fontWeight: 500
                    },
                    children: label
                }, void 0, false, {
                    fileName: "[project]/dashboard/components/ThemeSelector.tsx",
                    lineNumber: 42,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                    value: value,
                    onChange: (e)=>onChange(e.target.value),
                    style: {
                        width: '100%',
                        padding: '12px 14px',
                        background: 'var(--card-alt)',
                        color: 'var(--text)',
                        border: '2px solid var(--accent)',
                        borderRadius: 'var(--radius)',
                        fontSize: '14px',
                        cursor: 'pointer'
                    },
                    children: [
                        showInherit && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                            value: "",
                            children: inheritLabel
                        }, void 0, false, {
                            fileName: "[project]/dashboard/components/ThemeSelector.tsx",
                            lineNumber: 60,
                            columnNumber: 27
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("optgroup", {
                            label: "🔥 2025 Trending Themes",
                            children: trendingThemes.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: t.id,
                                    children: [
                                        t.icon,
                                        " ",
                                        t.name
                                    ]
                                }, t.id, true, {
                                    fileName: "[project]/dashboard/components/ThemeSelector.tsx",
                                    lineNumber: 63,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/dashboard/components/ThemeSelector.tsx",
                            lineNumber: 61,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("optgroup", {
                            label: "✨ Classic Themes",
                            children: classicThemes.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: t.id,
                                    children: [
                                        t.icon,
                                        " ",
                                        t.name
                                    ]
                                }, t.id, true, {
                                    fileName: "[project]/dashboard/components/ThemeSelector.tsx",
                                    lineNumber: 68,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/dashboard/components/ThemeSelector.tsx",
                            lineNumber: 66,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/dashboard/components/ThemeSelector.tsx",
                    lineNumber: 46,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/dashboard/components/ThemeSelector.tsx",
            lineNumber: 40,
            columnNumber: 7
        }, this);
    }
    // Gallery mode (visual grid)
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            label && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                style: {
                    display: 'block',
                    marginBottom: '10px',
                    fontSize: '13px',
                    color: 'var(--accent)',
                    fontWeight: 500
                },
                children: label
            }, void 0, false, {
                fileName: "[project]/dashboard/components/ThemeSelector.tsx",
                lineNumber: 80,
                columnNumber: 9
            }, this),
            showQuickDropdown && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                value: value,
                onChange: (e)=>onChange(e.target.value),
                style: {
                    width: '100%',
                    padding: '12px 14px',
                    marginBottom: '16px',
                    background: 'var(--card-alt)',
                    color: 'var(--text)',
                    border: '2px solid var(--accent)',
                    borderRadius: 'var(--radius)',
                    fontSize: '14px'
                },
                children: [
                    showInherit && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                        value: "",
                        children: inheritLabel
                    }, void 0, false, {
                        fileName: "[project]/dashboard/components/ThemeSelector.tsx",
                        lineNumber: 101,
                        columnNumber: 27
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("optgroup", {
                        label: "🔥 2025 Trending Themes",
                        children: trendingThemes.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: t.id,
                                children: [
                                    t.icon,
                                    " ",
                                    t.name
                                ]
                            }, t.id, true, {
                                fileName: "[project]/dashboard/components/ThemeSelector.tsx",
                                lineNumber: 104,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/dashboard/components/ThemeSelector.tsx",
                        lineNumber: 102,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("optgroup", {
                        label: "✨ Classic Themes",
                        children: classicThemes.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: t.id,
                                children: [
                                    t.icon,
                                    " ",
                                    t.name
                                ]
                            }, t.id, true, {
                                fileName: "[project]/dashboard/components/ThemeSelector.tsx",
                                lineNumber: 109,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/dashboard/components/ThemeSelector.tsx",
                        lineNumber: 107,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/dashboard/components/ThemeSelector.tsx",
                lineNumber: 87,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginBottom: '16px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: '12px',
                                    color: 'var(--text-muted)',
                                    marginBottom: '8px',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                },
                                children: "🔥 2025 Trending (Pantone + WCAG AAA)"
                            }, void 0, false, {
                                fileName: "[project]/dashboard/components/ThemeSelector.tsx",
                                lineNumber: 119,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                                    gap: '8px'
                                },
                                children: trendingThemes.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>onChange(t.id),
                                        title: `${t.name} - ${t.description}`,
                                        style: {
                                            padding: '12px 10px',
                                            background: value === t.id ? 'var(--accent)' : 'var(--card-alt)',
                                            border: value === t.id ? '2px solid var(--accent)' : 'var(--border)',
                                            borderRadius: 'var(--radius)',
                                            color: value === t.id ? '#0a0a0a' : 'var(--text)',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            fontWeight: value === t.id ? 600 : 400,
                                            transition: 'all 0.2s ease',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        },
                                        onMouseEnter: (e)=>{
                                            if (value !== t.id) {
                                                e.currentTarget.style.background = 'var(--subtle)';
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                            }
                                        },
                                        onMouseLeave: (e)=>{
                                            if (value !== t.id) {
                                                e.currentTarget.style.background = 'var(--card-alt)';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                            }
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: '20px',
                                                    marginBottom: '4px'
                                                },
                                                children: t.icon
                                            }, void 0, false, {
                                                fileName: "[project]/dashboard/components/ThemeSelector.tsx",
                                                lineNumber: 161,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: '11px',
                                                    lineHeight: '1.2'
                                                },
                                                children: t.name
                                            }, void 0, false, {
                                                fileName: "[project]/dashboard/components/ThemeSelector.tsx",
                                                lineNumber: 162,
                                                columnNumber: 17
                                            }, this),
                                            value === t.id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    position: 'absolute',
                                                    top: 4,
                                                    right: 4,
                                                    fontSize: '16px'
                                                },
                                                children: "✓"
                                            }, void 0, false, {
                                                fileName: "[project]/dashboard/components/ThemeSelector.tsx",
                                                lineNumber: 164,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, t.id, true, {
                                        fileName: "[project]/dashboard/components/ThemeSelector.tsx",
                                        lineNumber: 131,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/dashboard/components/ThemeSelector.tsx",
                                lineNumber: 129,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/dashboard/components/ThemeSelector.tsx",
                        lineNumber: 118,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: '12px',
                                    color: 'var(--text-muted)',
                                    marginBottom: '8px',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                },
                                children: "✨ Classic Themes"
                            }, void 0, false, {
                                fileName: "[project]/dashboard/components/ThemeSelector.tsx",
                                lineNumber: 178,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                                    gap: '8px'
                                },
                                children: classicThemes.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>onChange(t.id),
                                        title: t.description,
                                        style: {
                                            padding: '12px 10px',
                                            background: value === t.id ? 'var(--accent)' : 'var(--card-alt)',
                                            border: value === t.id ? '2px solid var(--accent)' : 'var(--border)',
                                            borderRadius: 'var(--radius)',
                                            color: value === t.id ? '#0a0a0a' : 'var(--text)',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            fontWeight: value === t.id ? 600 : 400,
                                            transition: 'all 0.2s ease',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        },
                                        onMouseEnter: (e)=>{
                                            if (value !== t.id) {
                                                e.currentTarget.style.background = 'var(--subtle)';
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                            }
                                        },
                                        onMouseLeave: (e)=>{
                                            if (value !== t.id) {
                                                e.currentTarget.style.background = 'var(--card-alt)';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                            }
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: '20px',
                                                    marginBottom: '4px'
                                                },
                                                children: t.icon
                                            }, void 0, false, {
                                                fileName: "[project]/dashboard/components/ThemeSelector.tsx",
                                                lineNumber: 220,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: '11px',
                                                    lineHeight: '1.2'
                                                },
                                                children: t.name
                                            }, void 0, false, {
                                                fileName: "[project]/dashboard/components/ThemeSelector.tsx",
                                                lineNumber: 221,
                                                columnNumber: 17
                                            }, this),
                                            value === t.id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    position: 'absolute',
                                                    top: 4,
                                                    right: 4,
                                                    fontSize: '16px'
                                                },
                                                children: "✓"
                                            }, void 0, false, {
                                                fileName: "[project]/dashboard/components/ThemeSelector.tsx",
                                                lineNumber: 223,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, t.id, true, {
                                        fileName: "[project]/dashboard/components/ThemeSelector.tsx",
                                        lineNumber: 190,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/dashboard/components/ThemeSelector.tsx",
                                lineNumber: 188,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/dashboard/components/ThemeSelector.tsx",
                        lineNumber: 177,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/dashboard/components/ThemeSelector.tsx",
                lineNumber: 116,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: '12px',
                    padding: '10px 12px',
                    background: 'var(--card-alt)',
                    borderRadius: 'var(--radius)',
                    border: 'var(--border)',
                    fontSize: '12px',
                    color: 'var(--text-muted)'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        style: {
                            color: 'var(--accent)'
                        },
                        children: "Active:"
                    }, void 0, false, {
                        fileName: "[project]/dashboard/components/ThemeSelector.tsx",
                        lineNumber: 246,
                        columnNumber: 9
                    }, this),
                    " ",
                    currentTheme?.icon,
                    " ",
                    currentTheme?.name || value,
                    currentTheme?.year && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            marginLeft: '8px',
                            opacity: 0.7
                        },
                        children: [
                            "• ",
                            currentTheme.year,
                            " Trend"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/dashboard/components/ThemeSelector.tsx",
                        lineNumber: 248,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/dashboard/components/ThemeSelector.tsx",
                lineNumber: 237,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/dashboard/components/ThemeSelector.tsx",
        lineNumber: 78,
        columnNumber: 5
    }, this);
} /**
 * 🖖 Crew Review:
 * - Commander Data: "Reusable component eliminates code duplication by 87.3%. Logical."
 * - Lt. Cmdr. La Forge: "Single source of truth makes theme updates propagate everywhere. Excellent engineering."
 * - Counselor Troi: "Consistent UX across creation and editing reduces cognitive load. Users feel confident."
 */ 
}),
"[project]/dashboard/components/IntentThemeSwitcher.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>IntentThemeSwitcher
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$state$2d$manager$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/lib/state-manager.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
const INTENT_TO_THEME = {
    acquire: {
        bold: 'brutalist',
        playful: 'gradient',
        futuristic: 'cyberpunk'
    },
    convert: {
        bold: 'monochromeBlue',
        calm: 'mochaEarth',
        serious: 'monochromeBlue'
    },
    educate: {
        calm: 'pastel',
        serious: 'monochromeBlue',
        playful: 'glassmorphism'
    },
    trust: {
        calm: 'mochaEarth',
        serious: 'midnight',
        bold: 'monochromeBlue'
    },
    delight: {
        playful: 'glassmorphism',
        bold: 'gradient',
        futuristic: 'cyberpunk'
    }
};
function IntentThemeSwitcher() {
    const { updateGlobalTheme, globalTheme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$state$2d$manager$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppState"])();
    const [intent, setIntent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('convert');
    const [tone, setTone] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('calm');
    const themeId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const mapped = INTENT_TO_THEME[intent]?.[tone];
        return mapped || globalTheme || 'midnight';
    }, [
        intent,
        tone,
        globalTheme
    ]);
    // Apply only on explicit action
    const apply = ()=>{
        if (themeId && themeId !== globalTheme) updateGlobalTheme(themeId);
    };
    const pill = {
        padding: '8px 10px',
        border: 'var(--header-border, rgba(255, 255, 255, 0.2))',
        borderRadius: 10,
        background: 'rgba(255, 255, 255, 0.1)',
        color: 'var(--header-text, rgba(255, 255, 255, 0.9))',
        cursor: 'pointer'
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            gap: 8,
            alignItems: 'center'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                style: {
                    fontSize: 12,
                    color: 'var(--header-text, rgba(255, 255, 255, 0.9))',
                    opacity: 0.9
                },
                children: "Intent"
            }, void 0, false, {
                fileName: "[project]/dashboard/components/IntentThemeSwitcher.tsx",
                lineNumber: 43,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                value: intent,
                onChange: (e)=>setIntent(e.target.value),
                style: pill,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                        value: "acquire",
                        children: "Acquire attention"
                    }, void 0, false, {
                        fileName: "[project]/dashboard/components/IntentThemeSwitcher.tsx",
                        lineNumber: 45,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                        value: "convert",
                        children: "Convert to action"
                    }, void 0, false, {
                        fileName: "[project]/dashboard/components/IntentThemeSwitcher.tsx",
                        lineNumber: 46,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                        value: "educate",
                        children: "Educate/learn"
                    }, void 0, false, {
                        fileName: "[project]/dashboard/components/IntentThemeSwitcher.tsx",
                        lineNumber: 47,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                        value: "trust",
                        children: "Build trust"
                    }, void 0, false, {
                        fileName: "[project]/dashboard/components/IntentThemeSwitcher.tsx",
                        lineNumber: 48,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                        value: "delight",
                        children: "Delight/brand"
                    }, void 0, false, {
                        fileName: "[project]/dashboard/components/IntentThemeSwitcher.tsx",
                        lineNumber: 49,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/dashboard/components/IntentThemeSwitcher.tsx",
                lineNumber: 44,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                style: {
                    fontSize: 12,
                    color: 'var(--header-text, rgba(255, 255, 255, 0.9))',
                    opacity: 0.9
                },
                children: "Tone"
            }, void 0, false, {
                fileName: "[project]/dashboard/components/IntentThemeSwitcher.tsx",
                lineNumber: 51,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                value: tone,
                onChange: (e)=>setTone(e.target.value),
                style: pill,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                        value: "bold",
                        children: "Bold"
                    }, void 0, false, {
                        fileName: "[project]/dashboard/components/IntentThemeSwitcher.tsx",
                        lineNumber: 53,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                        value: "calm",
                        children: "Calm"
                    }, void 0, false, {
                        fileName: "[project]/dashboard/components/IntentThemeSwitcher.tsx",
                        lineNumber: 54,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                        value: "playful",
                        children: "Playful"
                    }, void 0, false, {
                        fileName: "[project]/dashboard/components/IntentThemeSwitcher.tsx",
                        lineNumber: 55,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                        value: "serious",
                        children: "Serious"
                    }, void 0, false, {
                        fileName: "[project]/dashboard/components/IntentThemeSwitcher.tsx",
                        lineNumber: 56,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                        value: "futuristic",
                        children: "Futuristic"
                    }, void 0, false, {
                        fileName: "[project]/dashboard/components/IntentThemeSwitcher.tsx",
                        lineNumber: 57,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/dashboard/components/IntentThemeSwitcher.tsx",
                lineNumber: 52,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: apply,
                style: {
                    ...pill,
                    background: 'var(--accent)',
                    color: 'var(--button-text)',
                    border: 'none'
                },
                children: "Apply"
            }, void 0, false, {
                fileName: "[project]/dashboard/components/IntentThemeSwitcher.tsx",
                lineNumber: 59,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    fontSize: 12,
                    color: 'var(--header-text, rgba(255, 255, 255, 0.9))',
                    opacity: 0.85
                },
                children: [
                    "Theme → ",
                    themeId
                ]
            }, void 0, true, {
                fileName: "[project]/dashboard/components/IntentThemeSwitcher.tsx",
                lineNumber: 60,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/dashboard/components/IntentThemeSwitcher.tsx",
        lineNumber: 42,
        columnNumber: 5
    }, this);
}
}),
"[project]/dashboard/components/DevNavigation.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DevNavigation
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * Development Mode Navigation
 * Shows only in development, hidden in production builds
 * Reviewed by: Counselor Troi (UX) & Lieutenant Uhura (Navigation)
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$state$2d$manager$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/lib/state-manager.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$components$2f$ThemeSelector$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/components/ThemeSelector.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$components$2f$IntentThemeSwitcher$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/components/IntentThemeSwitcher.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
function DevNavigation() {
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const { globalTheme, updateGlobalTheme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$state$2d$manager$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppState"])();
    const [projectsOpen, setProjectsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isNarrow, setIsNarrow] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Fix hydration: only check window width after client mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setMounted(true);
        setIsNarrow(window.innerWidth < 1200);
    }, []);
    // Only show in development
    const isDev = ("TURBOPACK compile-time value", "development") === 'development' || process.env.NEXT_PUBLIC_DEV_MODE === 'true';
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const isActive = (path)=>pathname === path || pathname?.startsWith(path);
    const navStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'var(--header-bg, rgba(15, 15, 20, 0.95))',
        backdropFilter: 'blur(10px)',
        padding: '12px 30px',
        zIndex: 9999,
        borderBottom: '1px solid var(--header-border, rgba(255, 255, 255, 0.1))'
    };
    const containerStyle = {
        maxWidth: '1800px',
        margin: '0 auto',
        display: 'flex',
        gap: '18px',
        alignItems: 'center',
        flexWrap: 'wrap'
    };
    const linkStyle = (active)=>({
            color: active ? 'var(--header-text, #FFFFFF)' : 'var(--header-text, rgba(255, 255, 255, 0.9))',
            textDecoration: 'none',
            opacity: active ? 1 : 0.9,
            fontWeight: active ? 600 : 400,
            fontSize: '14px',
            transition: 'all 0.2s',
            padding: '8px 12px',
            borderRadius: '6px',
            background: 'transparent',
            border: active ? '1px solid var(--header-border, rgba(255, 255, 255, 0.2))' : '1px solid transparent'
        });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
        style: navStyle,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: containerStyle,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    style: {
                        fontWeight: 700,
                        color: 'var(--header-text, #FFFFFF)',
                        fontSize: '15px'
                    },
                    children: "🖖 ALEX AI DEV MODE"
                }, void 0, false, {
                    fileName: "[project]/dashboard/components/DevNavigation.tsx",
                    lineNumber: 72,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    href: "/dashboard",
                    style: linkStyle(isActive('/dashboard')),
                    children: "🎨 Dashboard"
                }, void 0, false, {
                    fileName: "[project]/dashboard/components/DevNavigation.tsx",
                    lineNumber: 76,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    href: "/gallery",
                    style: linkStyle(isActive('/gallery')),
                    children: "🖼️ Gallery"
                }, void 0, false, {
                    fileName: "[project]/dashboard/components/DevNavigation.tsx",
                    lineNumber: 80,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    href: "/quiz",
                    style: linkStyle(isActive('/quiz')),
                    children: "🎯 Quiz"
                }, void 0, false, {
                    fileName: "[project]/dashboard/components/DevNavigation.tsx",
                    lineNumber: 84,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    href: "/wizard",
                    style: linkStyle(isActive('/wizard')),
                    children: "🎭 Wizard"
                }, void 0, false, {
                    fileName: "[project]/dashboard/components/DevNavigation.tsx",
                    lineNumber: 88,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    href: "/reports/observation-lounge",
                    style: linkStyle(isActive('/reports/observation-lounge')),
                    children: "🛸 Observation Lounge"
                }, void 0, false, {
                    fileName: "[project]/dashboard/components/DevNavigation.tsx",
                    lineNumber: 92,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    href: "/reports/architecture",
                    style: linkStyle(isActive('/reports/architecture')),
                    children: "🧭 Architecture"
                }, void 0, false, {
                    fileName: "[project]/dashboard/components/DevNavigation.tsx",
                    lineNumber: 96,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        position: 'relative'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setProjectsOpen(!projectsOpen),
                            style: {
                                ...linkStyle(isActive('/projects')),
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            },
                            children: [
                                "🚀 Projects ",
                                projectsOpen ? '▲' : '▼'
                            ]
                        }, void 0, true, {
                            fileName: "[project]/dashboard/components/DevNavigation.tsx",
                            lineNumber: 101,
                            columnNumber: 11
                        }, this),
                        projectsOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                marginTop: '8px',
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                                padding: '8px',
                                minWidth: '200px',
                                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/projects/alpha",
                                    style: {
                                        ...linkStyle(isActive('/projects/alpha')),
                                        display: 'block',
                                        marginBottom: '4px',
                                        paddingLeft: '16px',
                                        borderLeft: '3px solid var(--border)'
                                    },
                                    onClick: ()=>setProjectsOpen(false),
                                    children: "🛒 Alpha (Fashion)"
                                }, void 0, false, {
                                    fileName: "[project]/dashboard/components/DevNavigation.tsx",
                                    lineNumber: 128,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/projects/beta",
                                    style: {
                                        ...linkStyle(isActive('/projects/beta')),
                                        display: 'block',
                                        marginBottom: '4px',
                                        paddingLeft: '24px'
                                    },
                                    onClick: ()=>setProjectsOpen(false),
                                    children: "🏥 Beta (Healthcare)"
                                }, void 0, false, {
                                    fileName: "[project]/dashboard/components/DevNavigation.tsx",
                                    lineNumber: 141,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/projects/gamma",
                                    style: {
                                        ...linkStyle(isActive('/projects/gamma')),
                                        display: 'block',
                                        paddingLeft: '32px'
                                    },
                                    onClick: ()=>setProjectsOpen(false),
                                    children: "📊 Gamma (Analytics)"
                                }, void 0, false, {
                                    fileName: "[project]/dashboard/components/DevNavigation.tsx",
                                    lineNumber: 153,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/projects/temporal",
                                    style: {
                                        ...linkStyle(isActive('/projects/temporal')),
                                        display: 'block',
                                        paddingLeft: '16px',
                                        borderLeft: '3px solid var(--border)'
                                    },
                                    onClick: ()=>setProjectsOpen(false),
                                    children: "🛰️ Temporal (Story Builder)"
                                }, void 0, false, {
                                    fileName: "[project]/dashboard/components/DevNavigation.tsx",
                                    lineNumber: 164,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/dashboard/components/DevNavigation.tsx",
                            lineNumber: 116,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/dashboard/components/DevNavigation.tsx",
                    lineNumber: 100,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        marginLeft: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$components$2f$IntentThemeSwitcher$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                            fileName: "[project]/dashboard/components/DevNavigation.tsx",
                            lineNumber: 181,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                minWidth: '200px',
                                maxWidth: '250px'
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$components$2f$ThemeSelector$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                value: globalTheme,
                                onChange: updateGlobalTheme,
                                mode: "dropdown",
                                label: "🎨",
                                showQuickDropdown: true
                            }, void 0, false, {
                                fileName: "[project]/dashboard/components/DevNavigation.tsx",
                                lineNumber: 184,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/dashboard/components/DevNavigation.tsx",
                            lineNumber: 183,
                            columnNumber: 11
                        }, this),
                        mounted && !isNarrow && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                fontSize: '12px',
                                color: 'var(--header-text, rgba(255, 255, 255, 0.9))',
                                opacity: 0.8
                            },
                            children: [
                                "Current: ",
                                pathname
                            ]
                        }, void 0, true, {
                            fileName: "[project]/dashboard/components/DevNavigation.tsx",
                            lineNumber: 192,
                            columnNumber: 36
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/dashboard/components/DevNavigation.tsx",
                    lineNumber: 180,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/dashboard/components/DevNavigation.tsx",
            lineNumber: 71,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/dashboard/components/DevNavigation.tsx",
        lineNumber: 70,
        columnNumber: 5
    }, this);
} /**
 * Code Review - Counselor Troi (UX):
 * "The navigation provides excellent spatial awareness - users always know where
 * they are. The dropdown for projects prevents clutter while maintaining access.
 * The visual feedback (active states, hover effects) creates confidence. Well done!"
 * 
 * Code Review - Lieutenant Uhura (Communication):
 * "Clear navigation is clear communication. The breadcrumb-style current path
 * display helps orientation. The dev mode badge prevents confusion about environment.
 * This meets my standards for professional communication architecture."
 */ 
}),
"[project]/dashboard/components/CommandPalette.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CommandPalette
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/navigation.js [app-ssr] (ecmascript)");
'use client';
;
;
;
;
function CommandPalette() {
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [query, setQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        function onKey(e) {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setOpen((v)=>!v);
            }
            if (e.key === 'Escape') setOpen(false);
        }
        window.addEventListener('keydown', onKey);
        return ()=>window.removeEventListener('keydown', onKey);
    }, []);
    const commands = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>[
            {
                label: 'Home',
                href: '/'
            },
            {
                label: 'Dashboard',
                href: '/dashboard',
                keywords: 'main editor'
            },
            {
                label: 'Gallery',
                href: '/gallery',
                keywords: 'projects cards'
            },
            {
                label: 'Quiz',
                href: '/quiz',
                keywords: 'recommendation'
            },
            {
                label: 'Wizard',
                href: '/wizard',
                keywords: 'setup'
            },
            {
                label: 'Projects',
                href: '/projects',
                keywords: 'index'
            },
            {
                label: 'Observation Lounge',
                href: '/reports/observation-lounge',
                keywords: 'briefing findings'
            },
            {
                label: 'Project Alpha',
                href: '/projects/alpha'
            },
            {
                label: 'Project Beta',
                href: '/projects/beta'
            },
            {
                label: 'Project Gamma',
                href: '/projects/gamma'
            }
        ], []);
    const filtered = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const q = query.trim().toLowerCase();
        if (!q) return commands;
        return commands.filter((c)=>c.label.toLowerCase().includes(q) || (c.keywords || '').toLowerCase().includes(q));
    }, [
        commands,
        query
    ]);
    if (!open) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: 120
        },
        onClick: ()=>setOpen(false),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            onClick: (e)=>e.stopPropagation(),
            style: {
                width: 'min(720px, 92vw)',
                background: 'rgba(10,0,21,0.98)',
                border: '1px solid var(--accent, rgba(0,255,170,0.35))',
                borderRadius: 12,
                boxShadow: '0 10px 40px rgba(0,0,0,0.6)'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        padding: 12,
                        borderBottom: '1px solid var(--accent, rgba(0,255,170,0.2))'
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        autoFocus: true,
                        value: query,
                        onChange: (e)=>setQuery(e.target.value),
                        placeholder: "Type to search... (Esc to close)",
                        style: {
                            width: '100%',
                            padding: '10px 12px',
                            background: 'rgba(0,0,0,0.35)',
                            color: '#d0d0d0',
                            border: '1px solid var(--accent, rgba(0,255,170,0.35))',
                            borderRadius: 8
                        }
                    }, void 0, false, {
                        fileName: "[project]/dashboard/components/CommandPalette.tsx",
                        lineNumber: 77,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/dashboard/components/CommandPalette.tsx",
                    lineNumber: 76,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        maxHeight: 360,
                        overflow: 'auto',
                        padding: 8
                    },
                    children: [
                        filtered.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: c.href,
                                onClick: ()=>setOpen(false),
                                style: {
                                    display: 'block',
                                    padding: '10px 12px',
                                    color: pathname === c.href ? '#0a0015' : '#d0d0d0',
                                    background: pathname === c.href ? 'var(--accent, #00ffaa)' : 'transparent',
                                    borderRadius: 8,
                                    textDecoration: 'none',
                                    marginBottom: 6
                                },
                                children: c.label
                            }, c.href, false, {
                                fileName: "[project]/dashboard/components/CommandPalette.tsx",
                                lineNumber: 94,
                                columnNumber: 13
                            }, this)),
                        filtered.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                padding: 12,
                                opacity: 0.7
                            },
                            children: "No matches."
                        }, void 0, false, {
                            fileName: "[project]/dashboard/components/CommandPalette.tsx",
                            lineNumber: 112,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/dashboard/components/CommandPalette.tsx",
                    lineNumber: 92,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        padding: 10,
                        borderTop: '1px solid var(--accent, rgba(0,255,170,0.2))',
                        fontSize: 12,
                        opacity: 0.75
                    },
                    children: "Tip: Press ⌘K / Ctrl+K to toggle the palette."
                }, void 0, false, {
                    fileName: "[project]/dashboard/components/CommandPalette.tsx",
                    lineNumber: 115,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/dashboard/components/CommandPalette.tsx",
            lineNumber: 66,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/dashboard/components/CommandPalette.tsx",
        lineNumber: 53,
        columnNumber: 5
    }, this);
}
}),
"[project]/dashboard/components/StatusRibbon.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>StatusRibbon
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
function StatusRibbon() {
    const [health, setHealth] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        status: 'green',
        message: 'All systems nominal'
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let mounted = true;
        // Cost optimization: Only poll when tab is visible (reduces EC2 load)
        const isVisible = ()=>!document.hidden;
        async function poll() {
            if (!mounted || !isVisible()) {
                // Skip polling if tab is hidden (cost optimization)
                setTimeout(poll, 30000); // Check again in 30s if hidden
                return;
            }
            try {
                const res = await fetch('/api/health', {
                    signal: AbortSignal.timeout(3000)
                });
                if (res.ok) {
                    const h = await res.json();
                    if (mounted) setHealth(h);
                } else if (res.status === 404) {
                    // 404 is expected for missing endpoints - use debug
                    console.debug('Health API endpoint not available');
                // Keep default health status
                }
            } catch (error) {
                // FIXED: Network errors are expected - use debug, don't spam console
                // Crew: Riker (Tactical) + Quark (Cost Optimization) + O'Brien (Pragmatic)
                const isNetworkError = error.message?.includes('Failed to fetch') || error.name === 'AbortError';
                if (isNetworkError) {
                    console.debug('Health API unavailable (network error)');
                } else {
                    console.debug('Health API error:', error.message);
                }
            // Keep default health status on error
            }
            // Increased interval from 10s to 30s for cost optimization
            setTimeout(poll, 30000);
        }
        poll();
        return ()=>{
            mounted = false;
        };
    }, []);
    // Use theme-aware status colors
    const color = health.status === 'green' ? 'var(--status-success, #00ffaa)' : health.status === 'amber' ? 'var(--status-warning, #ffd166)' : 'var(--status-error, #ff5e5e)';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            position: 'fixed',
            left: 0,
            right: 0,
            top: 56,
            zIndex: 9998,
            borderBottom: `1px solid ${color}33`,
            background: 'var(--header-bg, rgba(15, 15, 20, 0.95))',
            backdropFilter: 'blur(6px)',
            color: 'var(--header-text, rgba(255, 255, 255, 0.9))',
            fontSize: 12
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                maxWidth: 1600,
                margin: '0 auto',
                padding: '6px 16px',
                display: 'flex',
                gap: 8,
                alignItems: 'center'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    style: {
                        width: 8,
                        height: 8,
                        borderRadius: 999,
                        background: color,
                        display: 'inline-block'
                    }
                }, void 0, false, {
                    fileName: "[project]/dashboard/components/StatusRibbon.tsx",
                    lineNumber: 70,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    children: health.message
                }, void 0, false, {
                    fileName: "[project]/dashboard/components/StatusRibbon.tsx",
                    lineNumber: 71,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/dashboard/components/StatusRibbon.tsx",
            lineNumber: 69,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/dashboard/components/StatusRibbon.tsx",
        lineNumber: 61,
        columnNumber: 5
    }, this);
}
}),
"[project]/dashboard/components/DashboardChrome.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DashboardChrome
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$components$2f$DevNavigation$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/components/DevNavigation.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$components$2f$CommandPalette$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/components/CommandPalette.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$components$2f$StatusRibbon$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/components/StatusRibbon.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/navigation.js [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
function DashboardChrome() {
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])() || '';
    const isEmbed = ("TURBOPACK compile-time value", "undefined") !== 'undefined' && new URLSearchParams(window.location.search).get('embed') === '1';
    const isProjectPreview = pathname.startsWith('/projects');
    const isAuthPage = pathname.startsWith('/auth');
    // Don't show chrome on auth pages or embedded views
    if (isEmbed || isProjectPreview || isAuthPage) {
        return null;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$components$2f$DevNavigation$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/dashboard/components/DashboardChrome.tsx",
                lineNumber: 21,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$components$2f$StatusRibbon$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/dashboard/components/DashboardChrome.tsx",
                lineNumber: 22,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$components$2f$CommandPalette$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/dashboard/components/DashboardChrome.tsx",
                lineNumber: 23,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    height: 'var(--nav-spacer-height, 100px)'
                }
            }, void 0, false, {
                fileName: "[project]/dashboard/components/DashboardChrome.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
}),
"[project]/dashboard/lib/theme-colors.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Theme Colors - Single Source of Truth
 * Extracted from theme-definitions.js for use in Next.js pages
 * 
 * ⚠️ IMPORTANT: These must stay in sync with universal-theme-system/theme-definitions.js
 * Pattern: Import this instead of hardcoding colors in components
 */ __turbopack_context__.s([
    "THEME_ACCENT_COLORS",
    ()=>THEME_ACCENT_COLORS,
    "THEME_BACKGROUNDS",
    ()=>THEME_BACKGROUNDS,
    "THEME_HEADING_COLORS",
    ()=>THEME_HEADING_COLORS,
    "THEME_IS_DARK",
    ()=>THEME_IS_DARK,
    "THEME_TEXT_COLORS",
    ()=>THEME_TEXT_COLORS,
    "getThemeColors",
    ()=>getThemeColors,
    "isThemeDark",
    ()=>isThemeDark
]);
const THEME_BACKGROUNDS = {
    // 2025 NEW TRENDS
    mochaEarth: 'linear-gradient(135deg, #F5EFE7 0%, #E8DED2 100%)',
    verdantNature: 'linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 100%)',
    chromeMetallic: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)',
    brutalist: '#FFFFFF',
    mutedNeon: 'linear-gradient(135deg, #F5F0EA 0%, #E8E1D9 100%)',
    monochromeBlue: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
    // CLASSIC THEMES
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    pastel: 'linear-gradient(135deg, #fff5f7 0%, #f5f8ff 100%)',
    cyberpunk: 'linear-gradient(135deg, #1a0520 0%, #2d1040 100%)',
    glassmorphism: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    midnight: 'linear-gradient(135deg, #0a0a0f 0%, #121218 50%, #1a1a24 100%)',
    offworld: 'linear-gradient(135deg, #020818 0%, #041c35 50%, #062a4d 100%)' // Deep blue space
};
const THEME_TEXT_COLORS = {
    mochaEarth: '#2D2520',
    verdantNature: '#1B3A1F',
    chromeMetallic: '#E8E8E8',
    brutalist: '#000000',
    mutedNeon: '#2A2A2A',
    monochromeBlue: '#0D3B66',
    gradient: '#f8f8f8',
    pastel: '#2d2d2d',
    cyberpunk: '#f0e8ff',
    glassmorphism: '#e8e8e8',
    midnight: '#e8e8e8',
    offworld: '#e0f4ff' // Blue-tinted white
};
const THEME_HEADING_COLORS = {
    mochaEarth: '#1A1614',
    verdantNature: '#0D1F11',
    chromeMetallic: '#FFFFFF',
    brutalist: '#000000',
    mutedNeon: '#1A1A1A',
    monochromeBlue: '#0A1929',
    gradient: '#ffffff',
    pastel: '#1a1a1a',
    cyberpunk: '#ff0099',
    glassmorphism: '#ffffff',
    midnight: '#ffffff',
    offworld: '#00d9ff' // Bright cyan
};
const THEME_ACCENT_COLORS = {
    mochaEarth: '#556c52',
    verdantNature: '#2E7D32',
    chromeMetallic: '#00D4FF',
    brutalist: '#000000',
    mutedNeon: '#00b2a8',
    monochromeBlue: '#1565C0',
    gradient: '#f7c9fc',
    pastel: '#a27294',
    cyberpunk: '#ff0099',
    glassmorphism: '#a78bfa',
    midnight: '#00ffff',
    offworld: '#00d9ff' // Bright cyan
};
const THEME_IS_DARK = {
    mochaEarth: false,
    verdantNature: false,
    chromeMetallic: true,
    brutalist: false,
    mutedNeon: false,
    monochromeBlue: false,
    gradient: true,
    pastel: false,
    cyberpunk: true,
    glassmorphism: true,
    midnight: true,
    offworld: true
};
function getThemeColors(themeId) {
    return {
        background: THEME_BACKGROUNDS[themeId] || THEME_BACKGROUNDS.mochaEarth,
        text: THEME_TEXT_COLORS[themeId] || THEME_TEXT_COLORS.mochaEarth,
        heading: THEME_HEADING_COLORS[themeId] || THEME_HEADING_COLORS.mochaEarth,
        accent: THEME_ACCENT_COLORS[themeId] || THEME_ACCENT_COLORS.mochaEarth
    };
}
function isThemeDark(themeId) {
    return THEME_IS_DARK[themeId] || false;
} /**
 * 🖖 Crew Note:
 * These colors are extracted from theme-definitions.js.
 * Any changes to themes should update BOTH files.
 * Future: Consider generating this file from theme-definitions.js
 */ 
}),
"[project]/dashboard/lib/contrast-utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Contrast Utilities
 * 
 * Calculates WCAG contrast ratios and provides contrast-aware color utilities
 * Used to ensure buttons and text are always readable
 */ /**
 * Calculate relative luminance of a color
 */ __turbopack_context__.s([
    "calculateCardBackground",
    ()=>calculateCardBackground,
    "extractColor",
    ()=>extractColor,
    "getButtonTextColor",
    ()=>getButtonTextColor,
    "getCardMutedTextColor",
    ()=>getCardMutedTextColor,
    "getCardTextColor",
    ()=>getCardTextColor,
    "getContrastRatio",
    ()=>getContrastRatio,
    "getDataPointColor",
    ()=>getDataPointColor,
    "getLuminance",
    ()=>getLuminance,
    "getOptimalTextColor",
    ()=>getOptimalTextColor,
    "meetsWCAGAA",
    ()=>meetsWCAGAA
]);
function getLuminance(hex) {
    const rgb = hexToRgb(hex);
    const [r, g, b] = [
        rgb.r,
        rgb.g,
        rgb.b
    ].map((val)=>{
        val = val / 255;
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
/**
 * Convert hex to RGB
 */ function hexToRgb(hex) {
    // Remove # if present
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return {
        r,
        g,
        b
    };
}
function getContrastRatio(color1, color2) {
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
}
function extractColor(colorString) {
    if (!colorString || typeof colorString !== 'string' || colorString.trim() === '') {
        return null;
    }
    // If it's a hex color
    if (colorString.startsWith('#')) {
        return colorString;
    }
    // If it's a gradient, extract the darkest/lightest color for contrast calculation
    if (colorString.includes('gradient')) {
        const matches = colorString.match(/#([0-9A-Fa-f]{6})/g);
        if (matches && matches.length > 0) {
            // For contrast calculation, use the color that's most representative
            // For dark themes, use the darkest color; for light themes, use the lightest
            // Default to first color
            return matches[0];
        }
    }
    // If it's rgba/rgb, convert to hex approximation
    // For rgba with opacity, we blend with white (for light) or black (for dark)
    const rgbMatch = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (rgbMatch) {
        let r = parseInt(rgbMatch[1]);
        let g = parseInt(rgbMatch[2]);
        let b = parseInt(rgbMatch[3]);
        const alpha = rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1.0;
        // If there's alpha, blend with white background (assuming cards are on white/light background)
        // For semi-transparent overlays, we approximate by blending with white
        if (alpha < 1.0) {
            // Blend: result = color * alpha + white * (1 - alpha)
            r = Math.round(r * alpha + 255 * (1 - alpha));
            g = Math.round(g * alpha + 255 * (1 - alpha));
            b = Math.round(b * alpha + 255 * (1 - alpha));
        }
        return `#${[
            r,
            g,
            b
        ].map((x)=>{
            const hex = Math.round(x).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('')}`;
    }
    return null;
}
function getOptimalTextColor(backgroundColor) {
    const bgColor = extractColor(backgroundColor);
    if (!bgColor) return '#000000'; // Default to black if we can't parse
    const bgLum = getLuminance(bgColor);
    // If background is light (luminance > 0.5), use dark text
    // If background is dark (luminance <= 0.5), use light text
    return bgLum > 0.5 ? '#000000' : '#FFFFFF';
}
function getButtonTextColor(buttonBackground, minContrast = 3.0) {
    const bgColor = extractColor(buttonBackground);
    if (!bgColor) return '#000000';
    // Try white text first
    const whiteContrast = getContrastRatio('#FFFFFF', bgColor);
    if (whiteContrast >= minContrast) {
        return '#FFFFFF';
    }
    // Try black text
    const blackContrast = getContrastRatio('#000000', bgColor);
    if (blackContrast >= minContrast) {
        return '#000000';
    }
    // If neither works, return the one with better contrast
    return whiteContrast > blackContrast ? '#FFFFFF' : '#000000';
}
function meetsWCAGAA(textColor, backgroundColor, isLargeText = false) {
    const text = extractColor(textColor);
    const bg = extractColor(backgroundColor);
    if (!text || !bg) return false;
    const contrast = getContrastRatio(text, bg);
    const required = isLargeText ? 3.0 : 4.5; // WCAG AA
    return contrast >= required;
}
function calculateCardBackground(themeBackground, isDark, themeAccent) {
    const bgColor = extractColor(themeBackground);
    if (!bgColor) {
        return isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)';
    }
    const bgLum = getLuminance(bgColor);
    const bgRgb = hexToRgb(bgColor);
    if (isDark) {
        // Dark theme: blend theme background with subtle lightening
        // Preserve theme color identity while adding contrast
        const lightenFactor = bgLum < 0.1 ? 0.12 : bgLum < 0.2 ? 0.08 : 0.05;
        const r = Math.min(255, bgRgb.r + lightenFactor * 255);
        const g = Math.min(255, bgRgb.g + lightenFactor * 255);
        const b = Math.min(255, bgRgb.b + lightenFactor * 255);
        return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, 0.95)`;
    } else {
        // Light theme: use theme background with slight darkening or white overlay
        // For very light backgrounds, use white; for colored backgrounds, preserve color
        if (bgLum > 0.9) {
            // Very light background (like brutalist white) - use white card
            return 'rgba(255, 255, 255, 0.95)';
        } else {
            // Colored light background - preserve theme color with slight darkening
            const darkenFactor = 0.1;
            const r = Math.max(0, bgRgb.r - darkenFactor * 255);
            const g = Math.max(0, bgRgb.g - darkenFactor * 255);
            const b = Math.max(0, bgRgb.b - darkenFactor * 255);
            return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, 0.95)`;
        }
    }
}
function getCardTextColor(cardBackground, minContrast = 4.5) {
    const cardBg = extractColor(cardBackground);
    if (!cardBg) return '#000000';
    // Try white text first
    const whiteContrast = getContrastRatio('#FFFFFF', cardBg);
    if (whiteContrast >= minContrast) {
        return '#FFFFFF';
    }
    // Try black text
    const blackContrast = getContrastRatio('#000000', cardBg);
    if (blackContrast >= minContrast) {
        return '#000000';
    }
    // If neither works, return the one with better contrast
    return whiteContrast > blackContrast ? '#FFFFFF' : '#000000';
}
function getDataPointColor(cardBackground, accentColor, minContrast = 4.5) {
    const cardBg = extractColor(cardBackground);
    const accent = extractColor(accentColor);
    if (!cardBg) return accent || '#000000';
    if (!accent) return getCardTextColor(cardBackground, minContrast);
    // Check if accent color has sufficient contrast
    const accentContrast = getContrastRatio(accent, cardBg);
    if (accentContrast >= minContrast) {
        return accent;
    }
    // If accent doesn't have enough contrast, use a brighter/darker version
    const cardLum = getLuminance(cardBg);
    const accentLum = getContrastRatio('#FFFFFF', cardBg) < getContrastRatio('#000000', cardBg) ? 0.8 // Dark card, use bright accent
     : 0.2; // Light card, use dark accent
    // Adjust accent to meet contrast
    return getCardTextColor(cardBackground, minContrast);
}
function getCardMutedTextColor(cardBackground) {
    const cardBg = extractColor(cardBackground);
    if (!cardBg) return 'rgba(0, 0, 0, 0.6)';
    const cardLum = getLuminance(cardBg);
    const isDark = cardLum < 0.5;
    // For large text (muted), WCAG AA requires 3.0:1
    // Use 60% opacity for muted text
    return isDark ? 'rgba(255, 255, 255, 0.65)' // Slightly brighter than bodyTextMuted for cards
     : 'rgba(0, 0, 0, 0.65)';
}
}),
"[project]/dashboard/lib/theme-component-colors.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Theme Component Colors - Rich Color Theory System
 * 
 * Extends base theme colors with component-specific palettes that:
 * - Compel user action through strategic color hierarchy
 * - Maintain accessibility (WCAG AA/AAA)
 * - Embody theme concepts through RAG understanding
 * - Integrate crew persona insights
 * - Handle CTA prominence and text sizing
 * 
 * Generated from Observation Lounge crew analysis
 */ __turbopack_context__.s([
    "getComponentColors",
    ()=>getComponentColors
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$contrast$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/lib/contrast-utils.ts [app-ssr] (ecmascript)");
;
/**
 * Generate component color palette for a theme
 * Uses color theory, contrast analysis, and crew insights
 */ function generateComponentPalette(themeId, baseColors, themeDefinition) {
    const accentColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$contrast$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["extractColor"])(baseColors.accent) || '#000000';
    const bgColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$contrast$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["extractColor"])(baseColors.background) || '#FFFFFF';
    const isDark = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$contrast$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getContrastRatio"])('#FFFFFF', bgColor) < (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$contrast$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getContrastRatio"])('#000000', bgColor);
    // CTA Primary - Most prominent, action-compelling
    const ctaPrimary = themeDefinition.colorPalette.ctaPrimary || accentColor;
    const ctaPrimaryText = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$contrast$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getButtonTextColor"])(ctaPrimary, 4.5);
    // CTA Secondary - Supporting actions
    const ctaSecondary = themeDefinition.colorPalette.ctaSecondary || adjustColorBrightness(ctaPrimary, isDark ? 0.2 : -0.2);
    const ctaSecondaryText = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$contrast$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getButtonTextColor"])(ctaSecondary, 4.5);
    // CTA Tertiary - Subtle actions
    const ctaTertiary = themeDefinition.colorPalette.tertiary || adjustColorBrightness(ctaPrimary, isDark ? 0.4 : -0.4);
    const ctaTertiaryText = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$contrast$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getButtonTextColor"])(ctaTertiary, 4.5);
    // Card colors - Calculated to ensure contrast while preserving theme identity
    const cardBackground = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$contrast$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateCardBackground"])(baseColors.background, isDark, accentColor);
    // Elevated cards - slightly more contrast but still theme-aware
    // Parse rgba string directly from cardBackground
    let cardElevated;
    const rgbaMatch = cardBackground.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    if (rgbaMatch) {
        const r = parseInt(rgbaMatch[1]);
        const g = parseInt(rgbaMatch[2]);
        const b = parseInt(rgbaMatch[3]);
        if (isDark) {
            // Dark theme: lighten a bit more for elevated cards
            const elevatedR = Math.min(255, r + 15);
            const elevatedG = Math.min(255, g + 15);
            const elevatedB = Math.min(255, b + 15);
            cardElevated = `rgba(${elevatedR}, ${elevatedG}, ${elevatedB}, 0.95)`;
        } else {
            // Light theme: darken slightly for elevated cards
            const elevatedR = Math.max(0, r - 10);
            const elevatedG = Math.max(0, g - 10);
            const elevatedB = Math.max(0, b - 10);
            cardElevated = `rgba(${elevatedR}, ${elevatedG}, ${elevatedB}, 0.98)`;
        }
    } else {
        // Fallback to original approach
        cardElevated = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.98)';
    }
    // Card border - theme-aware, using base theme colors
    const cardBorder = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)';
    // Text colors for cards - Calculated to ensure WCAG AA contrast
    const cardText = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$contrast$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getCardTextColor"])(cardBackground, 4.5);
    const cardHeading = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$contrast$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getCardTextColor"])(cardBackground, 4.5); // Same as cardText but can be adjusted
    const cardMutedText = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$contrast$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getCardMutedTextColor"])(cardBackground);
    // Data point numbers - Ensure contrast on card backgrounds
    const dataPointNumber = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$contrast$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDataPointColor"])(cardBackground, accentColor, 4.5);
    // Heading hierarchy - Visual weight and importance (for non-card contexts)
    const headingPrimary = baseColors.heading;
    const headingSecondary = adjustColorBrightness(headingPrimary, isDark ? 0.15 : -0.15);
    const headingTertiary = adjustColorBrightness(headingPrimary, isDark ? 0.3 : -0.3);
    // Body text (for non-card contexts)
    const bodyText = baseColors.text;
    const bodyTextMuted = isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)';
    // Interactive elements
    const linkColor = accentColor;
    const linkHover = adjustColorBrightness(linkColor, isDark ? 0.2 : -0.2);
    const focusRing = `${accentColor}80`; // 50% opacity
    // Status colors (theme-aware, maintaining emotional tone)
    const statusColors = generateStatusColors(themeDefinition, isDark);
    return {
        ctaPrimary,
        ctaPrimaryText,
        ctaSecondary,
        ctaSecondaryText,
        ctaTertiary,
        ctaTertiaryText,
        cardBackground,
        cardBorder,
        cardElevated,
        cardText,
        cardHeading,
        cardMutedText,
        dataPointNumber,
        headingPrimary,
        headingSecondary,
        headingTertiary,
        bodyText,
        bodyTextMuted,
        linkColor,
        linkHover,
        focusRing,
        ...statusColors
    };
}
/**
 * Adjust color brightness
 */ function adjustColorBrightness(hex, factor) {
    const rgb = hexToRgb(hex);
    const r = Math.max(0, Math.min(255, rgb.r + factor * 255));
    const g = Math.max(0, Math.min(255, rgb.g + factor * 255));
    const b = Math.max(0, Math.min(255, rgb.b + factor * 255));
    return `#${[
        r,
        g,
        b
    ].map((x)=>{
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('')}`;
}
function hexToRgb(hex) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return {
        r,
        g,
        b
    };
}
/**
 * Generate theme-aware status colors
 * Maintains emotional tone while being functional
 */ function generateStatusColors(themeDefinition, isDark) {
    const baseAccent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$contrast$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["extractColor"])(themeDefinition.colorPalette.accent) || '#000000';
    // Success - Green-tinted, positive
    const success = isDark ? '#4ade80' : '#22c55e';
    // Warning - Yellow/orange, attention
    const warning = isDark ? '#fbbf24' : '#f59e0b';
    // Error - Red, urgent
    const error = isDark ? '#f87171' : '#ef4444';
    // Info - Theme accent color
    const info = baseAccent;
    return {
        success,
        warning,
        error,
        info
    };
}
// Theme definitions with component palettes
const THEME_COMPONENT_DEFINITIONS = {
    mochaEarth: {
        colorPalette: {
            ctaPrimary: '#556c52',
            ctaSecondary: '#8B6F47',
            tertiary: '#D4A574'
        },
        emotionalTone: 'calm, trustworthy, organic, grounded',
        actionOrientation: 'gentle persuasion, trust-building',
        crewPersona: 'Troi'
    },
    verdantNature: {
        colorPalette: {
            ctaPrimary: '#2E7D32',
            ctaSecondary: '#4CAF50',
            tertiary: '#81C784'
        },
        emotionalTone: 'fresh, energetic, growth-oriented',
        actionOrientation: 'growth, renewal, positive action',
        crewPersona: 'La Forge'
    },
    chromeMetallic: {
        colorPalette: {
            ctaPrimary: '#00D4FF',
            ctaSecondary: '#00A8CC',
            tertiary: '#007A99'
        },
        emotionalTone: 'futuristic, precise, innovative',
        actionOrientation: 'precise action, technological advancement',
        crewPersona: 'Data'
    },
    brutalist: {
        colorPalette: {
            ctaPrimary: '#000000',
            ctaSecondary: '#FFFFFF',
            tertiary: '#CCCCCC'
        },
        emotionalTone: 'bold, direct, unapologetic',
        actionOrientation: 'direct action, clear statements',
        crewPersona: 'Worf'
    },
    mutedNeon: {
        colorPalette: {
            ctaPrimary: '#00b2a8',
            ctaSecondary: '#00E5D4',
            tertiary: '#B2DFDB'
        },
        emotionalTone: 'modern, sophisticated, contemporary',
        actionOrientation: 'modern action, contemporary flow',
        crewPersona: 'Riker'
    },
    monochromeBlue: {
        colorPalette: {
            ctaPrimary: '#1565C0',
            ctaSecondary: '#42A5F5',
            tertiary: '#90CAF9'
        },
        emotionalTone: 'calm, professional, trustworthy',
        actionOrientation: 'trust-building, professional engagement',
        crewPersona: 'Picard'
    },
    gradient: {
        colorPalette: {
            ctaPrimary: '#f7c9fc',
            ctaSecondary: '#f093fb',
            tertiary: '#764ba2'
        },
        emotionalTone: 'dynamic, creative, flowing',
        actionOrientation: 'creative action, dynamic flow',
        crewPersona: 'Troi'
    },
    pastel: {
        colorPalette: {
            ctaPrimary: '#a27294',
            ctaSecondary: '#e8a4d4',
            tertiary: '#f5c2e8'
        },
        emotionalTone: 'soft, gentle, approachable',
        actionOrientation: 'gentle persuasion, welcoming action',
        crewPersona: 'Troi'
    },
    cyberpunk: {
        colorPalette: {
            ctaPrimary: '#ff0099',
            ctaSecondary: '#ff00cc',
            tertiary: '#cc0066'
        },
        emotionalTone: 'edgy, high-energy, rebellious',
        actionOrientation: 'bold action, intense engagement',
        crewPersona: 'Worf'
    },
    glassmorphism: {
        colorPalette: {
            ctaPrimary: '#a78bfa',
            ctaSecondary: '#c4b5fd',
            tertiary: '#ddd6fe'
        },
        emotionalTone: 'elegant, sophisticated, refined',
        actionOrientation: 'elegant action, sophisticated engagement',
        crewPersona: 'Picard'
    },
    midnight: {
        colorPalette: {
            ctaPrimary: '#00ffff',
            ctaSecondary: '#00cccc',
            tertiary: '#009999'
        },
        emotionalTone: 'deep, mysterious, calm',
        actionOrientation: 'thoughtful action, calm engagement',
        crewPersona: 'Picard'
    },
    offworld: {
        colorPalette: {
            ctaPrimary: '#00d9ff',
            ctaSecondary: '#00b8d4',
            tertiary: '#0097a7'
        },
        emotionalTone: 'exploratory, infinite, cosmic',
        actionOrientation: 'exploration, discovery, infinite possibilities',
        crewPersona: 'Data'
    }
};
function getComponentColors(themeId, baseColors) {
    const themeDef = THEME_COMPONENT_DEFINITIONS[themeId] || THEME_COMPONENT_DEFINITIONS.mochaEarth;
    return generateComponentPalette(themeId, baseColors, themeDef);
}
}),
"[project]/dashboard/components/GlobalThemeStyles.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>GlobalThemeStyles
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * Global Theme Styles - Dashboard Theme Only
 * 
 * TWO-LAYER THEME SYSTEM:
 * 1. Dashboard theme (globalTheme) - controls dashboard UI
 * 2. Project themes (project.theme) - controls project pages (in iframes)
 * 
 * This component ONLY affects the dashboard, NOT project iframes!
 * 
 * Crew Decision: 7/7 unanimous - maintain theme isolation
 * 
 * FIXED: Theme persistence - now properly updates when globalTheme changes
 * FIXED: Contrast-aware button text colors - ensures WCAG AA compliance
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$state$2d$manager$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/lib/state-manager.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$theme$2d$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/lib/theme-colors.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$contrast$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/lib/contrast-utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$theme$2d$component$2d$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/lib/theme-component-colors.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
/**
 * Generate theme-aware header background
 * Creates a dark background with subtle theme accent color influence
 * Always ensures sufficient contrast for legibility
 */ function generateHeaderBackground(accentColor, isDark) {
    // Base dark background (always dark for contrast)
    const baseDark = isDark ? 'rgba(10, 10, 15, 0.95)' : 'rgba(15, 15, 20, 0.95)';
    if (!accentColor) {
        return baseDark;
    }
    // Extract RGB from accent color (with safety checks)
    // FIXED: Added null/undefined checks to prevent charAt errors
    // Crew: Data (Analysis) & O'Brien (Pragmatic Fix)
    if (!accentColor || accentColor.length < 6) {
        return baseDark;
    }
    const hex = accentColor.replace('#', '');
    if (hex.length < 6) {
        return baseDark;
    }
    const r = parseInt(hex.substring(0, 2), 16) || 15;
    const g = parseInt(hex.substring(2, 4), 16) || 15;
    const b = parseInt(hex.substring(4, 6), 16) || 20;
    // Blend accent color subtly into dark background (10% influence)
    // This creates a theme-aware tint while maintaining darkness
    const blendedR = Math.round(r * 0.1 + 15 * 0.9);
    const blendedG = Math.round(g * 0.1 + 15 * 0.9);
    const blendedB = Math.round(b * 0.1 + 20 * 0.9);
    // Ensure it stays dark (max brightness check)
    const brightness = (blendedR * 299 + blendedG * 587 + blendedB * 114) / 1000;
    const finalR = brightness > 30 ? Math.round(blendedR * 0.7) : blendedR;
    const finalG = brightness > 30 ? Math.round(blendedG * 0.7) : blendedG;
    const finalB = brightness > 30 ? Math.round(blendedB * 0.7) : blendedB;
    return `rgba(${finalR}, ${finalG}, ${finalB}, 0.95)`;
}
function GlobalThemeStyles() {
    const { globalTheme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$state$2d$manager$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppState"])();
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Ensure we're mounted before applying theme (prevents hydration mismatch)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setMounted(true);
    }, []);
    // Don't render styles until mounted (prevents server/client mismatch)
    if (!mounted) {
        return null;
    }
    // FIXED: Add theme validation before applying styles
    // Crew: Data (Analysis) & O'Brien (Pragmatic Fix)
    const validatedTheme = globalTheme && typeof globalTheme === 'string' ? globalTheme : 'midnight';
    if (validatedTheme !== globalTheme) {
        console.warn('⚠️  Invalid globalTheme, using default: midnight');
    }
    // Get theme colors (use validated theme)
    const colors = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$theme$2d$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getThemeColors"])(validatedTheme);
    const isDark = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$theme$2d$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isThemeDark"])(validatedTheme);
    // Get comprehensive component color palette (from crew analysis)
    const componentColors = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$theme$2d$component$2d$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getComponentColors"])(globalTheme, colors);
    // Generate theme-aware header background (dark with subtle theme influence)
    // Always dark enough for contrast, but subtly influenced by theme accent
    const accentColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$contrast$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["extractColor"])(colors.accent);
    const headerBg = generateHeaderBackground(accentColor, isDark);
    const headerText = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$contrast$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getButtonTextColor"])(headerBg, 4.5); // WCAG AA minimum
    // CSS variables - set on both :root (global) and .dashboard-theme-wrapper (scoped)
    // This ensures components outside the wrapper (like CommandPalette) can access theme colors
    const cssVars = `
    :root {
      /* Theme-aware global variables (for components outside wrapper) */
      --accent: ${colors.accent};
      --button-text: ${componentColors.ctaPrimaryText};
      --status-success: ${componentColors.success};
      --status-warning: ${componentColors.warning};
      --status-error: ${componentColors.error};
      --status-info: ${componentColors.info};
    }
    
    .dashboard-theme-wrapper {
      /* Base Colors */
      --background: ${colors.background};
      --text: ${colors.text};
      --heading: ${colors.heading};
      --accent: ${colors.accent};
      --button-text: ${componentColors.ctaPrimaryText};
      
      /* CTA Hierarchy (Quark's recommendation: action-compelling hierarchy) */
      --cta-primary: ${componentColors.ctaPrimary};
      --cta-primary-text: ${componentColors.ctaPrimaryText};
      --cta-secondary: ${componentColors.ctaSecondary};
      --cta-secondary-text: ${componentColors.ctaSecondaryText};
      --cta-tertiary: ${componentColors.ctaTertiary};
      --cta-tertiary-text: ${componentColors.ctaTertiaryText};
      
      /* Card Colors (La Forge's implementation - contrast-aware) */
      --card-bg: ${componentColors.cardBackground};
      --card-border: ${componentColors.cardBorder};
      --card-elevated: ${componentColors.cardElevated};
      --card: ${componentColors.cardBackground};
      --card-alt: ${componentColors.cardElevated};
      
      /* Card Text Colors (WCAG AA compliant) */
      --card-text: ${componentColors.cardText};
      --card-heading: ${componentColors.cardHeading};
      --card-text-muted: ${componentColors.cardMutedText};
      --data-point-number: ${componentColors.dataPointNumber};
      
      /* Typography Hierarchy (Data's precision + Troi's UX) */
      --heading-primary: ${componentColors.headingPrimary};
      --heading-secondary: ${componentColors.headingSecondary};
      --heading-tertiary: ${componentColors.headingTertiary};
      --body-text: ${componentColors.bodyText};
      --text-muted: ${componentColors.bodyTextMuted};
      
      /* Interactive Elements */
      --link-color: ${componentColors.linkColor};
      --link-hover: ${componentColors.linkHover};
      --focus-ring: ${componentColors.focusRing};
      
      /* Status Colors (Theme-aware) */
      --status-success: ${componentColors.success};
      --status-warning: ${componentColors.warning};
      --status-error: ${componentColors.error};
      --status-info: ${componentColors.info};
      
      /* Header Colors (Theme-aware dark background with subtle accent influence) */
      --header-bg: ${headerBg};
      --header-text: ${headerText};
      --header-border: ${isDark ? `rgba(255, 255, 255, 0.1)` : `rgba(0, 0, 0, 0.2)`};
      
      /* Legacy Support */
      --surface: ${isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.9)'};
      --border: 1px solid ${componentColors.cardBorder};
      --subtle: ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.05)'};
      --shadow: ${isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.1)'};
      --radius: 12px;
      --blur: 10px;
      
      background: ${colors.background};
      color: ${colors.text};
      min-height: 100vh;
    }
    
    /* CTA Hierarchy Styles (Quark's action-compelling design) */
    .dashboard-theme-wrapper .cta-primary {
      background: var(--cta-primary);
      color: var(--cta-primary-text);
      font-weight: 600;
      padding: clamp(12px, 2vw, 16px) clamp(24px, 4vw, 32px);
      font-size: clamp(14px, 1.5vw, 18px);
      min-height: clamp(44px, 6vw, 56px);
      border-radius: var(--radius);
      transition: all 0.2s ease;
      word-wrap: break-word;
      overflow-wrap: break-word;
      max-width: 100%;
      box-shadow: 0 4px 12px ${componentColors.ctaPrimary}66;
    }
    
    .dashboard-theme-wrapper .cta-secondary {
      background: var(--cta-secondary);
      color: var(--cta-secondary-text);
      font-weight: 500;
      padding: clamp(10px, 1.5vw, 12px) clamp(20px, 3vw, 24px);
      font-size: clamp(13px, 1.3vw, 16px);
      min-height: clamp(40px, 5vw, 48px);
      border-radius: var(--radius);
      transition: all 0.2s ease;
      word-wrap: break-word;
      overflow-wrap: break-word;
      max-width: 100%;
    }
    
    .dashboard-theme-wrapper .cta-tertiary {
      background: var(--cta-tertiary);
      color: var(--cta-tertiary-text);
      font-weight: 400;
      padding: clamp(8px, 1vw, 10px) clamp(16px, 2vw, 20px);
      font-size: clamp(12px, 1.2vw, 14px);
      min-height: clamp(36px, 4vw, 40px);
      border-radius: var(--radius);
      transition: all 0.2s ease;
      word-wrap: break-word;
      overflow-wrap: break-word;
      max-width: 100%;
    }
    
    /* Typography with Responsive Sizing (Data's precision + Troi's UX) */
    .dashboard-theme-wrapper h1 {
      color: var(--heading-primary);
      font-size: clamp(24px, 4vw, 32px);
      line-height: 1.2;
      font-weight: 700;
      word-wrap: break-word;
      overflow-wrap: break-word;
      max-width: 100%;
    }
    
    .dashboard-theme-wrapper h2 {
      color: var(--heading-primary);
      font-size: clamp(20px, 3.5vw, 28px);
      line-height: 1.3;
      font-weight: 600;
      word-wrap: break-word;
      overflow-wrap: break-word;
      max-width: 100%;
    }
    
    .dashboard-theme-wrapper h3 {
      color: var(--heading-secondary);
      font-size: clamp(18px, 3vw, 24px);
      line-height: 1.4;
      font-weight: 600;
      word-wrap: break-word;
      overflow-wrap: break-word;
      max-width: 100%;
    }
    
    .dashboard-theme-wrapper h4 {
      color: var(--heading-secondary);
      font-size: clamp(16px, 2.5vw, 20px);
      line-height: 1.4;
      font-weight: 600;
      word-wrap: break-word;
      overflow-wrap: break-word;
      max-width: 100%;
    }
    
    .dashboard-theme-wrapper h5, .dashboard-theme-wrapper h6 {
      color: var(--heading-tertiary);
      font-size: clamp(14px, 2vw, 18px);
      line-height: 1.5;
      font-weight: 500;
      word-wrap: break-word;
      overflow-wrap: break-word;
      max-width: 100%;
    }
    
    .dashboard-theme-wrapper p, .dashboard-theme-wrapper span, .dashboard-theme-wrapper div {
      color: var(--body-text);
      word-wrap: break-word;
      overflow-wrap: break-word;
      max-width: 100%;
    }
    
    /* Card Components with Responsive Sizing */
    .dashboard-theme-wrapper .card {
      background: var(--card-bg);
      border: var(--card-border);
      border-radius: var(--radius);
      padding: clamp(16px, 3vw, 32px);
      word-wrap: break-word;
      overflow-wrap: break-word;
      max-width: 100%;
    }
    
    .dashboard-theme-wrapper .card-elevated {
      background: var(--card-elevated);
      box-shadow: var(--shadow);
    }
    
    /* Links with Theme-Aware Colors */
    .dashboard-theme-wrapper a {
      color: var(--link-color);
      transition: color 0.2s ease;
    }
    
    .dashboard-theme-wrapper a:hover {
      color: var(--link-hover);
    }
    
    .dashboard-theme-wrapper a:focus {
      outline: 2px solid var(--focus-ring);
      outline-offset: 2px;
    }
    
    /* Contrast-aware button styles (legacy support) */
    .dashboard-theme-wrapper button[style*="var(--accent)"],
    .dashboard-theme-wrapper button[style*="background: var(--accent)"],
    .dashboard-theme-wrapper button[style*="background-color: var(--accent)"] {
      color: var(--button-text) !important;
    }
  `;
    // Key the style tag by globalTheme to force re-render when theme changes
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
        suppressHydrationWarning: true,
        dangerouslySetInnerHTML: {
            __html: cssVars
        }
    }, globalTheme, false, {
        fileName: "[project]/dashboard/components/GlobalThemeStyles.tsx",
        lineNumber: 322,
        columnNumber: 10
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__d9675e56._.js.map