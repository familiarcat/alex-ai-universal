(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/dashboard/components/workflows/ExecutionMonitor.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ExecutionMonitor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * Execution Monitor Component
 * 
 * Real-time execution monitoring dashboard for MCP workflows
 * Shows execution status, logs, and history
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
function ExecutionMonitor({ workflowId, autoRefresh = true }) {
    _s();
    const [executions, setExecutions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedExecution, setSelectedExecution] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ExecutionMonitor.useEffect": ()=>{
            if (autoRefresh) {
                loadExecutions();
                const interval = setInterval(loadExecutions, 2000); // Refresh every 2 seconds
                return ({
                    "ExecutionMonitor.useEffect": ()=>clearInterval(interval)
                })["ExecutionMonitor.useEffect"];
            }
        }
    }["ExecutionMonitor.useEffect"], [
        workflowId,
        autoRefresh
    ]);
    const loadExecutions = async ()=>{
        try {
            const url = workflowId ? `/api/mcp/workflows/executions?workflowId=${workflowId}` : '/api/mcp/workflows/executions';
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setExecutions(data.executions || []);
            }
        } catch (error) {
            console.error('Error loading executions:', error);
        }
    };
    const getStatusColor = (status)=>{
        switch(status){
            case 'running':
                return 'var(--status-info)'; // blue
            case 'success':
                return 'var(--status-success)'; // green
            case 'error':
                return 'var(--status-error)'; // red
            case 'pending':
                return 'var(--status-warning)'; // yellow
            default:
                return 'var(--text-muted)'; // gray
        }
    };
    const formatDuration = (ms)=>{
        if (!ms) return 'N/A';
        if (ms < 1000) return `${ms}ms`;
        if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
        return `${(ms / 60000).toFixed(2)}m`;
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            background: 'var(--card)',
            borderRadius: 'var(--radius)',
            border: 'var(--border)'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    padding: 'var(--spacing-md)',
                    borderBottom: 'var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        style: {
                            fontSize: 'var(--font-lg)',
                            color: 'var(--accent)',
                            margin: 0
                        },
                        children: "📊 Execution Monitor"
                    }, void 0, false, {
                        fileName: "[project]/dashboard/components/workflows/ExecutionMonitor.tsx",
                        lineNumber: 95,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: loadExecutions,
                        style: {
                            padding: 'var(--spacing-xs) var(--spacing-sm)',
                            borderRadius: 'var(--radius-sm)',
                            border: 'var(--border)',
                            background: 'var(--accent)',
                            color: 'var(--text-on-accent)',
                            cursor: 'pointer',
                            fontSize: 'var(--font-sm)'
                        },
                        children: "Refresh"
                    }, void 0, false, {
                        fileName: "[project]/dashboard/components/workflows/ExecutionMonitor.tsx",
                        lineNumber: 102,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/dashboard/components/workflows/ExecutionMonitor.tsx",
                lineNumber: 88,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    flex: 1,
                    overflowY: 'auto',
                    padding: 'var(--spacing-sm)'
                },
                children: executions.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        textAlign: 'center',
                        padding: 'var(--spacing-lg)',
                        color: 'var(--text-muted)'
                    },
                    children: "No executions yet"
                }, void 0, false, {
                    fileName: "[project]/dashboard/components/workflows/ExecutionMonitor.tsx",
                    lineNumber: 125,
                    columnNumber: 11
                }, this) : executions.map((execution)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        onClick: ()=>setSelectedExecution(execution),
                        style: {
                            padding: 'var(--spacing-sm)',
                            marginBottom: 'var(--spacing-xs)',
                            borderRadius: 'var(--radius-sm)',
                            border: selectedExecution?.id === execution.id ? '2px solid var(--accent)' : 'var(--border)',
                            background: selectedExecution?.id === execution.id ? 'var(--accent-light)' : 'var(--background)',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: 'var(--spacing-xs)'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--spacing-xs)'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    width: '12px',
                                                    height: '12px',
                                                    borderRadius: '50%',
                                                    background: getStatusColor(execution.status)
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/dashboard/components/workflows/ExecutionMonitor.tsx",
                                                lineNumber: 162,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontWeight: 'bold',
                                                    color: 'var(--text)'
                                                },
                                                children: execution.workflowName
                                            }, void 0, false, {
                                                fileName: "[project]/dashboard/components/workflows/ExecutionMonitor.tsx",
                                                lineNumber: 168,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/dashboard/components/workflows/ExecutionMonitor.tsx",
                                        lineNumber: 157,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontSize: 'var(--font-xs)',
                                            color: 'var(--text-muted)'
                                        },
                                        children: formatDuration(execution.duration)
                                    }, void 0, false, {
                                        fileName: "[project]/dashboard/components/workflows/ExecutionMonitor.tsx",
                                        lineNumber: 175,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/dashboard/components/workflows/ExecutionMonitor.tsx",
                                lineNumber: 151,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: 'var(--font-xs)',
                                    color: 'var(--text-muted)'
                                },
                                children: new Date(execution.startTime).toLocaleString()
                            }, void 0, false, {
                                fileName: "[project]/dashboard/components/workflows/ExecutionMonitor.tsx",
                                lineNumber: 182,
                                columnNumber: 15
                            }, this)
                        ]
                    }, execution.id, true, {
                        fileName: "[project]/dashboard/components/workflows/ExecutionMonitor.tsx",
                        lineNumber: 134,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/dashboard/components/workflows/ExecutionMonitor.tsx",
                lineNumber: 119,
                columnNumber: 7
            }, this),
            selectedExecution && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    borderTop: 'var(--border)',
                    padding: 'var(--spacing-md)',
                    maxHeight: '300px',
                    overflowY: 'auto'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 'var(--spacing-sm)'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                style: {
                                    fontSize: 'var(--font-md)',
                                    color: 'var(--text)',
                                    margin: 0
                                },
                                children: "Execution Details"
                            }, void 0, false, {
                                fileName: "[project]/dashboard/components/workflows/ExecutionMonitor.tsx",
                                lineNumber: 207,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setSelectedExecution(null),
                                style: {
                                    background: 'none',
                                    border: 'none',
                                    fontSize: 'var(--font-xl)',
                                    cursor: 'pointer',
                                    color: 'var(--text)'
                                },
                                children: "×"
                            }, void 0, false, {
                                fileName: "[project]/dashboard/components/workflows/ExecutionMonitor.tsx",
                                lineNumber: 214,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/dashboard/components/workflows/ExecutionMonitor.tsx",
                        lineNumber: 201,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginBottom: 'var(--spacing-sm)'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Status:"
                            }, void 0, false, {
                                fileName: "[project]/dashboard/components/workflows/ExecutionMonitor.tsx",
                                lineNumber: 231,
                                columnNumber: 13
                            }, this),
                            ' ',
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    color: getStatusColor(selectedExecution.status)
                                },
                                children: selectedExecution.status.toUpperCase()
                            }, void 0, false, {
                                fileName: "[project]/dashboard/components/workflows/ExecutionMonitor.tsx",
                                lineNumber: 232,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/dashboard/components/workflows/ExecutionMonitor.tsx",
                        lineNumber: 228,
                        columnNumber: 11
                    }, this),
                    selectedExecution.logs && selectedExecution.logs.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginBottom: 'var(--spacing-sm)'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Logs:"
                            }, void 0, false, {
                                fileName: "[project]/dashboard/components/workflows/ExecutionMonitor.tsx",
                                lineNumber: 239,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 'var(--spacing-xs)',
                                    padding: 'var(--spacing-xs)',
                                    background: 'var(--background)',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: 'var(--font-xs)',
                                    fontFamily: 'monospace',
                                    maxHeight: '150px',
                                    overflowY: 'auto'
                                },
                                children: selectedExecution.logs.map((log, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: log
                                    }, index, false, {
                                        fileName: "[project]/dashboard/components/workflows/ExecutionMonitor.tsx",
                                        lineNumber: 251,
                                        columnNumber: 19
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/dashboard/components/workflows/ExecutionMonitor.tsx",
                                lineNumber: 240,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/dashboard/components/workflows/ExecutionMonitor.tsx",
                        lineNumber: 238,
                        columnNumber: 13
                    }, this),
                    selectedExecution.errors && selectedExecution.errors.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                style: {
                                    color: 'var(--status-error)'
                                },
                                children: "Errors:"
                            }, void 0, false, {
                                fileName: "[project]/dashboard/components/workflows/ExecutionMonitor.tsx",
                                lineNumber: 259,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 'var(--spacing-xs)',
                                    padding: 'var(--spacing-xs)',
                                    background: '#fee2e2',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: 'var(--font-xs)',
                                    fontFamily: 'monospace',
                                    color: '#dc2626'
                                },
                                children: selectedExecution.errors.map((error, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: error
                                    }, index, false, {
                                        fileName: "[project]/dashboard/components/workflows/ExecutionMonitor.tsx",
                                        lineNumber: 270,
                                        columnNumber: 19
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/dashboard/components/workflows/ExecutionMonitor.tsx",
                                lineNumber: 260,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/dashboard/components/workflows/ExecutionMonitor.tsx",
                        lineNumber: 258,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/dashboard/components/workflows/ExecutionMonitor.tsx",
                lineNumber: 195,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/dashboard/components/workflows/ExecutionMonitor.tsx",
        lineNumber: 79,
        columnNumber: 5
    }, this);
}
_s(ExecutionMonitor, "8dbODHI3xcaDoKsoX4Tmd8kBxfE=");
_c = ExecutionMonitor;
var _c;
__turbopack_context__.k.register(_c, "ExecutionMonitor");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/dashboard/components/workflows/ExecutionMonitor.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/dashboard/components/workflows/ExecutionMonitor.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=dashboard_components_workflows_ExecutionMonitor_tsx_d32e5d7c._.js.map