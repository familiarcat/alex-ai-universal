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
"[project]/dashboard/app/api/theme/test/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Theme Testing Harness API
 * 
 * Comprehensive theme testing and validation endpoint
 * 
 * Crew: Troi (UX) + Data (Analytics) + La Forge (Implementation)
 */ __turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/module/index.js [app-route] (ecmascript) <locals>");
;
;
const SUPABASE_URL = ("TURBOPACK compile-time value", "https://rpkkkbufdwxmjaerbhbn.supabase.co") || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
// All available themes
const THEMES = [
    'midnight',
    'mochaEarth',
    'oceanBlue',
    'forestGreen',
    'sunsetOrange',
    'lavenderPurple',
    'roseGold',
    'slateGray',
    'cyberpunk',
    'offworld',
    'gradientFusion',
    'monochromeBlue'
];
async function GET(request1) {
    try {
        const searchParams = request1.nextUrl.searchParams;
        const action = searchParams.get('action') || 'test';
        const theme = searchParams.get('theme');
        if (action === 'list') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                themes: THEMES,
                count: THEMES.length
            });
        }
        if (action === 'test' && theme) {
            return await testTheme(theme);
        }
        if (action === 'test-all') {
            return await testAllThemes();
        }
        if (action === 'verify-settings') {
            return await verifySettingsTable();
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Invalid action. Use: list, test, test-all, or verify-settings'
        }, {
            status: 400
        });
    } catch (error) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: error.message
        }, {
            status: 500
        });
    }
}
async function POST(request1) {
    try {
        const body = await request1.json();
        const { action, theme, userId = 'default' } = body;
        if (action === 'set-theme' && theme) {
            return await setTheme(theme, userId);
        }
        if (action === 'test-cycle') {
            return await testThemeCycle();
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Invalid action. Use: set-theme or test-cycle'
        }, {
            status: 400
        });
    } catch (error) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: error.message
        }, {
            status: 500
        });
    }
}
async function testTheme(theme) {
    const results = {
        theme,
        timestamp: new Date().toISOString(),
        tests: {
            themeExists: THEMES.includes(theme),
            canStore: false,
            canRetrieve: false,
            persistence: false,
            errors: []
        }
    };
    if (!results.tests.themeExists) {
        results.tests.errors.push(`Theme '${theme}' is not in the available themes list`);
        return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            results
        });
    }
    // Test storing theme
    try {
        const storeResponse = await fetch(`${request.url.split('/api')[0]}/api/settings/store`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: 'test-user',
                globalTheme: theme,
                preferences: {
                    test: true
                }
            })
        });
        results.tests.canStore = storeResponse.ok;
        if (!storeResponse.ok) {
            const errorData = await storeResponse.json().catch(()=>({}));
            results.tests.errors.push(`Store failed: ${errorData.error || storeResponse.statusText}`);
        }
    } catch (error) {
        results.tests.errors.push(`Store error: ${error.message}`);
    }
    // Test retrieving theme
    try {
        const retrieveResponse = await fetch(`${request.url.split('/api')[0]}/api/settings/retrieve?userId=test-user`, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache'
            },
            cache: 'no-store'
        });
        if (retrieveResponse.ok) {
            const data = await retrieveResponse.json();
            results.tests.canRetrieve = true;
            results.tests.persistence = data.globalTheme === theme;
            if (!results.tests.persistence) {
                results.tests.errors.push(`Persistence failed: expected '${theme}', got '${data.globalTheme}'`);
            }
        } else {
            results.tests.errors.push(`Retrieve failed: ${retrieveResponse.statusText}`);
        }
    } catch (error) {
        results.tests.errors.push(`Retrieve error: ${error.message}`);
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        success: results.tests.canStore && results.tests.canRetrieve && results.tests.persistence,
        results
    });
}
async function testAllThemes() {
    const allResults = [];
    for (const theme of THEMES){
        const testResult = await testTheme(theme);
        const resultData = await testResult.json();
        allResults.push(resultData.results);
    }
    const passed = allResults.filter((r)=>r.tests.canStore && r.tests.canRetrieve && r.tests.persistence).length;
    const failed = allResults.length - passed;
    return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        success: failed === 0,
        summary: {
            total: allResults.length,
            passed,
            failed,
            passRate: `${(passed / allResults.length * 100).toFixed(1)}%`
        },
        results: allResults
    });
}
async function verifySettingsTable() {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Supabase credentials not configured'
        }, {
            status: 500
        });
    }
    try {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(SUPABASE_URL, SUPABASE_SERVICE_KEY);
        // Check if table exists
        const { data, error } = await supabase.from('user_settings').select('user_id, global_theme, created_at').limit(1);
        if (error) {
            if (error.code === '42P01') {
                return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: false,
                    error: 'Table does not exist',
                    hint: 'Run migration: supabase/migrations/002_create_user_settings_table.sql'
                });
            }
            throw error;
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            tableExists: true,
            sampleData: data,
            message: 'Table is accessible and working'
        });
    } catch (error) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: error.message,
            code: error.code
        }, {
            status: 500
        });
    }
}
async function setTheme(theme, userId) {
    const response = await fetch(`${request.url.split('/api')[0]}/api/settings/store`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userId,
            globalTheme: theme,
            preferences: {}
        })
    });
    const data = await response.json();
    return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        success: response.ok && data.success,
        theme,
        userId,
        response: data
    });
}
async function testThemeCycle() {
    const cycleResults = [];
    const testUserId = `test-cycle-${Date.now()}`;
    for (const theme of THEMES.slice(0, 3)){
        // Set theme
        const setResult = await setTheme(theme, testUserId);
        const setData = await setResult.json();
        // Wait a bit
        await new Promise((resolve)=>setTimeout(resolve, 100));
        // Retrieve theme
        const retrieveResponse = await fetch(`${request.url.split('/api')[0]}/api/settings/retrieve?userId=${testUserId}`, {
            method: 'GET',
            cache: 'no-store'
        });
        const retrieveData = await retrieveResponse.json();
        cycleResults.push({
            theme,
            set: setData.success,
            retrieve: retrieveData.success && retrieveData.globalTheme === theme,
            persisted: retrieveData.globalTheme === theme
        });
    }
    const allPassed = cycleResults.every((r)=>r.set && r.retrieve && r.persisted);
    return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        success: allPassed,
        cycleResults,
        summary: {
            total: cycleResults.length,
            passed: cycleResults.filter((r)=>r.set && r.retrieve && r.persisted).length
        }
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0aa4cfa7._.js.map