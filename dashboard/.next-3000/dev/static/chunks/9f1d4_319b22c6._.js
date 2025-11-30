(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/dashboard/node_modules/@sentry/core/build/esm/utils/version.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// This is a magic string replaced by rollup
__turbopack_context__.s([
    "SDK_VERSION",
    ()=>SDK_VERSION
]);
const SDK_VERSION = "10.23.0";
;
 //# sourceMappingURL=version.js.map
}),
"[project]/dashboard/node_modules/@sentry/core/build/esm/utils/worldwide.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/** Internal global with common properties and Sentry extensions  */ /** Get's the global object for the current JavaScript runtime */ __turbopack_context__.s([
    "GLOBAL_OBJ",
    ()=>GLOBAL_OBJ
]);
const GLOBAL_OBJ = globalThis;
;
 //# sourceMappingURL=worldwide.js.map
}),
"[project]/dashboard/node_modules/@sentry/core/build/esm/carrier.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getGlobalSingleton",
    ()=>getGlobalSingleton,
    "getMainCarrier",
    ()=>getMainCarrier,
    "getSentryCarrier",
    ()=>getSentryCarrier
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$version$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/version.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$worldwide$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/worldwide.js [app-client] (ecmascript)");
;
;
/**
 * An object that contains globally accessible properties and maintains a scope stack.
 * @hidden
 */ /**
 * Returns the global shim registry.
 *
 * FIXME: This function is problematic, because despite always returning a valid Carrier,
 * it has an optional `__SENTRY__` property, which then in turn requires us to always perform an unnecessary check
 * at the call-site. We always access the carrier through this function, so we can guarantee that `__SENTRY__` is there.
 **/ function getMainCarrier() {
    // This ensures a Sentry carrier exists
    getSentryCarrier(__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$worldwide$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GLOBAL_OBJ"]);
    return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$worldwide$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GLOBAL_OBJ"];
}
/** Will either get the existing sentry carrier, or create a new one. */ function getSentryCarrier(carrier) {
    const __SENTRY__ = carrier.__SENTRY__ = carrier.__SENTRY__ || {};
    // For now: First SDK that sets the .version property wins
    __SENTRY__.version = __SENTRY__.version || __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$version$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SDK_VERSION"];
    // Intentionally populating and returning the version of "this" SDK instance
    // rather than what's set in .version so that "this" SDK always gets its carrier
    return __SENTRY__[__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$version$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SDK_VERSION"]] = __SENTRY__[__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$version$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SDK_VERSION"]] || {};
}
/**
 * Returns a global singleton contained in the global `__SENTRY__[]` object.
 *
 * If the singleton doesn't already exist in `__SENTRY__`, it will be created using the given factory
 * function and added to the `__SENTRY__` object.
 *
 * @param name name of the global singleton on __SENTRY__
 * @param creator creator Factory function to create the singleton if it doesn't already exist on `__SENTRY__`
 * @param obj (Optional) The global object on which to look for `__SENTRY__`, if not `GLOBAL_OBJ`'s return value
 * @returns the singleton
 */ function getGlobalSingleton(name, creator, obj = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$worldwide$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GLOBAL_OBJ"]) {
    const __SENTRY__ = obj.__SENTRY__ = obj.__SENTRY__ || {};
    const carrier = __SENTRY__[__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$version$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SDK_VERSION"]] = __SENTRY__[__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$version$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SDK_VERSION"]] || {};
    // Note: We do not want to set `carrier.version` here, as this may be called before any `init` is called, e.g. for the default scopes
    return carrier[name] || (carrier[name] = creator());
}
;
 //# sourceMappingURL=carrier.js.map
}),
"[project]/dashboard/node_modules/@sentry/core/build/esm/debug-build.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * This serves as a build time flag that will be true by default, but false in non-debug builds or if users replace `__SENTRY_DEBUG__` in their generated code.
 *
 * ATTENTION: This constant must never cross package boundaries (i.e. be exported) to guarantee that it can be used for tree shaking.
 */ __turbopack_context__.s([
    "DEBUG_BUILD",
    ()=>DEBUG_BUILD
]);
const DEBUG_BUILD = typeof __SENTRY_DEBUG__ === 'undefined' || __SENTRY_DEBUG__;
;
 //# sourceMappingURL=debug-build.js.map
}),
"[project]/dashboard/node_modules/@sentry/core/build/esm/utils/is.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// eslint-disable-next-line @typescript-eslint/unbound-method
__turbopack_context__.s([
    "isDOMError",
    ()=>isDOMError,
    "isDOMException",
    ()=>isDOMException,
    "isElement",
    ()=>isElement,
    "isError",
    ()=>isError,
    "isErrorEvent",
    ()=>isErrorEvent,
    "isEvent",
    ()=>isEvent,
    "isInstanceOf",
    ()=>isInstanceOf,
    "isParameterizedString",
    ()=>isParameterizedString,
    "isPlainObject",
    ()=>isPlainObject,
    "isPrimitive",
    ()=>isPrimitive,
    "isRegExp",
    ()=>isRegExp,
    "isRequest",
    ()=>isRequest,
    "isString",
    ()=>isString,
    "isSyntheticEvent",
    ()=>isSyntheticEvent,
    "isThenable",
    ()=>isThenable,
    "isVueViewModel",
    ()=>isVueViewModel
]);
const objectToString = Object.prototype.toString;
/**
 * Checks whether given value's type is one of a few Error or Error-like
 * {@link isError}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */ function isError(wat) {
    switch(objectToString.call(wat)){
        case '[object Error]':
        case '[object Exception]':
        case '[object DOMException]':
        case '[object WebAssembly.Exception]':
            return true;
        default:
            return isInstanceOf(wat, Error);
    }
}
/**
 * Checks whether given value is an instance of the given built-in class.
 *
 * @param wat The value to be checked
 * @param className
 * @returns A boolean representing the result.
 */ function isBuiltin(wat, className) {
    return objectToString.call(wat) === `[object ${className}]`;
}
/**
 * Checks whether given value's type is ErrorEvent
 * {@link isErrorEvent}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */ function isErrorEvent(wat) {
    return isBuiltin(wat, 'ErrorEvent');
}
/**
 * Checks whether given value's type is DOMError
 * {@link isDOMError}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */ function isDOMError(wat) {
    return isBuiltin(wat, 'DOMError');
}
/**
 * Checks whether given value's type is DOMException
 * {@link isDOMException}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */ function isDOMException(wat) {
    return isBuiltin(wat, 'DOMException');
}
/**
 * Checks whether given value's type is a string
 * {@link isString}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */ function isString(wat) {
    return isBuiltin(wat, 'String');
}
/**
 * Checks whether given string is parameterized
 * {@link isParameterizedString}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */ function isParameterizedString(wat) {
    return typeof wat === 'object' && wat !== null && '__sentry_template_string__' in wat && '__sentry_template_values__' in wat;
}
/**
 * Checks whether given value is a primitive (undefined, null, number, boolean, string, bigint, symbol)
 * {@link isPrimitive}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */ function isPrimitive(wat) {
    return wat === null || isParameterizedString(wat) || typeof wat !== 'object' && typeof wat !== 'function';
}
/**
 * Checks whether given value's type is an object literal, or a class instance.
 * {@link isPlainObject}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */ function isPlainObject(wat) {
    return isBuiltin(wat, 'Object');
}
/**
 * Checks whether given value's type is an Event instance
 * {@link isEvent}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */ function isEvent(wat) {
    return typeof Event !== 'undefined' && isInstanceOf(wat, Event);
}
/**
 * Checks whether given value's type is an Element instance
 * {@link isElement}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */ function isElement(wat) {
    return typeof Element !== 'undefined' && isInstanceOf(wat, Element);
}
/**
 * Checks whether given value's type is an regexp
 * {@link isRegExp}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */ function isRegExp(wat) {
    return isBuiltin(wat, 'RegExp');
}
/**
 * Checks whether given value has a then function.
 * @param wat A value to be checked.
 */ function isThenable(wat) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return Boolean(wat?.then && typeof wat.then === 'function');
}
/**
 * Checks whether given value's type is a SyntheticEvent
 * {@link isSyntheticEvent}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */ function isSyntheticEvent(wat) {
    return isPlainObject(wat) && 'nativeEvent' in wat && 'preventDefault' in wat && 'stopPropagation' in wat;
}
/**
 * Checks whether given value's type is an instance of provided constructor.
 * {@link isInstanceOf}.
 *
 * @param wat A value to be checked.
 * @param base A constructor to be used in a check.
 * @returns A boolean representing the result.
 */ function isInstanceOf(wat, base) {
    try {
        return wat instanceof base;
    } catch  {
        return false;
    }
}
/**
 * Checks whether given value's type is a Vue ViewModel.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */ function isVueViewModel(wat) {
    // Not using Object.prototype.toString because in Vue 3 it would read the instance's Symbol(Symbol.toStringTag) property.
    return !!(typeof wat === 'object' && wat !== null && (wat.__isVue || wat._isVue));
}
/**
 * Checks whether the given parameter is a Standard Web API Request instance.
 *
 * Returns false if Request is not available in the current runtime.
 */ function isRequest(request) {
    return typeof Request !== 'undefined' && isInstanceOf(request, Request);
}
;
 //# sourceMappingURL=is.js.map
}),
"[project]/dashboard/node_modules/@sentry/core/build/esm/utils/browser.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getComponentName",
    ()=>getComponentName,
    "getLocationHref",
    ()=>getLocationHref,
    "htmlTreeAsString",
    ()=>htmlTreeAsString
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$is$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/is.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$worldwide$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/worldwide.js [app-client] (ecmascript)");
;
;
const WINDOW = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$worldwide$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GLOBAL_OBJ"];
const DEFAULT_MAX_STRING_LENGTH = 80;
/**
 * Given a child DOM element, returns a query-selector statement describing that
 * and its ancestors
 * e.g. [HTMLElement] => body > div > input#foo.btn[name=baz]
 * @returns generated DOM path
 */ function htmlTreeAsString(elem, options = {}) {
    if (!elem) {
        return '<unknown>';
    }
    // try/catch both:
    // - accessing event.target (see getsentry/raven-js#838, #768)
    // - `htmlTreeAsString` because it's complex, and just accessing the DOM incorrectly
    // - can throw an exception in some circumstances.
    try {
        let currentElem = elem;
        const MAX_TRAVERSE_HEIGHT = 5;
        const out = [];
        let height = 0;
        let len = 0;
        const separator = ' > ';
        const sepLength = separator.length;
        let nextStr;
        const keyAttrs = Array.isArray(options) ? options : options.keyAttrs;
        const maxStringLength = !Array.isArray(options) && options.maxStringLength || DEFAULT_MAX_STRING_LENGTH;
        while(currentElem && height++ < MAX_TRAVERSE_HEIGHT){
            nextStr = _htmlElementAsString(currentElem, keyAttrs);
            // bail out if
            // - nextStr is the 'html' element
            // - the length of the string that would be created exceeds maxStringLength
            //   (ignore this limit if we are on the first iteration)
            if (nextStr === 'html' || height > 1 && len + out.length * sepLength + nextStr.length >= maxStringLength) {
                break;
            }
            out.push(nextStr);
            len += nextStr.length;
            currentElem = currentElem.parentNode;
        }
        return out.reverse().join(separator);
    } catch  {
        return '<unknown>';
    }
}
/**
 * Returns a simple, query-selector representation of a DOM element
 * e.g. [HTMLElement] => input#foo.btn[name=baz]
 * @returns generated DOM path
 */ function _htmlElementAsString(el, keyAttrs) {
    const elem = el;
    const out = [];
    if (!elem?.tagName) {
        return '';
    }
    // @ts-expect-error WINDOW has HTMLElement
    if (WINDOW.HTMLElement) {
        // If using the component name annotation plugin, this value may be available on the DOM node
        if (elem instanceof HTMLElement && elem.dataset) {
            if (elem.dataset['sentryComponent']) {
                return elem.dataset['sentryComponent'];
            }
            if (elem.dataset['sentryElement']) {
                return elem.dataset['sentryElement'];
            }
        }
    }
    out.push(elem.tagName.toLowerCase());
    // Pairs of attribute keys defined in `serializeAttribute` and their values on element.
    const keyAttrPairs = keyAttrs?.length ? keyAttrs.filter((keyAttr)=>elem.getAttribute(keyAttr)).map((keyAttr)=>[
            keyAttr,
            elem.getAttribute(keyAttr)
        ]) : null;
    if (keyAttrPairs?.length) {
        keyAttrPairs.forEach((keyAttrPair)=>{
            out.push(`[${keyAttrPair[0]}="${keyAttrPair[1]}"]`);
        });
    } else {
        if (elem.id) {
            out.push(`#${elem.id}`);
        }
        const className = elem.className;
        if (className && (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$is$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isString"])(className)) {
            const classes = className.split(/\s+/);
            for (const c of classes){
                out.push(`.${c}`);
            }
        }
    }
    const allowedAttrs = [
        'aria-label',
        'type',
        'name',
        'title',
        'alt'
    ];
    for (const k of allowedAttrs){
        const attr = elem.getAttribute(k);
        if (attr) {
            out.push(`[${k}="${attr}"]`);
        }
    }
    return out.join('');
}
/**
 * A safe form of location.href
 */ function getLocationHref() {
    try {
        return WINDOW.document.location.href;
    } catch  {
        return '';
    }
}
/**
 * Given a DOM element, traverses up the tree until it finds the first ancestor node
 * that has the `data-sentry-component` or `data-sentry-element` attribute with `data-sentry-component` taking
 * precedence. This attribute is added at build-time by projects that have the component name annotation plugin installed.
 *
 * @returns a string representation of the component for the provided DOM element, or `null` if not found
 */ function getComponentName(elem) {
    // @ts-expect-error WINDOW has HTMLElement
    if (!WINDOW.HTMLElement) {
        return null;
    }
    let currentElem = elem;
    const MAX_TRAVERSE_HEIGHT = 5;
    for(let i = 0; i < MAX_TRAVERSE_HEIGHT; i++){
        if (!currentElem) {
            return null;
        }
        if (currentElem instanceof HTMLElement) {
            if (currentElem.dataset['sentryComponent']) {
                return currentElem.dataset['sentryComponent'];
            }
            if (currentElem.dataset['sentryElement']) {
                return currentElem.dataset['sentryElement'];
            }
        }
        currentElem = currentElem.parentNode;
    }
    return null;
}
;
 //# sourceMappingURL=browser.js.map
}),
"[project]/dashboard/node_modules/@sentry/core/build/esm/utils/debug-logger.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CONSOLE_LEVELS",
    ()=>CONSOLE_LEVELS,
    "consoleSandbox",
    ()=>consoleSandbox,
    "debug",
    ()=>debug,
    "originalConsoleMethods",
    ()=>originalConsoleMethods
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$carrier$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/carrier.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$debug$2d$build$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/debug-build.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$worldwide$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/worldwide.js [app-client] (ecmascript)");
;
;
;
const CONSOLE_LEVELS = [
    'debug',
    'info',
    'warn',
    'error',
    'log',
    'assert',
    'trace'
];
/** Prefix for logging strings */ const PREFIX = 'Sentry Logger ';
/** This may be mutated by the console instrumentation. */ const originalConsoleMethods = {};
/**
 * Temporarily disable sentry console instrumentations.
 *
 * @param callback The function to run against the original `console` messages
 * @returns The results of the callback
 */ function consoleSandbox(callback) {
    if (!('console' in __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$worldwide$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GLOBAL_OBJ"])) {
        return callback();
    }
    const console = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$worldwide$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GLOBAL_OBJ"].console;
    const wrappedFuncs = {};
    const wrappedLevels = Object.keys(originalConsoleMethods);
    // Restore all wrapped console methods
    wrappedLevels.forEach((level)=>{
        const originalConsoleMethod = originalConsoleMethods[level];
        wrappedFuncs[level] = console[level];
        console[level] = originalConsoleMethod;
    });
    try {
        return callback();
    } finally{
        // Revert restoration to wrapped state
        wrappedLevels.forEach((level)=>{
            console[level] = wrappedFuncs[level];
        });
    }
}
function enable() {
    _getLoggerSettings().enabled = true;
}
function disable() {
    _getLoggerSettings().enabled = false;
}
function isEnabled() {
    return _getLoggerSettings().enabled;
}
function log(...args) {
    _maybeLog('log', ...args);
}
function warn(...args) {
    _maybeLog('warn', ...args);
}
function error(...args) {
    _maybeLog('error', ...args);
}
function _maybeLog(level, ...args) {
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$debug$2d$build$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEBUG_BUILD"]) {
        return;
    }
    if (isEnabled()) {
        consoleSandbox(()=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$worldwide$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GLOBAL_OBJ"].console[level](`${PREFIX}[${level}]:`, ...args);
        });
    }
}
function _getLoggerSettings() {
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$debug$2d$build$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEBUG_BUILD"]) {
        return {
            enabled: false
        };
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$carrier$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getGlobalSingleton"])('loggerSettings', ()=>({
            enabled: false
        }));
}
/**
 * This is a logger singleton which either logs things or no-ops if logging is not enabled.
 */ const debug = {
    /** Enable logging. */ enable,
    /** Disable logging. */ disable,
    /** Check if logging is enabled. */ isEnabled,
    /** Log a message. */ log,
    /** Log a warning. */ warn,
    /** Log an error. */ error
};
;
 //# sourceMappingURL=debug-logger.js.map
}),
"[project]/dashboard/node_modules/@sentry/core/build/esm/utils/string.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isMatchingPattern",
    ()=>isMatchingPattern,
    "safeJoin",
    ()=>safeJoin,
    "snipLine",
    ()=>snipLine,
    "stringMatchesSomePattern",
    ()=>stringMatchesSomePattern,
    "truncate",
    ()=>truncate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$is$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/is.js [app-client] (ecmascript)");
;
/**
 * Truncates given string to the maximum characters count
 *
 * @param str An object that contains serializable values
 * @param max Maximum number of characters in truncated string (0 = unlimited)
 * @returns string Encoded
 */ function truncate(str, max = 0) {
    if (typeof str !== 'string' || max === 0) {
        return str;
    }
    return str.length <= max ? str : `${str.slice(0, max)}...`;
}
/**
 * This is basically just `trim_line` from
 * https://github.com/getsentry/sentry/blob/master/src/sentry/lang/javascript/processor.py#L67
 *
 * @param str An object that contains serializable values
 * @param max Maximum number of characters in truncated string
 * @returns string Encoded
 */ function snipLine(line, colno) {
    let newLine = line;
    const lineLength = newLine.length;
    if (lineLength <= 150) {
        return newLine;
    }
    if (colno > lineLength) {
        // eslint-disable-next-line no-param-reassign
        colno = lineLength;
    }
    let start = Math.max(colno - 60, 0);
    if (start < 5) {
        start = 0;
    }
    let end = Math.min(start + 140, lineLength);
    if (end > lineLength - 5) {
        end = lineLength;
    }
    if (end === lineLength) {
        start = Math.max(end - 140, 0);
    }
    newLine = newLine.slice(start, end);
    if (start > 0) {
        newLine = `'{snip} ${newLine}`;
    }
    if (end < lineLength) {
        newLine += ' {snip}';
    }
    return newLine;
}
/**
 * Join values in array
 * @param input array of values to be joined together
 * @param delimiter string to be placed in-between values
 * @returns Joined values
 */ function safeJoin(input, delimiter) {
    if (!Array.isArray(input)) {
        return '';
    }
    const output = [];
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for(let i = 0; i < input.length; i++){
        const value = input[i];
        try {
            // This is a hack to fix a Vue3-specific bug that causes an infinite loop of
            // console warnings. This happens when a Vue template is rendered with
            // an undeclared variable, which we try to stringify, ultimately causing
            // Vue to issue another warning which repeats indefinitely.
            // see: https://github.com/getsentry/sentry-javascript/pull/8981
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$is$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isVueViewModel"])(value)) {
                output.push('[VueViewModel]');
            } else {
                output.push(String(value));
            }
        } catch  {
            output.push('[value cannot be serialized]');
        }
    }
    return output.join(delimiter);
}
/**
 * Checks if the given value matches a regex or string
 *
 * @param value The string to test
 * @param pattern Either a regex or a string against which `value` will be matched
 * @param requireExactStringMatch If true, `value` must match `pattern` exactly. If false, `value` will match
 * `pattern` if it contains `pattern`. Only applies to string-type patterns.
 */ function isMatchingPattern(value, pattern, requireExactStringMatch = false) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$is$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isString"])(value)) {
        return false;
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$is$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isRegExp"])(pattern)) {
        return pattern.test(value);
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$is$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isString"])(pattern)) {
        return requireExactStringMatch ? value === pattern : value.includes(pattern);
    }
    return false;
}
/**
 * Test the given string against an array of strings and regexes. By default, string matching is done on a
 * substring-inclusion basis rather than a strict equality basis
 *
 * @param testString The string to test
 * @param patterns The patterns against which to test the string
 * @param requireExactStringMatch If true, `testString` must match one of the given string patterns exactly in order to
 * count. If false, `testString` will match a string pattern if it contains that pattern.
 * @returns
 */ function stringMatchesSomePattern(testString, patterns = [], requireExactStringMatch = false) {
    return patterns.some((pattern)=>isMatchingPattern(testString, pattern, requireExactStringMatch));
}
;
 //# sourceMappingURL=string.js.map
}),
"[project]/dashboard/node_modules/@sentry/core/build/esm/utils/object.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addNonEnumerableProperty",
    ()=>addNonEnumerableProperty,
    "convertToPlainObject",
    ()=>convertToPlainObject,
    "dropUndefinedKeys",
    ()=>dropUndefinedKeys,
    "extractExceptionKeysForMessage",
    ()=>extractExceptionKeysForMessage,
    "fill",
    ()=>fill,
    "getOriginalFunction",
    ()=>getOriginalFunction,
    "markFunctionWrapped",
    ()=>markFunctionWrapped,
    "objectify",
    ()=>objectify
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$debug$2d$build$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/debug-build.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$browser$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/browser.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$debug$2d$logger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/debug-logger.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$is$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/is.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$string$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/string.js [app-client] (ecmascript)");
;
;
;
;
;
/* eslint-disable @typescript-eslint/no-explicit-any */ /**
 * Replace a method in an object with a wrapped version of itself.
 *
 * If the method on the passed object is not a function, the wrapper will not be applied.
 *
 * @param source An object that contains a method to be wrapped.
 * @param name The name of the method to be wrapped.
 * @param replacementFactory A higher-order function that takes the original version of the given method and returns a
 * wrapped version. Note: The function returned by `replacementFactory` needs to be a non-arrow function, in order to
 * preserve the correct value of `this`, and the original method must be called using `origMethod.call(this, <other
 * args>)` or `origMethod.apply(this, [<other args>])` (rather than being called directly), again to preserve `this`.
 * @returns void
 */ function fill(source, name, replacementFactory) {
    if (!(name in source)) {
        return;
    }
    // explicitly casting to unknown because we don't know the type of the method initially at all
    const original = source[name];
    if (typeof original !== 'function') {
        return;
    }
    const wrapped = replacementFactory(original);
    // Make sure it's a function first, as we need to attach an empty prototype for `defineProperties` to work
    // otherwise it'll throw "TypeError: Object.defineProperties called on non-object"
    if (typeof wrapped === 'function') {
        markFunctionWrapped(wrapped, original);
    }
    try {
        source[name] = wrapped;
    } catch  {
        __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$debug$2d$build$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEBUG_BUILD"] && __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$debug$2d$logger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["debug"].log(`Failed to replace method "${name}" in object`, source);
    }
}
/**
 * Defines a non-enumerable property on the given object.
 *
 * @param obj The object on which to set the property
 * @param name The name of the property to be set
 * @param value The value to which to set the property
 */ function addNonEnumerableProperty(obj, name, value) {
    try {
        Object.defineProperty(obj, name, {
            // enumerable: false, // the default, so we can save on bundle size by not explicitly setting it
            value: value,
            writable: true,
            configurable: true
        });
    } catch  {
        __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$debug$2d$build$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEBUG_BUILD"] && __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$debug$2d$logger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["debug"].log(`Failed to add non-enumerable property "${name}" to object`, obj);
    }
}
/**
 * Remembers the original function on the wrapped function and
 * patches up the prototype.
 *
 * @param wrapped the wrapper function
 * @param original the original function that gets wrapped
 */ function markFunctionWrapped(wrapped, original) {
    try {
        const proto = original.prototype || {};
        wrapped.prototype = original.prototype = proto;
        addNonEnumerableProperty(wrapped, '__sentry_original__', original);
    } catch  {} // eslint-disable-line no-empty
}
/**
 * This extracts the original function if available.  See
 * `markFunctionWrapped` for more information.
 *
 * @param func the function to unwrap
 * @returns the unwrapped version of the function if available.
 */ // eslint-disable-next-line @typescript-eslint/ban-types
function getOriginalFunction(func) {
    return func.__sentry_original__;
}
/**
 * Transforms any `Error` or `Event` into a plain object with all of their enumerable properties, and some of their
 * non-enumerable properties attached.
 *
 * @param value Initial source that we have to transform in order for it to be usable by the serializer
 * @returns An Event or Error turned into an object - or the value argument itself, when value is neither an Event nor
 *  an Error.
 */ function convertToPlainObject(value) {
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$is$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isError"])(value)) {
        return {
            message: value.message,
            name: value.name,
            stack: value.stack,
            ...getOwnProperties(value)
        };
    } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$is$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isEvent"])(value)) {
        const newObj = {
            type: value.type,
            target: serializeEventTarget(value.target),
            currentTarget: serializeEventTarget(value.currentTarget),
            ...getOwnProperties(value)
        };
        if (typeof CustomEvent !== 'undefined' && (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$is$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isInstanceOf"])(value, CustomEvent)) {
            newObj.detail = value.detail;
        }
        return newObj;
    } else {
        return value;
    }
}
/** Creates a string representation of the target of an `Event` object */ function serializeEventTarget(target) {
    try {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$is$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isElement"])(target) ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$browser$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["htmlTreeAsString"])(target) : Object.prototype.toString.call(target);
    } catch  {
        return '<unknown>';
    }
}
/** Filters out all but an object's own properties */ function getOwnProperties(obj) {
    if (typeof obj === 'object' && obj !== null) {
        const extractedProps = {};
        for(const property in obj){
            if (Object.prototype.hasOwnProperty.call(obj, property)) {
                extractedProps[property] = obj[property];
            }
        }
        return extractedProps;
    } else {
        return {};
    }
}
/**
 * Given any captured exception, extract its keys and create a sorted
 * and truncated list that will be used inside the event message.
 * eg. `Non-error exception captured with keys: foo, bar, baz`
 */ function extractExceptionKeysForMessage(exception, maxLength = 40) {
    const keys = Object.keys(convertToPlainObject(exception));
    keys.sort();
    const firstKey = keys[0];
    if (!firstKey) {
        return '[object has no keys]';
    }
    if (firstKey.length >= maxLength) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$string$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["truncate"])(firstKey, maxLength);
    }
    for(let includedKeys = keys.length; includedKeys > 0; includedKeys--){
        const serialized = keys.slice(0, includedKeys).join(', ');
        if (serialized.length > maxLength) {
            continue;
        }
        if (includedKeys === keys.length) {
            return serialized;
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$string$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["truncate"])(serialized, maxLength);
    }
    return '';
}
/**
 * Given any object, return a new object having removed all fields whose value was `undefined`.
 * Works recursively on objects and arrays.
 *
 * Attention: This function keeps circular references in the returned object.
 *
 * @deprecated This function is no longer used by the SDK and will be removed in a future major version.
 */ function dropUndefinedKeys(inputValue) {
    // This map keeps track of what already visited nodes map to.
    // Our Set - based memoBuilder doesn't work here because we want to the output object to have the same circular
    // references as the input object.
    const memoizationMap = new Map();
    // This function just proxies `_dropUndefinedKeys` to keep the `memoBuilder` out of this function's API
    return _dropUndefinedKeys(inputValue, memoizationMap);
}
function _dropUndefinedKeys(inputValue, memoizationMap) {
    // Early return for primitive values
    if (inputValue === null || typeof inputValue !== 'object') {
        return inputValue;
    }
    // Check memo map first for all object types
    const memoVal = memoizationMap.get(inputValue);
    if (memoVal !== undefined) {
        return memoVal;
    }
    // handle arrays
    if (Array.isArray(inputValue)) {
        const returnValue = [];
        // Store mapping to handle circular references
        memoizationMap.set(inputValue, returnValue);
        inputValue.forEach((value)=>{
            returnValue.push(_dropUndefinedKeys(value, memoizationMap));
        });
        return returnValue;
    }
    if (isPojo(inputValue)) {
        const returnValue = {};
        // Store mapping to handle circular references
        memoizationMap.set(inputValue, returnValue);
        const keys = Object.keys(inputValue);
        keys.forEach((key)=>{
            const val = inputValue[key];
            if (val !== undefined) {
                returnValue[key] = _dropUndefinedKeys(val, memoizationMap);
            }
        });
        return returnValue;
    }
    // For other object types, return as is
    return inputValue;
}
function isPojo(input) {
    // Plain objects have Object as constructor or no constructor
    const constructor = input.constructor;
    return constructor === Object || constructor === undefined;
}
/**
 * Ensure that something is an object.
 *
 * Turns `undefined` and `null` into `String`s and all other primitives into instances of their respective wrapper
 * classes (String, Boolean, Number, etc.). Acts as the identity function on non-primitives.
 *
 * @param wat The subject of the objectification
 * @returns A version of `wat` which can safely be used with `Object` class methods
 */ function objectify(wat) {
    let objectified;
    switch(true){
        // this will catch both undefined and null
        case wat == undefined:
            objectified = new String(wat);
            break;
        // Though symbols and bigints do have wrapper classes (`Symbol` and `BigInt`, respectively), for whatever reason
        // those classes don't have constructors which can be used with the `new` keyword. We therefore need to cast each as
        // an object in order to wrap it.
        case typeof wat === 'symbol' || typeof wat === 'bigint':
            objectified = Object(wat);
            break;
        // this will catch the remaining primitives: `String`, `Number`, and `Boolean`
        case (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$is$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isPrimitive"])(wat):
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            objectified = new wat.constructor(wat);
            break;
        // by process of elimination, at this point we know that `wat` must already be an object
        default:
            objectified = wat;
            break;
    }
    return objectified;
}
;
 //# sourceMappingURL=object.js.map
}),
"[project]/dashboard/node_modules/@sentry/core/build/esm/utils/misc.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addContextToFrame",
    ()=>addContextToFrame,
    "addExceptionMechanism",
    ()=>addExceptionMechanism,
    "addExceptionTypeValue",
    ()=>addExceptionTypeValue,
    "checkOrSetAlreadyCaught",
    ()=>checkOrSetAlreadyCaught,
    "getEventDescription",
    ()=>getEventDescription,
    "parseSemver",
    ()=>parseSemver,
    "uuid4",
    ()=>uuid4
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/object.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$string$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/string.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$worldwide$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/worldwide.js [app-client] (ecmascript)");
;
;
;
function getCrypto() {
    const gbl = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$worldwide$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GLOBAL_OBJ"];
    return gbl.crypto || gbl.msCrypto;
}
let emptyUuid;
function getRandomByte() {
    return Math.random() * 16;
}
/**
 * UUID4 generator
 * @param crypto Object that provides the crypto API.
 * @returns string Generated UUID4.
 */ function uuid4(crypto = getCrypto()) {
    try {
        if (crypto?.randomUUID) {
            return crypto.randomUUID().replace(/-/g, '');
        }
    } catch  {
    // some runtimes can crash invoking crypto
    // https://github.com/getsentry/sentry-javascript/issues/8935
    }
    if (!emptyUuid) {
        // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/2117523#2117523
        // Concatenating the following numbers as strings results in '10000000100040008000100000000000'
        emptyUuid = [
            1e7
        ] + 1e3 + 4e3 + 8e3 + 1e11;
    }
    return emptyUuid.replace(/[018]/g, (c)=>// eslint-disable-next-line no-bitwise
        (c ^ (getRandomByte() & 15) >> c / 4).toString(16));
}
function getFirstException(event) {
    return event.exception?.values?.[0];
}
/**
 * Extracts either message or type+value from an event that can be used for user-facing logs
 * @returns event's description
 */ function getEventDescription(event) {
    const { message, event_id: eventId } = event;
    if (message) {
        return message;
    }
    const firstException = getFirstException(event);
    if (firstException) {
        if (firstException.type && firstException.value) {
            return `${firstException.type}: ${firstException.value}`;
        }
        return firstException.type || firstException.value || eventId || '<unknown>';
    }
    return eventId || '<unknown>';
}
/**
 * Adds exception values, type and value to an synthetic Exception.
 * @param event The event to modify.
 * @param value Value of the exception.
 * @param type Type of the exception.
 * @hidden
 */ function addExceptionTypeValue(event, value, type) {
    const exception = event.exception = event.exception || {};
    const values = exception.values = exception.values || [];
    const firstException = values[0] = values[0] || {};
    if (!firstException.value) {
        firstException.value = value || '';
    }
    if (!firstException.type) {
        firstException.type = type || 'Error';
    }
}
/**
 * Adds exception mechanism data to a given event. Uses defaults if the second parameter is not passed.
 *
 * @param event The event to modify.
 * @param newMechanism Mechanism data to add to the event.
 * @hidden
 */ function addExceptionMechanism(event, newMechanism) {
    const firstException = getFirstException(event);
    if (!firstException) {
        return;
    }
    const defaultMechanism = {
        type: 'generic',
        handled: true
    };
    const currentMechanism = firstException.mechanism;
    firstException.mechanism = {
        ...defaultMechanism,
        ...currentMechanism,
        ...newMechanism
    };
    if (newMechanism && 'data' in newMechanism) {
        const mergedData = {
            ...currentMechanism?.data,
            ...newMechanism.data
        };
        firstException.mechanism.data = mergedData;
    }
}
// https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
const SEMVER_REGEXP = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
/**
 * Represents Semantic Versioning object
 */ function _parseInt(input) {
    return parseInt(input || '', 10);
}
/**
 * Parses input into a SemVer interface
 * @param input string representation of a semver version
 */ function parseSemver(input) {
    const match = input.match(SEMVER_REGEXP) || [];
    const major = _parseInt(match[1]);
    const minor = _parseInt(match[2]);
    const patch = _parseInt(match[3]);
    return {
        buildmetadata: match[5],
        major: isNaN(major) ? undefined : major,
        minor: isNaN(minor) ? undefined : minor,
        patch: isNaN(patch) ? undefined : patch,
        prerelease: match[4]
    };
}
/**
 * This function adds context (pre/post/line) lines to the provided frame
 *
 * @param lines string[] containing all lines
 * @param frame StackFrame that will be mutated
 * @param linesOfContext number of context lines we want to add pre/post
 */ function addContextToFrame(lines, frame, linesOfContext = 5) {
    // When there is no line number in the frame, attaching context is nonsensical and will even break grouping
    if (frame.lineno === undefined) {
        return;
    }
    const maxLines = lines.length;
    const sourceLine = Math.max(Math.min(maxLines - 1, frame.lineno - 1), 0);
    frame.pre_context = lines.slice(Math.max(0, sourceLine - linesOfContext), sourceLine).map((line)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$string$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["snipLine"])(line, 0));
    // We guard here to ensure this is not larger than the existing number of lines
    const lineIndex = Math.min(maxLines - 1, sourceLine);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    frame.context_line = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$string$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["snipLine"])(lines[lineIndex], frame.colno || 0);
    frame.post_context = lines.slice(Math.min(sourceLine + 1, maxLines), sourceLine + 1 + linesOfContext).map((line)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$string$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["snipLine"])(line, 0));
}
/**
 * Checks whether or not we've already captured the given exception (note: not an identical exception - the very object
 * in question), and marks it captured if not.
 *
 * This is useful because it's possible for an error to get captured by more than one mechanism. After we intercept and
 * record an error, we rethrow it (assuming we've intercepted it before it's reached the top-level global handlers), so
 * that we don't interfere with whatever effects the error might have had were the SDK not there. At that point, because
 * the error has been rethrown, it's possible for it to bubble up to some other code we've instrumented. If it's not
 * caught after that, it will bubble all the way up to the global handlers (which of course we also instrument). This
 * function helps us ensure that even if we encounter the same error more than once, we only record it the first time we
 * see it.
 *
 * Note: It will ignore primitives (always return `false` and not mark them as seen), as properties can't be set on
 * them. {@link: Object.objectify} can be used on exceptions to convert any that are primitives into their equivalent
 * object wrapper forms so that this check will always work. However, because we need to flag the exact object which
 * will get rethrown, and because that rethrowing happens outside of the event processing pipeline, the objectification
 * must be done before the exception captured.
 *
 * @param A thrown exception to check or flag as having been seen
 * @returns `true` if the exception has already been captured, `false` if not (with the side effect of marking it seen)
 */ function checkOrSetAlreadyCaught(exception) {
    if (isAlreadyCaptured(exception)) {
        return true;
    }
    try {
        // set it this way rather than by assignment so that it's not ennumerable and therefore isn't recorded by the
        // `ExtraErrorData` integration
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addNonEnumerableProperty"])(exception, '__sentry_captured__', true);
    } catch  {
    // `exception` is a primitive, so we can't mark it seen
    }
    return false;
}
function isAlreadyCaptured(exception) {
    try {
        return exception.__sentry_captured__;
    } catch  {} // eslint-disable-line no-empty
}
;
 //# sourceMappingURL=misc.js.map
}),
"[project]/dashboard/node_modules/@sentry/core/build/esm/utils/time.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "browserPerformanceTimeOrigin",
    ()=>browserPerformanceTimeOrigin,
    "dateTimestampInSeconds",
    ()=>dateTimestampInSeconds,
    "timestampInSeconds",
    ()=>timestampInSeconds
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$worldwide$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/worldwide.js [app-client] (ecmascript)");
;
const ONE_SECOND_IN_MS = 1000;
/**
 * A partial definition of the [Performance Web API]{@link https://developer.mozilla.org/en-US/docs/Web/API/Performance}
 * for accessing a high-resolution monotonic clock.
 */ /**
 * Returns a timestamp in seconds since the UNIX epoch using the Date API.
 */ function dateTimestampInSeconds() {
    return Date.now() / ONE_SECOND_IN_MS;
}
/**
 * Returns a wrapper around the native Performance API browser implementation, or undefined for browsers that do not
 * support the API.
 *
 * Wrapping the native API works around differences in behavior from different browsers.
 */ function createUnixTimestampInSecondsFunc() {
    const { performance } = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$worldwide$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GLOBAL_OBJ"];
    // Some browser and environments don't have a performance or timeOrigin, so we fallback to
    // using Date.now() to compute the starting time.
    if (!performance?.now || !performance.timeOrigin) {
        return dateTimestampInSeconds;
    }
    const timeOrigin = performance.timeOrigin;
    // performance.now() is a monotonic clock, which means it starts at 0 when the process begins. To get the current
    // wall clock time (actual UNIX timestamp), we need to add the starting time origin and the current time elapsed.
    //
    // TODO: This does not account for the case where the monotonic clock that powers performance.now() drifts from the
    // wall clock time, which causes the returned timestamp to be inaccurate. We should investigate how to detect and
    // correct for this.
    // See: https://github.com/getsentry/sentry-javascript/issues/2590
    // See: https://github.com/mdn/content/issues/4713
    // See: https://dev.to/noamr/when-a-millisecond-is-not-a-millisecond-3h6
    return ()=>{
        return (timeOrigin + performance.now()) / ONE_SECOND_IN_MS;
    };
}
let _cachedTimestampInSeconds;
/**
 * Returns a timestamp in seconds since the UNIX epoch using either the Performance or Date APIs, depending on the
 * availability of the Performance API.
 *
 * BUG: Note that because of how browsers implement the Performance API, the clock might stop when the computer is
 * asleep. This creates a skew between `dateTimestampInSeconds` and `timestampInSeconds`. The
 * skew can grow to arbitrary amounts like days, weeks or months.
 * See https://github.com/getsentry/sentry-javascript/issues/2590.
 */ function timestampInSeconds() {
    // We store this in a closure so that we don't have to create a new function every time this is called.
    const func = _cachedTimestampInSeconds ?? (_cachedTimestampInSeconds = createUnixTimestampInSecondsFunc());
    return func();
}
/**
 * Cached result of getBrowserTimeOrigin.
 */ let cachedTimeOrigin;
/**
 * Gets the time origin and the mode used to determine it.
 */ function getBrowserTimeOrigin() {
    // Unfortunately browsers may report an inaccurate time origin data, through either performance.timeOrigin or
    // performance.timing.navigationStart, which results in poor results in performance data. We only treat time origin
    // data as reliable if they are within a reasonable threshold of the current time.
    const { performance } = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$worldwide$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GLOBAL_OBJ"];
    if (!performance?.now) {
        return [
            undefined,
            'none'
        ];
    }
    const threshold = 3600 * 1000;
    const performanceNow = performance.now();
    const dateNow = Date.now();
    // if timeOrigin isn't available set delta to threshold so it isn't used
    const timeOriginDelta = performance.timeOrigin ? Math.abs(performance.timeOrigin + performanceNow - dateNow) : threshold;
    const timeOriginIsReliable = timeOriginDelta < threshold;
    // While performance.timing.navigationStart is deprecated in favor of performance.timeOrigin, performance.timeOrigin
    // is not as widely supported. Namely, performance.timeOrigin is undefined in Safari as of writing.
    // Also as of writing, performance.timing is not available in Web Workers in mainstream browsers, so it is not always
    // a valid fallback. In the absence of an initial time provided by the browser, fallback to the current time from the
    // Date API.
    // eslint-disable-next-line deprecation/deprecation
    const navigationStart = performance.timing?.navigationStart;
    const hasNavigationStart = typeof navigationStart === 'number';
    // if navigationStart isn't available set delta to threshold so it isn't used
    const navigationStartDelta = hasNavigationStart ? Math.abs(navigationStart + performanceNow - dateNow) : threshold;
    const navigationStartIsReliable = navigationStartDelta < threshold;
    if (timeOriginIsReliable || navigationStartIsReliable) {
        // Use the more reliable time origin
        if (timeOriginDelta <= navigationStartDelta) {
            return [
                performance.timeOrigin,
                'timeOrigin'
            ];
        } else {
            return [
                navigationStart,
                'navigationStart'
            ];
        }
    }
    // Either both timeOrigin and navigationStart are skewed or neither is available, fallback to Date.
    return [
        dateNow,
        'dateNow'
    ];
}
/**
 * The number of milliseconds since the UNIX epoch. This value is only usable in a browser, and only when the
 * performance API is available.
 */ function browserPerformanceTimeOrigin() {
    if (!cachedTimeOrigin) {
        cachedTimeOrigin = getBrowserTimeOrigin();
    }
    return cachedTimeOrigin[0];
}
;
 //# sourceMappingURL=time.js.map
}),
"[project]/dashboard/node_modules/@sentry/core/build/esm/session.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "closeSession",
    ()=>closeSession,
    "makeSession",
    ()=>makeSession,
    "updateSession",
    ()=>updateSession
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$misc$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/misc.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$time$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/time.js [app-client] (ecmascript)");
;
;
/**
 * Creates a new `Session` object by setting certain default parameters. If optional @param context
 * is passed, the passed properties are applied to the session object.
 *
 * @param context (optional) additional properties to be applied to the returned session object
 *
 * @returns a new `Session` object
 */ function makeSession(context) {
    // Both timestamp and started are in seconds since the UNIX epoch.
    const startingTime = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$time$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["timestampInSeconds"])();
    const session = {
        sid: (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$misc$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["uuid4"])(),
        init: true,
        timestamp: startingTime,
        started: startingTime,
        duration: 0,
        status: 'ok',
        errors: 0,
        ignoreDuration: false,
        toJSON: ()=>sessionToJSON(session)
    };
    if (context) {
        updateSession(session, context);
    }
    return session;
}
/**
 * Updates a session object with the properties passed in the context.
 *
 * Note that this function mutates the passed object and returns void.
 * (Had to do this instead of returning a new and updated session because closing and sending a session
 * makes an update to the session after it was passed to the sending logic.
 * @see Client.captureSession )
 *
 * @param session the `Session` to update
 * @param context the `SessionContext` holding the properties that should be updated in @param session
 */ // eslint-disable-next-line complexity
function updateSession(session, context = {}) {
    if (context.user) {
        if (!session.ipAddress && context.user.ip_address) {
            session.ipAddress = context.user.ip_address;
        }
        if (!session.did && !context.did) {
            session.did = context.user.id || context.user.email || context.user.username;
        }
    }
    session.timestamp = context.timestamp || (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$time$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["timestampInSeconds"])();
    if (context.abnormal_mechanism) {
        session.abnormal_mechanism = context.abnormal_mechanism;
    }
    if (context.ignoreDuration) {
        session.ignoreDuration = context.ignoreDuration;
    }
    if (context.sid) {
        // Good enough uuid validation. — Kamil
        session.sid = context.sid.length === 32 ? context.sid : (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$misc$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["uuid4"])();
    }
    if (context.init !== undefined) {
        session.init = context.init;
    }
    if (!session.did && context.did) {
        session.did = `${context.did}`;
    }
    if (typeof context.started === 'number') {
        session.started = context.started;
    }
    if (session.ignoreDuration) {
        session.duration = undefined;
    } else if (typeof context.duration === 'number') {
        session.duration = context.duration;
    } else {
        const duration = session.timestamp - session.started;
        session.duration = duration >= 0 ? duration : 0;
    }
    if (context.release) {
        session.release = context.release;
    }
    if (context.environment) {
        session.environment = context.environment;
    }
    if (!session.ipAddress && context.ipAddress) {
        session.ipAddress = context.ipAddress;
    }
    if (!session.userAgent && context.userAgent) {
        session.userAgent = context.userAgent;
    }
    if (typeof context.errors === 'number') {
        session.errors = context.errors;
    }
    if (context.status) {
        session.status = context.status;
    }
}
/**
 * Closes a session by setting its status and updating the session object with it.
 * Internally calls `updateSession` to update the passed session object.
 *
 * Note that this function mutates the passed session (@see updateSession for explanation).
 *
 * @param session the `Session` object to be closed
 * @param status the `SessionStatus` with which the session was closed. If you don't pass a status,
 *               this function will keep the previously set status, unless it was `'ok'` in which case
 *               it is changed to `'exited'`.
 */ function closeSession(session, status) {
    let context = {};
    if (status) {
        context = {
            status
        };
    } else if (session.status === 'ok') {
        context = {
            status: 'exited'
        };
    }
    updateSession(session, context);
}
/**
 * Serializes a passed session object to a JSON object with a slightly different structure.
 * This is necessary because the Sentry backend requires a slightly different schema of a session
 * than the one the JS SDKs use internally.
 *
 * @param session the session to be converted
 *
 * @returns a JSON object of the passed session
 */ function sessionToJSON(session) {
    return {
        sid: `${session.sid}`,
        init: session.init,
        // Make sure that sec is converted to ms for date constructor
        started: new Date(session.started * 1000).toISOString(),
        timestamp: new Date(session.timestamp * 1000).toISOString(),
        status: session.status,
        errors: session.errors,
        did: typeof session.did === 'number' || typeof session.did === 'string' ? `${session.did}` : undefined,
        duration: session.duration,
        abnormal_mechanism: session.abnormal_mechanism,
        attrs: {
            release: session.release,
            environment: session.environment,
            ip_address: session.ipAddress,
            user_agent: session.userAgent
        }
    };
}
;
 //# sourceMappingURL=session.js.map
}),
"[project]/dashboard/node_modules/@sentry/core/build/esm/utils/merge.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Shallow merge two objects.
 * Does not mutate the passed in objects.
 * Undefined/empty values in the merge object will overwrite existing values.
 *
 * By default, this merges 2 levels deep.
 */ __turbopack_context__.s([
    "merge",
    ()=>merge
]);
function merge(initialObj, mergeObj, levels = 2) {
    // If the merge value is not an object, or we have no merge levels left,
    // we just set the value to the merge value
    if (!mergeObj || typeof mergeObj !== 'object' || levels <= 0) {
        return mergeObj;
    }
    // If the merge object is an empty object, and the initial object is not undefined, we return the initial object
    if (initialObj && Object.keys(mergeObj).length === 0) {
        return initialObj;
    }
    // Clone object
    const output = {
        ...initialObj
    };
    // Merge values into output, resursively
    for(const key in mergeObj){
        if (Object.prototype.hasOwnProperty.call(mergeObj, key)) {
            output[key] = merge(output[key], mergeObj[key], levels - 1);
        }
    }
    return output;
}
;
 //# sourceMappingURL=merge.js.map
}),
"[project]/dashboard/node_modules/@sentry/core/build/esm/utils/propagationContext.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateSpanId",
    ()=>generateSpanId,
    "generateTraceId",
    ()=>generateTraceId
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$misc$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/misc.js [app-client] (ecmascript)");
;
/**
 * Generate a random, valid trace ID.
 */ function generateTraceId() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$misc$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["uuid4"])();
}
/**
 * Generate a random, valid span ID.
 */ function generateSpanId() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$misc$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["uuid4"])().substring(16);
}
;
 //# sourceMappingURL=propagationContext.js.map
}),
"[project]/dashboard/node_modules/@sentry/core/build/esm/utils/spanOnScope.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "_getSpanForScope",
    ()=>_getSpanForScope,
    "_setSpanForScope",
    ()=>_setSpanForScope
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/object.js [app-client] (ecmascript)");
;
const SCOPE_SPAN_FIELD = '_sentrySpan';
/**
 * Set the active span for a given scope.
 * NOTE: This should NOT be used directly, but is only used internally by the trace methods.
 */ function _setSpanForScope(scope, span) {
    if (span) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addNonEnumerableProperty"])(scope, SCOPE_SPAN_FIELD, span);
    } else {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete scope[SCOPE_SPAN_FIELD];
    }
}
/**
 * Get the active span for a given scope.
 * NOTE: This should NOT be used directly, but is only used internally by the trace methods.
 */ function _getSpanForScope(scope) {
    return scope[SCOPE_SPAN_FIELD];
}
;
 //# sourceMappingURL=spanOnScope.js.map
}),
"[project]/dashboard/node_modules/@sentry/core/build/esm/scope.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Scope",
    ()=>Scope
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$debug$2d$build$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/debug-build.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$session$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/session.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$debug$2d$logger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/debug-logger.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$is$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/is.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$merge$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/merge.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$misc$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/misc.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$propagationContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/propagationContext.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$spanOnScope$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/spanOnScope.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$string$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/string.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$time$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/time.js [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
/**
 * Default value for maximum number of breadcrumbs added to an event.
 */ const DEFAULT_MAX_BREADCRUMBS = 100;
/**
 * A context to be used for capturing an event.
 * This can either be a Scope, or a partial ScopeContext,
 * or a callback that receives the current scope and returns a new scope to use.
 */ /**
 * Holds additional event information.
 */ class Scope {
    /** Flag if notifying is happening. */ /** Callback for client to receive scope changes. */ /** Callback list that will be called during event processing. */ /** Array of breadcrumbs. */ /** User */ /** Tags */ /** Extra */ /** Contexts */ /** Attachments */ /** Propagation Context for distributed tracing */ /**
   * A place to stash data which is needed at some point in the SDK's event processing pipeline but which shouldn't get
   * sent to Sentry
   */ /** Fingerprint */ /** Severity */ /**
   * Transaction Name
   *
   * IMPORTANT: The transaction name on the scope has nothing to do with root spans/transaction objects.
   * It's purpose is to assign a transaction to the scope that's added to non-transaction events.
   */ /** Session */ /** The client on this scope */ /** Contains the last event id of a captured event.  */ // NOTE: Any field which gets added here should get added not only to the constructor but also to the `clone` method.
    constructor(){
        this._notifyingListeners = false;
        this._scopeListeners = [];
        this._eventProcessors = [];
        this._breadcrumbs = [];
        this._attachments = [];
        this._user = {};
        this._tags = {};
        this._extra = {};
        this._contexts = {};
        this._sdkProcessingMetadata = {};
        this._propagationContext = {
            traceId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$propagationContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateTraceId"])(),
            sampleRand: Math.random()
        };
    }
    /**
   * Clone all data from this scope into a new scope.
   */ clone() {
        const newScope = new Scope();
        newScope._breadcrumbs = [
            ...this._breadcrumbs
        ];
        newScope._tags = {
            ...this._tags
        };
        newScope._extra = {
            ...this._extra
        };
        newScope._contexts = {
            ...this._contexts
        };
        if (this._contexts.flags) {
            // We need to copy the `values` array so insertions on a cloned scope
            // won't affect the original array.
            newScope._contexts.flags = {
                values: [
                    ...this._contexts.flags.values
                ]
            };
        }
        newScope._user = this._user;
        newScope._level = this._level;
        newScope._session = this._session;
        newScope._transactionName = this._transactionName;
        newScope._fingerprint = this._fingerprint;
        newScope._eventProcessors = [
            ...this._eventProcessors
        ];
        newScope._attachments = [
            ...this._attachments
        ];
        newScope._sdkProcessingMetadata = {
            ...this._sdkProcessingMetadata
        };
        newScope._propagationContext = {
            ...this._propagationContext
        };
        newScope._client = this._client;
        newScope._lastEventId = this._lastEventId;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$spanOnScope$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_setSpanForScope"])(newScope, (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$spanOnScope$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_getSpanForScope"])(this));
        return newScope;
    }
    /**
   * Update the client assigned to this scope.
   * Note that not every scope will have a client assigned - isolation scopes & the global scope will generally not have a client,
   * as well as manually created scopes.
   */ setClient(client) {
        this._client = client;
    }
    /**
   * Set the ID of the last captured error event.
   * This is generally only captured on the isolation scope.
   */ setLastEventId(lastEventId) {
        this._lastEventId = lastEventId;
    }
    /**
   * Get the client assigned to this scope.
   */ getClient() {
        return this._client;
    }
    /**
   * Get the ID of the last captured error event.
   * This is generally only available on the isolation scope.
   */ lastEventId() {
        return this._lastEventId;
    }
    /**
   * @inheritDoc
   */ addScopeListener(callback) {
        this._scopeListeners.push(callback);
    }
    /**
   * Add an event processor that will be called before an event is sent.
   */ addEventProcessor(callback) {
        this._eventProcessors.push(callback);
        return this;
    }
    /**
   * Set the user for this scope.
   * Set to `null` to unset the user.
   */ setUser(user) {
        // If null is passed we want to unset everything, but still define keys,
        // so that later down in the pipeline any existing values are cleared.
        this._user = user || {
            email: undefined,
            id: undefined,
            ip_address: undefined,
            username: undefined
        };
        if (this._session) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$session$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateSession"])(this._session, {
                user
            });
        }
        this._notifyScopeListeners();
        return this;
    }
    /**
   * Get the user from this scope.
   */ getUser() {
        return this._user;
    }
    /**
   * Set an object that will be merged into existing tags on the scope,
   * and will be sent as tags data with the event.
   */ setTags(tags) {
        this._tags = {
            ...this._tags,
            ...tags
        };
        this._notifyScopeListeners();
        return this;
    }
    /**
   * Set a single tag that will be sent as tags data with the event.
   */ setTag(key, value) {
        this._tags = {
            ...this._tags,
            [key]: value
        };
        this._notifyScopeListeners();
        return this;
    }
    /**
   * Set an object that will be merged into existing extra on the scope,
   * and will be sent as extra data with the event.
   */ setExtras(extras) {
        this._extra = {
            ...this._extra,
            ...extras
        };
        this._notifyScopeListeners();
        return this;
    }
    /**
   * Set a single key:value extra entry that will be sent as extra data with the event.
   */ setExtra(key, extra) {
        this._extra = {
            ...this._extra,
            [key]: extra
        };
        this._notifyScopeListeners();
        return this;
    }
    /**
   * Sets the fingerprint on the scope to send with the events.
   * @param {string[]} fingerprint Fingerprint to group events in Sentry.
   */ setFingerprint(fingerprint) {
        this._fingerprint = fingerprint;
        this._notifyScopeListeners();
        return this;
    }
    /**
   * Sets the level on the scope for future events.
   */ setLevel(level) {
        this._level = level;
        this._notifyScopeListeners();
        return this;
    }
    /**
   * Sets the transaction name on the scope so that the name of e.g. taken server route or
   * the page location is attached to future events.
   *
   * IMPORTANT: Calling this function does NOT change the name of the currently active
   * root span. If you want to change the name of the active root span, use
   * `Sentry.updateSpanName(rootSpan, 'new name')` instead.
   *
   * By default, the SDK updates the scope's transaction name automatically on sensible
   * occasions, such as a page navigation or when handling a new request on the server.
   */ setTransactionName(name) {
        this._transactionName = name;
        this._notifyScopeListeners();
        return this;
    }
    /**
   * Sets context data with the given name.
   * Data passed as context will be normalized. You can also pass `null` to unset the context.
   * Note that context data will not be merged - calling `setContext` will overwrite an existing context with the same key.
   */ setContext(key, context) {
        if (context === null) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete this._contexts[key];
        } else {
            this._contexts[key] = context;
        }
        this._notifyScopeListeners();
        return this;
    }
    /**
   * Set the session for the scope.
   */ setSession(session) {
        if (!session) {
            delete this._session;
        } else {
            this._session = session;
        }
        this._notifyScopeListeners();
        return this;
    }
    /**
   * Get the session from the scope.
   */ getSession() {
        return this._session;
    }
    /**
   * Updates the scope with provided data. Can work in three variations:
   * - plain object containing updatable attributes
   * - Scope instance that'll extract the attributes from
   * - callback function that'll receive the current scope as an argument and allow for modifications
   */ update(captureContext) {
        if (!captureContext) {
            return this;
        }
        const scopeToMerge = typeof captureContext === 'function' ? captureContext(this) : captureContext;
        const scopeInstance = scopeToMerge instanceof Scope ? scopeToMerge.getScopeData() : (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$is$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isPlainObject"])(scopeToMerge) ? captureContext : undefined;
        const { tags, extra, user, contexts, level, fingerprint = [], propagationContext } = scopeInstance || {};
        this._tags = {
            ...this._tags,
            ...tags
        };
        this._extra = {
            ...this._extra,
            ...extra
        };
        this._contexts = {
            ...this._contexts,
            ...contexts
        };
        if (user && Object.keys(user).length) {
            this._user = user;
        }
        if (level) {
            this._level = level;
        }
        if (fingerprint.length) {
            this._fingerprint = fingerprint;
        }
        if (propagationContext) {
            this._propagationContext = propagationContext;
        }
        return this;
    }
    /**
   * Clears the current scope and resets its properties.
   * Note: The client will not be cleared.
   */ clear() {
        // client is not cleared here on purpose!
        this._breadcrumbs = [];
        this._tags = {};
        this._extra = {};
        this._user = {};
        this._contexts = {};
        this._level = undefined;
        this._transactionName = undefined;
        this._fingerprint = undefined;
        this._session = undefined;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$spanOnScope$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_setSpanForScope"])(this, undefined);
        this._attachments = [];
        this.setPropagationContext({
            traceId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$propagationContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateTraceId"])(),
            sampleRand: Math.random()
        });
        this._notifyScopeListeners();
        return this;
    }
    /**
   * Adds a breadcrumb to the scope.
   * By default, the last 100 breadcrumbs are kept.
   */ addBreadcrumb(breadcrumb, maxBreadcrumbs) {
        const maxCrumbs = typeof maxBreadcrumbs === 'number' ? maxBreadcrumbs : DEFAULT_MAX_BREADCRUMBS;
        // No data has been changed, so don't notify scope listeners
        if (maxCrumbs <= 0) {
            return this;
        }
        const mergedBreadcrumb = {
            timestamp: (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$time$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["dateTimestampInSeconds"])(),
            ...breadcrumb,
            // Breadcrumb messages can theoretically be infinitely large and they're held in memory so we truncate them not to leak (too much) memory
            message: breadcrumb.message ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$string$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["truncate"])(breadcrumb.message, 2048) : breadcrumb.message
        };
        this._breadcrumbs.push(mergedBreadcrumb);
        if (this._breadcrumbs.length > maxCrumbs) {
            this._breadcrumbs = this._breadcrumbs.slice(-maxCrumbs);
            this._client?.recordDroppedEvent('buffer_overflow', 'log_item');
        }
        this._notifyScopeListeners();
        return this;
    }
    /**
   * Get the last breadcrumb of the scope.
   */ getLastBreadcrumb() {
        return this._breadcrumbs[this._breadcrumbs.length - 1];
    }
    /**
   * Clear all breadcrumbs from the scope.
   */ clearBreadcrumbs() {
        this._breadcrumbs = [];
        this._notifyScopeListeners();
        return this;
    }
    /**
   * Add an attachment to the scope.
   */ addAttachment(attachment) {
        this._attachments.push(attachment);
        return this;
    }
    /**
   * Clear all attachments from the scope.
   */ clearAttachments() {
        this._attachments = [];
        return this;
    }
    /**
   * Get the data of this scope, which should be applied to an event during processing.
   */ getScopeData() {
        return {
            breadcrumbs: this._breadcrumbs,
            attachments: this._attachments,
            contexts: this._contexts,
            tags: this._tags,
            extra: this._extra,
            user: this._user,
            level: this._level,
            fingerprint: this._fingerprint || [],
            eventProcessors: this._eventProcessors,
            propagationContext: this._propagationContext,
            sdkProcessingMetadata: this._sdkProcessingMetadata,
            transactionName: this._transactionName,
            span: (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$spanOnScope$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_getSpanForScope"])(this)
        };
    }
    /**
   * Add data which will be accessible during event processing but won't get sent to Sentry.
   */ setSDKProcessingMetadata(newData) {
        this._sdkProcessingMetadata = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$merge$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["merge"])(this._sdkProcessingMetadata, newData, 2);
        return this;
    }
    /**
   * Add propagation context to the scope, used for distributed tracing
   */ setPropagationContext(context) {
        this._propagationContext = context;
        return this;
    }
    /**
   * Get propagation context from the scope, used for distributed tracing
   */ getPropagationContext() {
        return this._propagationContext;
    }
    /**
   * Capture an exception for this scope.
   *
   * @returns {string} The id of the captured Sentry event.
   */ captureException(exception, hint) {
        const eventId = hint?.event_id || (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$misc$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["uuid4"])();
        if (!this._client) {
            __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$debug$2d$build$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEBUG_BUILD"] && __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$debug$2d$logger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["debug"].warn('No client configured on scope - will not capture exception!');
            return eventId;
        }
        const syntheticException = new Error('Sentry syntheticException');
        this._client.captureException(exception, {
            originalException: exception,
            syntheticException,
            ...hint,
            event_id: eventId
        }, this);
        return eventId;
    }
    /**
   * Capture a message for this scope.
   *
   * @returns {string} The id of the captured message.
   */ captureMessage(message, level, hint) {
        const eventId = hint?.event_id || (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$misc$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["uuid4"])();
        if (!this._client) {
            __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$debug$2d$build$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEBUG_BUILD"] && __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$debug$2d$logger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["debug"].warn('No client configured on scope - will not capture message!');
            return eventId;
        }
        const syntheticException = new Error(message);
        this._client.captureMessage(message, level, {
            originalException: message,
            syntheticException,
            ...hint,
            event_id: eventId
        }, this);
        return eventId;
    }
    /**
   * Capture a Sentry event for this scope.
   *
   * @returns {string} The id of the captured event.
   */ captureEvent(event, hint) {
        const eventId = hint?.event_id || (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$misc$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["uuid4"])();
        if (!this._client) {
            __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$debug$2d$build$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEBUG_BUILD"] && __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$debug$2d$logger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["debug"].warn('No client configured on scope - will not capture event!');
            return eventId;
        }
        this._client.captureEvent(event, {
            ...hint,
            event_id: eventId
        }, this);
        return eventId;
    }
    /**
   * This will be called on every set call.
   */ _notifyScopeListeners() {
        // We need this check for this._notifyingListeners to be able to work on scope during updates
        // If this check is not here we'll produce endless recursion when something is done with the scope
        // during the callback.
        if (!this._notifyingListeners) {
            this._notifyingListeners = true;
            this._scopeListeners.forEach((callback)=>{
                callback(this);
            });
            this._notifyingListeners = false;
        }
    }
}
;
 //# sourceMappingURL=scope.js.map
}),
"[project]/dashboard/node_modules/@sentry/core/build/esm/defaultScopes.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getDefaultCurrentScope",
    ()=>getDefaultCurrentScope,
    "getDefaultIsolationScope",
    ()=>getDefaultIsolationScope
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$carrier$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/carrier.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$scope$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/scope.js [app-client] (ecmascript)");
;
;
/** Get the default current scope. */ function getDefaultCurrentScope() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$carrier$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getGlobalSingleton"])('defaultCurrentScope', ()=>new __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$scope$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Scope"]());
}
/** Get the default isolation scope. */ function getDefaultIsolationScope() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$carrier$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getGlobalSingleton"])('defaultIsolationScope', ()=>new __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$scope$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Scope"]());
}
;
 //# sourceMappingURL=defaultScopes.js.map
}),
"[project]/dashboard/node_modules/@sentry/core/build/esm/asyncContext/stackStrategy.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AsyncContextStack",
    ()=>AsyncContextStack,
    "getStackAsyncContextStrategy",
    ()=>getStackAsyncContextStrategy
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$defaultScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/defaultScopes.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$scope$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/scope.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$is$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/is.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$carrier$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/carrier.js [app-client] (ecmascript)");
;
;
;
;
/**
 * This is an object that holds a stack of scopes.
 */ class AsyncContextStack {
    constructor(scope, isolationScope){
        let assignedScope;
        if (!scope) {
            assignedScope = new __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$scope$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Scope"]();
        } else {
            assignedScope = scope;
        }
        let assignedIsolationScope;
        if (!isolationScope) {
            assignedIsolationScope = new __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$scope$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Scope"]();
        } else {
            assignedIsolationScope = isolationScope;
        }
        // scope stack for domains or the process
        this._stack = [
            {
                scope: assignedScope
            }
        ];
        this._isolationScope = assignedIsolationScope;
    }
    /**
   * Fork a scope for the stack.
   */ withScope(callback) {
        const scope = this._pushScope();
        let maybePromiseResult;
        try {
            maybePromiseResult = callback(scope);
        } catch (e) {
            this._popScope();
            throw e;
        }
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$is$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isThenable"])(maybePromiseResult)) {
            // @ts-expect-error - isThenable returns the wrong type
            return maybePromiseResult.then((res)=>{
                this._popScope();
                return res;
            }, (e)=>{
                this._popScope();
                throw e;
            });
        }
        this._popScope();
        return maybePromiseResult;
    }
    /**
   * Get the client of the stack.
   */ getClient() {
        return this.getStackTop().client;
    }
    /**
   * Returns the scope of the top stack.
   */ getScope() {
        return this.getStackTop().scope;
    }
    /**
   * Get the isolation scope for the stack.
   */ getIsolationScope() {
        return this._isolationScope;
    }
    /**
   * Returns the topmost scope layer in the order domain > local > process.
   */ getStackTop() {
        return this._stack[this._stack.length - 1];
    }
    /**
   * Push a scope to the stack.
   */ _pushScope() {
        // We want to clone the content of prev scope
        const scope = this.getScope().clone();
        this._stack.push({
            client: this.getClient(),
            scope
        });
        return scope;
    }
    /**
   * Pop a scope from the stack.
   */ _popScope() {
        if (this._stack.length <= 1) return false;
        return !!this._stack.pop();
    }
}
/**
 * Get the global async context stack.
 * This will be removed during the v8 cycle and is only here to make migration easier.
 */ function getAsyncContextStack() {
    const registry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$carrier$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMainCarrier"])();
    const sentry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$carrier$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSentryCarrier"])(registry);
    return sentry.stack = sentry.stack || new AsyncContextStack((0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$defaultScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDefaultCurrentScope"])(), (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$defaultScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDefaultIsolationScope"])());
}
function withScope(callback) {
    return getAsyncContextStack().withScope(callback);
}
function withSetScope(scope, callback) {
    const stack = getAsyncContextStack();
    return stack.withScope(()=>{
        stack.getStackTop().scope = scope;
        return callback(scope);
    });
}
function withIsolationScope(callback) {
    return getAsyncContextStack().withScope(()=>{
        return callback(getAsyncContextStack().getIsolationScope());
    });
}
/**
 * Get the stack-based async context strategy.
 */ function getStackAsyncContextStrategy() {
    return {
        withIsolationScope,
        withScope,
        withSetScope,
        withSetIsolationScope: (_isolationScope, callback)=>{
            return withIsolationScope(callback);
        },
        getCurrentScope: ()=>getAsyncContextStack().getScope(),
        getIsolationScope: ()=>getAsyncContextStack().getIsolationScope()
    };
}
;
 //# sourceMappingURL=stackStrategy.js.map
}),
"[project]/dashboard/node_modules/@sentry/core/build/esm/asyncContext/index.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getAsyncContextStrategy",
    ()=>getAsyncContextStrategy,
    "setAsyncContextStrategy",
    ()=>setAsyncContextStrategy
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$carrier$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/carrier.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$asyncContext$2f$stackStrategy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/asyncContext/stackStrategy.js [app-client] (ecmascript)");
;
;
/**
 * @private Private API with no semver guarantees!
 *
 * Sets the global async context strategy
 */ function setAsyncContextStrategy(strategy) {
    // Get main carrier (global for every environment)
    const registry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$carrier$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMainCarrier"])();
    const sentry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$carrier$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSentryCarrier"])(registry);
    sentry.acs = strategy;
}
/**
 * Get the current async context strategy.
 * If none has been setup, the default will be used.
 */ function getAsyncContextStrategy(carrier) {
    const sentry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$carrier$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSentryCarrier"])(carrier);
    if (sentry.acs) {
        return sentry.acs;
    }
    // Otherwise, use the default one (stack)
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$asyncContext$2f$stackStrategy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getStackAsyncContextStrategy"])();
}
;
 //# sourceMappingURL=index.js.map
}),
"[project]/dashboard/node_modules/@sentry/core/build/esm/currentScopes.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getClient",
    ()=>getClient,
    "getCurrentScope",
    ()=>getCurrentScope,
    "getGlobalScope",
    ()=>getGlobalScope,
    "getIsolationScope",
    ()=>getIsolationScope,
    "getTraceContextFromScope",
    ()=>getTraceContextFromScope,
    "withIsolationScope",
    ()=>withIsolationScope,
    "withScope",
    ()=>withScope
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$asyncContext$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/asyncContext/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$carrier$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/carrier.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$scope$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/scope.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$propagationContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/propagationContext.js [app-client] (ecmascript)");
;
;
;
;
/**
 * Get the currently active scope.
 */ function getCurrentScope() {
    const carrier = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$carrier$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMainCarrier"])();
    const acs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$asyncContext$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAsyncContextStrategy"])(carrier);
    return acs.getCurrentScope();
}
/**
 * Get the currently active isolation scope.
 * The isolation scope is active for the current execution context.
 */ function getIsolationScope() {
    const carrier = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$carrier$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMainCarrier"])();
    const acs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$asyncContext$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAsyncContextStrategy"])(carrier);
    return acs.getIsolationScope();
}
/**
 * Get the global scope.
 * This scope is applied to _all_ events.
 */ function getGlobalScope() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$carrier$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getGlobalSingleton"])('globalScope', ()=>new __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$scope$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Scope"]());
}
/**
 * Creates a new scope with and executes the given operation within.
 * The scope is automatically removed once the operation
 * finishes or throws.
 */ /**
 * Either creates a new active scope, or sets the given scope as active scope in the given callback.
 */ function withScope(...rest) {
    const carrier = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$carrier$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMainCarrier"])();
    const acs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$asyncContext$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAsyncContextStrategy"])(carrier);
    // If a scope is defined, we want to make this the active scope instead of the default one
    if (rest.length === 2) {
        const [scope, callback] = rest;
        if (!scope) {
            return acs.withScope(callback);
        }
        return acs.withSetScope(scope, callback);
    }
    return acs.withScope(rest[0]);
}
/**
 * Attempts to fork the current isolation scope and the current scope based on the current async context strategy. If no
 * async context strategy is set, the isolation scope and the current scope will not be forked (this is currently the
 * case, for example, in the browser).
 *
 * Usage of this function in environments without async context strategy is discouraged and may lead to unexpected behaviour.
 *
 * This function is intended for Sentry SDK and SDK integration development. It is not recommended to be used in "normal"
 * applications directly because it comes with pitfalls. Use at your own risk!
 */ /**
 * Either creates a new active isolation scope, or sets the given isolation scope as active scope in the given callback.
 */ function withIsolationScope(...rest) {
    const carrier = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$carrier$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMainCarrier"])();
    const acs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$asyncContext$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAsyncContextStrategy"])(carrier);
    // If a scope is defined, we want to make this the active scope instead of the default one
    if (rest.length === 2) {
        const [isolationScope, callback] = rest;
        if (!isolationScope) {
            return acs.withIsolationScope(callback);
        }
        return acs.withSetIsolationScope(isolationScope, callback);
    }
    return acs.withIsolationScope(rest[0]);
}
/**
 * Get the currently active client.
 */ function getClient() {
    return getCurrentScope().getClient();
}
/**
 * Get a trace context for the given scope.
 */ function getTraceContextFromScope(scope) {
    const propagationContext = scope.getPropagationContext();
    const { traceId, parentSpanId, propagationSpanId } = propagationContext;
    const traceContext = {
        trace_id: traceId,
        span_id: propagationSpanId || (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$propagationContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateSpanId"])()
    };
    if (parentSpanId) {
        traceContext.parent_span_id = parentSpanId;
    }
    return traceContext;
}
;
 //# sourceMappingURL=currentScopes.js.map
}),
"[project]/dashboard/node_modules/@sentry/core/build/esm/constants.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_ENVIRONMENT",
    ()=>DEFAULT_ENVIRONMENT
]);
const DEFAULT_ENVIRONMENT = 'production';
;
 //# sourceMappingURL=constants.js.map
}),
"[project]/dashboard/node_modules/@sentry/core/build/esm/utils/syncpromise.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SyncPromise",
    ()=>SyncPromise,
    "rejectedSyncPromise",
    ()=>rejectedSyncPromise,
    "resolvedSyncPromise",
    ()=>resolvedSyncPromise
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$is$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/is.js [app-client] (ecmascript)");
;
/* eslint-disable @typescript-eslint/no-explicit-any */ /** SyncPromise internal states */ const STATE_PENDING = 0;
const STATE_RESOLVED = 1;
const STATE_REJECTED = 2;
/**
 * Creates a resolved sync promise.
 *
 * @param value the value to resolve the promise with
 * @returns the resolved sync promise
 */ function resolvedSyncPromise(value) {
    return new SyncPromise((resolve)=>{
        resolve(value);
    });
}
/**
 * Creates a rejected sync promise.
 *
 * @param value the value to reject the promise with
 * @returns the rejected sync promise
 */ function rejectedSyncPromise(reason) {
    return new SyncPromise((_, reject)=>{
        reject(reason);
    });
}
/**
 * Thenable class that behaves like a Promise and follows it's interface
 * but is not async internally
 */ class SyncPromise {
    constructor(executor){
        this._state = STATE_PENDING;
        this._handlers = [];
        this._runExecutor(executor);
    }
    /** @inheritdoc */ then(onfulfilled, onrejected) {
        return new SyncPromise((resolve, reject)=>{
            this._handlers.push([
                false,
                (result)=>{
                    if (!onfulfilled) {
                        // TODO: ¯\_(ツ)_/¯
                        // TODO: FIXME
                        resolve(result);
                    } else {
                        try {
                            resolve(onfulfilled(result));
                        } catch (e) {
                            reject(e);
                        }
                    }
                },
                (reason)=>{
                    if (!onrejected) {
                        reject(reason);
                    } else {
                        try {
                            resolve(onrejected(reason));
                        } catch (e) {
                            reject(e);
                        }
                    }
                }
            ]);
            this._executeHandlers();
        });
    }
    /** @inheritdoc */ catch(onrejected) {
        return this.then((val)=>val, onrejected);
    }
    /** @inheritdoc */ finally(onfinally) {
        return new SyncPromise((resolve, reject)=>{
            let val;
            let isRejected;
            return this.then((value)=>{
                isRejected = false;
                val = value;
                if (onfinally) {
                    onfinally();
                }
            }, (reason)=>{
                isRejected = true;
                val = reason;
                if (onfinally) {
                    onfinally();
                }
            }).then(()=>{
                if (isRejected) {
                    reject(val);
                    return;
                }
                resolve(val);
            });
        });
    }
    /** Excute the resolve/reject handlers. */ _executeHandlers() {
        if (this._state === STATE_PENDING) {
            return;
        }
        const cachedHandlers = this._handlers.slice();
        this._handlers = [];
        cachedHandlers.forEach((handler)=>{
            if (handler[0]) {
                return;
            }
            if (this._state === STATE_RESOLVED) {
                handler[1](this._value);
            }
            if (this._state === STATE_REJECTED) {
                handler[2](this._value);
            }
            handler[0] = true;
        });
    }
    /** Run the executor for the SyncPromise. */ _runExecutor(executor) {
        const setResult = (state, value)=>{
            if (this._state !== STATE_PENDING) {
                return;
            }
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$is$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isThenable"])(value)) {
                void value.then(resolve, reject);
                return;
            }
            this._state = state;
            this._value = value;
            this._executeHandlers();
        };
        const resolve = (value)=>{
            setResult(STATE_RESOLVED, value);
        };
        const reject = (reason)=>{
            setResult(STATE_REJECTED, reason);
        };
        try {
            executor(resolve, reject);
        } catch (e) {
            reject(e);
        }
    }
}
;
 //# sourceMappingURL=syncpromise.js.map
}),
"[project]/dashboard/node_modules/@sentry/core/build/esm/eventProcessors.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "notifyEventProcessors",
    ()=>notifyEventProcessors
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$debug$2d$build$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/debug-build.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$debug$2d$logger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/debug-logger.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$is$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/is.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$syncpromise$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/syncpromise.js [app-client] (ecmascript)");
;
;
;
;
/**
 * Process an array of event processors, returning the processed event (or `null` if the event was dropped).
 */ function notifyEventProcessors(processors, event, hint, index = 0) {
    try {
        const result = _notifyEventProcessors(event, hint, processors, index);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$is$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isThenable"])(result) ? result : (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$syncpromise$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["resolvedSyncPromise"])(result);
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$syncpromise$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["rejectedSyncPromise"])(error);
    }
}
function _notifyEventProcessors(event, hint, processors, index) {
    const processor = processors[index];
    if (!event || !processor) {
        return event;
    }
    const result = processor({
        ...event
    }, hint);
    __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$debug$2d$build$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEBUG_BUILD"] && result === null && __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$debug$2d$logger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["debug"].log(`Event processor "${processor.id || '?'}" dropped event`);
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$is$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isThenable"])(result)) {
        return result.then((final)=>_notifyEventProcessors(final, hint, processors, index + 1));
    }
    return _notifyEventProcessors(result, hint, processors, index + 1);
}
;
 //# sourceMappingURL=eventProcessors.js.map
}),
"[project]/dashboard/node_modules/@sentry/core/build/esm/semanticAttributes.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Use this attribute to represent the source of a span.
 * Should be one of: custom, url, route, view, component, task, unknown
 *
 */ __turbopack_context__.s([
    "SEMANTIC_ATTRIBUTE_CACHE_HIT",
    ()=>SEMANTIC_ATTRIBUTE_CACHE_HIT,
    "SEMANTIC_ATTRIBUTE_CACHE_ITEM_SIZE",
    ()=>SEMANTIC_ATTRIBUTE_CACHE_ITEM_SIZE,
    "SEMANTIC_ATTRIBUTE_CACHE_KEY",
    ()=>SEMANTIC_ATTRIBUTE_CACHE_KEY,
    "SEMANTIC_ATTRIBUTE_EXCLUSIVE_TIME",
    ()=>SEMANTIC_ATTRIBUTE_EXCLUSIVE_TIME,
    "SEMANTIC_ATTRIBUTE_HTTP_REQUEST_METHOD",
    ()=>SEMANTIC_ATTRIBUTE_HTTP_REQUEST_METHOD,
    "SEMANTIC_ATTRIBUTE_PROFILE_ID",
    ()=>SEMANTIC_ATTRIBUTE_PROFILE_ID,
    "SEMANTIC_ATTRIBUTE_SENTRY_CUSTOM_SPAN_NAME",
    ()=>SEMANTIC_ATTRIBUTE_SENTRY_CUSTOM_SPAN_NAME,
    "SEMANTIC_ATTRIBUTE_SENTRY_IDLE_SPAN_FINISH_REASON",
    ()=>SEMANTIC_ATTRIBUTE_SENTRY_IDLE_SPAN_FINISH_REASON,
    "SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_UNIT",
    ()=>SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_UNIT,
    "SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_VALUE",
    ()=>SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_VALUE,
    "SEMANTIC_ATTRIBUTE_SENTRY_OP",
    ()=>SEMANTIC_ATTRIBUTE_SENTRY_OP,
    "SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN",
    ()=>SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN,
    "SEMANTIC_ATTRIBUTE_SENTRY_PREVIOUS_TRACE_SAMPLE_RATE",
    ()=>SEMANTIC_ATTRIBUTE_SENTRY_PREVIOUS_TRACE_SAMPLE_RATE,
    "SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE",
    ()=>SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE,
    "SEMANTIC_ATTRIBUTE_SENTRY_SOURCE",
    ()=>SEMANTIC_ATTRIBUTE_SENTRY_SOURCE,
    "SEMANTIC_ATTRIBUTE_URL_FULL",
    ()=>SEMANTIC_ATTRIBUTE_URL_FULL,
    "SEMANTIC_LINK_ATTRIBUTE_LINK_TYPE",
    ()=>SEMANTIC_LINK_ATTRIBUTE_LINK_TYPE
]);
const SEMANTIC_ATTRIBUTE_SENTRY_SOURCE = 'sentry.source';
/**
 * Attributes that holds the sample rate that was locally applied to a span.
 * If this attribute is not defined, it means that the span inherited a sampling decision.
 *
 * NOTE: Is only defined on root spans.
 */ const SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE = 'sentry.sample_rate';
/**
 * Attribute holding the sample rate of the previous trace.
 * This is used to sample consistently across subsequent traces in the browser SDK.
 *
 * Note: Only defined on root spans, if opted into consistent sampling
 */ const SEMANTIC_ATTRIBUTE_SENTRY_PREVIOUS_TRACE_SAMPLE_RATE = 'sentry.previous_trace_sample_rate';
/**
 * Use this attribute to represent the operation of a span.
 */ const SEMANTIC_ATTRIBUTE_SENTRY_OP = 'sentry.op';
/**
 * Use this attribute to represent the origin of a span.
 */ const SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN = 'sentry.origin';
/** The reason why an idle span finished. */ const SEMANTIC_ATTRIBUTE_SENTRY_IDLE_SPAN_FINISH_REASON = 'sentry.idle_span_finish_reason';
/** The unit of a measurement, which may be stored as a TimedEvent. */ const SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_UNIT = 'sentry.measurement_unit';
/** The value of a measurement, which may be stored as a TimedEvent. */ const SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_VALUE = 'sentry.measurement_value';
/**
 * A custom span name set by users guaranteed to be taken over any automatically
 * inferred name. This attribute is removed before the span is sent.
 *
 * @internal only meant for internal SDK usage
 * @hidden
 */ const SEMANTIC_ATTRIBUTE_SENTRY_CUSTOM_SPAN_NAME = 'sentry.custom_span_name';
/**
 * The id of the profile that this span occurred in.
 */ const SEMANTIC_ATTRIBUTE_PROFILE_ID = 'sentry.profile_id';
const SEMANTIC_ATTRIBUTE_EXCLUSIVE_TIME = 'sentry.exclusive_time';
const SEMANTIC_ATTRIBUTE_CACHE_HIT = 'cache.hit';
const SEMANTIC_ATTRIBUTE_CACHE_KEY = 'cache.key';
const SEMANTIC_ATTRIBUTE_CACHE_ITEM_SIZE = 'cache.item_size';
/** TODO: Remove these once we update to latest semantic conventions */ const SEMANTIC_ATTRIBUTE_HTTP_REQUEST_METHOD = 'http.request.method';
const SEMANTIC_ATTRIBUTE_URL_FULL = 'url.full';
/**
 * A span link attribute to mark the link as a special span link.
 *
 * Known values:
 * - `previous_trace`: The span links to the frontend root span of the previous trace.
 * - `next_trace`: The span links to the frontend root span of the next trace. (Not set by the SDK)
 *
 * Other values may be set as appropriate.
 * @see https://develop.sentry.dev/sdk/telemetry/traces/span-links/#link-types
 */ const SEMANTIC_LINK_ATTRIBUTE_LINK_TYPE = 'sentry.link.type';
;
 //# sourceMappingURL=semanticAttributes.js.map
}),
"[project]/dashboard/node_modules/@sentry/core/build/esm/utils/baggage.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MAX_BAGGAGE_STRING_LENGTH",
    ()=>MAX_BAGGAGE_STRING_LENGTH,
    "SENTRY_BAGGAGE_KEY_PREFIX",
    ()=>SENTRY_BAGGAGE_KEY_PREFIX,
    "SENTRY_BAGGAGE_KEY_PREFIX_REGEX",
    ()=>SENTRY_BAGGAGE_KEY_PREFIX_REGEX,
    "baggageHeaderToDynamicSamplingContext",
    ()=>baggageHeaderToDynamicSamplingContext,
    "dynamicSamplingContextToSentryBaggageHeader",
    ()=>dynamicSamplingContextToSentryBaggageHeader,
    "objectToBaggageHeader",
    ()=>objectToBaggageHeader,
    "parseBaggageHeader",
    ()=>parseBaggageHeader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$debug$2d$build$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/debug-build.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$debug$2d$logger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/debug-logger.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$is$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/is.js [app-client] (ecmascript)");
;
;
;
const SENTRY_BAGGAGE_KEY_PREFIX = 'sentry-';
const SENTRY_BAGGAGE_KEY_PREFIX_REGEX = /^sentry-/;
/**
 * Max length of a serialized baggage string
 *
 * https://www.w3.org/TR/baggage/#limits
 */ const MAX_BAGGAGE_STRING_LENGTH = 8192;
/**
 * Takes a baggage header and turns it into Dynamic Sampling Context, by extracting all the "sentry-" prefixed values
 * from it.
 *
 * @param baggageHeader A very bread definition of a baggage header as it might appear in various frameworks.
 * @returns The Dynamic Sampling Context that was found on `baggageHeader`, if there was any, `undefined` otherwise.
 */ function baggageHeaderToDynamicSamplingContext(// Very liberal definition of what any incoming header might look like
baggageHeader) {
    const baggageObject = parseBaggageHeader(baggageHeader);
    if (!baggageObject) {
        return undefined;
    }
    // Read all "sentry-" prefixed values out of the baggage object and put it onto a dynamic sampling context object.
    const dynamicSamplingContext = Object.entries(baggageObject).reduce((acc, [key, value])=>{
        if (key.match(SENTRY_BAGGAGE_KEY_PREFIX_REGEX)) {
            const nonPrefixedKey = key.slice(SENTRY_BAGGAGE_KEY_PREFIX.length);
            acc[nonPrefixedKey] = value;
        }
        return acc;
    }, {});
    // Only return a dynamic sampling context object if there are keys in it.
    // A keyless object means there were no sentry values on the header, which means that there is no DSC.
    if (Object.keys(dynamicSamplingContext).length > 0) {
        return dynamicSamplingContext;
    } else {
        return undefined;
    }
}
/**
 * Turns a Dynamic Sampling Object into a baggage header by prefixing all the keys on the object with "sentry-".
 *
 * @param dynamicSamplingContext The Dynamic Sampling Context to turn into a header. For convenience and compatibility
 * with the `getDynamicSamplingContext` method on the Transaction class ,this argument can also be `undefined`. If it is
 * `undefined` the function will return `undefined`.
 * @returns a baggage header, created from `dynamicSamplingContext`, or `undefined` either if `dynamicSamplingContext`
 * was `undefined`, or if `dynamicSamplingContext` didn't contain any values.
 */ function dynamicSamplingContextToSentryBaggageHeader(// this also takes undefined for convenience and bundle size in other places
dynamicSamplingContext) {
    if (!dynamicSamplingContext) {
        return undefined;
    }
    // Prefix all DSC keys with "sentry-" and put them into a new object
    const sentryPrefixedDSC = Object.entries(dynamicSamplingContext).reduce((acc, [dscKey, dscValue])=>{
        if (dscValue) {
            acc[`${SENTRY_BAGGAGE_KEY_PREFIX}${dscKey}`] = dscValue;
        }
        return acc;
    }, {});
    return objectToBaggageHeader(sentryPrefixedDSC);
}
/**
 * Take a baggage header and parse it into an object.
 */ function parseBaggageHeader(baggageHeader) {
    if (!baggageHeader || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$is$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isString"])(baggageHeader) && !Array.isArray(baggageHeader)) {
        return undefined;
    }
    if (Array.isArray(baggageHeader)) {
        // Combine all baggage headers into one object containing the baggage values so we can later read the Sentry-DSC-values from it
        return baggageHeader.reduce((acc, curr)=>{
            const currBaggageObject = baggageHeaderToObject(curr);
            Object.entries(currBaggageObject).forEach(([key, value])=>{
                acc[key] = value;
            });
            return acc;
        }, {});
    }
    return baggageHeaderToObject(baggageHeader);
}
/**
 * Will parse a baggage header, which is a simple key-value map, into a flat object.
 *
 * @param baggageHeader The baggage header to parse.
 * @returns a flat object containing all the key-value pairs from `baggageHeader`.
 */ function baggageHeaderToObject(baggageHeader) {
    return baggageHeader.split(',').map((baggageEntry)=>{
        const eqIdx = baggageEntry.indexOf('=');
        if (eqIdx === -1) {
            // Likely an invalid entry
            return [];
        }
        const key = baggageEntry.slice(0, eqIdx);
        const value = baggageEntry.slice(eqIdx + 1);
        return [
            key,
            value
        ].map((keyOrValue)=>{
            try {
                return decodeURIComponent(keyOrValue.trim());
            } catch  {
                // We ignore errors here, e.g. if the value cannot be URL decoded.
                // This will then be skipped in the next step
                return;
            }
        });
    }).reduce((acc, [key, value])=>{
        if (key && value) {
            acc[key] = value;
        }
        return acc;
    }, {});
}
/**
 * Turns a flat object (key-value pairs) into a baggage header, which is also just key-value pairs.
 *
 * @param object The object to turn into a baggage header.
 * @returns a baggage header string, or `undefined` if the object didn't have any values, since an empty baggage header
 * is not spec compliant.
 */ function objectToBaggageHeader(object) {
    if (Object.keys(object).length === 0) {
        // An empty baggage header is not spec compliant: We return undefined.
        return undefined;
    }
    return Object.entries(object).reduce((baggageHeader, [objectKey, objectValue], currentIndex)=>{
        const baggageEntry = `${encodeURIComponent(objectKey)}=${encodeURIComponent(objectValue)}`;
        const newBaggageHeader = currentIndex === 0 ? baggageEntry : `${baggageHeader},${baggageEntry}`;
        if (newBaggageHeader.length > MAX_BAGGAGE_STRING_LENGTH) {
            __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$debug$2d$build$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEBUG_BUILD"] && __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$debug$2d$logger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["debug"].warn(`Not adding key: ${objectKey} with val: ${objectValue} to baggage header due to exceeding baggage size limits.`);
            return baggageHeader;
        } else {
            return newBaggageHeader;
        }
    }, '');
}
;
 //# sourceMappingURL=baggage.js.map
}),
"[project]/dashboard/node_modules/@sentry/core/build/esm/utils/dsn.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "dsnFromString",
    ()=>dsnFromString,
    "dsnToString",
    ()=>dsnToString,
    "extractOrgIdFromClient",
    ()=>extractOrgIdFromClient,
    "extractOrgIdFromDsnHost",
    ()=>extractOrgIdFromDsnHost,
    "makeDsn",
    ()=>makeDsn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$debug$2d$build$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/debug-build.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$debug$2d$logger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/debug-logger.js [app-client] (ecmascript)");
;
;
/** Regular expression used to extract org ID from a DSN host. */ const ORG_ID_REGEX = /^o(\d+)\./;
/** Regular expression used to parse a Dsn. */ const DSN_REGEX = /^(?:(\w+):)\/\/(?:(\w+)(?::(\w+)?)?@)([\w.-]+)(?::(\d+))?\/(.+)/;
function isValidProtocol(protocol) {
    return protocol === 'http' || protocol === 'https';
}
/**
 * Renders the string representation of this Dsn.
 *
 * By default, this will render the public representation without the password
 * component. To get the deprecated private representation, set `withPassword`
 * to true.
 *
 * @param withPassword When set to true, the password will be included.
 */ function dsnToString(dsn, withPassword = false) {
    const { host, path, pass, port, projectId, protocol, publicKey } = dsn;
    return `${protocol}://${publicKey}${withPassword && pass ? `:${pass}` : ''}` + `@${host}${port ? `:${port}` : ''}/${path ? `${path}/` : path}${projectId}`;
}
/**
 * Parses a Dsn from a given string.
 *
 * @param str A Dsn as string
 * @returns Dsn as DsnComponents or undefined if @param str is not a valid DSN string
 */ function dsnFromString(str) {
    const match = DSN_REGEX.exec(str);
    if (!match) {
        // This should be logged to the console
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$debug$2d$logger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["consoleSandbox"])(()=>{
            // eslint-disable-next-line no-console
            console.error(`Invalid Sentry Dsn: ${str}`);
        });
        return undefined;
    }
    const [protocol, publicKey, pass = '', host = '', port = '', lastPath = ''] = match.slice(1);
    let path = '';
    let projectId = lastPath;
    const split = projectId.split('/');
    if (split.length > 1) {
        path = split.slice(0, -1).join('/');
        projectId = split.pop();
    }
    if (projectId) {
        const projectMatch = projectId.match(/^\d+/);
        if (projectMatch) {
            projectId = projectMatch[0];
        }
    }
    return dsnFromComponents({
        host,
        pass,
        path,
        projectId,
        port,
        protocol: protocol,
        publicKey
    });
}
function dsnFromComponents(components) {
    return {
        protocol: components.protocol,
        publicKey: components.publicKey || '',
        pass: components.pass || '',
        host: components.host,
        port: components.port || '',
        path: components.path || '',
        projectId: components.projectId
    };
}
function validateDsn(dsn) {
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$debug$2d$build$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEBUG_BUILD"]) {
        return true;
    }
    const { port, projectId, protocol } = dsn;
    const requiredComponents = [
        'protocol',
        'publicKey',
        'host',
        'projectId'
    ];
    const hasMissingRequiredComponent = requiredComponents.find((component)=>{
        if (!dsn[component]) {
            __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$debug$2d$logger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["debug"].error(`Invalid Sentry Dsn: ${component} missing`);
            return true;
        }
        return false;
    });
    if (hasMissingRequiredComponent) {
        return false;
    }
    if (!projectId.match(/^\d+$/)) {
        __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$debug$2d$logger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["debug"].error(`Invalid Sentry Dsn: Invalid projectId ${projectId}`);
        return false;
    }
    if (!isValidProtocol(protocol)) {
        __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$debug$2d$logger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["debug"].error(`Invalid Sentry Dsn: Invalid protocol ${protocol}`);
        return false;
    }
    if (port && isNaN(parseInt(port, 10))) {
        __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$debug$2d$logger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["debug"].error(`Invalid Sentry Dsn: Invalid port ${port}`);
        return false;
    }
    return true;
}
/**
 * Extract the org ID from a DSN host.
 *
 * @param host The host from a DSN
 * @returns The org ID if found, undefined otherwise
 */ function extractOrgIdFromDsnHost(host) {
    const match = host.match(ORG_ID_REGEX);
    return match?.[1];
}
/**
 *  Returns the organization ID of the client.
 *
 *  The organization ID is extracted from the DSN. If the client options include a `orgId`, this will always take precedence.
 */ function extractOrgIdFromClient(client) {
    const options = client.getOptions();
    const { host } = client.getDsn() || {};
    let org_id;
    if (options.orgId) {
        org_id = String(options.orgId);
    } else if (host) {
        org_id = extractOrgIdFromDsnHost(host);
    }
    return org_id;
}
/**
 * Creates a valid Sentry Dsn object, identifying a Sentry instance and project.
 * @returns a valid DsnComponents object or `undefined` if @param from is an invalid DSN source
 */ function makeDsn(from) {
    const components = typeof from === 'string' ? dsnFromString(from) : dsnFromComponents(from);
    if (!components || !validateDsn(components)) {
        return undefined;
    }
    return components;
}
;
 //# sourceMappingURL=dsn.js.map
}),
"[project]/dashboard/node_modules/@sentry/core/build/esm/utils/hasSpansEnabled.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "hasSpansEnabled",
    ()=>hasSpansEnabled
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/currentScopes.js [app-client] (ecmascript)");
;
// Treeshakable guard to remove all code related to tracing
/**
 * Determines if span recording is currently enabled.
 *
 * Spans are recorded when at least one of `tracesSampleRate` and `tracesSampler`
 * is defined in the SDK config. This function does not make any assumption about
 * sampling decisions, it only checks if the SDK is configured to record spans.
 *
 * Important: This function only determines if span recording is enabled. Trace
 * continuation and propagation is separately controlled and not covered by this function.
 * If this function returns `false`, traces can still be propagated (which is what
 * we refer to by "Tracing without Performance")
 * @see https://develop.sentry.dev/sdk/telemetry/traces/tracing-without-performance/
 *
 * @param maybeOptions An SDK options object to be passed to this function.
 * If this option is not provided, the function will use the current client's options.
 */ function hasSpansEnabled(maybeOptions) {
    if (typeof __SENTRY_TRACING__ === 'boolean' && !__SENTRY_TRACING__) {
        return false;
    }
    const options = maybeOptions || (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getClient"])()?.getOptions();
    return !!options && // Note: This check is `!= null`, meaning "nullish". `0` is not "nullish", `undefined` and `null` are. (This comment was brought to you by 15 minutes of questioning life)
    (options.tracesSampleRate != null || !!options.tracesSampler);
}
;
 //# sourceMappingURL=hasSpansEnabled.js.map
}),
"[project]/dashboard/node_modules/@sentry/core/build/esm/tracing/spanstatus.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SPAN_STATUS_ERROR",
    ()=>SPAN_STATUS_ERROR,
    "SPAN_STATUS_OK",
    ()=>SPAN_STATUS_OK,
    "SPAN_STATUS_UNSET",
    ()=>SPAN_STATUS_UNSET,
    "getSpanStatusFromHttpCode",
    ()=>getSpanStatusFromHttpCode,
    "setHttpStatus",
    ()=>setHttpStatus
]);
const SPAN_STATUS_UNSET = 0;
const SPAN_STATUS_OK = 1;
const SPAN_STATUS_ERROR = 2;
/**
 * Converts a HTTP status code into a sentry status with a message.
 *
 * @param httpStatus The HTTP response status code.
 * @returns The span status or internal_error.
 */ // https://develop.sentry.dev/sdk/event-payloads/span/
function getSpanStatusFromHttpCode(httpStatus) {
    if (httpStatus < 400 && httpStatus >= 100) {
        return {
            code: SPAN_STATUS_OK
        };
    }
    if (httpStatus >= 400 && httpStatus < 500) {
        switch(httpStatus){
            case 401:
                return {
                    code: SPAN_STATUS_ERROR,
                    message: 'unauthenticated'
                };
            case 403:
                return {
                    code: SPAN_STATUS_ERROR,
                    message: 'permission_denied'
                };
            case 404:
                return {
                    code: SPAN_STATUS_ERROR,
                    message: 'not_found'
                };
            case 409:
                return {
                    code: SPAN_STATUS_ERROR,
                    message: 'already_exists'
                };
            case 413:
                return {
                    code: SPAN_STATUS_ERROR,
                    message: 'failed_precondition'
                };
            case 429:
                return {
                    code: SPAN_STATUS_ERROR,
                    message: 'resource_exhausted'
                };
            case 499:
                return {
                    code: SPAN_STATUS_ERROR,
                    message: 'cancelled'
                };
            default:
                return {
                    code: SPAN_STATUS_ERROR,
                    message: 'invalid_argument'
                };
        }
    }
    if (httpStatus >= 500 && httpStatus < 600) {
        switch(httpStatus){
            case 501:
                return {
                    code: SPAN_STATUS_ERROR,
                    message: 'unimplemented'
                };
            case 503:
                return {
                    code: SPAN_STATUS_ERROR,
                    message: 'unavailable'
                };
            case 504:
                return {
                    code: SPAN_STATUS_ERROR,
                    message: 'deadline_exceeded'
                };
            default:
                return {
                    code: SPAN_STATUS_ERROR,
                    message: 'internal_error'
                };
        }
    }
    return {
        code: SPAN_STATUS_ERROR,
        message: 'internal_error'
    };
}
/**
 * Sets the Http status attributes on the current span based on the http code.
 * Additionally, the span's status is updated, depending on the http code.
 */ function setHttpStatus(span, httpStatus) {
    span.setAttribute('http.response.status_code', httpStatus);
    const spanStatus = getSpanStatusFromHttpCode(httpStatus);
    if (spanStatus.message !== 'unknown_error') {
        span.setStatus(spanStatus);
    }
}
;
 //# sourceMappingURL=spanstatus.js.map
}),
"[project]/dashboard/node_modules/@sentry/core/build/esm/tracing/utils.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getCapturedScopesOnSpan",
    ()=>getCapturedScopesOnSpan,
    "setCapturedScopesOnSpan",
    ()=>setCapturedScopesOnSpan
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/object.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$worldwide$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/worldwide.js [app-client] (ecmascript)");
;
;
const SCOPE_ON_START_SPAN_FIELD = '_sentryScope';
const ISOLATION_SCOPE_ON_START_SPAN_FIELD = '_sentryIsolationScope';
/** Wrap a scope with a WeakRef if available, falling back to a direct scope. */ function wrapScopeWithWeakRef(scope) {
    try {
        // @ts-expect-error - WeakRef is not available in all environments
        const WeakRefClass = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$worldwide$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GLOBAL_OBJ"].WeakRef;
        if (typeof WeakRefClass === 'function') {
            return new WeakRefClass(scope);
        }
    } catch  {
    // WeakRef not available or failed to create
    // We'll fall back to a direct scope
    }
    return scope;
}
/** Try to unwrap a scope from a potential WeakRef wrapper. */ function unwrapScopeFromWeakRef(scopeRef) {
    if (!scopeRef) {
        return undefined;
    }
    if (typeof scopeRef === 'object' && 'deref' in scopeRef && typeof scopeRef.deref === 'function') {
        try {
            return scopeRef.deref();
        } catch  {
            return undefined;
        }
    }
    // Fallback to a direct scope
    return scopeRef;
}
/** Store the scope & isolation scope for a span, which can the be used when it is finished. */ function setCapturedScopesOnSpan(span, scope, isolationScope) {
    if (span) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addNonEnumerableProperty"])(span, ISOLATION_SCOPE_ON_START_SPAN_FIELD, wrapScopeWithWeakRef(isolationScope));
        // We don't wrap the scope with a WeakRef here because webkit aggressively garbage collects
        // and scopes are not held in memory for long periods of time.
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addNonEnumerableProperty"])(span, SCOPE_ON_START_SPAN_FIELD, scope);
    }
}
/**
 * Grabs the scope and isolation scope off a span that were active when the span was started.
 * If WeakRef was used and scopes have been garbage collected, returns undefined for those scopes.
 */ function getCapturedScopesOnSpan(span) {
    const spanWithScopes = span;
    return {
        scope: spanWithScopes[SCOPE_ON_START_SPAN_FIELD],
        isolationScope: unwrapScopeFromWeakRef(spanWithScopes[ISOLATION_SCOPE_ON_START_SPAN_FIELD])
    };
}
;
 //# sourceMappingURL=utils.js.map
}),
"[project]/dashboard/node_modules/@sentry/core/build/esm/utils/parseSampleRate.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Parse a sample rate from a given value.
 * This will either return a boolean or number sample rate, if the sample rate is valid (between 0 and 1).
 * If a string is passed, we try to convert it to a number.
 *
 * Any invalid sample rate will return `undefined`.
 */ __turbopack_context__.s([
    "parseSampleRate",
    ()=>parseSampleRate
]);
function parseSampleRate(sampleRate) {
    if (typeof sampleRate === 'boolean') {
        return Number(sampleRate);
    }
    const rate = typeof sampleRate === 'string' ? parseFloat(sampleRate) : sampleRate;
    if (typeof rate !== 'number' || isNaN(rate) || rate < 0 || rate > 1) {
        return undefined;
    }
    return rate;
}
;
 //# sourceMappingURL=parseSampleRate.js.map
}),
"[project]/dashboard/node_modules/@sentry/core/build/esm/utils/tracing.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TRACEPARENT_REGEXP",
    ()=>TRACEPARENT_REGEXP,
    "extractTraceparentData",
    ()=>extractTraceparentData,
    "generateSentryTraceHeader",
    ()=>generateSentryTraceHeader,
    "generateTraceparentHeader",
    ()=>generateTraceparentHeader,
    "propagationContextFromHeaders",
    ()=>propagationContextFromHeaders,
    "shouldContinueTrace",
    ()=>shouldContinueTrace
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$debug$2d$logger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/debug-logger.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$baggage$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/baggage.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$dsn$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/dsn.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$parseSampleRate$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/parseSampleRate.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$propagationContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/propagationContext.js [app-client] (ecmascript)");
;
;
;
;
;
// eslint-disable-next-line @sentry-internal/sdk/no-regexp-constructor -- RegExp is used for readability here
const TRACEPARENT_REGEXP = new RegExp('^[ \\t]*' + // whitespace
'([0-9a-f]{32})?' + // trace_id
'-?([0-9a-f]{16})?' + // span_id
'-?([01])?' + // sampled
'[ \\t]*$');
/**
 * Extract transaction context data from a `sentry-trace` header.
 *
 * This is terrible naming but the function has nothing to do with the W3C traceparent header.
 * It can only parse the `sentry-trace` header and extract the "trace parent" data.
 *
 * @param traceparent Traceparent string
 *
 * @returns Object containing data from the header, or undefined if traceparent string is malformed
 */ function extractTraceparentData(traceparent) {
    if (!traceparent) {
        return undefined;
    }
    const matches = traceparent.match(TRACEPARENT_REGEXP);
    if (!matches) {
        return undefined;
    }
    let parentSampled;
    if (matches[3] === '1') {
        parentSampled = true;
    } else if (matches[3] === '0') {
        parentSampled = false;
    }
    return {
        traceId: matches[1],
        parentSampled,
        parentSpanId: matches[2]
    };
}
/**
 * Create a propagation context from incoming headers or
 * creates a minimal new one if the headers are undefined.
 */ function propagationContextFromHeaders(sentryTrace, baggage) {
    const traceparentData = extractTraceparentData(sentryTrace);
    const dynamicSamplingContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$baggage$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["baggageHeaderToDynamicSamplingContext"])(baggage);
    if (!traceparentData?.traceId) {
        return {
            traceId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$propagationContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateTraceId"])(),
            sampleRand: Math.random()
        };
    }
    const sampleRand = getSampleRandFromTraceparentAndDsc(traceparentData, dynamicSamplingContext);
    // The sample_rand on the DSC needs to be generated based on traceparent + baggage.
    if (dynamicSamplingContext) {
        dynamicSamplingContext.sample_rand = sampleRand.toString();
    }
    const { traceId, parentSpanId, parentSampled } = traceparentData;
    return {
        traceId,
        parentSpanId,
        sampled: parentSampled,
        dsc: dynamicSamplingContext || {},
        sampleRand
    };
}
/**
 * Create sentry-trace header from span context values.
 */ function generateSentryTraceHeader(traceId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$propagationContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateTraceId"])(), spanId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$propagationContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateSpanId"])(), sampled) {
    let sampledString = '';
    if (sampled !== undefined) {
        sampledString = sampled ? '-1' : '-0';
    }
    return `${traceId}-${spanId}${sampledString}`;
}
/**
 * Creates a W3C traceparent header from the given trace and span ids.
 */ function generateTraceparentHeader(traceId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$propagationContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateTraceId"])(), spanId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$propagationContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateSpanId"])(), sampled) {
    return `00-${traceId}-${spanId}-${sampled ? '01' : '00'}`;
}
/**
 * Given any combination of an incoming trace, generate a sample rand based on its defined semantics.
 *
 * Read more: https://develop.sentry.dev/sdk/telemetry/traces/#propagated-random-value
 */ function getSampleRandFromTraceparentAndDsc(traceparentData, dsc) {
    // When there is an incoming sample rand use it.
    const parsedSampleRand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$parseSampleRate$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseSampleRate"])(dsc?.sample_rand);
    if (parsedSampleRand !== undefined) {
        return parsedSampleRand;
    }
    // Otherwise, if there is an incoming sampling decision + sample rate, generate a sample rand that would lead to the same sampling decision.
    const parsedSampleRate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$parseSampleRate$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseSampleRate"])(dsc?.sample_rate);
    if (parsedSampleRate && traceparentData?.parentSampled !== undefined) {
        return traceparentData.parentSampled ? Math.random() * parsedSampleRate : parsedSampleRate + Math.random() * (1 - parsedSampleRate);
    } else {
        // If nothing applies, return a random sample rand.
        return Math.random();
    }
}
/**
 * Determines whether a new trace should be continued based on the provided baggage org ID and the client's `strictTraceContinuation` option.
 * If the trace should not be continued, a new trace will be started.
 *
 * The result is dependent on the `strictTraceContinuation` option in the client.
 * See https://develop.sentry.dev/sdk/telemetry/traces/#stricttracecontinuation
 */ function shouldContinueTrace(client, baggageOrgId) {
    const clientOrgId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$dsn$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extractOrgIdFromClient"])(client);
    // Case: baggage orgID and Client orgID don't match - always start new trace
    if (baggageOrgId && clientOrgId && baggageOrgId !== clientOrgId) {
        __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$debug$2d$logger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["debug"].log(`Won't continue trace because org IDs don't match (incoming baggage: ${baggageOrgId}, SDK options: ${clientOrgId})`);
        return false;
    }
    const strictTraceContinuation = client.getOptions().strictTraceContinuation || false; // default for `strictTraceContinuation` is `false`
    if (strictTraceContinuation) {
        // With strict continuation enabled, don't continue trace if:
        // - Baggage has orgID, but Client doesn't have one
        // - Client has orgID, but baggage doesn't have one
        if (baggageOrgId && !clientOrgId || !baggageOrgId && clientOrgId) {
            __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$debug$2d$logger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["debug"].log(`Starting a new trace because strict trace continuation is enabled but one org ID is missing (incoming baggage: ${baggageOrgId}, Sentry client: ${clientOrgId})`);
            return false;
        }
    }
    return true;
}
;
 //# sourceMappingURL=tracing.js.map
}),
"[project]/dashboard/node_modules/@sentry/core/build/esm/utils/spanUtils.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TRACE_FLAG_NONE",
    ()=>TRACE_FLAG_NONE,
    "TRACE_FLAG_SAMPLED",
    ()=>TRACE_FLAG_SAMPLED,
    "addChildSpanToSpan",
    ()=>addChildSpanToSpan,
    "convertSpanLinksForEnvelope",
    ()=>convertSpanLinksForEnvelope,
    "getActiveSpan",
    ()=>getActiveSpan,
    "getRootSpan",
    ()=>getRootSpan,
    "getSpanDescendants",
    ()=>getSpanDescendants,
    "getStatusMessage",
    ()=>getStatusMessage,
    "removeChildSpanFromSpan",
    ()=>removeChildSpanFromSpan,
    "showSpanDropWarning",
    ()=>showSpanDropWarning,
    "spanIsSampled",
    ()=>spanIsSampled,
    "spanTimeInputToSeconds",
    ()=>spanTimeInputToSeconds,
    "spanToJSON",
    ()=>spanToJSON,
    "spanToTraceContext",
    ()=>spanToTraceContext,
    "spanToTraceHeader",
    ()=>spanToTraceHeader,
    "spanToTraceparentHeader",
    ()=>spanToTraceparentHeader,
    "spanToTransactionTraceContext",
    ()=>spanToTransactionTraceContext,
    "updateSpanName",
    ()=>updateSpanName
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$asyncContext$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/asyncContext/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$carrier$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/carrier.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/currentScopes.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$semanticAttributes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/semanticAttributes.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$tracing$2f$spanstatus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/tracing/spanstatus.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$tracing$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/tracing/utils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/object.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$propagationContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/propagationContext.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$time$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/time.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$tracing$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/tracing.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$debug$2d$logger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/debug-logger.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$spanOnScope$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/spanOnScope.js [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
// These are aligned with OpenTelemetry trace flags
const TRACE_FLAG_NONE = 0x0;
const TRACE_FLAG_SAMPLED = 0x1;
let hasShownSpanDropWarning = false;
/**
 * Convert a span to a trace context, which can be sent as the `trace` context in an event.
 * By default, this will only include trace_id, span_id & parent_span_id.
 * If `includeAllData` is true, it will also include data, op, status & origin.
 */ function spanToTransactionTraceContext(span) {
    const { spanId: span_id, traceId: trace_id } = span.spanContext();
    const { data, op, parent_span_id, status, origin, links } = spanToJSON(span);
    return {
        parent_span_id,
        span_id,
        trace_id,
        data,
        op,
        status,
        origin,
        links
    };
}
/**
 * Convert a span to a trace context, which can be sent as the `trace` context in a non-transaction event.
 */ function spanToTraceContext(span) {
    const { spanId, traceId: trace_id, isRemote } = span.spanContext();
    // If the span is remote, we use a random/virtual span as span_id to the trace context,
    // and the remote span as parent_span_id
    const parent_span_id = isRemote ? spanId : spanToJSON(span).parent_span_id;
    const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$tracing$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCapturedScopesOnSpan"])(span).scope;
    const span_id = isRemote ? scope?.getPropagationContext().propagationSpanId || (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$propagationContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateSpanId"])() : spanId;
    return {
        parent_span_id,
        span_id,
        trace_id
    };
}
/**
 * Convert a Span to a Sentry trace header.
 */ function spanToTraceHeader(span) {
    const { traceId, spanId } = span.spanContext();
    const sampled = spanIsSampled(span);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$tracing$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateSentryTraceHeader"])(traceId, spanId, sampled);
}
/**
 * Convert a Span to a W3C traceparent header.
 */ function spanToTraceparentHeader(span) {
    const { traceId, spanId } = span.spanContext();
    const sampled = spanIsSampled(span);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$tracing$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateTraceparentHeader"])(traceId, spanId, sampled);
}
/**
 *  Converts the span links array to a flattened version to be sent within an envelope.
 *
 *  If the links array is empty, it returns `undefined` so the empty value can be dropped before it's sent.
 */ function convertSpanLinksForEnvelope(links) {
    if (links && links.length > 0) {
        return links.map(({ context: { spanId, traceId, traceFlags, ...restContext }, attributes })=>({
                span_id: spanId,
                trace_id: traceId,
                sampled: traceFlags === TRACE_FLAG_SAMPLED,
                attributes,
                ...restContext
            }));
    } else {
        return undefined;
    }
}
/**
 * Convert a span time input into a timestamp in seconds.
 */ function spanTimeInputToSeconds(input) {
    if (typeof input === 'number') {
        return ensureTimestampInSeconds(input);
    }
    if (Array.isArray(input)) {
        // See {@link HrTime} for the array-based time format
        return input[0] + input[1] / 1e9;
    }
    if (input instanceof Date) {
        return ensureTimestampInSeconds(input.getTime());
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$time$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["timestampInSeconds"])();
}
/**
 * Converts a timestamp to second, if it was in milliseconds, or keeps it as second.
 */ function ensureTimestampInSeconds(timestamp) {
    const isMs = timestamp > 9999999999;
    return isMs ? timestamp / 1000 : timestamp;
}
/**
 * Convert a span to a JSON representation.
 */ // Note: Because of this, we currently have a circular type dependency (which we opted out of in package.json).
// This is not avoidable as we need `spanToJSON` in `spanUtils.ts`, which in turn is needed by `span.ts` for backwards compatibility.
// And `spanToJSON` needs the Span class from `span.ts` to check here.
function spanToJSON(span) {
    if (spanIsSentrySpan(span)) {
        return span.getSpanJSON();
    }
    const { spanId: span_id, traceId: trace_id } = span.spanContext();
    // Handle a span from @opentelemetry/sdk-base-trace's `Span` class
    if (spanIsOpenTelemetrySdkTraceBaseSpan(span)) {
        const { attributes, startTime, name, endTime, status, links } = span;
        // In preparation for the next major of OpenTelemetry, we want to support
        // looking up the parent span id according to the new API
        // In OTel v1, the parent span id is accessed as `parentSpanId`
        // In OTel v2, the parent span id is accessed as `spanId` on the `parentSpanContext`
        const parentSpanId = 'parentSpanId' in span ? span.parentSpanId : 'parentSpanContext' in span ? span.parentSpanContext?.spanId : undefined;
        return {
            span_id,
            trace_id,
            data: attributes,
            description: name,
            parent_span_id: parentSpanId,
            start_timestamp: spanTimeInputToSeconds(startTime),
            // This is [0,0] by default in OTEL, in which case we want to interpret this as no end time
            timestamp: spanTimeInputToSeconds(endTime) || undefined,
            status: getStatusMessage(status),
            op: attributes[__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$semanticAttributes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SEMANTIC_ATTRIBUTE_SENTRY_OP"]],
            origin: attributes[__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$semanticAttributes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN"]],
            links: convertSpanLinksForEnvelope(links)
        };
    }
    // Finally, at least we have `spanContext()`....
    // This should not actually happen in reality, but we need to handle it for type safety.
    return {
        span_id,
        trace_id,
        start_timestamp: 0,
        data: {}
    };
}
function spanIsOpenTelemetrySdkTraceBaseSpan(span) {
    const castSpan = span;
    return !!castSpan.attributes && !!castSpan.startTime && !!castSpan.name && !!castSpan.endTime && !!castSpan.status;
}
/** Exported only for tests. */ /**
 * Sadly, due to circular dependency checks we cannot actually import the Span class here and check for instanceof.
 * :( So instead we approximate this by checking if it has the `getSpanJSON` method.
 */ function spanIsSentrySpan(span) {
    return typeof span.getSpanJSON === 'function';
}
/**
 * Returns true if a span is sampled.
 * In most cases, you should just use `span.isRecording()` instead.
 * However, this has a slightly different semantic, as it also returns false if the span is finished.
 * So in the case where this distinction is important, use this method.
 */ function spanIsSampled(span) {
    // We align our trace flags with the ones OpenTelemetry use
    // So we also check for sampled the same way they do.
    const { traceFlags } = span.spanContext();
    return traceFlags === TRACE_FLAG_SAMPLED;
}
/** Get the status message to use for a JSON representation of a span. */ function getStatusMessage(status) {
    if (!status || status.code === __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$tracing$2f$spanstatus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SPAN_STATUS_UNSET"]) {
        return undefined;
    }
    if (status.code === __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$tracing$2f$spanstatus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SPAN_STATUS_OK"]) {
        return 'ok';
    }
    return status.message || 'internal_error';
}
const CHILD_SPANS_FIELD = '_sentryChildSpans';
const ROOT_SPAN_FIELD = '_sentryRootSpan';
/**
 * Adds an opaque child span reference to a span.
 */ function addChildSpanToSpan(span, childSpan) {
    // We store the root span reference on the child span
    // We need this for `getRootSpan()` to work
    const rootSpan = span[ROOT_SPAN_FIELD] || span;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addNonEnumerableProperty"])(childSpan, ROOT_SPAN_FIELD, rootSpan);
    // We store a list of child spans on the parent span
    // We need this for `getSpanDescendants()` to work
    if (span[CHILD_SPANS_FIELD]) {
        span[CHILD_SPANS_FIELD].add(childSpan);
    } else {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addNonEnumerableProperty"])(span, CHILD_SPANS_FIELD, new Set([
            childSpan
        ]));
    }
}
/** This is only used internally by Idle Spans. */ function removeChildSpanFromSpan(span, childSpan) {
    if (span[CHILD_SPANS_FIELD]) {
        span[CHILD_SPANS_FIELD].delete(childSpan);
    }
}
/**
 * Returns an array of the given span and all of its descendants.
 */ function getSpanDescendants(span) {
    const resultSet = new Set();
    function addSpanChildren(span) {
        // This exit condition is required to not infinitely loop in case of a circular dependency.
        if (resultSet.has(span)) {
            return;
        // We want to ignore unsampled spans (e.g. non recording spans)
        } else if (spanIsSampled(span)) {
            resultSet.add(span);
            const childSpans = span[CHILD_SPANS_FIELD] ? Array.from(span[CHILD_SPANS_FIELD]) : [];
            for (const childSpan of childSpans){
                addSpanChildren(childSpan);
            }
        }
    }
    addSpanChildren(span);
    return Array.from(resultSet);
}
/**
 * Returns the root span of a given span.
 */ function getRootSpan(span) {
    return span[ROOT_SPAN_FIELD] || span;
}
/**
 * Returns the currently active span.
 */ function getActiveSpan() {
    const carrier = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$carrier$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMainCarrier"])();
    const acs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$asyncContext$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAsyncContextStrategy"])(carrier);
    if (acs.getActiveSpan) {
        return acs.getActiveSpan();
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$spanOnScope$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_getSpanForScope"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCurrentScope"])());
}
/**
 * Logs a warning once if `beforeSendSpan` is used to drop spans.
 */ function showSpanDropWarning() {
    if (!hasShownSpanDropWarning) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$debug$2d$logger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["consoleSandbox"])(()=>{
            // eslint-disable-next-line no-console
            console.warn('[Sentry] Returning null from `beforeSendSpan` is disallowed. To drop certain spans, configure the respective integrations directly or use `ignoreSpans`.');
        });
        hasShownSpanDropWarning = true;
    }
}
/**
 * Updates the name of the given span and ensures that the span name is not
 * overwritten by the Sentry SDK.
 *
 * Use this function instead of `span.updateName()` if you want to make sure that
 * your name is kept. For some spans, for example root `http.server` spans the
 * Sentry SDK would otherwise overwrite the span name with a high-quality name
 * it infers when the span ends.
 *
 * Use this function in server code or when your span is started on the server
 * and on the client (browser). If you only update a span name on the client,
 * you can also use `span.updateName()` the SDK does not overwrite the name.
 *
 * @param span - The span to update the name of.
 * @param name - The name to set on the span.
 */ function updateSpanName(span, name) {
    span.updateName(name);
    span.setAttributes({
        [__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$semanticAttributes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SEMANTIC_ATTRIBUTE_SENTRY_SOURCE"]]: 'custom',
        [__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$semanticAttributes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SEMANTIC_ATTRIBUTE_SENTRY_CUSTOM_SPAN_NAME"]]: name
    });
}
;
 //# sourceMappingURL=spanUtils.js.map
}),
"[project]/dashboard/node_modules/@sentry/core/build/esm/tracing/dynamicSamplingContext.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "freezeDscOnSpan",
    ()=>freezeDscOnSpan,
    "getDynamicSamplingContextFromClient",
    ()=>getDynamicSamplingContextFromClient,
    "getDynamicSamplingContextFromScope",
    ()=>getDynamicSamplingContextFromScope,
    "getDynamicSamplingContextFromSpan",
    ()=>getDynamicSamplingContextFromSpan,
    "spanToBaggageHeader",
    ()=>spanToBaggageHeader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/constants.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/currentScopes.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$semanticAttributes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/semanticAttributes.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$baggage$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/baggage.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$dsn$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/dsn.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$hasSpansEnabled$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/hasSpansEnabled.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/object.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$spanUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/spanUtils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$tracing$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/tracing/utils.js [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
;
/**
 * If you change this value, also update the terser plugin config to
 * avoid minification of the object property!
 */ const FROZEN_DSC_FIELD = '_frozenDsc';
/**
 * Freeze the given DSC on the given span.
 */ function freezeDscOnSpan(span, dsc) {
    const spanWithMaybeDsc = span;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addNonEnumerableProperty"])(spanWithMaybeDsc, FROZEN_DSC_FIELD, dsc);
}
/**
 * Creates a dynamic sampling context from a client.
 *
 * Dispatches the `createDsc` lifecycle hook as a side effect.
 */ function getDynamicSamplingContextFromClient(trace_id, client) {
    const options = client.getOptions();
    const { publicKey: public_key } = client.getDsn() || {};
    // Instead of conditionally adding non-undefined values, we add them and then remove them if needed
    // otherwise, the order of baggage entries changes, which "breaks" a bunch of tests etc.
    const dsc = {
        environment: options.environment || __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_ENVIRONMENT"],
        release: options.release,
        public_key,
        trace_id,
        org_id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$dsn$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extractOrgIdFromClient"])(client)
    };
    client.emit('createDsc', dsc);
    return dsc;
}
/**
 * Get the dynamic sampling context for the currently active scopes.
 */ function getDynamicSamplingContextFromScope(client, scope) {
    const propagationContext = scope.getPropagationContext();
    return propagationContext.dsc || getDynamicSamplingContextFromClient(propagationContext.traceId, client);
}
/**
 * Creates a dynamic sampling context from a span (and client and scope)
 *
 * @param span the span from which a few values like the root span name and sample rate are extracted.
 *
 * @returns a dynamic sampling context
 */ function getDynamicSamplingContextFromSpan(span) {
    const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getClient"])();
    if (!client) {
        return {};
    }
    const rootSpan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$spanUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRootSpan"])(span);
    const rootSpanJson = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$spanUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["spanToJSON"])(rootSpan);
    const rootSpanAttributes = rootSpanJson.data;
    const traceState = rootSpan.spanContext().traceState;
    // The span sample rate that was locally applied to the root span should also always be applied to the DSC, even if the DSC is frozen.
    // This is so that the downstream traces/services can use parentSampleRate in their `tracesSampler` to make consistent sampling decisions across the entire trace.
    const rootSpanSampleRate = traceState?.get('sentry.sample_rate') ?? rootSpanAttributes[__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$semanticAttributes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE"]] ?? rootSpanAttributes[__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$semanticAttributes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SEMANTIC_ATTRIBUTE_SENTRY_PREVIOUS_TRACE_SAMPLE_RATE"]];
    function applyLocalSampleRateToDsc(dsc) {
        if (typeof rootSpanSampleRate === 'number' || typeof rootSpanSampleRate === 'string') {
            dsc.sample_rate = `${rootSpanSampleRate}`;
        }
        return dsc;
    }
    // For core implementation, we freeze the DSC onto the span as a non-enumerable property
    const frozenDsc = rootSpan[FROZEN_DSC_FIELD];
    if (frozenDsc) {
        return applyLocalSampleRateToDsc(frozenDsc);
    }
    // For OpenTelemetry, we freeze the DSC on the trace state
    const traceStateDsc = traceState?.get('sentry.dsc');
    // If the span has a DSC, we want it to take precedence
    const dscOnTraceState = traceStateDsc && (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$baggage$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["baggageHeaderToDynamicSamplingContext"])(traceStateDsc);
    if (dscOnTraceState) {
        return applyLocalSampleRateToDsc(dscOnTraceState);
    }
    // Else, we generate it from the span
    const dsc = getDynamicSamplingContextFromClient(span.spanContext().traceId, client);
    // We don't want to have a transaction name in the DSC if the source is "url" because URLs might contain PII
    const source = rootSpanAttributes[__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$semanticAttributes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SEMANTIC_ATTRIBUTE_SENTRY_SOURCE"]];
    // after JSON conversion, txn.name becomes jsonSpan.description
    const name = rootSpanJson.description;
    if (source !== 'url' && name) {
        dsc.transaction = name;
    }
    // How can we even land here with hasSpansEnabled() returning false?
    // Otel creates a Non-recording span in Tracing Without Performance mode when handling incoming requests
    // So we end up with an active span that is not sampled (neither positively nor negatively)
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$hasSpansEnabled$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasSpansEnabled"])()) {
        dsc.sampled = String((0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$spanUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["spanIsSampled"])(rootSpan));
        dsc.sample_rand = // In OTEL we store the sample rand on the trace state because we cannot access scopes for NonRecordingSpans
        // The Sentry OTEL SpanSampler takes care of writing the sample rand on the root span
        traceState?.get('sentry.sample_rand') ?? // On all other platforms we can actually get the scopes from a root span (we use this as a fallback)
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$tracing$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCapturedScopesOnSpan"])(rootSpan).scope?.getPropagationContext().sampleRand.toString();
    }
    applyLocalSampleRateToDsc(dsc);
    client.emit('createDsc', dsc, rootSpan);
    return dsc;
}
/**
 * Convert a Span to a baggage header.
 */ function spanToBaggageHeader(span) {
    const dsc = getDynamicSamplingContextFromSpan(span);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$baggage$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["dynamicSamplingContextToSentryBaggageHeader"])(dsc);
}
;
 //# sourceMappingURL=dynamicSamplingContext.js.map
}),
"[project]/dashboard/node_modules/@sentry/core/build/esm/utils/applyScopeDataToEvent.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "applyScopeDataToEvent",
    ()=>applyScopeDataToEvent,
    "mergeAndOverwriteScopeData",
    ()=>mergeAndOverwriteScopeData,
    "mergeScopeData",
    ()=>mergeScopeData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$tracing$2f$dynamicSamplingContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/tracing/dynamicSamplingContext.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$merge$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/merge.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$spanUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/spanUtils.js [app-client] (ecmascript)");
;
;
;
/**
 * Applies data from the scope to the event and runs all event processors on it.
 */ function applyScopeDataToEvent(event, data) {
    const { fingerprint, span, breadcrumbs, sdkProcessingMetadata } = data;
    // Apply general data
    applyDataToEvent(event, data);
    // We want to set the trace context for normal events only if there isn't already
    // a trace context on the event. There is a product feature in place where we link
    // errors with transaction and it relies on that.
    if (span) {
        applySpanToEvent(event, span);
    }
    applyFingerprintToEvent(event, fingerprint);
    applyBreadcrumbsToEvent(event, breadcrumbs);
    applySdkMetadataToEvent(event, sdkProcessingMetadata);
}
/** Merge data of two scopes together. */ function mergeScopeData(data, mergeData) {
    const { extra, tags, user, contexts, level, sdkProcessingMetadata, breadcrumbs, fingerprint, eventProcessors, attachments, propagationContext, transactionName, span } = mergeData;
    mergeAndOverwriteScopeData(data, 'extra', extra);
    mergeAndOverwriteScopeData(data, 'tags', tags);
    mergeAndOverwriteScopeData(data, 'user', user);
    mergeAndOverwriteScopeData(data, 'contexts', contexts);
    data.sdkProcessingMetadata = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$merge$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["merge"])(data.sdkProcessingMetadata, sdkProcessingMetadata, 2);
    if (level) {
        data.level = level;
    }
    if (transactionName) {
        data.transactionName = transactionName;
    }
    if (span) {
        data.span = span;
    }
    if (breadcrumbs.length) {
        data.breadcrumbs = [
            ...data.breadcrumbs,
            ...breadcrumbs
        ];
    }
    if (fingerprint.length) {
        data.fingerprint = [
            ...data.fingerprint,
            ...fingerprint
        ];
    }
    if (eventProcessors.length) {
        data.eventProcessors = [
            ...data.eventProcessors,
            ...eventProcessors
        ];
    }
    if (attachments.length) {
        data.attachments = [
            ...data.attachments,
            ...attachments
        ];
    }
    data.propagationContext = {
        ...data.propagationContext,
        ...propagationContext
    };
}
/**
 * Merges certain scope data. Undefined values will overwrite any existing values.
 * Exported only for tests.
 */ function mergeAndOverwriteScopeData(data, prop, mergeVal) {
    data[prop] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$merge$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["merge"])(data[prop], mergeVal, 1);
}
function applyDataToEvent(event, data) {
    const { extra, tags, user, contexts, level, transactionName } = data;
    if (Object.keys(extra).length) {
        event.extra = {
            ...extra,
            ...event.extra
        };
    }
    if (Object.keys(tags).length) {
        event.tags = {
            ...tags,
            ...event.tags
        };
    }
    if (Object.keys(user).length) {
        event.user = {
            ...user,
            ...event.user
        };
    }
    if (Object.keys(contexts).length) {
        event.contexts = {
            ...contexts,
            ...event.contexts
        };
    }
    if (level) {
        event.level = level;
    }
    // transaction events get their `transaction` from the root span name
    if (transactionName && event.type !== 'transaction') {
        event.transaction = transactionName;
    }
}
function applyBreadcrumbsToEvent(event, breadcrumbs) {
    const mergedBreadcrumbs = [
        ...event.breadcrumbs || [],
        ...breadcrumbs
    ];
    event.breadcrumbs = mergedBreadcrumbs.length ? mergedBreadcrumbs : undefined;
}
function applySdkMetadataToEvent(event, sdkProcessingMetadata) {
    event.sdkProcessingMetadata = {
        ...event.sdkProcessingMetadata,
        ...sdkProcessingMetadata
    };
}
function applySpanToEvent(event, span) {
    event.contexts = {
        trace: (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$spanUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["spanToTraceContext"])(span),
        ...event.contexts
    };
    event.sdkProcessingMetadata = {
        dynamicSamplingContext: (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$tracing$2f$dynamicSamplingContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDynamicSamplingContextFromSpan"])(span),
        ...event.sdkProcessingMetadata
    };
    const rootSpan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$spanUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRootSpan"])(span);
    const transactionName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$spanUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["spanToJSON"])(rootSpan).description;
    if (transactionName && !event.transaction && event.type === 'transaction') {
        event.transaction = transactionName;
    }
}
/**
 * Applies fingerprint from the scope to the event if there's one,
 * uses message if there's one instead or get rid of empty fingerprint
 */ function applyFingerprintToEvent(event, fingerprint) {
    // Make sure it's an array first and we actually have something in place
    event.fingerprint = event.fingerprint ? Array.isArray(event.fingerprint) ? event.fingerprint : [
        event.fingerprint
    ] : [];
    // If we have something on the scope, then merge it with event
    if (fingerprint) {
        event.fingerprint = event.fingerprint.concat(fingerprint);
    }
    // If we have no data at all, remove empty array default
    if (!event.fingerprint.length) {
        delete event.fingerprint;
    }
}
;
 //# sourceMappingURL=applyScopeDataToEvent.js.map
}),
"[project]/dashboard/node_modules/@sentry/core/build/esm/utils/debug-ids.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getDebugImagesForResources",
    ()=>getDebugImagesForResources,
    "getFilenameToDebugIdMap",
    ()=>getFilenameToDebugIdMap
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$worldwide$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/worldwide.js [app-client] (ecmascript)");
;
let parsedStackResults;
let lastSentryKeysCount;
let lastNativeKeysCount;
let cachedFilenameDebugIds;
/**
 * Returns a map of filenames to debug identifiers.
 * Supports both proprietary _sentryDebugIds and native _debugIds (e.g., from Vercel) formats.
 */ function getFilenameToDebugIdMap(stackParser) {
    const sentryDebugIdMap = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$worldwide$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GLOBAL_OBJ"]._sentryDebugIds;
    const nativeDebugIdMap = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$worldwide$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GLOBAL_OBJ"]._debugIds;
    if (!sentryDebugIdMap && !nativeDebugIdMap) {
        return {};
    }
    const sentryDebugIdKeys = sentryDebugIdMap ? Object.keys(sentryDebugIdMap) : [];
    const nativeDebugIdKeys = nativeDebugIdMap ? Object.keys(nativeDebugIdMap) : [];
    // If the count of registered globals hasn't changed since the last call, we
    // can just return the cached result.
    if (cachedFilenameDebugIds && sentryDebugIdKeys.length === lastSentryKeysCount && nativeDebugIdKeys.length === lastNativeKeysCount) {
        return cachedFilenameDebugIds;
    }
    lastSentryKeysCount = sentryDebugIdKeys.length;
    lastNativeKeysCount = nativeDebugIdKeys.length;
    // Build a map of filename -> debug_id from both sources
    cachedFilenameDebugIds = {};
    if (!parsedStackResults) {
        parsedStackResults = {};
    }
    const processDebugIds = (debugIdKeys, debugIdMap)=>{
        for (const key of debugIdKeys){
            const debugId = debugIdMap[key];
            const result = parsedStackResults?.[key];
            if (result && cachedFilenameDebugIds && debugId) {
                // Use cached filename but update with current debug ID
                cachedFilenameDebugIds[result[0]] = debugId;
                // Update cached result with new debug ID
                if (parsedStackResults) {
                    parsedStackResults[key] = [
                        result[0],
                        debugId
                    ];
                }
            } else if (debugId) {
                const parsedStack = stackParser(key);
                for(let i = parsedStack.length - 1; i >= 0; i--){
                    const stackFrame = parsedStack[i];
                    const filename = stackFrame?.filename;
                    if (filename && cachedFilenameDebugIds && parsedStackResults) {
                        cachedFilenameDebugIds[filename] = debugId;
                        parsedStackResults[key] = [
                            filename,
                            debugId
                        ];
                        break;
                    }
                }
            }
        }
    };
    if (sentryDebugIdMap) {
        processDebugIds(sentryDebugIdKeys, sentryDebugIdMap);
    }
    // Native _debugIds will override _sentryDebugIds if same file
    if (nativeDebugIdMap) {
        processDebugIds(nativeDebugIdKeys, nativeDebugIdMap);
    }
    return cachedFilenameDebugIds;
}
/**
 * Returns a list of debug images for the given resources.
 */ function getDebugImagesForResources(stackParser, resource_paths) {
    const filenameDebugIdMap = getFilenameToDebugIdMap(stackParser);
    if (!filenameDebugIdMap) {
        return [];
    }
    const images = [];
    for (const path of resource_paths){
        if (path && filenameDebugIdMap[path]) {
            images.push({
                type: 'sourcemap',
                code_file: path,
                debug_id: filenameDebugIdMap[path]
            });
        }
    }
    return images;
}
;
 //# sourceMappingURL=debug-ids.js.map
}),
"[project]/dashboard/node_modules/@sentry/core/build/esm/utils/stacktrace.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "UNKNOWN_FUNCTION",
    ()=>UNKNOWN_FUNCTION,
    "createStackParser",
    ()=>createStackParser,
    "getFramesFromEvent",
    ()=>getFramesFromEvent,
    "getFunctionName",
    ()=>getFunctionName,
    "stackParserFromStackParserOptions",
    ()=>stackParserFromStackParserOptions,
    "stripSentryFramesAndReverse",
    ()=>stripSentryFramesAndReverse
]);
const STACKTRACE_FRAME_LIMIT = 50;
const UNKNOWN_FUNCTION = '?';
// Used to sanitize webpack (error: *) wrapped stack errors
const WEBPACK_ERROR_REGEXP = /\(error: (.*)\)/;
const STRIP_FRAME_REGEXP = /captureMessage|captureException/;
/**
 * Creates a stack parser with the supplied line parsers
 *
 * StackFrames are returned in the correct order for Sentry Exception
 * frames and with Sentry SDK internal frames removed from the top and bottom
 *
 */ function createStackParser(...parsers) {
    const sortedParsers = parsers.sort((a, b)=>a[0] - b[0]).map((p)=>p[1]);
    return (stack, skipFirstLines = 0, framesToPop = 0)=>{
        const frames = [];
        const lines = stack.split('\n');
        for(let i = skipFirstLines; i < lines.length; i++){
            let line = lines[i];
            // Truncate lines over 1kb because many of the regular expressions use
            // backtracking which results in run time that increases exponentially
            // with input size. Huge strings can result in hangs/Denial of Service:
            // https://github.com/getsentry/sentry-javascript/issues/2286
            if (line.length > 1024) {
                line = line.slice(0, 1024);
            }
            // https://github.com/getsentry/sentry-javascript/issues/5459
            // Remove webpack (error: *) wrappers
            const cleanedLine = WEBPACK_ERROR_REGEXP.test(line) ? line.replace(WEBPACK_ERROR_REGEXP, '$1') : line;
            // https://github.com/getsentry/sentry-javascript/issues/7813
            // Skip Error: lines
            if (cleanedLine.match(/\S*Error: /)) {
                continue;
            }
            for (const parser of sortedParsers){
                const frame = parser(cleanedLine);
                if (frame) {
                    frames.push(frame);
                    break;
                }
            }
            if (frames.length >= STACKTRACE_FRAME_LIMIT + framesToPop) {
                break;
            }
        }
        return stripSentryFramesAndReverse(frames.slice(framesToPop));
    };
}
/**
 * Gets a stack parser implementation from Options.stackParser
 * @see Options
 *
 * If options contains an array of line parsers, it is converted into a parser
 */ function stackParserFromStackParserOptions(stackParser) {
    if (Array.isArray(stackParser)) {
        return createStackParser(...stackParser);
    }
    return stackParser;
}
/**
 * Removes Sentry frames from the top and bottom of the stack if present and enforces a limit of max number of frames.
 * Assumes stack input is ordered from top to bottom and returns the reverse representation so call site of the
 * function that caused the crash is the last frame in the array.
 * @hidden
 */ function stripSentryFramesAndReverse(stack) {
    if (!stack.length) {
        return [];
    }
    const localStack = Array.from(stack);
    // If stack starts with one of our API calls, remove it (starts, meaning it's the top of the stack - aka last call)
    if (/sentryWrapped/.test(getLastStackFrame(localStack).function || '')) {
        localStack.pop();
    }
    // Reversing in the middle of the procedure allows us to just pop the values off the stack
    localStack.reverse();
    // If stack ends with one of our internal API calls, remove it (ends, meaning it's the bottom of the stack - aka top-most call)
    if (STRIP_FRAME_REGEXP.test(getLastStackFrame(localStack).function || '')) {
        localStack.pop();
        // When using synthetic events, we will have a 2 levels deep stack, as `new Error('Sentry syntheticException')`
        // is produced within the scope itself, making it:
        //
        //   Sentry.captureException()
        //   scope.captureException()
        //
        // instead of just the top `Sentry` call itself.
        // This forces us to possibly strip an additional frame in the exact same was as above.
        if (STRIP_FRAME_REGEXP.test(getLastStackFrame(localStack).function || '')) {
            localStack.pop();
        }
    }
    return localStack.slice(0, STACKTRACE_FRAME_LIMIT).map((frame)=>({
            ...frame,
            filename: frame.filename || getLastStackFrame(localStack).filename,
            function: frame.function || UNKNOWN_FUNCTION
        }));
}
function getLastStackFrame(arr) {
    return arr[arr.length - 1] || {};
}
const defaultFunctionName = '<anonymous>';
/**
 * Safely extract function name from itself
 */ function getFunctionName(fn) {
    try {
        if (!fn || typeof fn !== 'function') {
            return defaultFunctionName;
        }
        return fn.name || defaultFunctionName;
    } catch  {
        // Just accessing custom props in some Selenium environments
        // can cause a "Permission denied" exception (see raven-js#495).
        return defaultFunctionName;
    }
}
/**
 * Get's stack frames from an event without needing to check for undefined properties.
 */ function getFramesFromEvent(event) {
    const exception = event.exception;
    if (exception) {
        const frames = [];
        try {
            // @ts-expect-error Object could be undefined
            exception.values.forEach((value)=>{
                // @ts-expect-error Value could be undefined
                if (value.stacktrace.frames) {
                    // @ts-expect-error Value could be undefined
                    frames.push(...value.stacktrace.frames);
                }
            });
            return frames;
        } catch  {
            return undefined;
        }
    }
    return undefined;
}
;
 //# sourceMappingURL=stacktrace.js.map
}),
"[project]/dashboard/node_modules/@sentry/core/build/esm/utils/normalize.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "normalize",
    ()=>normalize,
    "normalizeToSize",
    ()=>normalizeToSize,
    "normalizeUrlToBase",
    ()=>normalizeUrlToBase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$is$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/is.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/object.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$stacktrace$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/stacktrace.js [app-client] (ecmascript)");
;
;
;
/**
 * Recursively normalizes the given object.
 *
 * - Creates a copy to prevent original input mutation
 * - Skips non-enumerable properties
 * - When stringifying, calls `toJSON` if implemented
 * - Removes circular references
 * - Translates non-serializable values (`undefined`/`NaN`/functions) to serializable format
 * - Translates known global objects/classes to a string representations
 * - Takes care of `Error` object serialization
 * - Optionally limits depth of final output
 * - Optionally limits number of properties/elements included in any single object/array
 *
 * @param input The object to be normalized.
 * @param depth The max depth to which to normalize the object. (Anything deeper stringified whole.)
 * @param maxProperties The max number of elements or properties to be included in any single array or
 * object in the normalized output.
 * @returns A normalized version of the object, or `"**non-serializable**"` if any errors are thrown during normalization.
 */ // eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalize(input, depth = 100, maxProperties = +Infinity) {
    try {
        // since we're at the outermost level, we don't provide a key
        return visit('', input, depth, maxProperties);
    } catch (err) {
        return {
            ERROR: `**non-serializable** (${err})`
        };
    }
}
/** JSDoc */ function normalizeToSize(// eslint-disable-next-line @typescript-eslint/no-explicit-any
object, // Default Node.js REPL depth
depth = 3, // 100kB, as 200kB is max payload size, so half sounds reasonable
maxSize = 100 * 1024) {
    const normalized = normalize(object, depth);
    if (jsonSize(normalized) > maxSize) {
        return normalizeToSize(object, depth - 1, maxSize);
    }
    return normalized;
}
/**
 * Visits a node to perform normalization on it
 *
 * @param key The key corresponding to the given node
 * @param value The node to be visited
 * @param depth Optional number indicating the maximum recursion depth
 * @param maxProperties Optional maximum number of properties/elements included in any single object/array
 * @param memo Optional Memo class handling decycling
 */ function visit(key, value, depth = +Infinity, maxProperties = +Infinity, memo = memoBuilder()) {
    const [memoize, unmemoize] = memo;
    // Get the simple cases out of the way first
    if (value == null || // this matches null and undefined -> eqeq not eqeqeq
    [
        'boolean',
        'string'
    ].includes(typeof value) || typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }
    const stringified = stringifyValue(key, value);
    // Anything we could potentially dig into more (objects or arrays) will have come back as `"[object XXXX]"`.
    // Everything else will have already been serialized, so if we don't see that pattern, we're done.
    if (!stringified.startsWith('[object ')) {
        return stringified;
    }
    // From here on, we can assert that `value` is either an object or an array.
    // Do not normalize objects that we know have already been normalized. As a general rule, the
    // "__sentry_skip_normalization__" property should only be used sparingly and only should only be set on objects that
    // have already been normalized.
    if (value['__sentry_skip_normalization__']) {
        return value;
    }
    // We can set `__sentry_override_normalization_depth__` on an object to ensure that from there
    // We keep a certain amount of depth.
    // This should be used sparingly, e.g. we use it for the redux integration to ensure we get a certain amount of state.
    const remainingDepth = typeof value['__sentry_override_normalization_depth__'] === 'number' ? value['__sentry_override_normalization_depth__'] : depth;
    // We're also done if we've reached the max depth
    if (remainingDepth === 0) {
        // At this point we know `serialized` is a string of the form `"[object XXXX]"`. Clean it up so it's just `"[XXXX]"`.
        return stringified.replace('object ', '');
    }
    // If we've already visited this branch, bail out, as it's circular reference. If not, note that we're seeing it now.
    if (memoize(value)) {
        return '[Circular ~]';
    }
    // If the value has a `toJSON` method, we call it to extract more information
    const valueWithToJSON = value;
    if (valueWithToJSON && typeof valueWithToJSON.toJSON === 'function') {
        try {
            const jsonValue = valueWithToJSON.toJSON();
            // We need to normalize the return value of `.toJSON()` in case it has circular references
            return visit('', jsonValue, remainingDepth - 1, maxProperties, memo);
        } catch  {
        // pass (The built-in `toJSON` failed, but we can still try to do it ourselves)
        }
    }
    // At this point we know we either have an object or an array, we haven't seen it before, and we're going to recurse
    // because we haven't yet reached the max depth. Create an accumulator to hold the results of visiting each
    // property/entry, and keep track of the number of items we add to it.
    const normalized = Array.isArray(value) ? [] : {};
    let numAdded = 0;
    // Before we begin, convert`Error` and`Event` instances into plain objects, since some of each of their relevant
    // properties are non-enumerable and otherwise would get missed.
    const visitable = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["convertToPlainObject"])(value);
    for(const visitKey in visitable){
        // Avoid iterating over fields in the prototype if they've somehow been exposed to enumeration.
        if (!Object.prototype.hasOwnProperty.call(visitable, visitKey)) {
            continue;
        }
        if (numAdded >= maxProperties) {
            normalized[visitKey] = '[MaxProperties ~]';
            break;
        }
        // Recursively visit all the child nodes
        const visitValue = visitable[visitKey];
        normalized[visitKey] = visit(visitKey, visitValue, remainingDepth - 1, maxProperties, memo);
        numAdded++;
    }
    // Once we've visited all the branches, remove the parent from memo storage
    unmemoize(value);
    // Return accumulated values
    return normalized;
}
/* eslint-disable complexity */ /**
 * Stringify the given value. Handles various known special values and types.
 *
 * Not meant to be used on simple primitives which already have a string representation, as it will, for example, turn
 * the number 1231 into "[Object Number]", nor on `null`, as it will throw.
 *
 * @param value The value to stringify
 * @returns A stringified representation of the given value
 */ function stringifyValue(key, // this type is a tiny bit of a cheat, since this function does handle NaN (which is technically a number), but for
// our internal use, it'll do
value) {
    try {
        if (key === 'domain' && value && typeof value === 'object' && value._events) {
            return '[Domain]';
        }
        if (key === 'domainEmitter') {
            return '[DomainEmitter]';
        }
        // It's safe to use `global`, `window`, and `document` here in this manner, as we are asserting using `typeof` first
        // which won't throw if they are not present.
        if (("TURBOPACK compile-time value", "object") !== 'undefined' && value === /*TURBOPACK member replacement*/ __turbopack_context__.g) {
            return '[Global]';
        }
        // eslint-disable-next-line no-restricted-globals
        if (typeof window !== 'undefined' && value === window) {
            return '[Window]';
        }
        // eslint-disable-next-line no-restricted-globals
        if (typeof document !== 'undefined' && value === document) {
            return '[Document]';
        }
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$is$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isVueViewModel"])(value)) {
            return '[VueViewModel]';
        }
        // React's SyntheticEvent thingy
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$is$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSyntheticEvent"])(value)) {
            return '[SyntheticEvent]';
        }
        if (typeof value === 'number' && !Number.isFinite(value)) {
            return `[${value}]`;
        }
        if (typeof value === 'function') {
            return `[Function: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$stacktrace$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getFunctionName"])(value)}]`;
        }
        if (typeof value === 'symbol') {
            return `[${String(value)}]`;
        }
        // stringified BigInts are indistinguishable from regular numbers, so we need to label them to avoid confusion
        if (typeof value === 'bigint') {
            return `[BigInt: ${String(value)}]`;
        }
        // Now that we've knocked out all the special cases and the primitives, all we have left are objects. Simply casting
        // them to strings means that instances of classes which haven't defined their `toStringTag` will just come out as
        // `"[object Object]"`. If we instead look at the constructor's name (which is the same as the name of the class),
        // we can make sure that only plain objects come out that way.
        const objName = getConstructorName(value);
        // Handle HTML Elements
        if (/^HTML(\w*)Element$/.test(objName)) {
            return `[HTMLElement: ${objName}]`;
        }
        return `[object ${objName}]`;
    } catch (err) {
        return `**non-serializable** (${err})`;
    }
}
/* eslint-enable complexity */ function getConstructorName(value) {
    const prototype = Object.getPrototypeOf(value);
    return prototype?.constructor ? prototype.constructor.name : 'null prototype';
}
/** Calculates bytes size of input string */ function utf8Length(value) {
    // eslint-disable-next-line no-bitwise
    return ~-encodeURI(value).split(/%..|./).length;
}
/** Calculates bytes size of input object */ // eslint-disable-next-line @typescript-eslint/no-explicit-any
function jsonSize(value) {
    return utf8Length(JSON.stringify(value));
}
/**
 * Normalizes URLs in exceptions and stacktraces to a base path so Sentry can fingerprint
 * across platforms and working directory.
 *
 * @param url The URL to be normalized.
 * @param basePath The application base path.
 * @returns The normalized URL.
 */ function normalizeUrlToBase(url, basePath) {
    const escapedBase = basePath// Backslash to forward
    .replace(/\\/g, '/')// Escape RegExp special characters
    .replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
    let newUrl = url;
    try {
        newUrl = decodeURI(url);
    } catch  {
    // Sometime this breaks
    }
    return newUrl.replace(/\\/g, '/').replace(/webpack:\/?/g, '') // Remove intermediate base path
    // eslint-disable-next-line @sentry-internal/sdk/no-regexp-constructor
    .replace(new RegExp(`(file://)?/*${escapedBase}/*`, 'ig'), 'app:///');
}
/**
 * Helper to decycle json objects
 */ function memoBuilder() {
    const inner = new WeakSet();
    function memoize(obj) {
        if (inner.has(obj)) {
            return true;
        }
        inner.add(obj);
        return false;
    }
    function unmemoize(obj) {
        inner.delete(obj);
    }
    return [
        memoize,
        unmemoize
    ];
}
;
 //# sourceMappingURL=normalize.js.map
}),
"[project]/dashboard/node_modules/@sentry/core/build/esm/utils/prepareEvent.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "applyClientOptions",
    ()=>applyClientOptions,
    "applyDebugIds",
    ()=>applyDebugIds,
    "applyDebugMeta",
    ()=>applyDebugMeta,
    "parseEventHintOrCaptureContext",
    ()=>parseEventHintOrCaptureContext,
    "prepareEvent",
    ()=>prepareEvent
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/constants.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/currentScopes.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$eventProcessors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/eventProcessors.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$scope$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/scope.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$applyScopeDataToEvent$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/applyScopeDataToEvent.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$debug$2d$ids$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/debug-ids.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$misc$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/misc.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$normalize$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/normalize.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$string$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/string.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$time$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/time.js [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
/**
 * This type makes sure that we get either a CaptureContext, OR an EventHint.
 * It does not allow mixing them, which could lead to unexpected outcomes, e.g. this is disallowed:
 * { user: { id: '123' }, mechanism: { handled: false } }
 */ /**
 * Adds common information to events.
 *
 * The information includes release and environment from `options`,
 * breadcrumbs and context (extra, tags and user) from the scope.
 *
 * Information that is already present in the event is never overwritten. For
 * nested objects, such as the context, keys are merged.
 *
 * @param event The original event.
 * @param hint May contain additional information about the original exception.
 * @param scope A scope containing event metadata.
 * @returns A new event with more information.
 * @hidden
 */ function prepareEvent(options, event, hint, scope, client, isolationScope) {
    const { normalizeDepth = 3, normalizeMaxBreadth = 1000 } = options;
    const prepared = {
        ...event,
        event_id: event.event_id || hint.event_id || (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$misc$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["uuid4"])(),
        timestamp: event.timestamp || (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$time$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["dateTimestampInSeconds"])()
    };
    const integrations = hint.integrations || options.integrations.map((i)=>i.name);
    applyClientOptions(prepared, options);
    applyIntegrationsMetadata(prepared, integrations);
    if (client) {
        client.emit('applyFrameMetadata', event);
    }
    // Only put debug IDs onto frames for error events.
    if (event.type === undefined) {
        applyDebugIds(prepared, options.stackParser);
    }
    // If we have scope given to us, use it as the base for further modifications.
    // This allows us to prevent unnecessary copying of data if `captureContext` is not provided.
    const finalScope = getFinalScope(scope, hint.captureContext);
    if (hint.mechanism) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$misc$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addExceptionMechanism"])(prepared, hint.mechanism);
    }
    const clientEventProcessors = client ? client.getEventProcessors() : [];
    // This should be the last thing called, since we want that
    // {@link Scope.addEventProcessor} gets the finished prepared event.
    // Merge scope data together
    const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getGlobalScope"])().getScopeData();
    if (isolationScope) {
        const isolationData = isolationScope.getScopeData();
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$applyScopeDataToEvent$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mergeScopeData"])(data, isolationData);
    }
    if (finalScope) {
        const finalScopeData = finalScope.getScopeData();
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$applyScopeDataToEvent$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mergeScopeData"])(data, finalScopeData);
    }
    const attachments = [
        ...hint.attachments || [],
        ...data.attachments
    ];
    if (attachments.length) {
        hint.attachments = attachments;
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$applyScopeDataToEvent$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["applyScopeDataToEvent"])(prepared, data);
    const eventProcessors = [
        ...clientEventProcessors,
        // Run scope event processors _after_ all other processors
        ...data.eventProcessors
    ];
    const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$eventProcessors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["notifyEventProcessors"])(eventProcessors, prepared, hint);
    return result.then((evt)=>{
        if (evt) {
            // We apply the debug_meta field only after all event processors have ran, so that if any event processors modified
            // file names (e.g.the RewriteFrames integration) the filename -> debug ID relationship isn't destroyed.
            // This should not cause any PII issues, since we're only moving data that is already on the event and not adding
            // any new data
            applyDebugMeta(evt);
        }
        if (typeof normalizeDepth === 'number' && normalizeDepth > 0) {
            return normalizeEvent(evt, normalizeDepth, normalizeMaxBreadth);
        }
        return evt;
    });
}
/**
 * Enhances event using the client configuration.
 * It takes care of all "static" values like environment, release and `dist`,
 * as well as truncating overly long values.
 *
 * Only exported for tests.
 *
 * @param event event instance to be enhanced
 */ function applyClientOptions(event, options) {
    const { environment, release, dist, maxValueLength } = options;
    // empty strings do not make sense for environment, release, and dist
    // so we handle them the same as if they were not provided
    event.environment = event.environment || environment || __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_ENVIRONMENT"];
    if (!event.release && release) {
        event.release = release;
    }
    if (!event.dist && dist) {
        event.dist = dist;
    }
    const request = event.request;
    if (request?.url) {
        request.url = maxValueLength ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$string$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["truncate"])(request.url, maxValueLength) : request.url;
    }
}
/**
 * Puts debug IDs into the stack frames of an error event.
 */ function applyDebugIds(event, stackParser) {
    // Build a map of filename -> debug_id
    const filenameDebugIdMap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$debug$2d$ids$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getFilenameToDebugIdMap"])(stackParser);
    event.exception?.values?.forEach((exception)=>{
        exception.stacktrace?.frames?.forEach((frame)=>{
            if (frame.filename) {
                frame.debug_id = filenameDebugIdMap[frame.filename];
            }
        });
    });
}
/**
 * Moves debug IDs from the stack frames of an error event into the debug_meta field.
 */ function applyDebugMeta(event) {
    // Extract debug IDs and filenames from the stack frames on the event.
    const filenameDebugIdMap = {};
    event.exception?.values?.forEach((exception)=>{
        exception.stacktrace?.frames?.forEach((frame)=>{
            if (frame.debug_id) {
                if (frame.abs_path) {
                    filenameDebugIdMap[frame.abs_path] = frame.debug_id;
                } else if (frame.filename) {
                    filenameDebugIdMap[frame.filename] = frame.debug_id;
                }
                delete frame.debug_id;
            }
        });
    });
    if (Object.keys(filenameDebugIdMap).length === 0) {
        return;
    }
    // Fill debug_meta information
    event.debug_meta = event.debug_meta || {};
    event.debug_meta.images = event.debug_meta.images || [];
    const images = event.debug_meta.images;
    Object.entries(filenameDebugIdMap).forEach(([filename, debug_id])=>{
        images.push({
            type: 'sourcemap',
            code_file: filename,
            debug_id
        });
    });
}
/**
 * This function adds all used integrations to the SDK info in the event.
 * @param event The event that will be filled with all integrations.
 */ function applyIntegrationsMetadata(event, integrationNames) {
    if (integrationNames.length > 0) {
        event.sdk = event.sdk || {};
        event.sdk.integrations = [
            ...event.sdk.integrations || [],
            ...integrationNames
        ];
    }
}
/**
 * Applies `normalize` function on necessary `Event` attributes to make them safe for serialization.
 * Normalized keys:
 * - `breadcrumbs.data`
 * - `user`
 * - `contexts`
 * - `extra`
 * @param event Event
 * @returns Normalized event
 */ function normalizeEvent(event, depth, maxBreadth) {
    if (!event) {
        return null;
    }
    const normalized = {
        ...event,
        ...event.breadcrumbs && {
            breadcrumbs: event.breadcrumbs.map((b)=>({
                    ...b,
                    ...b.data && {
                        data: (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$normalize$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalize"])(b.data, depth, maxBreadth)
                    }
                }))
        },
        ...event.user && {
            user: (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$normalize$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalize"])(event.user, depth, maxBreadth)
        },
        ...event.contexts && {
            contexts: (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$normalize$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalize"])(event.contexts, depth, maxBreadth)
        },
        ...event.extra && {
            extra: (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$normalize$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalize"])(event.extra, depth, maxBreadth)
        }
    };
    // event.contexts.trace stores information about a Transaction. Similarly,
    // event.spans[] stores information about child Spans. Given that a
    // Transaction is conceptually a Span, normalization should apply to both
    // Transactions and Spans consistently.
    // For now the decision is to skip normalization of Transactions and Spans,
    // so this block overwrites the normalized event to add back the original
    // Transaction information prior to normalization.
    if (event.contexts?.trace && normalized.contexts) {
        normalized.contexts.trace = event.contexts.trace;
        // event.contexts.trace.data may contain circular/dangerous data so we need to normalize it
        if (event.contexts.trace.data) {
            normalized.contexts.trace.data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$normalize$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalize"])(event.contexts.trace.data, depth, maxBreadth);
        }
    }
    // event.spans[].data may contain circular/dangerous data so we need to normalize it
    if (event.spans) {
        normalized.spans = event.spans.map((span)=>{
            return {
                ...span,
                ...span.data && {
                    data: (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$normalize$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalize"])(span.data, depth, maxBreadth)
                }
            };
        });
    }
    // event.contexts.flags (FeatureFlagContext) stores context for our feature
    // flag integrations. It has a greater nesting depth than our other typed
    // Contexts, so we re-normalize with a fixed depth of 3 here. We do not want
    // to skip this in case of conflicting, user-provided context.
    if (event.contexts?.flags && normalized.contexts) {
        normalized.contexts.flags = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$normalize$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalize"])(event.contexts.flags, 3, maxBreadth);
    }
    return normalized;
}
function getFinalScope(scope, captureContext) {
    if (!captureContext) {
        return scope;
    }
    const finalScope = scope ? scope.clone() : new __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$scope$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Scope"]();
    finalScope.update(captureContext);
    return finalScope;
}
/**
 * Parse either an `EventHint` directly, or convert a `CaptureContext` to an `EventHint`.
 * This is used to allow to update method signatures that used to accept a `CaptureContext` but should now accept an `EventHint`.
 */ function parseEventHintOrCaptureContext(hint) {
    if (!hint) {
        return undefined;
    }
    // If you pass a Scope or `() => Scope` as CaptureContext, we just return this as captureContext
    if (hintIsScopeOrFunction(hint)) {
        return {
            captureContext: hint
        };
    }
    if (hintIsScopeContext(hint)) {
        return {
            captureContext: hint
        };
    }
    return hint;
}
function hintIsScopeOrFunction(hint) {
    return hint instanceof __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$scope$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Scope"] || typeof hint === 'function';
}
const captureContextKeys = [
    'user',
    'level',
    'extra',
    'contexts',
    'tags',
    'fingerprint',
    'propagationContext'
];
function hintIsScopeContext(hint) {
    return Object.keys(hint).some((key)=>captureContextKeys.includes(key));
}
;
 //# sourceMappingURL=prepareEvent.js.map
}),
"[project]/dashboard/node_modules/@sentry/core/build/esm/exports.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addEventProcessor",
    ()=>addEventProcessor,
    "captureCheckIn",
    ()=>captureCheckIn,
    "captureEvent",
    ()=>captureEvent,
    "captureException",
    ()=>captureException,
    "captureMessage",
    ()=>captureMessage,
    "captureSession",
    ()=>captureSession,
    "close",
    ()=>close,
    "endSession",
    ()=>endSession,
    "flush",
    ()=>flush,
    "isEnabled",
    ()=>isEnabled,
    "isInitialized",
    ()=>isInitialized,
    "lastEventId",
    ()=>lastEventId,
    "setContext",
    ()=>setContext,
    "setExtra",
    ()=>setExtra,
    "setExtras",
    ()=>setExtras,
    "setTag",
    ()=>setTag,
    "setTags",
    ()=>setTags,
    "setUser",
    ()=>setUser,
    "startSession",
    ()=>startSession,
    "withMonitor",
    ()=>withMonitor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/currentScopes.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$debug$2d$build$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/debug-build.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$session$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/session.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$debug$2d$logger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/debug-logger.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$is$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/is.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$misc$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/misc.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$prepareEvent$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/prepareEvent.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$time$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/time.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$worldwide$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@sentry/core/build/esm/utils/worldwide.js [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
;
/**
 * Captures an exception event and sends it to Sentry.
 *
 * @param exception The exception to capture.
 * @param hint Optional additional data to attach to the Sentry event.
 * @returns the id of the captured Sentry event.
 */ function captureException(exception, hint) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCurrentScope"])().captureException(exception, (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$prepareEvent$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseEventHintOrCaptureContext"])(hint));
}
/**
 * Captures a message event and sends it to Sentry.
 *
 * @param message The message to send to Sentry.
 * @param captureContext Define the level of the message or pass in additional data to attach to the message.
 * @returns the id of the captured message.
 */ function captureMessage(message, captureContext) {
    // This is necessary to provide explicit scopes upgrade, without changing the original
    // arity of the `captureMessage(message, level)` method.
    const level = typeof captureContext === 'string' ? captureContext : undefined;
    const context = typeof captureContext !== 'string' ? {
        captureContext
    } : undefined;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCurrentScope"])().captureMessage(message, level, context);
}
/**
 * Captures a manually created event and sends it to Sentry.
 *
 * @param event The event to send to Sentry.
 * @param hint Optional additional data to attach to the Sentry event.
 * @returns the id of the captured event.
 */ function captureEvent(event, hint) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCurrentScope"])().captureEvent(event, hint);
}
/**
 * Sets context data with the given name.
 * @param name of the context
 * @param context Any kind of data. This data will be normalized.
 */ function setContext(name, context) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getIsolationScope"])().setContext(name, context);
}
/**
 * Set an object that will be merged sent as extra data with the event.
 * @param extras Extras object to merge into current context.
 */ function setExtras(extras) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getIsolationScope"])().setExtras(extras);
}
/**
 * Set key:value that will be sent as extra data with the event.
 * @param key String of extra
 * @param extra Any kind of data. This data will be normalized.
 */ function setExtra(key, extra) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getIsolationScope"])().setExtra(key, extra);
}
/**
 * Set an object that will be merged sent as tags data with the event.
 * @param tags Tags context object to merge into current context.
 */ function setTags(tags) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getIsolationScope"])().setTags(tags);
}
/**
 * Set key:value that will be sent as tags data with the event.
 *
 * Can also be used to unset a tag, by passing `undefined`.
 *
 * @param key String key of tag
 * @param value Value of tag
 */ function setTag(key, value) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getIsolationScope"])().setTag(key, value);
}
/**
 * Updates user context information for future events.
 *
 * @param user User context object to be set in the current context. Pass `null` to unset the user.
 */ function setUser(user) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getIsolationScope"])().setUser(user);
}
/**
 * The last error event id of the isolation scope.
 *
 * Warning: This function really returns the last recorded error event id on the current
 * isolation scope. If you call this function after handling a certain error and another error
 * is captured in between, the last one is returned instead of the one you might expect.
 * Also, ids of events that were never sent to Sentry (for example because
 * they were dropped in `beforeSend`) could be returned.
 *
 * @returns The last event id of the isolation scope.
 */ function lastEventId() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getIsolationScope"])().lastEventId();
}
/**
 * Create a cron monitor check in and send it to Sentry.
 *
 * @param checkIn An object that describes a check in.
 * @param upsertMonitorConfig An optional object that describes a monitor config. Use this if you want
 * to create a monitor automatically when sending a check in.
 */ function captureCheckIn(checkIn, upsertMonitorConfig) {
    const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCurrentScope"])();
    const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getClient"])();
    if (!client) {
        __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$debug$2d$build$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEBUG_BUILD"] && __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$debug$2d$logger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["debug"].warn('Cannot capture check-in. No client defined.');
    } else if (!client.captureCheckIn) {
        __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$debug$2d$build$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEBUG_BUILD"] && __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$debug$2d$logger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["debug"].warn('Cannot capture check-in. Client does not support sending check-ins.');
    } else {
        return client.captureCheckIn(checkIn, upsertMonitorConfig, scope);
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$misc$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["uuid4"])();
}
/**
 * Wraps a callback with a cron monitor check in. The check in will be sent to Sentry when the callback finishes.
 *
 * @param monitorSlug The distinct slug of the monitor.
 * @param callback Callback to be monitored
 * @param upsertMonitorConfig An optional object that describes a monitor config. Use this if you want
 * to create a monitor automatically when sending a check in.
 */ function withMonitor(monitorSlug, callback, upsertMonitorConfig) {
    const checkInId = captureCheckIn({
        monitorSlug,
        status: 'in_progress'
    }, upsertMonitorConfig);
    const now = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$time$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["timestampInSeconds"])();
    function finishCheckIn(status) {
        captureCheckIn({
            monitorSlug,
            status,
            checkInId,
            duration: (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$time$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["timestampInSeconds"])() - now
        });
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["withIsolationScope"])(()=>{
        let maybePromiseResult;
        try {
            maybePromiseResult = callback();
        } catch (e) {
            finishCheckIn('error');
            throw e;
        }
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$is$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isThenable"])(maybePromiseResult)) {
            return maybePromiseResult.then((r)=>{
                finishCheckIn('ok');
                return r;
            }, (e)=>{
                finishCheckIn('error');
                throw e;
            });
        }
        finishCheckIn('ok');
        return maybePromiseResult;
    });
}
/**
 * Call `flush()` on the current client, if there is one. See {@link Client.flush}.
 *
 * @param timeout Maximum time in ms the client should wait to flush its event queue. Omitting this parameter will cause
 * the client to wait until all events are sent before resolving the promise.
 * @returns A promise which resolves to `true` if the queue successfully drains before the timeout, or `false` if it
 * doesn't (or if there's no client defined).
 */ async function flush(timeout) {
    const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getClient"])();
    if (client) {
        return client.flush(timeout);
    }
    __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$debug$2d$build$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEBUG_BUILD"] && __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$debug$2d$logger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["debug"].warn('Cannot flush events. No client defined.');
    return Promise.resolve(false);
}
/**
 * Call `close()` on the current client, if there is one. See {@link Client.close}.
 *
 * @param timeout Maximum time in ms the client should wait to flush its event queue before shutting down. Omitting this
 * parameter will cause the client to wait until all events are sent before disabling itself.
 * @returns A promise which resolves to `true` if the queue successfully drains before the timeout, or `false` if it
 * doesn't (or if there's no client defined).
 */ async function close(timeout) {
    const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getClient"])();
    if (client) {
        return client.close(timeout);
    }
    __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$debug$2d$build$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEBUG_BUILD"] && __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$debug$2d$logger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["debug"].warn('Cannot flush events and disable SDK. No client defined.');
    return Promise.resolve(false);
}
/**
 * Returns true if Sentry has been properly initialized.
 */ function isInitialized() {
    return !!(0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getClient"])();
}
/** If the SDK is initialized & enabled. */ function isEnabled() {
    const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getClient"])();
    return client?.getOptions().enabled !== false && !!client?.getTransport();
}
/**
 * Add an event processor.
 * This will be added to the current isolation scope, ensuring any event that is processed in the current execution
 * context will have the processor applied.
 */ function addEventProcessor(callback) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getIsolationScope"])().addEventProcessor(callback);
}
/**
 * Start a session on the current isolation scope.
 *
 * @param context (optional) additional properties to be applied to the returned session object
 *
 * @returns the new active session
 */ function startSession(context) {
    const isolationScope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getIsolationScope"])();
    const currentScope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCurrentScope"])();
    // Will fetch userAgent if called from browser sdk
    const { userAgent } = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$utils$2f$worldwide$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GLOBAL_OBJ"].navigator || {};
    const session = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$session$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["makeSession"])({
        user: currentScope.getUser() || isolationScope.getUser(),
        ...userAgent && {
            userAgent
        },
        ...context
    });
    // End existing session if there's one
    const currentSession = isolationScope.getSession();
    if (currentSession?.status === 'ok') {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$session$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateSession"])(currentSession, {
            status: 'exited'
        });
    }
    endSession();
    // Afterwards we set the new session on the scope
    isolationScope.setSession(session);
    return session;
}
/**
 * End the session on the current isolation scope.
 */ function endSession() {
    const isolationScope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getIsolationScope"])();
    const currentScope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCurrentScope"])();
    const session = currentScope.getSession() || isolationScope.getSession();
    if (session) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$session$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["closeSession"])(session);
    }
    _sendSessionUpdate();
    // the session is over; take it off of the scope
    isolationScope.setSession();
}
/**
 * Sends the current Session on the scope
 */ function _sendSessionUpdate() {
    const isolationScope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getIsolationScope"])();
    const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$sentry$2f$core$2f$build$2f$esm$2f$currentScopes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getClient"])();
    const session = isolationScope.getSession();
    if (session && client) {
        client.captureSession(session);
    }
}
/**
 * Sends the current session on the scope to Sentry
 *
 * @param end If set the session will be marked as exited and removed from the scope.
 *            Defaults to `false`.
 */ function captureSession(end = false) {
    // both send the update and pull the session from the scope
    if (end) {
        endSession();
        return;
    }
    // only send the update
    _sendSessionUpdate();
}
;
 //# sourceMappingURL=exports.js.map
}),
"[project]/dashboard/node_modules/axios/lib/helpers/bind.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>bind
]);
'use strict';
function bind(fn, thisArg) {
    return function wrap() {
        return fn.apply(thisArg, arguments);
    };
}
}),
"[project]/dashboard/node_modules/axios/lib/utils.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/dashboard/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$bind$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/helpers/bind.js [app-client] (ecmascript)");
'use strict';
;
// utils is a library of generic helper functions non-specific to axios
const { toString } = Object.prototype;
const { getPrototypeOf } = Object;
const { iterator, toStringTag } = Symbol;
const kindOf = ((cache)=>(thing)=>{
        const str = toString.call(thing);
        return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
    })(Object.create(null));
const kindOfTest = (type)=>{
    type = type.toLowerCase();
    return (thing)=>kindOf(thing) === type;
};
const typeOfTest = (type)=>(thing)=>typeof thing === type;
/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 *
 * @returns {boolean} True if value is an Array, otherwise false
 */ const { isArray } = Array;
/**
 * Determine if a value is undefined
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if the value is undefined, otherwise false
 */ const isUndefined = typeOfTest('undefined');
/**
 * Determine if a value is a Buffer
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a Buffer, otherwise false
 */ function isBuffer(val) {
    return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor) && isFunction(val.constructor.isBuffer) && val.constructor.isBuffer(val);
}
/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */ const isArrayBuffer = kindOfTest('ArrayBuffer');
/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */ function isArrayBufferView(val) {
    let result;
    if (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView) {
        result = ArrayBuffer.isView(val);
    } else {
        result = val && val.buffer && isArrayBuffer(val.buffer);
    }
    return result;
}
/**
 * Determine if a value is a String
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a String, otherwise false
 */ const isString = typeOfTest('string');
/**
 * Determine if a value is a Function
 *
 * @param {*} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */ const isFunction = typeOfTest('function');
/**
 * Determine if a value is a Number
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a Number, otherwise false
 */ const isNumber = typeOfTest('number');
/**
 * Determine if a value is an Object
 *
 * @param {*} thing The value to test
 *
 * @returns {boolean} True if value is an Object, otherwise false
 */ const isObject = (thing)=>thing !== null && typeof thing === 'object';
/**
 * Determine if a value is a Boolean
 *
 * @param {*} thing The value to test
 * @returns {boolean} True if value is a Boolean, otherwise false
 */ const isBoolean = (thing)=>thing === true || thing === false;
/**
 * Determine if a value is a plain Object
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a plain Object, otherwise false
 */ const isPlainObject = (val)=>{
    if (kindOf(val) !== 'object') {
        return false;
    }
    const prototype = getPrototypeOf(val);
    return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(toStringTag in val) && !(iterator in val);
};
/**
 * Determine if a value is an empty object (safely handles Buffers)
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is an empty object, otherwise false
 */ const isEmptyObject = (val)=>{
    // Early return for non-objects or Buffers to prevent RangeError
    if (!isObject(val) || isBuffer(val)) {
        return false;
    }
    try {
        return Object.keys(val).length === 0 && Object.getPrototypeOf(val) === Object.prototype;
    } catch (e) {
        // Fallback for any other objects that might cause RangeError with Object.keys()
        return false;
    }
};
/**
 * Determine if a value is a Date
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a Date, otherwise false
 */ const isDate = kindOfTest('Date');
/**
 * Determine if a value is a File
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a File, otherwise false
 */ const isFile = kindOfTest('File');
/**
 * Determine if a value is a Blob
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a Blob, otherwise false
 */ const isBlob = kindOfTest('Blob');
/**
 * Determine if a value is a FileList
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a File, otherwise false
 */ const isFileList = kindOfTest('FileList');
/**
 * Determine if a value is a Stream
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a Stream, otherwise false
 */ const isStream = (val)=>isObject(val) && isFunction(val.pipe);
/**
 * Determine if a value is a FormData
 *
 * @param {*} thing The value to test
 *
 * @returns {boolean} True if value is an FormData, otherwise false
 */ const isFormData = (thing)=>{
    let kind;
    return thing && (typeof FormData === 'function' && thing instanceof FormData || isFunction(thing.append) && ((kind = kindOf(thing)) === 'formdata' || kind === 'object' && isFunction(thing.toString) && thing.toString() === '[object FormData]'));
};
/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */ const isURLSearchParams = kindOfTest('URLSearchParams');
const [isReadableStream, isRequest, isResponse, isHeaders] = [
    'ReadableStream',
    'Request',
    'Response',
    'Headers'
].map(kindOfTest);
/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 *
 * @returns {String} The String freed of excess whitespace
 */ const trim = (str)=>str.trim ? str.trim() : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 *
 * @param {Boolean} [allOwnKeys = false]
 * @returns {any}
 */ function forEach(obj, fn, { allOwnKeys = false } = {}) {
    // Don't bother if no value provided
    if (obj === null || typeof obj === 'undefined') {
        return;
    }
    let i;
    let l;
    // Force an array if not already something iterable
    if (typeof obj !== 'object') {
        /*eslint no-param-reassign:0*/ obj = [
            obj
        ];
    }
    if (isArray(obj)) {
        // Iterate over array values
        for(i = 0, l = obj.length; i < l; i++){
            fn.call(null, obj[i], i, obj);
        }
    } else {
        // Buffer check
        if (isBuffer(obj)) {
            return;
        }
        // Iterate over object keys
        const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
        const len = keys.length;
        let key;
        for(i = 0; i < len; i++){
            key = keys[i];
            fn.call(null, obj[key], key, obj);
        }
    }
}
function findKey(obj, key) {
    if (isBuffer(obj)) {
        return null;
    }
    key = key.toLowerCase();
    const keys = Object.keys(obj);
    let i = keys.length;
    let _key;
    while(i-- > 0){
        _key = keys[i];
        if (key === _key.toLowerCase()) {
            return _key;
        }
    }
    return null;
}
const _global = (()=>{
    /*eslint no-undef:0*/ if (typeof globalThis !== "undefined") return globalThis;
    return typeof self !== "undefined" ? self : typeof window !== 'undefined' ? window : /*TURBOPACK member replacement*/ __turbopack_context__.g;
})();
const isContextDefined = (context)=>!isUndefined(context) && context !== _global;
/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 *
 * @returns {Object} Result of all merge properties
 */ function merge() {
    const { caseless, skipUndefined } = isContextDefined(this) && this || {};
    const result = {};
    const assignValue = (val, key)=>{
        const targetKey = caseless && findKey(result, key) || key;
        if (isPlainObject(result[targetKey]) && isPlainObject(val)) {
            result[targetKey] = merge(result[targetKey], val);
        } else if (isPlainObject(val)) {
            result[targetKey] = merge({}, val);
        } else if (isArray(val)) {
            result[targetKey] = val.slice();
        } else if (!skipUndefined || !isUndefined(val)) {
            result[targetKey] = val;
        }
    };
    for(let i = 0, l = arguments.length; i < l; i++){
        arguments[i] && forEach(arguments[i], assignValue);
    }
    return result;
}
/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 *
 * @param {Boolean} [allOwnKeys]
 * @returns {Object} The resulting value of object a
 */ const extend = (a, b, thisArg, { allOwnKeys } = {})=>{
    forEach(b, (val, key)=>{
        if (thisArg && isFunction(val)) {
            a[key] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$bind$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(val, thisArg);
        } else {
            a[key] = val;
        }
    }, {
        allOwnKeys
    });
    return a;
};
/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 *
 * @returns {string} content value without BOM
 */ const stripBOM = (content)=>{
    if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
    }
    return content;
};
/**
 * Inherit the prototype methods from one constructor into another
 * @param {function} constructor
 * @param {function} superConstructor
 * @param {object} [props]
 * @param {object} [descriptors]
 *
 * @returns {void}
 */ const inherits = (constructor, superConstructor, props, descriptors)=>{
    constructor.prototype = Object.create(superConstructor.prototype, descriptors);
    constructor.prototype.constructor = constructor;
    Object.defineProperty(constructor, 'super', {
        value: superConstructor.prototype
    });
    props && Object.assign(constructor.prototype, props);
};
/**
 * Resolve object with deep prototype chain to a flat object
 * @param {Object} sourceObj source object
 * @param {Object} [destObj]
 * @param {Function|Boolean} [filter]
 * @param {Function} [propFilter]
 *
 * @returns {Object}
 */ const toFlatObject = (sourceObj, destObj, filter, propFilter)=>{
    let props;
    let i;
    let prop;
    const merged = {};
    destObj = destObj || {};
    // eslint-disable-next-line no-eq-null,eqeqeq
    if (sourceObj == null) return destObj;
    do {
        props = Object.getOwnPropertyNames(sourceObj);
        i = props.length;
        while(i-- > 0){
            prop = props[i];
            if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
                destObj[prop] = sourceObj[prop];
                merged[prop] = true;
            }
        }
        sourceObj = filter !== false && getPrototypeOf(sourceObj);
    }while (sourceObj && (!filter || filter(sourceObj, destObj)) && sourceObj !== Object.prototype)
    return destObj;
};
/**
 * Determines whether a string ends with the characters of a specified string
 *
 * @param {String} str
 * @param {String} searchString
 * @param {Number} [position= 0]
 *
 * @returns {boolean}
 */ const endsWith = (str, searchString, position)=>{
    str = String(str);
    if (position === undefined || position > str.length) {
        position = str.length;
    }
    position -= searchString.length;
    const lastIndex = str.indexOf(searchString, position);
    return lastIndex !== -1 && lastIndex === position;
};
/**
 * Returns new array from array like object or null if failed
 *
 * @param {*} [thing]
 *
 * @returns {?Array}
 */ const toArray = (thing)=>{
    if (!thing) return null;
    if (isArray(thing)) return thing;
    let i = thing.length;
    if (!isNumber(i)) return null;
    const arr = new Array(i);
    while(i-- > 0){
        arr[i] = thing[i];
    }
    return arr;
};
/**
 * Checking if the Uint8Array exists and if it does, it returns a function that checks if the
 * thing passed in is an instance of Uint8Array
 *
 * @param {TypedArray}
 *
 * @returns {Array}
 */ // eslint-disable-next-line func-names
const isTypedArray = ((TypedArray)=>{
    // eslint-disable-next-line func-names
    return (thing)=>{
        return TypedArray && thing instanceof TypedArray;
    };
})(typeof Uint8Array !== 'undefined' && getPrototypeOf(Uint8Array));
/**
 * For each entry in the object, call the function with the key and value.
 *
 * @param {Object<any, any>} obj - The object to iterate over.
 * @param {Function} fn - The function to call for each entry.
 *
 * @returns {void}
 */ const forEachEntry = (obj, fn)=>{
    const generator = obj && obj[iterator];
    const _iterator = generator.call(obj);
    let result;
    while((result = _iterator.next()) && !result.done){
        const pair = result.value;
        fn.call(obj, pair[0], pair[1]);
    }
};
/**
 * It takes a regular expression and a string, and returns an array of all the matches
 *
 * @param {string} regExp - The regular expression to match against.
 * @param {string} str - The string to search.
 *
 * @returns {Array<boolean>}
 */ const matchAll = (regExp, str)=>{
    let matches;
    const arr = [];
    while((matches = regExp.exec(str)) !== null){
        arr.push(matches);
    }
    return arr;
};
/* Checking if the kindOfTest function returns true when passed an HTMLFormElement. */ const isHTMLForm = kindOfTest('HTMLFormElement');
const toCamelCase = (str)=>{
    return str.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function replacer(m, p1, p2) {
        return p1.toUpperCase() + p2;
    });
};
/* Creating a function that will check if an object has a property. */ const hasOwnProperty = (({ hasOwnProperty })=>(obj, prop)=>hasOwnProperty.call(obj, prop))(Object.prototype);
/**
 * Determine if a value is a RegExp object
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a RegExp object, otherwise false
 */ const isRegExp = kindOfTest('RegExp');
const reduceDescriptors = (obj, reducer)=>{
    const descriptors = Object.getOwnPropertyDescriptors(obj);
    const reducedDescriptors = {};
    forEach(descriptors, (descriptor, name)=>{
        let ret;
        if ((ret = reducer(descriptor, name, obj)) !== false) {
            reducedDescriptors[name] = ret || descriptor;
        }
    });
    Object.defineProperties(obj, reducedDescriptors);
};
/**
 * Makes all methods read-only
 * @param {Object} obj
 */ const freezeMethods = (obj)=>{
    reduceDescriptors(obj, (descriptor, name)=>{
        // skip restricted props in strict mode
        if (isFunction(obj) && [
            'arguments',
            'caller',
            'callee'
        ].indexOf(name) !== -1) {
            return false;
        }
        const value = obj[name];
        if (!isFunction(value)) return;
        descriptor.enumerable = false;
        if ('writable' in descriptor) {
            descriptor.writable = false;
            return;
        }
        if (!descriptor.set) {
            descriptor.set = ()=>{
                throw Error('Can not rewrite read-only method \'' + name + '\'');
            };
        }
    });
};
const toObjectSet = (arrayOrString, delimiter)=>{
    const obj = {};
    const define = (arr)=>{
        arr.forEach((value)=>{
            obj[value] = true;
        });
    };
    isArray(arrayOrString) ? define(arrayOrString) : define(String(arrayOrString).split(delimiter));
    return obj;
};
const noop = ()=>{};
const toFiniteNumber = (value, defaultValue)=>{
    return value != null && Number.isFinite(value = +value) ? value : defaultValue;
};
/**
 * If the thing is a FormData object, return true, otherwise return false.
 *
 * @param {unknown} thing - The thing to check.
 *
 * @returns {boolean}
 */ function isSpecCompliantForm(thing) {
    return !!(thing && isFunction(thing.append) && thing[toStringTag] === 'FormData' && thing[iterator]);
}
const toJSONObject = (obj)=>{
    const stack = new Array(10);
    const visit = (source, i)=>{
        if (isObject(source)) {
            if (stack.indexOf(source) >= 0) {
                return;
            }
            //Buffer check
            if (isBuffer(source)) {
                return source;
            }
            if (!('toJSON' in source)) {
                stack[i] = source;
                const target = isArray(source) ? [] : {};
                forEach(source, (value, key)=>{
                    const reducedValue = visit(value, i + 1);
                    !isUndefined(reducedValue) && (target[key] = reducedValue);
                });
                stack[i] = undefined;
                return target;
            }
        }
        return source;
    };
    return visit(obj, 0);
};
const isAsyncFn = kindOfTest('AsyncFunction');
const isThenable = (thing)=>thing && (isObject(thing) || isFunction(thing)) && isFunction(thing.then) && isFunction(thing.catch);
// original code
// https://github.com/DigitalBrainJS/AxiosPromise/blob/16deab13710ec09779922131f3fa5954320f83ab/lib/utils.js#L11-L34
const _setImmediate = ((setImmediateSupported, postMessageSupported)=>{
    if (setImmediateSupported) {
        return setImmediate;
    }
    return postMessageSupported ? ((token, callbacks)=>{
        _global.addEventListener("message", ({ source, data })=>{
            if (source === _global && data === token) {
                callbacks.length && callbacks.shift()();
            }
        }, false);
        return (cb)=>{
            callbacks.push(cb);
            _global.postMessage(token, "*");
        };
    })(`axios@${Math.random()}`, []) : (cb)=>setTimeout(cb);
})(typeof setImmediate === 'function', isFunction(_global.postMessage));
const asap = typeof queueMicrotask !== 'undefined' ? queueMicrotask.bind(_global) : typeof __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"] !== 'undefined' && __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].nextTick || _setImmediate;
// *********************
const isIterable = (thing)=>thing != null && isFunction(thing[iterator]);
const __TURBOPACK__default__export__ = {
    isArray,
    isArrayBuffer,
    isBuffer,
    isFormData,
    isArrayBufferView,
    isString,
    isNumber,
    isBoolean,
    isObject,
    isPlainObject,
    isEmptyObject,
    isReadableStream,
    isRequest,
    isResponse,
    isHeaders,
    isUndefined,
    isDate,
    isFile,
    isBlob,
    isRegExp,
    isFunction,
    isStream,
    isURLSearchParams,
    isTypedArray,
    isFileList,
    forEach,
    merge,
    extend,
    trim,
    stripBOM,
    inherits,
    toFlatObject,
    kindOf,
    kindOfTest,
    endsWith,
    toArray,
    forEachEntry,
    matchAll,
    isHTMLForm,
    hasOwnProperty,
    hasOwnProp: hasOwnProperty,
    reduceDescriptors,
    freezeMethods,
    toObjectSet,
    toCamelCase,
    noop,
    toFiniteNumber,
    findKey,
    global: _global,
    isContextDefined,
    isSpecCompliantForm,
    toJSONObject,
    isAsyncFn,
    isThenable,
    setImmediate: _setImmediate,
    asap,
    isIterable
};
}),
"[project]/dashboard/node_modules/next/dist/compiled/buffer/index.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {

(function() {
    var e = {
        675: function(e, r) {
            "use strict";
            r.byteLength = byteLength;
            r.toByteArray = toByteArray;
            r.fromByteArray = fromByteArray;
            var t = [];
            var f = [];
            var n = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
            var i = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
            for(var o = 0, u = i.length; o < u; ++o){
                t[o] = i[o];
                f[i.charCodeAt(o)] = o;
            }
            f["-".charCodeAt(0)] = 62;
            f["_".charCodeAt(0)] = 63;
            function getLens(e) {
                var r = e.length;
                if (r % 4 > 0) {
                    throw new Error("Invalid string. Length must be a multiple of 4");
                }
                var t = e.indexOf("=");
                if (t === -1) t = r;
                var f = t === r ? 0 : 4 - t % 4;
                return [
                    t,
                    f
                ];
            }
            function byteLength(e) {
                var r = getLens(e);
                var t = r[0];
                var f = r[1];
                return (t + f) * 3 / 4 - f;
            }
            function _byteLength(e, r, t) {
                return (r + t) * 3 / 4 - t;
            }
            function toByteArray(e) {
                var r;
                var t = getLens(e);
                var i = t[0];
                var o = t[1];
                var u = new n(_byteLength(e, i, o));
                var a = 0;
                var s = o > 0 ? i - 4 : i;
                var h;
                for(h = 0; h < s; h += 4){
                    r = f[e.charCodeAt(h)] << 18 | f[e.charCodeAt(h + 1)] << 12 | f[e.charCodeAt(h + 2)] << 6 | f[e.charCodeAt(h + 3)];
                    u[a++] = r >> 16 & 255;
                    u[a++] = r >> 8 & 255;
                    u[a++] = r & 255;
                }
                if (o === 2) {
                    r = f[e.charCodeAt(h)] << 2 | f[e.charCodeAt(h + 1)] >> 4;
                    u[a++] = r & 255;
                }
                if (o === 1) {
                    r = f[e.charCodeAt(h)] << 10 | f[e.charCodeAt(h + 1)] << 4 | f[e.charCodeAt(h + 2)] >> 2;
                    u[a++] = r >> 8 & 255;
                    u[a++] = r & 255;
                }
                return u;
            }
            function tripletToBase64(e) {
                return t[e >> 18 & 63] + t[e >> 12 & 63] + t[e >> 6 & 63] + t[e & 63];
            }
            function encodeChunk(e, r, t) {
                var f;
                var n = [];
                for(var i = r; i < t; i += 3){
                    f = (e[i] << 16 & 16711680) + (e[i + 1] << 8 & 65280) + (e[i + 2] & 255);
                    n.push(tripletToBase64(f));
                }
                return n.join("");
            }
            function fromByteArray(e) {
                var r;
                var f = e.length;
                var n = f % 3;
                var i = [];
                var o = 16383;
                for(var u = 0, a = f - n; u < a; u += o){
                    i.push(encodeChunk(e, u, u + o > a ? a : u + o));
                }
                if (n === 1) {
                    r = e[f - 1];
                    i.push(t[r >> 2] + t[r << 4 & 63] + "==");
                } else if (n === 2) {
                    r = (e[f - 2] << 8) + e[f - 1];
                    i.push(t[r >> 10] + t[r >> 4 & 63] + t[r << 2 & 63] + "=");
                }
                return i.join("");
            }
        },
        72: function(e, r, t) {
            "use strict";
            /*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */ var f = t(675);
            var n = t(783);
            var i = typeof Symbol === "function" && typeof Symbol.for === "function" ? Symbol.for("nodejs.util.inspect.custom") : null;
            r.Buffer = Buffer;
            r.SlowBuffer = SlowBuffer;
            r.INSPECT_MAX_BYTES = 50;
            var o = 2147483647;
            r.kMaxLength = o;
            Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport();
            if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== "undefined" && typeof console.error === "function") {
                console.error("This browser lacks typed array (Uint8Array) support which is required by " + "`buffer` v5.x. Use `buffer` v4.x if you require old browser support.");
            }
            function typedArraySupport() {
                try {
                    var e = new Uint8Array(1);
                    var r = {
                        foo: function() {
                            return 42;
                        }
                    };
                    Object.setPrototypeOf(r, Uint8Array.prototype);
                    Object.setPrototypeOf(e, r);
                    return e.foo() === 42;
                } catch (e) {
                    return false;
                }
            }
            Object.defineProperty(Buffer.prototype, "parent", {
                enumerable: true,
                get: function() {
                    if (!Buffer.isBuffer(this)) return undefined;
                    return this.buffer;
                }
            });
            Object.defineProperty(Buffer.prototype, "offset", {
                enumerable: true,
                get: function() {
                    if (!Buffer.isBuffer(this)) return undefined;
                    return this.byteOffset;
                }
            });
            function createBuffer(e) {
                if (e > o) {
                    throw new RangeError('The value "' + e + '" is invalid for option "size"');
                }
                var r = new Uint8Array(e);
                Object.setPrototypeOf(r, Buffer.prototype);
                return r;
            }
            function Buffer(e, r, t) {
                if (typeof e === "number") {
                    if (typeof r === "string") {
                        throw new TypeError('The "string" argument must be of type string. Received type number');
                    }
                    return allocUnsafe(e);
                }
                return from(e, r, t);
            }
            Buffer.poolSize = 8192;
            function from(e, r, t) {
                if (typeof e === "string") {
                    return fromString(e, r);
                }
                if (ArrayBuffer.isView(e)) {
                    return fromArrayLike(e);
                }
                if (e == null) {
                    throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, " + "or Array-like Object. Received type " + typeof e);
                }
                if (isInstance(e, ArrayBuffer) || e && isInstance(e.buffer, ArrayBuffer)) {
                    return fromArrayBuffer(e, r, t);
                }
                if (typeof SharedArrayBuffer !== "undefined" && (isInstance(e, SharedArrayBuffer) || e && isInstance(e.buffer, SharedArrayBuffer))) {
                    return fromArrayBuffer(e, r, t);
                }
                if (typeof e === "number") {
                    throw new TypeError('The "value" argument must not be of type number. Received type number');
                }
                var f = e.valueOf && e.valueOf();
                if (f != null && f !== e) {
                    return Buffer.from(f, r, t);
                }
                var n = fromObject(e);
                if (n) return n;
                if (typeof Symbol !== "undefined" && Symbol.toPrimitive != null && typeof e[Symbol.toPrimitive] === "function") {
                    return Buffer.from(e[Symbol.toPrimitive]("string"), r, t);
                }
                throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, " + "or Array-like Object. Received type " + typeof e);
            }
            Buffer.from = function(e, r, t) {
                return from(e, r, t);
            };
            Object.setPrototypeOf(Buffer.prototype, Uint8Array.prototype);
            Object.setPrototypeOf(Buffer, Uint8Array);
            function assertSize(e) {
                if (typeof e !== "number") {
                    throw new TypeError('"size" argument must be of type number');
                } else if (e < 0) {
                    throw new RangeError('The value "' + e + '" is invalid for option "size"');
                }
            }
            function alloc(e, r, t) {
                assertSize(e);
                if (e <= 0) {
                    return createBuffer(e);
                }
                if (r !== undefined) {
                    return typeof t === "string" ? createBuffer(e).fill(r, t) : createBuffer(e).fill(r);
                }
                return createBuffer(e);
            }
            Buffer.alloc = function(e, r, t) {
                return alloc(e, r, t);
            };
            function allocUnsafe(e) {
                assertSize(e);
                return createBuffer(e < 0 ? 0 : checked(e) | 0);
            }
            Buffer.allocUnsafe = function(e) {
                return allocUnsafe(e);
            };
            Buffer.allocUnsafeSlow = function(e) {
                return allocUnsafe(e);
            };
            function fromString(e, r) {
                if (typeof r !== "string" || r === "") {
                    r = "utf8";
                }
                if (!Buffer.isEncoding(r)) {
                    throw new TypeError("Unknown encoding: " + r);
                }
                var t = byteLength(e, r) | 0;
                var f = createBuffer(t);
                var n = f.write(e, r);
                if (n !== t) {
                    f = f.slice(0, n);
                }
                return f;
            }
            function fromArrayLike(e) {
                var r = e.length < 0 ? 0 : checked(e.length) | 0;
                var t = createBuffer(r);
                for(var f = 0; f < r; f += 1){
                    t[f] = e[f] & 255;
                }
                return t;
            }
            function fromArrayBuffer(e, r, t) {
                if (r < 0 || e.byteLength < r) {
                    throw new RangeError('"offset" is outside of buffer bounds');
                }
                if (e.byteLength < r + (t || 0)) {
                    throw new RangeError('"length" is outside of buffer bounds');
                }
                var f;
                if (r === undefined && t === undefined) {
                    f = new Uint8Array(e);
                } else if (t === undefined) {
                    f = new Uint8Array(e, r);
                } else {
                    f = new Uint8Array(e, r, t);
                }
                Object.setPrototypeOf(f, Buffer.prototype);
                return f;
            }
            function fromObject(e) {
                if (Buffer.isBuffer(e)) {
                    var r = checked(e.length) | 0;
                    var t = createBuffer(r);
                    if (t.length === 0) {
                        return t;
                    }
                    e.copy(t, 0, 0, r);
                    return t;
                }
                if (e.length !== undefined) {
                    if (typeof e.length !== "number" || numberIsNaN(e.length)) {
                        return createBuffer(0);
                    }
                    return fromArrayLike(e);
                }
                if (e.type === "Buffer" && Array.isArray(e.data)) {
                    return fromArrayLike(e.data);
                }
            }
            function checked(e) {
                if (e >= o) {
                    throw new RangeError("Attempt to allocate Buffer larger than maximum " + "size: 0x" + o.toString(16) + " bytes");
                }
                return e | 0;
            }
            function SlowBuffer(e) {
                if (+e != e) {
                    e = 0;
                }
                return Buffer.alloc(+e);
            }
            Buffer.isBuffer = function isBuffer(e) {
                return e != null && e._isBuffer === true && e !== Buffer.prototype;
            };
            Buffer.compare = function compare(e, r) {
                if (isInstance(e, Uint8Array)) e = Buffer.from(e, e.offset, e.byteLength);
                if (isInstance(r, Uint8Array)) r = Buffer.from(r, r.offset, r.byteLength);
                if (!Buffer.isBuffer(e) || !Buffer.isBuffer(r)) {
                    throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');
                }
                if (e === r) return 0;
                var t = e.length;
                var f = r.length;
                for(var n = 0, i = Math.min(t, f); n < i; ++n){
                    if (e[n] !== r[n]) {
                        t = e[n];
                        f = r[n];
                        break;
                    }
                }
                if (t < f) return -1;
                if (f < t) return 1;
                return 0;
            };
            Buffer.isEncoding = function isEncoding(e) {
                switch(String(e).toLowerCase()){
                    case "hex":
                    case "utf8":
                    case "utf-8":
                    case "ascii":
                    case "latin1":
                    case "binary":
                    case "base64":
                    case "ucs2":
                    case "ucs-2":
                    case "utf16le":
                    case "utf-16le":
                        return true;
                    default:
                        return false;
                }
            };
            Buffer.concat = function concat(e, r) {
                if (!Array.isArray(e)) {
                    throw new TypeError('"list" argument must be an Array of Buffers');
                }
                if (e.length === 0) {
                    return Buffer.alloc(0);
                }
                var t;
                if (r === undefined) {
                    r = 0;
                    for(t = 0; t < e.length; ++t){
                        r += e[t].length;
                    }
                }
                var f = Buffer.allocUnsafe(r);
                var n = 0;
                for(t = 0; t < e.length; ++t){
                    var i = e[t];
                    if (isInstance(i, Uint8Array)) {
                        i = Buffer.from(i);
                    }
                    if (!Buffer.isBuffer(i)) {
                        throw new TypeError('"list" argument must be an Array of Buffers');
                    }
                    i.copy(f, n);
                    n += i.length;
                }
                return f;
            };
            function byteLength(e, r) {
                if (Buffer.isBuffer(e)) {
                    return e.length;
                }
                if (ArrayBuffer.isView(e) || isInstance(e, ArrayBuffer)) {
                    return e.byteLength;
                }
                if (typeof e !== "string") {
                    throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' + "Received type " + typeof e);
                }
                var t = e.length;
                var f = arguments.length > 2 && arguments[2] === true;
                if (!f && t === 0) return 0;
                var n = false;
                for(;;){
                    switch(r){
                        case "ascii":
                        case "latin1":
                        case "binary":
                            return t;
                        case "utf8":
                        case "utf-8":
                            return utf8ToBytes(e).length;
                        case "ucs2":
                        case "ucs-2":
                        case "utf16le":
                        case "utf-16le":
                            return t * 2;
                        case "hex":
                            return t >>> 1;
                        case "base64":
                            return base64ToBytes(e).length;
                        default:
                            if (n) {
                                return f ? -1 : utf8ToBytes(e).length;
                            }
                            r = ("" + r).toLowerCase();
                            n = true;
                    }
                }
            }
            Buffer.byteLength = byteLength;
            function slowToString(e, r, t) {
                var f = false;
                if (r === undefined || r < 0) {
                    r = 0;
                }
                if (r > this.length) {
                    return "";
                }
                if (t === undefined || t > this.length) {
                    t = this.length;
                }
                if (t <= 0) {
                    return "";
                }
                t >>>= 0;
                r >>>= 0;
                if (t <= r) {
                    return "";
                }
                if (!e) e = "utf8";
                while(true){
                    switch(e){
                        case "hex":
                            return hexSlice(this, r, t);
                        case "utf8":
                        case "utf-8":
                            return utf8Slice(this, r, t);
                        case "ascii":
                            return asciiSlice(this, r, t);
                        case "latin1":
                        case "binary":
                            return latin1Slice(this, r, t);
                        case "base64":
                            return base64Slice(this, r, t);
                        case "ucs2":
                        case "ucs-2":
                        case "utf16le":
                        case "utf-16le":
                            return utf16leSlice(this, r, t);
                        default:
                            if (f) throw new TypeError("Unknown encoding: " + e);
                            e = (e + "").toLowerCase();
                            f = true;
                    }
                }
            }
            Buffer.prototype._isBuffer = true;
            function swap(e, r, t) {
                var f = e[r];
                e[r] = e[t];
                e[t] = f;
            }
            Buffer.prototype.swap16 = function swap16() {
                var e = this.length;
                if (e % 2 !== 0) {
                    throw new RangeError("Buffer size must be a multiple of 16-bits");
                }
                for(var r = 0; r < e; r += 2){
                    swap(this, r, r + 1);
                }
                return this;
            };
            Buffer.prototype.swap32 = function swap32() {
                var e = this.length;
                if (e % 4 !== 0) {
                    throw new RangeError("Buffer size must be a multiple of 32-bits");
                }
                for(var r = 0; r < e; r += 4){
                    swap(this, r, r + 3);
                    swap(this, r + 1, r + 2);
                }
                return this;
            };
            Buffer.prototype.swap64 = function swap64() {
                var e = this.length;
                if (e % 8 !== 0) {
                    throw new RangeError("Buffer size must be a multiple of 64-bits");
                }
                for(var r = 0; r < e; r += 8){
                    swap(this, r, r + 7);
                    swap(this, r + 1, r + 6);
                    swap(this, r + 2, r + 5);
                    swap(this, r + 3, r + 4);
                }
                return this;
            };
            Buffer.prototype.toString = function toString() {
                var e = this.length;
                if (e === 0) return "";
                if (arguments.length === 0) return utf8Slice(this, 0, e);
                return slowToString.apply(this, arguments);
            };
            Buffer.prototype.toLocaleString = Buffer.prototype.toString;
            Buffer.prototype.equals = function equals(e) {
                if (!Buffer.isBuffer(e)) throw new TypeError("Argument must be a Buffer");
                if (this === e) return true;
                return Buffer.compare(this, e) === 0;
            };
            Buffer.prototype.inspect = function inspect() {
                var e = "";
                var t = r.INSPECT_MAX_BYTES;
                e = this.toString("hex", 0, t).replace(/(.{2})/g, "$1 ").trim();
                if (this.length > t) e += " ... ";
                return "<Buffer " + e + ">";
            };
            if (i) {
                Buffer.prototype[i] = Buffer.prototype.inspect;
            }
            Buffer.prototype.compare = function compare(e, r, t, f, n) {
                if (isInstance(e, Uint8Array)) {
                    e = Buffer.from(e, e.offset, e.byteLength);
                }
                if (!Buffer.isBuffer(e)) {
                    throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. ' + "Received type " + typeof e);
                }
                if (r === undefined) {
                    r = 0;
                }
                if (t === undefined) {
                    t = e ? e.length : 0;
                }
                if (f === undefined) {
                    f = 0;
                }
                if (n === undefined) {
                    n = this.length;
                }
                if (r < 0 || t > e.length || f < 0 || n > this.length) {
                    throw new RangeError("out of range index");
                }
                if (f >= n && r >= t) {
                    return 0;
                }
                if (f >= n) {
                    return -1;
                }
                if (r >= t) {
                    return 1;
                }
                r >>>= 0;
                t >>>= 0;
                f >>>= 0;
                n >>>= 0;
                if (this === e) return 0;
                var i = n - f;
                var o = t - r;
                var u = Math.min(i, o);
                var a = this.slice(f, n);
                var s = e.slice(r, t);
                for(var h = 0; h < u; ++h){
                    if (a[h] !== s[h]) {
                        i = a[h];
                        o = s[h];
                        break;
                    }
                }
                if (i < o) return -1;
                if (o < i) return 1;
                return 0;
            };
            function bidirectionalIndexOf(e, r, t, f, n) {
                if (e.length === 0) return -1;
                if (typeof t === "string") {
                    f = t;
                    t = 0;
                } else if (t > 2147483647) {
                    t = 2147483647;
                } else if (t < -2147483648) {
                    t = -2147483648;
                }
                t = +t;
                if (numberIsNaN(t)) {
                    t = n ? 0 : e.length - 1;
                }
                if (t < 0) t = e.length + t;
                if (t >= e.length) {
                    if (n) return -1;
                    else t = e.length - 1;
                } else if (t < 0) {
                    if (n) t = 0;
                    else return -1;
                }
                if (typeof r === "string") {
                    r = Buffer.from(r, f);
                }
                if (Buffer.isBuffer(r)) {
                    if (r.length === 0) {
                        return -1;
                    }
                    return arrayIndexOf(e, r, t, f, n);
                } else if (typeof r === "number") {
                    r = r & 255;
                    if (typeof Uint8Array.prototype.indexOf === "function") {
                        if (n) {
                            return Uint8Array.prototype.indexOf.call(e, r, t);
                        } else {
                            return Uint8Array.prototype.lastIndexOf.call(e, r, t);
                        }
                    }
                    return arrayIndexOf(e, [
                        r
                    ], t, f, n);
                }
                throw new TypeError("val must be string, number or Buffer");
            }
            function arrayIndexOf(e, r, t, f, n) {
                var i = 1;
                var o = e.length;
                var u = r.length;
                if (f !== undefined) {
                    f = String(f).toLowerCase();
                    if (f === "ucs2" || f === "ucs-2" || f === "utf16le" || f === "utf-16le") {
                        if (e.length < 2 || r.length < 2) {
                            return -1;
                        }
                        i = 2;
                        o /= 2;
                        u /= 2;
                        t /= 2;
                    }
                }
                function read(e, r) {
                    if (i === 1) {
                        return e[r];
                    } else {
                        return e.readUInt16BE(r * i);
                    }
                }
                var a;
                if (n) {
                    var s = -1;
                    for(a = t; a < o; a++){
                        if (read(e, a) === read(r, s === -1 ? 0 : a - s)) {
                            if (s === -1) s = a;
                            if (a - s + 1 === u) return s * i;
                        } else {
                            if (s !== -1) a -= a - s;
                            s = -1;
                        }
                    }
                } else {
                    if (t + u > o) t = o - u;
                    for(a = t; a >= 0; a--){
                        var h = true;
                        for(var c = 0; c < u; c++){
                            if (read(e, a + c) !== read(r, c)) {
                                h = false;
                                break;
                            }
                        }
                        if (h) return a;
                    }
                }
                return -1;
            }
            Buffer.prototype.includes = function includes(e, r, t) {
                return this.indexOf(e, r, t) !== -1;
            };
            Buffer.prototype.indexOf = function indexOf(e, r, t) {
                return bidirectionalIndexOf(this, e, r, t, true);
            };
            Buffer.prototype.lastIndexOf = function lastIndexOf(e, r, t) {
                return bidirectionalIndexOf(this, e, r, t, false);
            };
            function hexWrite(e, r, t, f) {
                t = Number(t) || 0;
                var n = e.length - t;
                if (!f) {
                    f = n;
                } else {
                    f = Number(f);
                    if (f > n) {
                        f = n;
                    }
                }
                var i = r.length;
                if (f > i / 2) {
                    f = i / 2;
                }
                for(var o = 0; o < f; ++o){
                    var u = parseInt(r.substr(o * 2, 2), 16);
                    if (numberIsNaN(u)) return o;
                    e[t + o] = u;
                }
                return o;
            }
            function utf8Write(e, r, t, f) {
                return blitBuffer(utf8ToBytes(r, e.length - t), e, t, f);
            }
            function asciiWrite(e, r, t, f) {
                return blitBuffer(asciiToBytes(r), e, t, f);
            }
            function latin1Write(e, r, t, f) {
                return asciiWrite(e, r, t, f);
            }
            function base64Write(e, r, t, f) {
                return blitBuffer(base64ToBytes(r), e, t, f);
            }
            function ucs2Write(e, r, t, f) {
                return blitBuffer(utf16leToBytes(r, e.length - t), e, t, f);
            }
            Buffer.prototype.write = function write(e, r, t, f) {
                if (r === undefined) {
                    f = "utf8";
                    t = this.length;
                    r = 0;
                } else if (t === undefined && typeof r === "string") {
                    f = r;
                    t = this.length;
                    r = 0;
                } else if (isFinite(r)) {
                    r = r >>> 0;
                    if (isFinite(t)) {
                        t = t >>> 0;
                        if (f === undefined) f = "utf8";
                    } else {
                        f = t;
                        t = undefined;
                    }
                } else {
                    throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
                }
                var n = this.length - r;
                if (t === undefined || t > n) t = n;
                if (e.length > 0 && (t < 0 || r < 0) || r > this.length) {
                    throw new RangeError("Attempt to write outside buffer bounds");
                }
                if (!f) f = "utf8";
                var i = false;
                for(;;){
                    switch(f){
                        case "hex":
                            return hexWrite(this, e, r, t);
                        case "utf8":
                        case "utf-8":
                            return utf8Write(this, e, r, t);
                        case "ascii":
                            return asciiWrite(this, e, r, t);
                        case "latin1":
                        case "binary":
                            return latin1Write(this, e, r, t);
                        case "base64":
                            return base64Write(this, e, r, t);
                        case "ucs2":
                        case "ucs-2":
                        case "utf16le":
                        case "utf-16le":
                            return ucs2Write(this, e, r, t);
                        default:
                            if (i) throw new TypeError("Unknown encoding: " + f);
                            f = ("" + f).toLowerCase();
                            i = true;
                    }
                }
            };
            Buffer.prototype.toJSON = function toJSON() {
                return {
                    type: "Buffer",
                    data: Array.prototype.slice.call(this._arr || this, 0)
                };
            };
            function base64Slice(e, r, t) {
                if (r === 0 && t === e.length) {
                    return f.fromByteArray(e);
                } else {
                    return f.fromByteArray(e.slice(r, t));
                }
            }
            function utf8Slice(e, r, t) {
                t = Math.min(e.length, t);
                var f = [];
                var n = r;
                while(n < t){
                    var i = e[n];
                    var o = null;
                    var u = i > 239 ? 4 : i > 223 ? 3 : i > 191 ? 2 : 1;
                    if (n + u <= t) {
                        var a, s, h, c;
                        switch(u){
                            case 1:
                                if (i < 128) {
                                    o = i;
                                }
                                break;
                            case 2:
                                a = e[n + 1];
                                if ((a & 192) === 128) {
                                    c = (i & 31) << 6 | a & 63;
                                    if (c > 127) {
                                        o = c;
                                    }
                                }
                                break;
                            case 3:
                                a = e[n + 1];
                                s = e[n + 2];
                                if ((a & 192) === 128 && (s & 192) === 128) {
                                    c = (i & 15) << 12 | (a & 63) << 6 | s & 63;
                                    if (c > 2047 && (c < 55296 || c > 57343)) {
                                        o = c;
                                    }
                                }
                                break;
                            case 4:
                                a = e[n + 1];
                                s = e[n + 2];
                                h = e[n + 3];
                                if ((a & 192) === 128 && (s & 192) === 128 && (h & 192) === 128) {
                                    c = (i & 15) << 18 | (a & 63) << 12 | (s & 63) << 6 | h & 63;
                                    if (c > 65535 && c < 1114112) {
                                        o = c;
                                    }
                                }
                        }
                    }
                    if (o === null) {
                        o = 65533;
                        u = 1;
                    } else if (o > 65535) {
                        o -= 65536;
                        f.push(o >>> 10 & 1023 | 55296);
                        o = 56320 | o & 1023;
                    }
                    f.push(o);
                    n += u;
                }
                return decodeCodePointsArray(f);
            }
            var u = 4096;
            function decodeCodePointsArray(e) {
                var r = e.length;
                if (r <= u) {
                    return String.fromCharCode.apply(String, e);
                }
                var t = "";
                var f = 0;
                while(f < r){
                    t += String.fromCharCode.apply(String, e.slice(f, f += u));
                }
                return t;
            }
            function asciiSlice(e, r, t) {
                var f = "";
                t = Math.min(e.length, t);
                for(var n = r; n < t; ++n){
                    f += String.fromCharCode(e[n] & 127);
                }
                return f;
            }
            function latin1Slice(e, r, t) {
                var f = "";
                t = Math.min(e.length, t);
                for(var n = r; n < t; ++n){
                    f += String.fromCharCode(e[n]);
                }
                return f;
            }
            function hexSlice(e, r, t) {
                var f = e.length;
                if (!r || r < 0) r = 0;
                if (!t || t < 0 || t > f) t = f;
                var n = "";
                for(var i = r; i < t; ++i){
                    n += s[e[i]];
                }
                return n;
            }
            function utf16leSlice(e, r, t) {
                var f = e.slice(r, t);
                var n = "";
                for(var i = 0; i < f.length; i += 2){
                    n += String.fromCharCode(f[i] + f[i + 1] * 256);
                }
                return n;
            }
            Buffer.prototype.slice = function slice(e, r) {
                var t = this.length;
                e = ~~e;
                r = r === undefined ? t : ~~r;
                if (e < 0) {
                    e += t;
                    if (e < 0) e = 0;
                } else if (e > t) {
                    e = t;
                }
                if (r < 0) {
                    r += t;
                    if (r < 0) r = 0;
                } else if (r > t) {
                    r = t;
                }
                if (r < e) r = e;
                var f = this.subarray(e, r);
                Object.setPrototypeOf(f, Buffer.prototype);
                return f;
            };
            function checkOffset(e, r, t) {
                if (e % 1 !== 0 || e < 0) throw new RangeError("offset is not uint");
                if (e + r > t) throw new RangeError("Trying to access beyond buffer length");
            }
            Buffer.prototype.readUIntLE = function readUIntLE(e, r, t) {
                e = e >>> 0;
                r = r >>> 0;
                if (!t) checkOffset(e, r, this.length);
                var f = this[e];
                var n = 1;
                var i = 0;
                while(++i < r && (n *= 256)){
                    f += this[e + i] * n;
                }
                return f;
            };
            Buffer.prototype.readUIntBE = function readUIntBE(e, r, t) {
                e = e >>> 0;
                r = r >>> 0;
                if (!t) {
                    checkOffset(e, r, this.length);
                }
                var f = this[e + --r];
                var n = 1;
                while(r > 0 && (n *= 256)){
                    f += this[e + --r] * n;
                }
                return f;
            };
            Buffer.prototype.readUInt8 = function readUInt8(e, r) {
                e = e >>> 0;
                if (!r) checkOffset(e, 1, this.length);
                return this[e];
            };
            Buffer.prototype.readUInt16LE = function readUInt16LE(e, r) {
                e = e >>> 0;
                if (!r) checkOffset(e, 2, this.length);
                return this[e] | this[e + 1] << 8;
            };
            Buffer.prototype.readUInt16BE = function readUInt16BE(e, r) {
                e = e >>> 0;
                if (!r) checkOffset(e, 2, this.length);
                return this[e] << 8 | this[e + 1];
            };
            Buffer.prototype.readUInt32LE = function readUInt32LE(e, r) {
                e = e >>> 0;
                if (!r) checkOffset(e, 4, this.length);
                return (this[e] | this[e + 1] << 8 | this[e + 2] << 16) + this[e + 3] * 16777216;
            };
            Buffer.prototype.readUInt32BE = function readUInt32BE(e, r) {
                e = e >>> 0;
                if (!r) checkOffset(e, 4, this.length);
                return this[e] * 16777216 + (this[e + 1] << 16 | this[e + 2] << 8 | this[e + 3]);
            };
            Buffer.prototype.readIntLE = function readIntLE(e, r, t) {
                e = e >>> 0;
                r = r >>> 0;
                if (!t) checkOffset(e, r, this.length);
                var f = this[e];
                var n = 1;
                var i = 0;
                while(++i < r && (n *= 256)){
                    f += this[e + i] * n;
                }
                n *= 128;
                if (f >= n) f -= Math.pow(2, 8 * r);
                return f;
            };
            Buffer.prototype.readIntBE = function readIntBE(e, r, t) {
                e = e >>> 0;
                r = r >>> 0;
                if (!t) checkOffset(e, r, this.length);
                var f = r;
                var n = 1;
                var i = this[e + --f];
                while(f > 0 && (n *= 256)){
                    i += this[e + --f] * n;
                }
                n *= 128;
                if (i >= n) i -= Math.pow(2, 8 * r);
                return i;
            };
            Buffer.prototype.readInt8 = function readInt8(e, r) {
                e = e >>> 0;
                if (!r) checkOffset(e, 1, this.length);
                if (!(this[e] & 128)) return this[e];
                return (255 - this[e] + 1) * -1;
            };
            Buffer.prototype.readInt16LE = function readInt16LE(e, r) {
                e = e >>> 0;
                if (!r) checkOffset(e, 2, this.length);
                var t = this[e] | this[e + 1] << 8;
                return t & 32768 ? t | 4294901760 : t;
            };
            Buffer.prototype.readInt16BE = function readInt16BE(e, r) {
                e = e >>> 0;
                if (!r) checkOffset(e, 2, this.length);
                var t = this[e + 1] | this[e] << 8;
                return t & 32768 ? t | 4294901760 : t;
            };
            Buffer.prototype.readInt32LE = function readInt32LE(e, r) {
                e = e >>> 0;
                if (!r) checkOffset(e, 4, this.length);
                return this[e] | this[e + 1] << 8 | this[e + 2] << 16 | this[e + 3] << 24;
            };
            Buffer.prototype.readInt32BE = function readInt32BE(e, r) {
                e = e >>> 0;
                if (!r) checkOffset(e, 4, this.length);
                return this[e] << 24 | this[e + 1] << 16 | this[e + 2] << 8 | this[e + 3];
            };
            Buffer.prototype.readFloatLE = function readFloatLE(e, r) {
                e = e >>> 0;
                if (!r) checkOffset(e, 4, this.length);
                return n.read(this, e, true, 23, 4);
            };
            Buffer.prototype.readFloatBE = function readFloatBE(e, r) {
                e = e >>> 0;
                if (!r) checkOffset(e, 4, this.length);
                return n.read(this, e, false, 23, 4);
            };
            Buffer.prototype.readDoubleLE = function readDoubleLE(e, r) {
                e = e >>> 0;
                if (!r) checkOffset(e, 8, this.length);
                return n.read(this, e, true, 52, 8);
            };
            Buffer.prototype.readDoubleBE = function readDoubleBE(e, r) {
                e = e >>> 0;
                if (!r) checkOffset(e, 8, this.length);
                return n.read(this, e, false, 52, 8);
            };
            function checkInt(e, r, t, f, n, i) {
                if (!Buffer.isBuffer(e)) throw new TypeError('"buffer" argument must be a Buffer instance');
                if (r > n || r < i) throw new RangeError('"value" argument is out of bounds');
                if (t + f > e.length) throw new RangeError("Index out of range");
            }
            Buffer.prototype.writeUIntLE = function writeUIntLE(e, r, t, f) {
                e = +e;
                r = r >>> 0;
                t = t >>> 0;
                if (!f) {
                    var n = Math.pow(2, 8 * t) - 1;
                    checkInt(this, e, r, t, n, 0);
                }
                var i = 1;
                var o = 0;
                this[r] = e & 255;
                while(++o < t && (i *= 256)){
                    this[r + o] = e / i & 255;
                }
                return r + t;
            };
            Buffer.prototype.writeUIntBE = function writeUIntBE(e, r, t, f) {
                e = +e;
                r = r >>> 0;
                t = t >>> 0;
                if (!f) {
                    var n = Math.pow(2, 8 * t) - 1;
                    checkInt(this, e, r, t, n, 0);
                }
                var i = t - 1;
                var o = 1;
                this[r + i] = e & 255;
                while(--i >= 0 && (o *= 256)){
                    this[r + i] = e / o & 255;
                }
                return r + t;
            };
            Buffer.prototype.writeUInt8 = function writeUInt8(e, r, t) {
                e = +e;
                r = r >>> 0;
                if (!t) checkInt(this, e, r, 1, 255, 0);
                this[r] = e & 255;
                return r + 1;
            };
            Buffer.prototype.writeUInt16LE = function writeUInt16LE(e, r, t) {
                e = +e;
                r = r >>> 0;
                if (!t) checkInt(this, e, r, 2, 65535, 0);
                this[r] = e & 255;
                this[r + 1] = e >>> 8;
                return r + 2;
            };
            Buffer.prototype.writeUInt16BE = function writeUInt16BE(e, r, t) {
                e = +e;
                r = r >>> 0;
                if (!t) checkInt(this, e, r, 2, 65535, 0);
                this[r] = e >>> 8;
                this[r + 1] = e & 255;
                return r + 2;
            };
            Buffer.prototype.writeUInt32LE = function writeUInt32LE(e, r, t) {
                e = +e;
                r = r >>> 0;
                if (!t) checkInt(this, e, r, 4, 4294967295, 0);
                this[r + 3] = e >>> 24;
                this[r + 2] = e >>> 16;
                this[r + 1] = e >>> 8;
                this[r] = e & 255;
                return r + 4;
            };
            Buffer.prototype.writeUInt32BE = function writeUInt32BE(e, r, t) {
                e = +e;
                r = r >>> 0;
                if (!t) checkInt(this, e, r, 4, 4294967295, 0);
                this[r] = e >>> 24;
                this[r + 1] = e >>> 16;
                this[r + 2] = e >>> 8;
                this[r + 3] = e & 255;
                return r + 4;
            };
            Buffer.prototype.writeIntLE = function writeIntLE(e, r, t, f) {
                e = +e;
                r = r >>> 0;
                if (!f) {
                    var n = Math.pow(2, 8 * t - 1);
                    checkInt(this, e, r, t, n - 1, -n);
                }
                var i = 0;
                var o = 1;
                var u = 0;
                this[r] = e & 255;
                while(++i < t && (o *= 256)){
                    if (e < 0 && u === 0 && this[r + i - 1] !== 0) {
                        u = 1;
                    }
                    this[r + i] = (e / o >> 0) - u & 255;
                }
                return r + t;
            };
            Buffer.prototype.writeIntBE = function writeIntBE(e, r, t, f) {
                e = +e;
                r = r >>> 0;
                if (!f) {
                    var n = Math.pow(2, 8 * t - 1);
                    checkInt(this, e, r, t, n - 1, -n);
                }
                var i = t - 1;
                var o = 1;
                var u = 0;
                this[r + i] = e & 255;
                while(--i >= 0 && (o *= 256)){
                    if (e < 0 && u === 0 && this[r + i + 1] !== 0) {
                        u = 1;
                    }
                    this[r + i] = (e / o >> 0) - u & 255;
                }
                return r + t;
            };
            Buffer.prototype.writeInt8 = function writeInt8(e, r, t) {
                e = +e;
                r = r >>> 0;
                if (!t) checkInt(this, e, r, 1, 127, -128);
                if (e < 0) e = 255 + e + 1;
                this[r] = e & 255;
                return r + 1;
            };
            Buffer.prototype.writeInt16LE = function writeInt16LE(e, r, t) {
                e = +e;
                r = r >>> 0;
                if (!t) checkInt(this, e, r, 2, 32767, -32768);
                this[r] = e & 255;
                this[r + 1] = e >>> 8;
                return r + 2;
            };
            Buffer.prototype.writeInt16BE = function writeInt16BE(e, r, t) {
                e = +e;
                r = r >>> 0;
                if (!t) checkInt(this, e, r, 2, 32767, -32768);
                this[r] = e >>> 8;
                this[r + 1] = e & 255;
                return r + 2;
            };
            Buffer.prototype.writeInt32LE = function writeInt32LE(e, r, t) {
                e = +e;
                r = r >>> 0;
                if (!t) checkInt(this, e, r, 4, 2147483647, -2147483648);
                this[r] = e & 255;
                this[r + 1] = e >>> 8;
                this[r + 2] = e >>> 16;
                this[r + 3] = e >>> 24;
                return r + 4;
            };
            Buffer.prototype.writeInt32BE = function writeInt32BE(e, r, t) {
                e = +e;
                r = r >>> 0;
                if (!t) checkInt(this, e, r, 4, 2147483647, -2147483648);
                if (e < 0) e = 4294967295 + e + 1;
                this[r] = e >>> 24;
                this[r + 1] = e >>> 16;
                this[r + 2] = e >>> 8;
                this[r + 3] = e & 255;
                return r + 4;
            };
            function checkIEEE754(e, r, t, f, n, i) {
                if (t + f > e.length) throw new RangeError("Index out of range");
                if (t < 0) throw new RangeError("Index out of range");
            }
            function writeFloat(e, r, t, f, i) {
                r = +r;
                t = t >>> 0;
                if (!i) {
                    checkIEEE754(e, r, t, 4, 34028234663852886e22, -34028234663852886e22);
                }
                n.write(e, r, t, f, 23, 4);
                return t + 4;
            }
            Buffer.prototype.writeFloatLE = function writeFloatLE(e, r, t) {
                return writeFloat(this, e, r, true, t);
            };
            Buffer.prototype.writeFloatBE = function writeFloatBE(e, r, t) {
                return writeFloat(this, e, r, false, t);
            };
            function writeDouble(e, r, t, f, i) {
                r = +r;
                t = t >>> 0;
                if (!i) {
                    checkIEEE754(e, r, t, 8, 17976931348623157e292, -17976931348623157e292);
                }
                n.write(e, r, t, f, 52, 8);
                return t + 8;
            }
            Buffer.prototype.writeDoubleLE = function writeDoubleLE(e, r, t) {
                return writeDouble(this, e, r, true, t);
            };
            Buffer.prototype.writeDoubleBE = function writeDoubleBE(e, r, t) {
                return writeDouble(this, e, r, false, t);
            };
            Buffer.prototype.copy = function copy(e, r, t, f) {
                if (!Buffer.isBuffer(e)) throw new TypeError("argument should be a Buffer");
                if (!t) t = 0;
                if (!f && f !== 0) f = this.length;
                if (r >= e.length) r = e.length;
                if (!r) r = 0;
                if (f > 0 && f < t) f = t;
                if (f === t) return 0;
                if (e.length === 0 || this.length === 0) return 0;
                if (r < 0) {
                    throw new RangeError("targetStart out of bounds");
                }
                if (t < 0 || t >= this.length) throw new RangeError("Index out of range");
                if (f < 0) throw new RangeError("sourceEnd out of bounds");
                if (f > this.length) f = this.length;
                if (e.length - r < f - t) {
                    f = e.length - r + t;
                }
                var n = f - t;
                if (this === e && typeof Uint8Array.prototype.copyWithin === "function") {
                    this.copyWithin(r, t, f);
                } else if (this === e && t < r && r < f) {
                    for(var i = n - 1; i >= 0; --i){
                        e[i + r] = this[i + t];
                    }
                } else {
                    Uint8Array.prototype.set.call(e, this.subarray(t, f), r);
                }
                return n;
            };
            Buffer.prototype.fill = function fill(e, r, t, f) {
                if (typeof e === "string") {
                    if (typeof r === "string") {
                        f = r;
                        r = 0;
                        t = this.length;
                    } else if (typeof t === "string") {
                        f = t;
                        t = this.length;
                    }
                    if (f !== undefined && typeof f !== "string") {
                        throw new TypeError("encoding must be a string");
                    }
                    if (typeof f === "string" && !Buffer.isEncoding(f)) {
                        throw new TypeError("Unknown encoding: " + f);
                    }
                    if (e.length === 1) {
                        var n = e.charCodeAt(0);
                        if (f === "utf8" && n < 128 || f === "latin1") {
                            e = n;
                        }
                    }
                } else if (typeof e === "number") {
                    e = e & 255;
                } else if (typeof e === "boolean") {
                    e = Number(e);
                }
                if (r < 0 || this.length < r || this.length < t) {
                    throw new RangeError("Out of range index");
                }
                if (t <= r) {
                    return this;
                }
                r = r >>> 0;
                t = t === undefined ? this.length : t >>> 0;
                if (!e) e = 0;
                var i;
                if (typeof e === "number") {
                    for(i = r; i < t; ++i){
                        this[i] = e;
                    }
                } else {
                    var o = Buffer.isBuffer(e) ? e : Buffer.from(e, f);
                    var u = o.length;
                    if (u === 0) {
                        throw new TypeError('The value "' + e + '" is invalid for argument "value"');
                    }
                    for(i = 0; i < t - r; ++i){
                        this[i + r] = o[i % u];
                    }
                }
                return this;
            };
            var a = /[^+/0-9A-Za-z-_]/g;
            function base64clean(e) {
                e = e.split("=")[0];
                e = e.trim().replace(a, "");
                if (e.length < 2) return "";
                while(e.length % 4 !== 0){
                    e = e + "=";
                }
                return e;
            }
            function utf8ToBytes(e, r) {
                r = r || Infinity;
                var t;
                var f = e.length;
                var n = null;
                var i = [];
                for(var o = 0; o < f; ++o){
                    t = e.charCodeAt(o);
                    if (t > 55295 && t < 57344) {
                        if (!n) {
                            if (t > 56319) {
                                if ((r -= 3) > -1) i.push(239, 191, 189);
                                continue;
                            } else if (o + 1 === f) {
                                if ((r -= 3) > -1) i.push(239, 191, 189);
                                continue;
                            }
                            n = t;
                            continue;
                        }
                        if (t < 56320) {
                            if ((r -= 3) > -1) i.push(239, 191, 189);
                            n = t;
                            continue;
                        }
                        t = (n - 55296 << 10 | t - 56320) + 65536;
                    } else if (n) {
                        if ((r -= 3) > -1) i.push(239, 191, 189);
                    }
                    n = null;
                    if (t < 128) {
                        if ((r -= 1) < 0) break;
                        i.push(t);
                    } else if (t < 2048) {
                        if ((r -= 2) < 0) break;
                        i.push(t >> 6 | 192, t & 63 | 128);
                    } else if (t < 65536) {
                        if ((r -= 3) < 0) break;
                        i.push(t >> 12 | 224, t >> 6 & 63 | 128, t & 63 | 128);
                    } else if (t < 1114112) {
                        if ((r -= 4) < 0) break;
                        i.push(t >> 18 | 240, t >> 12 & 63 | 128, t >> 6 & 63 | 128, t & 63 | 128);
                    } else {
                        throw new Error("Invalid code point");
                    }
                }
                return i;
            }
            function asciiToBytes(e) {
                var r = [];
                for(var t = 0; t < e.length; ++t){
                    r.push(e.charCodeAt(t) & 255);
                }
                return r;
            }
            function utf16leToBytes(e, r) {
                var t, f, n;
                var i = [];
                for(var o = 0; o < e.length; ++o){
                    if ((r -= 2) < 0) break;
                    t = e.charCodeAt(o);
                    f = t >> 8;
                    n = t % 256;
                    i.push(n);
                    i.push(f);
                }
                return i;
            }
            function base64ToBytes(e) {
                return f.toByteArray(base64clean(e));
            }
            function blitBuffer(e, r, t, f) {
                for(var n = 0; n < f; ++n){
                    if (n + t >= r.length || n >= e.length) break;
                    r[n + t] = e[n];
                }
                return n;
            }
            function isInstance(e, r) {
                return e instanceof r || e != null && e.constructor != null && e.constructor.name != null && e.constructor.name === r.name;
            }
            function numberIsNaN(e) {
                return e !== e;
            }
            var s = function() {
                var e = "0123456789abcdef";
                var r = new Array(256);
                for(var t = 0; t < 16; ++t){
                    var f = t * 16;
                    for(var n = 0; n < 16; ++n){
                        r[f + n] = e[t] + e[n];
                    }
                }
                return r;
            }();
        },
        783: function(e, r) {
            /*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */ r.read = function(e, r, t, f, n) {
                var i, o;
                var u = n * 8 - f - 1;
                var a = (1 << u) - 1;
                var s = a >> 1;
                var h = -7;
                var c = t ? n - 1 : 0;
                var l = t ? -1 : 1;
                var p = e[r + c];
                c += l;
                i = p & (1 << -h) - 1;
                p >>= -h;
                h += u;
                for(; h > 0; i = i * 256 + e[r + c], c += l, h -= 8){}
                o = i & (1 << -h) - 1;
                i >>= -h;
                h += f;
                for(; h > 0; o = o * 256 + e[r + c], c += l, h -= 8){}
                if (i === 0) {
                    i = 1 - s;
                } else if (i === a) {
                    return o ? NaN : (p ? -1 : 1) * Infinity;
                } else {
                    o = o + Math.pow(2, f);
                    i = i - s;
                }
                return (p ? -1 : 1) * o * Math.pow(2, i - f);
            };
            r.write = function(e, r, t, f, n, i) {
                var o, u, a;
                var s = i * 8 - n - 1;
                var h = (1 << s) - 1;
                var c = h >> 1;
                var l = n === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
                var p = f ? 0 : i - 1;
                var y = f ? 1 : -1;
                var g = r < 0 || r === 0 && 1 / r < 0 ? 1 : 0;
                r = Math.abs(r);
                if (isNaN(r) || r === Infinity) {
                    u = isNaN(r) ? 1 : 0;
                    o = h;
                } else {
                    o = Math.floor(Math.log(r) / Math.LN2);
                    if (r * (a = Math.pow(2, -o)) < 1) {
                        o--;
                        a *= 2;
                    }
                    if (o + c >= 1) {
                        r += l / a;
                    } else {
                        r += l * Math.pow(2, 1 - c);
                    }
                    if (r * a >= 2) {
                        o++;
                        a /= 2;
                    }
                    if (o + c >= h) {
                        u = 0;
                        o = h;
                    } else if (o + c >= 1) {
                        u = (r * a - 1) * Math.pow(2, n);
                        o = o + c;
                    } else {
                        u = r * Math.pow(2, c - 1) * Math.pow(2, n);
                        o = 0;
                    }
                }
                for(; n >= 8; e[t + p] = u & 255, p += y, u /= 256, n -= 8){}
                o = o << n | u;
                s += n;
                for(; s > 0; e[t + p] = o & 255, p += y, o /= 256, s -= 8){}
                e[t + p - y] |= g * 128;
            };
        }
    };
    var r = {};
    function __nccwpck_require__(t) {
        var f = r[t];
        if (f !== undefined) {
            return f.exports;
        }
        var n = r[t] = {
            exports: {}
        };
        var i = true;
        try {
            e[t](n, n.exports, __nccwpck_require__);
            i = false;
        } finally{
            if (i) delete r[t];
        }
        return n.exports;
    }
    if (typeof __nccwpck_require__ !== "undefined") __nccwpck_require__.ab = ("TURBOPACK compile-time value", "/ROOT/dashboard/node_modules/next/dist/compiled/buffer") + "/";
    var t = __nccwpck_require__(72);
    module.exports = t;
})();
}),
"[project]/dashboard/node_modules/axios/lib/core/AxiosError.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/utils.js [app-client] (ecmascript)");
'use strict';
;
/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [config] The config.
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 *
 * @returns {Error} The created error.
 */ function AxiosError(message, code, config, request, response) {
    Error.call(this);
    if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
    } else {
        this.stack = new Error().stack;
    }
    this.message = message;
    this.name = 'AxiosError';
    code && (this.code = code);
    config && (this.config = config);
    request && (this.request = request);
    if (response) {
        this.response = response;
        this.status = response.status ? response.status : null;
    }
}
__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].inherits(AxiosError, Error, {
    toJSON: function toJSON() {
        return {
            // Standard
            message: this.message,
            name: this.name,
            // Microsoft
            description: this.description,
            number: this.number,
            // Mozilla
            fileName: this.fileName,
            lineNumber: this.lineNumber,
            columnNumber: this.columnNumber,
            stack: this.stack,
            // Axios
            config: __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].toJSONObject(this.config),
            code: this.code,
            status: this.status
        };
    }
});
const prototype = AxiosError.prototype;
const descriptors = {};
[
    'ERR_BAD_OPTION_VALUE',
    'ERR_BAD_OPTION',
    'ECONNABORTED',
    'ETIMEDOUT',
    'ERR_NETWORK',
    'ERR_FR_TOO_MANY_REDIRECTS',
    'ERR_DEPRECATED',
    'ERR_BAD_RESPONSE',
    'ERR_BAD_REQUEST',
    'ERR_CANCELED',
    'ERR_NOT_SUPPORT',
    'ERR_INVALID_URL'
].forEach((code)=>{
    descriptors[code] = {
        value: code
    };
});
Object.defineProperties(AxiosError, descriptors);
Object.defineProperty(prototype, 'isAxiosError', {
    value: true
});
// eslint-disable-next-line func-names
AxiosError.from = (error, code, config, request, response, customProps)=>{
    const axiosError = Object.create(prototype);
    __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].toFlatObject(error, axiosError, function filter(obj) {
        return obj !== Error.prototype;
    }, (prop)=>{
        return prop !== 'isAxiosError';
    });
    const msg = error && error.message ? error.message : 'Error';
    // Prefer explicit code; otherwise copy the low-level error's code (e.g. ECONNREFUSED)
    const errCode = code == null && error ? error.code : code;
    AxiosError.call(axiosError, msg, errCode, config, request, response);
    // Chain the original error on the standard field; non-enumerable to avoid JSON noise
    if (error && axiosError.cause == null) {
        Object.defineProperty(axiosError, 'cause', {
            value: error,
            configurable: true
        });
    }
    axiosError.name = error && error.name || 'Error';
    customProps && Object.assign(axiosError, customProps);
    return axiosError;
};
const __TURBOPACK__default__export__ = AxiosError;
}),
"[project]/dashboard/node_modules/axios/lib/helpers/null.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// eslint-disable-next-line strict
__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
const __TURBOPACK__default__export__ = null;
}),
"[project]/dashboard/node_modules/axios/lib/helpers/toFormData.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$buffer$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/dashboard/node_modules/next/dist/compiled/buffer/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/utils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/core/AxiosError.js [app-client] (ecmascript)");
// temporary hotfix to avoid circular references until AxiosURLSearchParams is refactored
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$null$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/helpers/null.js [app-client] (ecmascript)");
'use strict';
;
;
;
/**
 * Determines if the given thing is a array or js object.
 *
 * @param {string} thing - The object or array to be visited.
 *
 * @returns {boolean}
 */ function isVisitable(thing) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isPlainObject(thing) || __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isArray(thing);
}
/**
 * It removes the brackets from the end of a string
 *
 * @param {string} key - The key of the parameter.
 *
 * @returns {string} the key without the brackets.
 */ function removeBrackets(key) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].endsWith(key, '[]') ? key.slice(0, -2) : key;
}
/**
 * It takes a path, a key, and a boolean, and returns a string
 *
 * @param {string} path - The path to the current key.
 * @param {string} key - The key of the current object being iterated over.
 * @param {string} dots - If true, the key will be rendered with dots instead of brackets.
 *
 * @returns {string} The path to the current key.
 */ function renderKey(path, key, dots) {
    if (!path) return key;
    return path.concat(key).map(function each(token, i) {
        // eslint-disable-next-line no-param-reassign
        token = removeBrackets(token);
        return !dots && i ? '[' + token + ']' : token;
    }).join(dots ? '.' : '');
}
/**
 * If the array is an array and none of its elements are visitable, then it's a flat array.
 *
 * @param {Array<any>} arr - The array to check
 *
 * @returns {boolean}
 */ function isFlatArray(arr) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isArray(arr) && !arr.some(isVisitable);
}
const predicates = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].toFlatObject(__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, null, function filter(prop) {
    return /^is[A-Z]/.test(prop);
});
/**
 * Convert a data object to FormData
 *
 * @param {Object} obj
 * @param {?Object} [formData]
 * @param {?Object} [options]
 * @param {Function} [options.visitor]
 * @param {Boolean} [options.metaTokens = true]
 * @param {Boolean} [options.dots = false]
 * @param {?Boolean} [options.indexes = false]
 *
 * @returns {Object}
 **/ /**
 * It converts an object into a FormData object
 *
 * @param {Object<any, any>} obj - The object to convert to form data.
 * @param {string} formData - The FormData object to append to.
 * @param {Object<string, any>} options
 *
 * @returns
 */ function toFormData(obj, formData, options) {
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isObject(obj)) {
        throw new TypeError('target must be an object');
    }
    // eslint-disable-next-line no-param-reassign
    formData = formData || new (__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$null$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"] || FormData)();
    // eslint-disable-next-line no-param-reassign
    options = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].toFlatObject(options, {
        metaTokens: true,
        dots: false,
        indexes: false
    }, false, function defined(option, source) {
        // eslint-disable-next-line no-eq-null,eqeqeq
        return !__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isUndefined(source[option]);
    });
    const metaTokens = options.metaTokens;
    // eslint-disable-next-line no-use-before-define
    const visitor = options.visitor || defaultVisitor;
    const dots = options.dots;
    const indexes = options.indexes;
    const _Blob = options.Blob || typeof Blob !== 'undefined' && Blob;
    const useBlob = _Blob && __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isSpecCompliantForm(formData);
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isFunction(visitor)) {
        throw new TypeError('visitor must be a function');
    }
    function convertValue(value) {
        if (value === null) return '';
        if (__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isDate(value)) {
            return value.toISOString();
        }
        if (__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isBoolean(value)) {
            return value.toString();
        }
        if (!useBlob && __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isBlob(value)) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]('Blob is not supported. Use a Buffer instead.');
        }
        if (__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isArrayBuffer(value) || __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isTypedArray(value)) {
            return useBlob && typeof Blob === 'function' ? new Blob([
                value
            ]) : __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$buffer$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Buffer"].from(value);
        }
        return value;
    }
    /**
   * Default visitor.
   *
   * @param {*} value
   * @param {String|Number} key
   * @param {Array<String|Number>} path
   * @this {FormData}
   *
   * @returns {boolean} return true to visit the each prop of the value recursively
   */ function defaultVisitor(value, key, path) {
        let arr = value;
        if (value && !path && typeof value === 'object') {
            if (__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].endsWith(key, '{}')) {
                // eslint-disable-next-line no-param-reassign
                key = metaTokens ? key : key.slice(0, -2);
                // eslint-disable-next-line no-param-reassign
                value = JSON.stringify(value);
            } else if (__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isArray(value) && isFlatArray(value) || (__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isFileList(value) || __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].endsWith(key, '[]')) && (arr = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].toArray(value))) {
                // eslint-disable-next-line no-param-reassign
                key = removeBrackets(key);
                arr.forEach(function each(el, index) {
                    !(__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isUndefined(el) || el === null) && formData.append(// eslint-disable-next-line no-nested-ternary
                    indexes === true ? renderKey([
                        key
                    ], index, dots) : indexes === null ? key : key + '[]', convertValue(el));
                });
                return false;
            }
        }
        if (isVisitable(value)) {
            return true;
        }
        formData.append(renderKey(path, key, dots), convertValue(value));
        return false;
    }
    const stack = [];
    const exposedHelpers = Object.assign(predicates, {
        defaultVisitor,
        convertValue,
        isVisitable
    });
    function build(value, path) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isUndefined(value)) return;
        if (stack.indexOf(value) !== -1) {
            throw Error('Circular reference detected in ' + path.join('.'));
        }
        stack.push(value);
        __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].forEach(value, function each(el, key) {
            const result = !(__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isUndefined(el) || el === null) && visitor.call(formData, el, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isString(key) ? key.trim() : key, path, exposedHelpers);
            if (result === true) {
                build(el, path ? path.concat(key) : [
                    key
                ]);
            }
        });
        stack.pop();
    }
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isObject(obj)) {
        throw new TypeError('data must be an object');
    }
    build(obj);
    return formData;
}
const __TURBOPACK__default__export__ = toFormData;
}),
"[project]/dashboard/node_modules/axios/lib/helpers/AxiosURLSearchParams.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$toFormData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/helpers/toFormData.js [app-client] (ecmascript)");
'use strict';
;
/**
 * It encodes a string by replacing all characters that are not in the unreserved set with
 * their percent-encoded equivalents
 *
 * @param {string} str - The string to encode.
 *
 * @returns {string} The encoded string.
 */ function encode(str) {
    const charMap = {
        '!': '%21',
        "'": '%27',
        '(': '%28',
        ')': '%29',
        '~': '%7E',
        '%20': '+',
        '%00': '\x00'
    };
    return encodeURIComponent(str).replace(/[!'()~]|%20|%00/g, function replacer(match) {
        return charMap[match];
    });
}
/**
 * It takes a params object and converts it to a FormData object
 *
 * @param {Object<string, any>} params - The parameters to be converted to a FormData object.
 * @param {Object<string, any>} options - The options object passed to the Axios constructor.
 *
 * @returns {void}
 */ function AxiosURLSearchParams(params, options) {
    this._pairs = [];
    params && (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$toFormData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(params, this, options);
}
const prototype = AxiosURLSearchParams.prototype;
prototype.append = function append(name, value) {
    this._pairs.push([
        name,
        value
    ]);
};
prototype.toString = function toString(encoder) {
    const _encode = encoder ? function(value) {
        return encoder.call(this, value, encode);
    } : encode;
    return this._pairs.map(function each(pair) {
        return _encode(pair[0]) + '=' + _encode(pair[1]);
    }, '').join('&');
};
const __TURBOPACK__default__export__ = AxiosURLSearchParams;
}),
"[project]/dashboard/node_modules/axios/lib/helpers/buildURL.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>buildURL
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/utils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$AxiosURLSearchParams$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/helpers/AxiosURLSearchParams.js [app-client] (ecmascript)");
'use strict';
;
;
/**
 * It replaces all instances of the characters `:`, `$`, `,`, `+`, `[`, and `]` with their
 * URI encoded counterparts
 *
 * @param {string} val The value to be encoded.
 *
 * @returns {string} The encoded value.
 */ function encode(val) {
    return encodeURIComponent(val).replace(/%3A/gi, ':').replace(/%24/g, '$').replace(/%2C/gi, ',').replace(/%20/g, '+');
}
function buildURL(url, params, options) {
    /*eslint no-param-reassign:0*/ if (!params) {
        return url;
    }
    const _encode = options && options.encode || encode;
    if (__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isFunction(options)) {
        options = {
            serialize: options
        };
    }
    const serializeFn = options && options.serialize;
    let serializedParams;
    if (serializeFn) {
        serializedParams = serializeFn(params, options);
    } else {
        serializedParams = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isURLSearchParams(params) ? params.toString() : new __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$AxiosURLSearchParams$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"](params, options).toString(_encode);
    }
    if (serializedParams) {
        const hashmarkIndex = url.indexOf("#");
        if (hashmarkIndex !== -1) {
            url = url.slice(0, hashmarkIndex);
        }
        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
    }
    return url;
}
}),
"[project]/dashboard/node_modules/axios/lib/core/InterceptorManager.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/utils.js [app-client] (ecmascript)");
'use strict';
;
class InterceptorManager {
    constructor(){
        this.handlers = [];
    }
    /**
   * Add a new interceptor to the stack
   *
   * @param {Function} fulfilled The function to handle `then` for a `Promise`
   * @param {Function} rejected The function to handle `reject` for a `Promise`
   *
   * @return {Number} An ID used to remove interceptor later
   */ use(fulfilled, rejected, options) {
        this.handlers.push({
            fulfilled,
            rejected,
            synchronous: options ? options.synchronous : false,
            runWhen: options ? options.runWhen : null
        });
        return this.handlers.length - 1;
    }
    /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   *
   * @returns {void}
   */ eject(id) {
        if (this.handlers[id]) {
            this.handlers[id] = null;
        }
    }
    /**
   * Clear all interceptors from the stack
   *
   * @returns {void}
   */ clear() {
        if (this.handlers) {
            this.handlers = [];
        }
    }
    /**
   * Iterate over all the registered interceptors
   *
   * This method is particularly useful for skipping over any
   * interceptors that may have become `null` calling `eject`.
   *
   * @param {Function} fn The function to call for each interceptor
   *
   * @returns {void}
   */ forEach(fn) {
        __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].forEach(this.handlers, function forEachHandler(h) {
            if (h !== null) {
                fn(h);
            }
        });
    }
}
const __TURBOPACK__default__export__ = InterceptorManager;
}),
"[project]/dashboard/node_modules/axios/lib/defaults/transitional.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
'use strict';
const __TURBOPACK__default__export__ = {
    silentJSONParsing: true,
    forcedJSONParsing: true,
    clarifyTimeoutError: false
};
}),
"[project]/dashboard/node_modules/axios/lib/platform/browser/classes/URLSearchParams.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$AxiosURLSearchParams$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/helpers/AxiosURLSearchParams.js [app-client] (ecmascript)");
'use strict';
;
const __TURBOPACK__default__export__ = typeof URLSearchParams !== 'undefined' ? URLSearchParams : __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$AxiosURLSearchParams$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"];
}),
"[project]/dashboard/node_modules/axios/lib/platform/browser/classes/FormData.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
'use strict';
const __TURBOPACK__default__export__ = typeof FormData !== 'undefined' ? FormData : null;
}),
"[project]/dashboard/node_modules/axios/lib/platform/browser/classes/Blob.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
'use strict';
const __TURBOPACK__default__export__ = typeof Blob !== 'undefined' ? Blob : null;
}),
"[project]/dashboard/node_modules/axios/lib/platform/browser/index.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$platform$2f$browser$2f$classes$2f$URLSearchParams$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/platform/browser/classes/URLSearchParams.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$platform$2f$browser$2f$classes$2f$FormData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/platform/browser/classes/FormData.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$platform$2f$browser$2f$classes$2f$Blob$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/platform/browser/classes/Blob.js [app-client] (ecmascript)");
;
;
;
const __TURBOPACK__default__export__ = {
    isBrowser: true,
    classes: {
        URLSearchParams: __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$platform$2f$browser$2f$classes$2f$URLSearchParams$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        FormData: __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$platform$2f$browser$2f$classes$2f$FormData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        Blob: __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$platform$2f$browser$2f$classes$2f$Blob$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
    },
    protocols: [
        'http',
        'https',
        'file',
        'blob',
        'url',
        'data'
    ]
};
}),
"[project]/dashboard/node_modules/axios/lib/platform/common/utils.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "hasBrowserEnv",
    ()=>hasBrowserEnv,
    "hasStandardBrowserEnv",
    ()=>hasStandardBrowserEnv,
    "hasStandardBrowserWebWorkerEnv",
    ()=>hasStandardBrowserWebWorkerEnv,
    "navigator",
    ()=>_navigator,
    "origin",
    ()=>origin
]);
const hasBrowserEnv = typeof window !== 'undefined' && typeof document !== 'undefined';
const _navigator = typeof navigator === 'object' && navigator || undefined;
/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 *
 * @returns {boolean}
 */ const hasStandardBrowserEnv = hasBrowserEnv && (!_navigator || [
    'ReactNative',
    'NativeScript',
    'NS'
].indexOf(_navigator.product) < 0);
/**
 * Determine if we're running in a standard browser webWorker environment
 *
 * Although the `isStandardBrowserEnv` method indicates that
 * `allows axios to run in a web worker`, the WebWorker will still be
 * filtered out due to its judgment standard
 * `typeof window !== 'undefined' && typeof document !== 'undefined'`.
 * This leads to a problem when axios post `FormData` in webWorker
 */ const hasStandardBrowserWebWorkerEnv = (()=>{
    return typeof WorkerGlobalScope !== 'undefined' && // eslint-disable-next-line no-undef
    self instanceof WorkerGlobalScope && typeof self.importScripts === 'function';
})();
const origin = hasBrowserEnv && window.location.href || 'http://localhost';
;
}),
"[project]/dashboard/node_modules/axios/lib/platform/index.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$platform$2f$browser$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/platform/browser/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$platform$2f$common$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/platform/common/utils.js [app-client] (ecmascript)");
;
;
const __TURBOPACK__default__export__ = {
    ...__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$platform$2f$common$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__,
    ...__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$platform$2f$browser$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
};
}),
"[project]/dashboard/node_modules/axios/lib/helpers/toURLEncodedForm.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>toURLEncodedForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/utils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$toFormData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/helpers/toFormData.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$platform$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/platform/index.js [app-client] (ecmascript)");
'use strict';
;
;
;
function toURLEncodedForm(data, options) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$toFormData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(data, new __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$platform$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].classes.URLSearchParams(), {
        visitor: function(value, key, path, helpers) {
            if (__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$platform$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isNode && __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isBuffer(value)) {
                this.append(key, value.toString('base64'));
                return false;
            }
            return helpers.defaultVisitor.apply(this, arguments);
        },
        ...options
    });
}
}),
"[project]/dashboard/node_modules/axios/lib/helpers/formDataToJSON.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/utils.js [app-client] (ecmascript)");
'use strict';
;
/**
 * It takes a string like `foo[x][y][z]` and returns an array like `['foo', 'x', 'y', 'z']
 *
 * @param {string} name - The name of the property to get.
 *
 * @returns An array of strings.
 */ function parsePropPath(name) {
    // foo[x][y][z]
    // foo.x.y.z
    // foo-x-y-z
    // foo x y z
    return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].matchAll(/\w+|\[(\w*)]/g, name).map((match)=>{
        return match[0] === '[]' ? '' : match[1] || match[0];
    });
}
/**
 * Convert an array to an object.
 *
 * @param {Array<any>} arr - The array to convert to an object.
 *
 * @returns An object with the same keys and values as the array.
 */ function arrayToObject(arr) {
    const obj = {};
    const keys = Object.keys(arr);
    let i;
    const len = keys.length;
    let key;
    for(i = 0; i < len; i++){
        key = keys[i];
        obj[key] = arr[key];
    }
    return obj;
}
/**
 * It takes a FormData object and returns a JavaScript object
 *
 * @param {string} formData The FormData object to convert to JSON.
 *
 * @returns {Object<string, any> | null} The converted object.
 */ function formDataToJSON(formData) {
    function buildPath(path, value, target, index) {
        let name = path[index++];
        if (name === '__proto__') return true;
        const isNumericKey = Number.isFinite(+name);
        const isLast = index >= path.length;
        name = !name && __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isArray(target) ? target.length : name;
        if (isLast) {
            if (__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].hasOwnProp(target, name)) {
                target[name] = [
                    target[name],
                    value
                ];
            } else {
                target[name] = value;
            }
            return !isNumericKey;
        }
        if (!target[name] || !__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isObject(target[name])) {
            target[name] = [];
        }
        const result = buildPath(path, value, target[name], index);
        if (result && __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isArray(target[name])) {
            target[name] = arrayToObject(target[name]);
        }
        return !isNumericKey;
    }
    if (__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isFormData(formData) && __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isFunction(formData.entries)) {
        const obj = {};
        __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].forEachEntry(formData, (name, value)=>{
            buildPath(parsePropPath(name), value, obj, 0);
        });
        return obj;
    }
    return null;
}
const __TURBOPACK__default__export__ = formDataToJSON;
}),
"[project]/dashboard/node_modules/axios/lib/defaults/index.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/utils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/core/AxiosError.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$defaults$2f$transitional$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/defaults/transitional.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$toFormData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/helpers/toFormData.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$toURLEncodedForm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/helpers/toURLEncodedForm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$platform$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/platform/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$formDataToJSON$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/helpers/formDataToJSON.js [app-client] (ecmascript)");
'use strict';
;
;
;
;
;
;
;
/**
 * It takes a string, tries to parse it, and if it fails, it returns the stringified version
 * of the input
 *
 * @param {any} rawValue - The value to be stringified.
 * @param {Function} parser - A function that parses a string into a JavaScript object.
 * @param {Function} encoder - A function that takes a value and returns a string.
 *
 * @returns {string} A stringified version of the rawValue.
 */ function stringifySafely(rawValue, parser, encoder) {
    if (__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isString(rawValue)) {
        try {
            (parser || JSON.parse)(rawValue);
            return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].trim(rawValue);
        } catch (e) {
            if (e.name !== 'SyntaxError') {
                throw e;
            }
        }
    }
    return (encoder || JSON.stringify)(rawValue);
}
const defaults = {
    transitional: __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$defaults$2f$transitional$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
    adapter: [
        'xhr',
        'http',
        'fetch'
    ],
    transformRequest: [
        function transformRequest(data, headers) {
            const contentType = headers.getContentType() || '';
            const hasJSONContentType = contentType.indexOf('application/json') > -1;
            const isObjectPayload = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isObject(data);
            if (isObjectPayload && __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isHTMLForm(data)) {
                data = new FormData(data);
            }
            const isFormData = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isFormData(data);
            if (isFormData) {
                return hasJSONContentType ? JSON.stringify((0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$formDataToJSON$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(data)) : data;
            }
            if (__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isArrayBuffer(data) || __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isBuffer(data) || __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isStream(data) || __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isFile(data) || __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isBlob(data) || __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isReadableStream(data)) {
                return data;
            }
            if (__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isArrayBufferView(data)) {
                return data.buffer;
            }
            if (__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isURLSearchParams(data)) {
                headers.setContentType('application/x-www-form-urlencoded;charset=utf-8', false);
                return data.toString();
            }
            let isFileList;
            if (isObjectPayload) {
                if (contentType.indexOf('application/x-www-form-urlencoded') > -1) {
                    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$toURLEncodedForm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(data, this.formSerializer).toString();
                }
                if ((isFileList = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isFileList(data)) || contentType.indexOf('multipart/form-data') > -1) {
                    const _FormData = this.env && this.env.FormData;
                    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$toFormData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(isFileList ? {
                        'files[]': data
                    } : data, _FormData && new _FormData(), this.formSerializer);
                }
            }
            if (isObjectPayload || hasJSONContentType) {
                headers.setContentType('application/json', false);
                return stringifySafely(data);
            }
            return data;
        }
    ],
    transformResponse: [
        function transformResponse(data) {
            const transitional = this.transitional || defaults.transitional;
            const forcedJSONParsing = transitional && transitional.forcedJSONParsing;
            const JSONRequested = this.responseType === 'json';
            if (__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isResponse(data) || __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isReadableStream(data)) {
                return data;
            }
            if (data && __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isString(data) && (forcedJSONParsing && !this.responseType || JSONRequested)) {
                const silentJSONParsing = transitional && transitional.silentJSONParsing;
                const strictJSONParsing = !silentJSONParsing && JSONRequested;
                try {
                    return JSON.parse(data, this.parseReviver);
                } catch (e) {
                    if (strictJSONParsing) {
                        if (e.name === 'SyntaxError') {
                            throw __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].from(e, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].ERR_BAD_RESPONSE, this, null, this.response);
                        }
                        throw e;
                    }
                }
            }
            return data;
        }
    ],
    /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */ timeout: 0,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    maxContentLength: -1,
    maxBodyLength: -1,
    env: {
        FormData: __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$platform$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].classes.FormData,
        Blob: __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$platform$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].classes.Blob
    },
    validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
    },
    headers: {
        common: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': undefined
        }
    }
};
__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].forEach([
    'delete',
    'get',
    'head',
    'post',
    'put',
    'patch'
], (method)=>{
    defaults.headers[method] = {};
});
const __TURBOPACK__default__export__ = defaults;
}),
"[project]/dashboard/node_modules/axios/lib/helpers/parseHeaders.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/utils.js [app-client] (ecmascript)");
'use strict';
;
// RawAxiosHeaders whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
const ignoreDuplicateOf = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].toObjectSet([
    'age',
    'authorization',
    'content-length',
    'content-type',
    'etag',
    'expires',
    'from',
    'host',
    'if-modified-since',
    'if-unmodified-since',
    'last-modified',
    'location',
    'max-forwards',
    'proxy-authorization',
    'referer',
    'retry-after',
    'user-agent'
]);
const __TURBOPACK__default__export__ = (rawHeaders)=>{
    const parsed = {};
    let key;
    let val;
    let i;
    rawHeaders && rawHeaders.split('\n').forEach(function parser(line) {
        i = line.indexOf(':');
        key = line.substring(0, i).trim().toLowerCase();
        val = line.substring(i + 1).trim();
        if (!key || parsed[key] && ignoreDuplicateOf[key]) {
            return;
        }
        if (key === 'set-cookie') {
            if (parsed[key]) {
                parsed[key].push(val);
            } else {
                parsed[key] = [
                    val
                ];
            }
        } else {
            parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
        }
    });
    return parsed;
};
}),
"[project]/dashboard/node_modules/axios/lib/core/AxiosHeaders.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/utils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$parseHeaders$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/helpers/parseHeaders.js [app-client] (ecmascript)");
'use strict';
;
;
const $internals = Symbol('internals');
function normalizeHeader(header) {
    return header && String(header).trim().toLowerCase();
}
function normalizeValue(value) {
    if (value === false || value == null) {
        return value;
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isArray(value) ? value.map(normalizeValue) : String(value);
}
function parseTokens(str) {
    const tokens = Object.create(null);
    const tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
    let match;
    while(match = tokensRE.exec(str)){
        tokens[match[1]] = match[2];
    }
    return tokens;
}
const isValidHeaderName = (str)=>/^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(str.trim());
function matchHeaderValue(context, value, header, filter, isHeaderNameFilter) {
    if (__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isFunction(filter)) {
        return filter.call(this, value, header);
    }
    if (isHeaderNameFilter) {
        value = header;
    }
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isString(value)) return;
    if (__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isString(filter)) {
        return value.indexOf(filter) !== -1;
    }
    if (__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isRegExp(filter)) {
        return filter.test(value);
    }
}
function formatHeader(header) {
    return header.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (w, char, str)=>{
        return char.toUpperCase() + str;
    });
}
function buildAccessors(obj, header) {
    const accessorName = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].toCamelCase(' ' + header);
    [
        'get',
        'set',
        'has'
    ].forEach((methodName)=>{
        Object.defineProperty(obj, methodName + accessorName, {
            value: function(arg1, arg2, arg3) {
                return this[methodName].call(this, header, arg1, arg2, arg3);
            },
            configurable: true
        });
    });
}
class AxiosHeaders {
    constructor(headers){
        headers && this.set(headers);
    }
    set(header, valueOrRewrite, rewrite) {
        const self = this;
        function setHeader(_value, _header, _rewrite) {
            const lHeader = normalizeHeader(_header);
            if (!lHeader) {
                throw new Error('header name must be a non-empty string');
            }
            const key = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].findKey(self, lHeader);
            if (!key || self[key] === undefined || _rewrite === true || _rewrite === undefined && self[key] !== false) {
                self[key || _header] = normalizeValue(_value);
            }
        }
        const setHeaders = (headers, _rewrite)=>__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].forEach(headers, (_value, _header)=>setHeader(_value, _header, _rewrite));
        if (__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isPlainObject(header) || header instanceof this.constructor) {
            setHeaders(header, valueOrRewrite);
        } else if (__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isString(header) && (header = header.trim()) && !isValidHeaderName(header)) {
            setHeaders((0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$parseHeaders$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(header), valueOrRewrite);
        } else if (__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isObject(header) && __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isIterable(header)) {
            let obj = {}, dest, key;
            for (const entry of header){
                if (!__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isArray(entry)) {
                    throw TypeError('Object iterator must return a key-value pair');
                }
                obj[key = entry[0]] = (dest = obj[key]) ? __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isArray(dest) ? [
                    ...dest,
                    entry[1]
                ] : [
                    dest,
                    entry[1]
                ] : entry[1];
            }
            setHeaders(obj, valueOrRewrite);
        } else {
            header != null && setHeader(valueOrRewrite, header, rewrite);
        }
        return this;
    }
    get(header, parser) {
        header = normalizeHeader(header);
        if (header) {
            const key = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].findKey(this, header);
            if (key) {
                const value = this[key];
                if (!parser) {
                    return value;
                }
                if (parser === true) {
                    return parseTokens(value);
                }
                if (__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isFunction(parser)) {
                    return parser.call(this, value, key);
                }
                if (__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isRegExp(parser)) {
                    return parser.exec(value);
                }
                throw new TypeError('parser must be boolean|regexp|function');
            }
        }
    }
    has(header, matcher) {
        header = normalizeHeader(header);
        if (header) {
            const key = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].findKey(this, header);
            return !!(key && this[key] !== undefined && (!matcher || matchHeaderValue(this, this[key], key, matcher)));
        }
        return false;
    }
    delete(header, matcher) {
        const self = this;
        let deleted = false;
        function deleteHeader(_header) {
            _header = normalizeHeader(_header);
            if (_header) {
                const key = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].findKey(self, _header);
                if (key && (!matcher || matchHeaderValue(self, self[key], key, matcher))) {
                    delete self[key];
                    deleted = true;
                }
            }
        }
        if (__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isArray(header)) {
            header.forEach(deleteHeader);
        } else {
            deleteHeader(header);
        }
        return deleted;
    }
    clear(matcher) {
        const keys = Object.keys(this);
        let i = keys.length;
        let deleted = false;
        while(i--){
            const key = keys[i];
            if (!matcher || matchHeaderValue(this, this[key], key, matcher, true)) {
                delete this[key];
                deleted = true;
            }
        }
        return deleted;
    }
    normalize(format) {
        const self = this;
        const headers = {};
        __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].forEach(this, (value, header)=>{
            const key = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].findKey(headers, header);
            if (key) {
                self[key] = normalizeValue(value);
                delete self[header];
                return;
            }
            const normalized = format ? formatHeader(header) : String(header).trim();
            if (normalized !== header) {
                delete self[header];
            }
            self[normalized] = normalizeValue(value);
            headers[normalized] = true;
        });
        return this;
    }
    concat(...targets) {
        return this.constructor.concat(this, ...targets);
    }
    toJSON(asStrings) {
        const obj = Object.create(null);
        __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].forEach(this, (value, header)=>{
            value != null && value !== false && (obj[header] = asStrings && __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isArray(value) ? value.join(', ') : value);
        });
        return obj;
    }
    [Symbol.iterator]() {
        return Object.entries(this.toJSON())[Symbol.iterator]();
    }
    toString() {
        return Object.entries(this.toJSON()).map(([header, value])=>header + ': ' + value).join('\n');
    }
    getSetCookie() {
        return this.get("set-cookie") || [];
    }
    get [Symbol.toStringTag]() {
        return 'AxiosHeaders';
    }
    static from(thing) {
        return thing instanceof this ? thing : new this(thing);
    }
    static concat(first, ...targets) {
        const computed = new this(first);
        targets.forEach((target)=>computed.set(target));
        return computed;
    }
    static accessor(header) {
        const internals = this[$internals] = this[$internals] = {
            accessors: {}
        };
        const accessors = internals.accessors;
        const prototype = this.prototype;
        function defineAccessor(_header) {
            const lHeader = normalizeHeader(_header);
            if (!accessors[lHeader]) {
                buildAccessors(prototype, _header);
                accessors[lHeader] = true;
            }
        }
        __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);
        return this;
    }
}
AxiosHeaders.accessor([
    'Content-Type',
    'Content-Length',
    'Accept',
    'Accept-Encoding',
    'User-Agent',
    'Authorization'
]);
// reserved names hotfix
__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].reduceDescriptors(AxiosHeaders.prototype, ({ value }, key)=>{
    let mapped = key[0].toUpperCase() + key.slice(1); // map `set` => `Set`
    return {
        get: ()=>value,
        set (headerValue) {
            this[mapped] = headerValue;
        }
    };
});
__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].freezeMethods(AxiosHeaders);
const __TURBOPACK__default__export__ = AxiosHeaders;
}),
"[project]/dashboard/node_modules/axios/lib/core/transformData.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>transformData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/utils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$defaults$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/defaults/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosHeaders$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/core/AxiosHeaders.js [app-client] (ecmascript)");
'use strict';
;
;
;
function transformData(fns, response) {
    const config = this || __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$defaults$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"];
    const context = response || config;
    const headers = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosHeaders$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].from(context.headers);
    let data = context.data;
    __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].forEach(fns, function transform(fn) {
        data = fn.call(config, data, headers.normalize(), response ? response.status : undefined);
    });
    headers.normalize();
    return data;
}
}),
"[project]/dashboard/node_modules/axios/lib/cancel/isCancel.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>isCancel
]);
'use strict';
function isCancel(value) {
    return !!(value && value.__CANCEL__);
}
}),
"[project]/dashboard/node_modules/axios/lib/cancel/CanceledError.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/core/AxiosError.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/utils.js [app-client] (ecmascript)");
'use strict';
;
;
/**
 * A `CanceledError` is an object that is thrown when an operation is canceled.
 *
 * @param {string=} message The message.
 * @param {Object=} config The config.
 * @param {Object=} request The request.
 *
 * @returns {CanceledError} The created error.
 */ function CanceledError(message, config, request) {
    // eslint-disable-next-line no-eq-null,eqeqeq
    __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].call(this, message == null ? 'canceled' : message, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].ERR_CANCELED, config, request);
    this.name = 'CanceledError';
}
__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].inherits(CanceledError, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
    __CANCEL__: true
});
const __TURBOPACK__default__export__ = CanceledError;
}),
"[project]/dashboard/node_modules/axios/lib/core/settle.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>settle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/core/AxiosError.js [app-client] (ecmascript)");
'use strict';
;
function settle(resolve, reject, response) {
    const validateStatus = response.config.validateStatus;
    if (!response.status || !validateStatus || validateStatus(response.status)) {
        resolve(response);
    } else {
        reject(new __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]('Request failed with status code ' + response.status, [
            __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].ERR_BAD_REQUEST,
            __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].ERR_BAD_RESPONSE
        ][Math.floor(response.status / 100) - 4], response.config, response.request, response));
    }
}
}),
"[project]/dashboard/node_modules/axios/lib/helpers/parseProtocol.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>parseProtocol
]);
'use strict';
function parseProtocol(url) {
    const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
    return match && match[1] || '';
}
}),
"[project]/dashboard/node_modules/axios/lib/helpers/speedometer.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
'use strict';
/**
 * Calculate data maxRate
 * @param {Number} [samplesCount= 10]
 * @param {Number} [min= 1000]
 * @returns {Function}
 */ function speedometer(samplesCount, min) {
    samplesCount = samplesCount || 10;
    const bytes = new Array(samplesCount);
    const timestamps = new Array(samplesCount);
    let head = 0;
    let tail = 0;
    let firstSampleTS;
    min = min !== undefined ? min : 1000;
    return function push(chunkLength) {
        const now = Date.now();
        const startedAt = timestamps[tail];
        if (!firstSampleTS) {
            firstSampleTS = now;
        }
        bytes[head] = chunkLength;
        timestamps[head] = now;
        let i = tail;
        let bytesCount = 0;
        while(i !== head){
            bytesCount += bytes[i++];
            i = i % samplesCount;
        }
        head = (head + 1) % samplesCount;
        if (head === tail) {
            tail = (tail + 1) % samplesCount;
        }
        if (now - firstSampleTS < min) {
            return;
        }
        const passed = startedAt && now - startedAt;
        return passed ? Math.round(bytesCount * 1000 / passed) : undefined;
    };
}
const __TURBOPACK__default__export__ = speedometer;
}),
"[project]/dashboard/node_modules/axios/lib/helpers/throttle.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Throttle decorator
 * @param {Function} fn
 * @param {Number} freq
 * @return {Function}
 */ __turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
function throttle(fn, freq) {
    let timestamp = 0;
    let threshold = 1000 / freq;
    let lastArgs;
    let timer;
    const invoke = (args, now = Date.now())=>{
        timestamp = now;
        lastArgs = null;
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        fn(...args);
    };
    const throttled = (...args)=>{
        const now = Date.now();
        const passed = now - timestamp;
        if (passed >= threshold) {
            invoke(args, now);
        } else {
            lastArgs = args;
            if (!timer) {
                timer = setTimeout(()=>{
                    timer = null;
                    invoke(lastArgs);
                }, threshold - passed);
            }
        }
    };
    const flush = ()=>lastArgs && invoke(lastArgs);
    return [
        throttled,
        flush
    ];
}
const __TURBOPACK__default__export__ = throttle;
}),
"[project]/dashboard/node_modules/axios/lib/helpers/progressEventReducer.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "asyncDecorator",
    ()=>asyncDecorator,
    "progressEventDecorator",
    ()=>progressEventDecorator,
    "progressEventReducer",
    ()=>progressEventReducer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$speedometer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/helpers/speedometer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$throttle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/helpers/throttle.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/utils.js [app-client] (ecmascript)");
;
;
;
const progressEventReducer = (listener, isDownloadStream, freq = 3)=>{
    let bytesNotified = 0;
    const _speedometer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$speedometer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(50, 250);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$throttle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])((e)=>{
        const loaded = e.loaded;
        const total = e.lengthComputable ? e.total : undefined;
        const progressBytes = loaded - bytesNotified;
        const rate = _speedometer(progressBytes);
        const inRange = loaded <= total;
        bytesNotified = loaded;
        const data = {
            loaded,
            total,
            progress: total ? loaded / total : undefined,
            bytes: progressBytes,
            rate: rate ? rate : undefined,
            estimated: rate && total && inRange ? (total - loaded) / rate : undefined,
            event: e,
            lengthComputable: total != null,
            [isDownloadStream ? 'download' : 'upload']: true
        };
        listener(data);
    }, freq);
};
const progressEventDecorator = (total, throttled)=>{
    const lengthComputable = total != null;
    return [
        (loaded)=>throttled[0]({
                lengthComputable,
                total,
                loaded
            }),
        throttled[1]
    ];
};
const asyncDecorator = (fn)=>(...args)=>__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].asap(()=>fn(...args));
}),
"[project]/dashboard/node_modules/axios/lib/helpers/isURLSameOrigin.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$platform$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/platform/index.js [app-client] (ecmascript)");
;
const __TURBOPACK__default__export__ = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$platform$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].hasStandardBrowserEnv ? ((origin, isMSIE)=>(url)=>{
        url = new URL(url, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$platform$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].origin);
        return origin.protocol === url.protocol && origin.host === url.host && (isMSIE || origin.port === url.port);
    })(new URL(__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$platform$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].origin), __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$platform$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].navigator && /(msie|trident)/i.test(__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$platform$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].navigator.userAgent)) : ()=>true;
}),
"[project]/dashboard/node_modules/axios/lib/helpers/cookies.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/utils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$platform$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/platform/index.js [app-client] (ecmascript)");
;
;
const __TURBOPACK__default__export__ = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$platform$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].hasStandardBrowserEnv ? // Standard browser envs support document.cookie
{
    write (name, value, expires, path, domain, secure, sameSite) {
        if (typeof document === 'undefined') return;
        const cookie = [
            `${name}=${encodeURIComponent(value)}`
        ];
        if (__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isNumber(expires)) {
            cookie.push(`expires=${new Date(expires).toUTCString()}`);
        }
        if (__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isString(path)) {
            cookie.push(`path=${path}`);
        }
        if (__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isString(domain)) {
            cookie.push(`domain=${domain}`);
        }
        if (secure === true) {
            cookie.push('secure');
        }
        if (__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isString(sameSite)) {
            cookie.push(`SameSite=${sameSite}`);
        }
        document.cookie = cookie.join('; ');
    },
    read (name) {
        if (typeof document === 'undefined') return null;
        const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
        return match ? decodeURIComponent(match[1]) : null;
    },
    remove (name) {
        this.write(name, '', Date.now() - 86400000, '/');
    }
} : // Non-standard browser env (web workers, react-native) lack needed support.
{
    write () {},
    read () {
        return null;
    },
    remove () {}
};
}),
"[project]/dashboard/node_modules/axios/lib/helpers/isAbsoluteURL.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>isAbsoluteURL
]);
'use strict';
function isAbsoluteURL(url) {
    // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
    // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
    // by any combination of letters, digits, plus, period, or hyphen.
    return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
}
}),
"[project]/dashboard/node_modules/axios/lib/helpers/combineURLs.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>combineURLs
]);
'use strict';
function combineURLs(baseURL, relativeURL) {
    return relativeURL ? baseURL.replace(/\/?\/$/, '') + '/' + relativeURL.replace(/^\/+/, '') : baseURL;
}
}),
"[project]/dashboard/node_modules/axios/lib/core/buildFullPath.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>buildFullPath
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$isAbsoluteURL$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/helpers/isAbsoluteURL.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$combineURLs$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/helpers/combineURLs.js [app-client] (ecmascript)");
'use strict';
;
;
function buildFullPath(baseURL, requestedURL, allowAbsoluteUrls) {
    let isRelativeUrl = !(0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$isAbsoluteURL$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(requestedURL);
    if (baseURL && (isRelativeUrl || allowAbsoluteUrls == false)) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$combineURLs$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(baseURL, requestedURL);
    }
    return requestedURL;
}
}),
"[project]/dashboard/node_modules/axios/lib/core/mergeConfig.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>mergeConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/utils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosHeaders$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/core/AxiosHeaders.js [app-client] (ecmascript)");
'use strict';
;
;
const headersToObject = (thing)=>thing instanceof __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosHeaders$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"] ? {
        ...thing
    } : thing;
function mergeConfig(config1, config2) {
    // eslint-disable-next-line no-param-reassign
    config2 = config2 || {};
    const config = {};
    function getMergedValue(target, source, prop, caseless) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isPlainObject(target) && __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isPlainObject(source)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].merge.call({
                caseless
            }, target, source);
        } else if (__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isPlainObject(source)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].merge({}, source);
        } else if (__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isArray(source)) {
            return source.slice();
        }
        return source;
    }
    // eslint-disable-next-line consistent-return
    function mergeDeepProperties(a, b, prop, caseless) {
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isUndefined(b)) {
            return getMergedValue(a, b, prop, caseless);
        } else if (!__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isUndefined(a)) {
            return getMergedValue(undefined, a, prop, caseless);
        }
    }
    // eslint-disable-next-line consistent-return
    function valueFromConfig2(a, b) {
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isUndefined(b)) {
            return getMergedValue(undefined, b);
        }
    }
    // eslint-disable-next-line consistent-return
    function defaultToConfig2(a, b) {
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isUndefined(b)) {
            return getMergedValue(undefined, b);
        } else if (!__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isUndefined(a)) {
            return getMergedValue(undefined, a);
        }
    }
    // eslint-disable-next-line consistent-return
    function mergeDirectKeys(a, b, prop) {
        if (prop in config2) {
            return getMergedValue(a, b);
        } else if (prop in config1) {
            return getMergedValue(undefined, a);
        }
    }
    const mergeMap = {
        url: valueFromConfig2,
        method: valueFromConfig2,
        data: valueFromConfig2,
        baseURL: defaultToConfig2,
        transformRequest: defaultToConfig2,
        transformResponse: defaultToConfig2,
        paramsSerializer: defaultToConfig2,
        timeout: defaultToConfig2,
        timeoutMessage: defaultToConfig2,
        withCredentials: defaultToConfig2,
        withXSRFToken: defaultToConfig2,
        adapter: defaultToConfig2,
        responseType: defaultToConfig2,
        xsrfCookieName: defaultToConfig2,
        xsrfHeaderName: defaultToConfig2,
        onUploadProgress: defaultToConfig2,
        onDownloadProgress: defaultToConfig2,
        decompress: defaultToConfig2,
        maxContentLength: defaultToConfig2,
        maxBodyLength: defaultToConfig2,
        beforeRedirect: defaultToConfig2,
        transport: defaultToConfig2,
        httpAgent: defaultToConfig2,
        httpsAgent: defaultToConfig2,
        cancelToken: defaultToConfig2,
        socketPath: defaultToConfig2,
        responseEncoding: defaultToConfig2,
        validateStatus: mergeDirectKeys,
        headers: (a, b, prop)=>mergeDeepProperties(headersToObject(a), headersToObject(b), prop, true)
    };
    __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].forEach(Object.keys({
        ...config1,
        ...config2
    }), function computeConfigValue(prop) {
        const merge = mergeMap[prop] || mergeDeepProperties;
        const configValue = merge(config1[prop], config2[prop], prop);
        __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isUndefined(configValue) && merge !== mergeDirectKeys || (config[prop] = configValue);
    });
    return config;
}
}),
"[project]/dashboard/node_modules/axios/lib/helpers/resolveConfig.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$platform$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/platform/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/utils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$isURLSameOrigin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/helpers/isURLSameOrigin.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$cookies$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/helpers/cookies.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$buildFullPath$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/core/buildFullPath.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$mergeConfig$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/core/mergeConfig.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosHeaders$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/core/AxiosHeaders.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$buildURL$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/helpers/buildURL.js [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
const __TURBOPACK__default__export__ = (config)=>{
    const newConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$mergeConfig$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({}, config);
    let { data, withXSRFToken, xsrfHeaderName, xsrfCookieName, headers, auth } = newConfig;
    newConfig.headers = headers = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosHeaders$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].from(headers);
    newConfig.url = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$buildURL$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$buildFullPath$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(newConfig.baseURL, newConfig.url, newConfig.allowAbsoluteUrls), config.params, config.paramsSerializer);
    // HTTP basic authentication
    if (auth) {
        headers.set('Authorization', 'Basic ' + btoa((auth.username || '') + ':' + (auth.password ? unescape(encodeURIComponent(auth.password)) : '')));
    }
    if (__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isFormData(data)) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$platform$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].hasStandardBrowserEnv || __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$platform$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].hasStandardBrowserWebWorkerEnv) {
            headers.setContentType(undefined); // browser handles it
        } else if (__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isFunction(data.getHeaders)) {
            // Node.js FormData (like form-data package)
            const formHeaders = data.getHeaders();
            // Only set safe headers to avoid overwriting security headers
            const allowedHeaders = [
                'content-type',
                'content-length'
            ];
            Object.entries(formHeaders).forEach(([key, val])=>{
                if (allowedHeaders.includes(key.toLowerCase())) {
                    headers.set(key, val);
                }
            });
        }
    }
    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$platform$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].hasStandardBrowserEnv) {
        withXSRFToken && __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isFunction(withXSRFToken) && (withXSRFToken = withXSRFToken(newConfig));
        if (withXSRFToken || withXSRFToken !== false && (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$isURLSameOrigin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(newConfig.url)) {
            // Add xsrf header
            const xsrfValue = xsrfHeaderName && xsrfCookieName && __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$cookies$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].read(xsrfCookieName);
            if (xsrfValue) {
                headers.set(xsrfHeaderName, xsrfValue);
            }
        }
    }
    return newConfig;
};
}),
"[project]/dashboard/node_modules/axios/lib/adapters/xhr.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/utils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$settle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/core/settle.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$defaults$2f$transitional$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/defaults/transitional.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/core/AxiosError.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$cancel$2f$CanceledError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/cancel/CanceledError.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$parseProtocol$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/helpers/parseProtocol.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$platform$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/platform/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosHeaders$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/core/AxiosHeaders.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$progressEventReducer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/helpers/progressEventReducer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$resolveConfig$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/helpers/resolveConfig.js [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
const isXHRAdapterSupported = typeof XMLHttpRequest !== 'undefined';
const __TURBOPACK__default__export__ = isXHRAdapterSupported && function(config) {
    return new Promise(function dispatchXhrRequest(resolve, reject) {
        const _config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$resolveConfig$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(config);
        let requestData = _config.data;
        const requestHeaders = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosHeaders$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].from(_config.headers).normalize();
        let { responseType, onUploadProgress, onDownloadProgress } = _config;
        let onCanceled;
        let uploadThrottled, downloadThrottled;
        let flushUpload, flushDownload;
        function done() {
            flushUpload && flushUpload(); // flush events
            flushDownload && flushDownload(); // flush events
            _config.cancelToken && _config.cancelToken.unsubscribe(onCanceled);
            _config.signal && _config.signal.removeEventListener('abort', onCanceled);
        }
        let request = new XMLHttpRequest();
        request.open(_config.method.toUpperCase(), _config.url, true);
        // Set the request timeout in MS
        request.timeout = _config.timeout;
        function onloadend() {
            if (!request) {
                return;
            }
            // Prepare the response
            const responseHeaders = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosHeaders$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].from('getAllResponseHeaders' in request && request.getAllResponseHeaders());
            const responseData = !responseType || responseType === 'text' || responseType === 'json' ? request.responseText : request.response;
            const response = {
                data: responseData,
                status: request.status,
                statusText: request.statusText,
                headers: responseHeaders,
                config,
                request
            };
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$settle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(function _resolve(value) {
                resolve(value);
                done();
            }, function _reject(err) {
                reject(err);
                done();
            }, response);
            // Clean up request
            request = null;
        }
        if ('onloadend' in request) {
            // Use onloadend if available
            request.onloadend = onloadend;
        } else {
            // Listen for ready state to emulate onloadend
            request.onreadystatechange = function handleLoad() {
                if (!request || request.readyState !== 4) {
                    return;
                }
                // The request errored out and we didn't get a response, this will be
                // handled by onerror instead
                // With one exception: request that using file: protocol, most browsers
                // will return status as 0 even though it's a successful request
                if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
                    return;
                }
                // readystate handler is calling before onerror or ontimeout handlers,
                // so we should call onloadend on the next 'tick'
                setTimeout(onloadend);
            };
        }
        // Handle browser request cancellation (as opposed to a manual cancellation)
        request.onabort = function handleAbort() {
            if (!request) {
                return;
            }
            reject(new __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]('Request aborted', __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].ECONNABORTED, config, request));
            // Clean up request
            request = null;
        };
        // Handle low level network errors
        request.onerror = function handleError(event) {
            // Browsers deliver a ProgressEvent in XHR onerror
            // (message may be empty; when present, surface it)
            // See https://developer.mozilla.org/docs/Web/API/XMLHttpRequest/error_event
            const msg = event && event.message ? event.message : 'Network Error';
            const err = new __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"](msg, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].ERR_NETWORK, config, request);
            // attach the underlying event for consumers who want details
            err.event = event || null;
            reject(err);
            request = null;
        };
        // Handle timeout
        request.ontimeout = function handleTimeout() {
            let timeoutErrorMessage = _config.timeout ? 'timeout of ' + _config.timeout + 'ms exceeded' : 'timeout exceeded';
            const transitional = _config.transitional || __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$defaults$2f$transitional$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"];
            if (_config.timeoutErrorMessage) {
                timeoutErrorMessage = _config.timeoutErrorMessage;
            }
            reject(new __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"](timeoutErrorMessage, transitional.clarifyTimeoutError ? __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].ETIMEDOUT : __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].ECONNABORTED, config, request));
            // Clean up request
            request = null;
        };
        // Remove Content-Type if data is undefined
        requestData === undefined && requestHeaders.setContentType(null);
        // Add headers to the request
        if ('setRequestHeader' in request) {
            __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].forEach(requestHeaders.toJSON(), function setRequestHeader(val, key) {
                request.setRequestHeader(key, val);
            });
        }
        // Add withCredentials to request if needed
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isUndefined(_config.withCredentials)) {
            request.withCredentials = !!_config.withCredentials;
        }
        // Add responseType to request if needed
        if (responseType && responseType !== 'json') {
            request.responseType = _config.responseType;
        }
        // Handle progress if needed
        if (onDownloadProgress) {
            [downloadThrottled, flushDownload] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$progressEventReducer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["progressEventReducer"])(onDownloadProgress, true);
            request.addEventListener('progress', downloadThrottled);
        }
        // Not all browsers support upload events
        if (onUploadProgress && request.upload) {
            [uploadThrottled, flushUpload] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$progressEventReducer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["progressEventReducer"])(onUploadProgress);
            request.upload.addEventListener('progress', uploadThrottled);
            request.upload.addEventListener('loadend', flushUpload);
        }
        if (_config.cancelToken || _config.signal) {
            // Handle cancellation
            // eslint-disable-next-line func-names
            onCanceled = (cancel)=>{
                if (!request) {
                    return;
                }
                reject(!cancel || cancel.type ? new __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$cancel$2f$CanceledError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"](null, config, request) : cancel);
                request.abort();
                request = null;
            };
            _config.cancelToken && _config.cancelToken.subscribe(onCanceled);
            if (_config.signal) {
                _config.signal.aborted ? onCanceled() : _config.signal.addEventListener('abort', onCanceled);
            }
        }
        const protocol = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$parseProtocol$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(_config.url);
        if (protocol && __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$platform$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].protocols.indexOf(protocol) === -1) {
            reject(new __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]('Unsupported protocol ' + protocol + ':', __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].ERR_BAD_REQUEST, config));
            return;
        }
        // Send the request
        request.send(requestData || null);
    });
};
}),
"[project]/dashboard/node_modules/axios/lib/helpers/composeSignals.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$cancel$2f$CanceledError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/cancel/CanceledError.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/core/AxiosError.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/utils.js [app-client] (ecmascript)");
;
;
;
const composeSignals = (signals, timeout)=>{
    const { length } = signals = signals ? signals.filter(Boolean) : [];
    if (timeout || length) {
        let controller = new AbortController();
        let aborted;
        const onabort = function(reason) {
            if (!aborted) {
                aborted = true;
                unsubscribe();
                const err = reason instanceof Error ? reason : this.reason;
                controller.abort(err instanceof __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"] ? err : new __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$cancel$2f$CanceledError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"](err instanceof Error ? err.message : err));
            }
        };
        let timer = timeout && setTimeout(()=>{
            timer = null;
            onabort(new __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"](`timeout ${timeout} of ms exceeded`, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].ETIMEDOUT));
        }, timeout);
        const unsubscribe = ()=>{
            if (signals) {
                timer && clearTimeout(timer);
                timer = null;
                signals.forEach((signal)=>{
                    signal.unsubscribe ? signal.unsubscribe(onabort) : signal.removeEventListener('abort', onabort);
                });
                signals = null;
            }
        };
        signals.forEach((signal)=>signal.addEventListener('abort', onabort));
        const { signal } = controller;
        signal.unsubscribe = ()=>__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].asap(unsubscribe);
        return signal;
    }
};
const __TURBOPACK__default__export__ = composeSignals;
}),
"[project]/dashboard/node_modules/axios/lib/helpers/trackStream.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "readBytes",
    ()=>readBytes,
    "streamChunk",
    ()=>streamChunk,
    "trackStream",
    ()=>trackStream
]);
const streamChunk = function*(chunk, chunkSize) {
    let len = chunk.byteLength;
    if (!chunkSize || len < chunkSize) {
        yield chunk;
        return;
    }
    let pos = 0;
    let end;
    while(pos < len){
        end = pos + chunkSize;
        yield chunk.slice(pos, end);
        pos = end;
    }
};
const readBytes = async function*(iterable, chunkSize) {
    for await (const chunk of readStream(iterable)){
        yield* streamChunk(chunk, chunkSize);
    }
};
const readStream = async function*(stream) {
    if (stream[Symbol.asyncIterator]) {
        yield* stream;
        return;
    }
    const reader = stream.getReader();
    try {
        for(;;){
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            yield value;
        }
    } finally{
        await reader.cancel();
    }
};
const trackStream = (stream, chunkSize, onProgress, onFinish)=>{
    const iterator = readBytes(stream, chunkSize);
    let bytes = 0;
    let done;
    let _onFinish = (e)=>{
        if (!done) {
            done = true;
            onFinish && onFinish(e);
        }
    };
    return new ReadableStream({
        async pull (controller) {
            try {
                const { done, value } = await iterator.next();
                if (done) {
                    _onFinish();
                    controller.close();
                    return;
                }
                let len = value.byteLength;
                if (onProgress) {
                    let loadedBytes = bytes += len;
                    onProgress(loadedBytes);
                }
                controller.enqueue(new Uint8Array(value));
            } catch (err) {
                _onFinish(err);
                throw err;
            }
        },
        cancel (reason) {
            _onFinish(reason);
            return iterator.return();
        }
    }, {
        highWaterMark: 2
    });
};
}),
"[project]/dashboard/node_modules/axios/lib/adapters/fetch.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "getFetch",
    ()=>getFetch
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$platform$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/platform/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/utils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/core/AxiosError.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$composeSignals$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/helpers/composeSignals.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$trackStream$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/helpers/trackStream.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosHeaders$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/core/AxiosHeaders.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$progressEventReducer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/helpers/progressEventReducer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$resolveConfig$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/helpers/resolveConfig.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$settle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/core/settle.js [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
;
const DEFAULT_CHUNK_SIZE = 64 * 1024;
const { isFunction } = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"];
const globalFetchAPI = (({ Request, Response })=>({
        Request,
        Response
    }))(__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].global);
const { ReadableStream, TextEncoder } = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].global;
const test = (fn, ...args)=>{
    try {
        return !!fn(...args);
    } catch (e) {
        return false;
    }
};
const factory = (env)=>{
    env = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].merge.call({
        skipUndefined: true
    }, globalFetchAPI, env);
    const { fetch: envFetch, Request, Response } = env;
    const isFetchSupported = envFetch ? isFunction(envFetch) : typeof fetch === 'function';
    const isRequestSupported = isFunction(Request);
    const isResponseSupported = isFunction(Response);
    if (!isFetchSupported) {
        return false;
    }
    const isReadableStreamSupported = isFetchSupported && isFunction(ReadableStream);
    const encodeText = isFetchSupported && (typeof TextEncoder === 'function' ? ((encoder)=>(str)=>encoder.encode(str))(new TextEncoder()) : async (str)=>new Uint8Array(await new Request(str).arrayBuffer()));
    const supportsRequestStream = isRequestSupported && isReadableStreamSupported && test(()=>{
        let duplexAccessed = false;
        const hasContentType = new Request(__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$platform$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].origin, {
            body: new ReadableStream(),
            method: 'POST',
            get duplex () {
                duplexAccessed = true;
                return 'half';
            }
        }).headers.has('Content-Type');
        return duplexAccessed && !hasContentType;
    });
    const supportsResponseStream = isResponseSupported && isReadableStreamSupported && test(()=>__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isReadableStream(new Response('').body));
    const resolvers = {
        stream: supportsResponseStream && ((res)=>res.body)
    };
    isFetchSupported && (()=>{
        [
            'text',
            'arrayBuffer',
            'blob',
            'formData',
            'stream'
        ].forEach((type)=>{
            !resolvers[type] && (resolvers[type] = (res, config)=>{
                let method = res && res[type];
                if (method) {
                    return method.call(res);
                }
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"](`Response type '${type}' is not supported`, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].ERR_NOT_SUPPORT, config);
            });
        });
    })();
    const getBodyLength = async (body)=>{
        if (body == null) {
            return 0;
        }
        if (__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isBlob(body)) {
            return body.size;
        }
        if (__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isSpecCompliantForm(body)) {
            const _request = new Request(__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$platform$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].origin, {
                method: 'POST',
                body
            });
            return (await _request.arrayBuffer()).byteLength;
        }
        if (__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isArrayBufferView(body) || __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isArrayBuffer(body)) {
            return body.byteLength;
        }
        if (__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isURLSearchParams(body)) {
            body = body + '';
        }
        if (__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isString(body)) {
            return (await encodeText(body)).byteLength;
        }
    };
    const resolveBodyLength = async (headers, body)=>{
        const length = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].toFiniteNumber(headers.getContentLength());
        return length == null ? getBodyLength(body) : length;
    };
    return async (config)=>{
        let { url, method, data, signal, cancelToken, timeout, onDownloadProgress, onUploadProgress, responseType, headers, withCredentials = 'same-origin', fetchOptions } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$resolveConfig$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(config);
        let _fetch = envFetch || fetch;
        responseType = responseType ? (responseType + '').toLowerCase() : 'text';
        let composedSignal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$composeSignals$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])([
            signal,
            cancelToken && cancelToken.toAbortSignal()
        ], timeout);
        let request = null;
        const unsubscribe = composedSignal && composedSignal.unsubscribe && (()=>{
            composedSignal.unsubscribe();
        });
        let requestContentLength;
        try {
            if (onUploadProgress && supportsRequestStream && method !== 'get' && method !== 'head' && (requestContentLength = await resolveBodyLength(headers, data)) !== 0) {
                let _request = new Request(url, {
                    method: 'POST',
                    body: data,
                    duplex: "half"
                });
                let contentTypeHeader;
                if (__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isFormData(data) && (contentTypeHeader = _request.headers.get('content-type'))) {
                    headers.setContentType(contentTypeHeader);
                }
                if (_request.body) {
                    const [onProgress, flush] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$progressEventReducer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["progressEventDecorator"])(requestContentLength, (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$progressEventReducer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["progressEventReducer"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$progressEventReducer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["asyncDecorator"])(onUploadProgress)));
                    data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$trackStream$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["trackStream"])(_request.body, DEFAULT_CHUNK_SIZE, onProgress, flush);
                }
            }
            if (!__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isString(withCredentials)) {
                withCredentials = withCredentials ? 'include' : 'omit';
            }
            // Cloudflare Workers throws when credentials are defined
            // see https://github.com/cloudflare/workerd/issues/902
            const isCredentialsSupported = isRequestSupported && "credentials" in Request.prototype;
            const resolvedOptions = {
                ...fetchOptions,
                signal: composedSignal,
                method: method.toUpperCase(),
                headers: headers.normalize().toJSON(),
                body: data,
                duplex: "half",
                credentials: isCredentialsSupported ? withCredentials : undefined
            };
            request = isRequestSupported && new Request(url, resolvedOptions);
            let response = await (isRequestSupported ? _fetch(request, fetchOptions) : _fetch(url, resolvedOptions));
            const isStreamResponse = supportsResponseStream && (responseType === 'stream' || responseType === 'response');
            if (supportsResponseStream && (onDownloadProgress || isStreamResponse && unsubscribe)) {
                const options = {};
                [
                    'status',
                    'statusText',
                    'headers'
                ].forEach((prop)=>{
                    options[prop] = response[prop];
                });
                const responseContentLength = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].toFiniteNumber(response.headers.get('content-length'));
                const [onProgress, flush] = onDownloadProgress && (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$progressEventReducer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["progressEventDecorator"])(responseContentLength, (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$progressEventReducer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["progressEventReducer"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$progressEventReducer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["asyncDecorator"])(onDownloadProgress), true)) || [];
                response = new Response((0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$trackStream$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["trackStream"])(response.body, DEFAULT_CHUNK_SIZE, onProgress, ()=>{
                    flush && flush();
                    unsubscribe && unsubscribe();
                }), options);
            }
            responseType = responseType || 'text';
            let responseData = await resolvers[__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].findKey(resolvers, responseType) || 'text'](response, config);
            !isStreamResponse && unsubscribe && unsubscribe();
            return await new Promise((resolve, reject)=>{
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$settle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(resolve, reject, {
                    data: responseData,
                    headers: __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosHeaders$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].from(response.headers),
                    status: response.status,
                    statusText: response.statusText,
                    config,
                    request
                });
            });
        } catch (err) {
            unsubscribe && unsubscribe();
            if (err && err.name === 'TypeError' && /Load failed|fetch/i.test(err.message)) {
                throw Object.assign(new __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]('Network Error', __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].ERR_NETWORK, config, request), {
                    cause: err.cause || err
                });
            }
            throw __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].from(err, err && err.code, config, request);
        }
    };
};
const seedCache = new Map();
const getFetch = (config)=>{
    let env = config && config.env || {};
    const { fetch: fetch1, Request, Response } = env;
    const seeds = [
        Request,
        Response,
        fetch1
    ];
    let len = seeds.length, i = len, seed, target, map = seedCache;
    while(i--){
        seed = seeds[i];
        target = map.get(seed);
        target === undefined && map.set(seed, target = i ? new Map() : factory(env));
        map = target;
    }
    return target;
};
const adapter = getFetch();
const __TURBOPACK__default__export__ = adapter;
}),
"[project]/dashboard/node_modules/axios/lib/adapters/adapters.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/utils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$null$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/helpers/null.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$adapters$2f$xhr$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/adapters/xhr.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$adapters$2f$fetch$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/adapters/fetch.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/core/AxiosError.js [app-client] (ecmascript)");
;
;
;
;
;
/**
 * Known adapters mapping.
 * Provides environment-specific adapters for Axios:
 * - `http` for Node.js
 * - `xhr` for browsers
 * - `fetch` for fetch API-based requests
 * 
 * @type {Object<string, Function|Object>}
 */ const knownAdapters = {
    http: __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$null$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
    xhr: __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$adapters$2f$xhr$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
    fetch: {
        get: __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$adapters$2f$fetch$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getFetch"]
    }
};
// Assign adapter names for easier debugging and identification
__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].forEach(knownAdapters, (fn, value)=>{
    if (fn) {
        try {
            Object.defineProperty(fn, 'name', {
                value
            });
        } catch (e) {
        // eslint-disable-next-line no-empty
        }
        Object.defineProperty(fn, 'adapterName', {
            value
        });
    }
});
/**
 * Render a rejection reason string for unknown or unsupported adapters
 * 
 * @param {string} reason
 * @returns {string}
 */ const renderReason = (reason)=>`- ${reason}`;
/**
 * Check if the adapter is resolved (function, null, or false)
 * 
 * @param {Function|null|false} adapter
 * @returns {boolean}
 */ const isResolvedHandle = (adapter)=>__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isFunction(adapter) || adapter === null || adapter === false;
/**
 * Get the first suitable adapter from the provided list.
 * Tries each adapter in order until a supported one is found.
 * Throws an AxiosError if no adapter is suitable.
 * 
 * @param {Array<string|Function>|string|Function} adapters - Adapter(s) by name or function.
 * @param {Object} config - Axios request configuration
 * @throws {AxiosError} If no suitable adapter is available
 * @returns {Function} The resolved adapter function
 */ function getAdapter(adapters, config) {
    adapters = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isArray(adapters) ? adapters : [
        adapters
    ];
    const { length } = adapters;
    let nameOrAdapter;
    let adapter;
    const rejectedReasons = {};
    for(let i = 0; i < length; i++){
        nameOrAdapter = adapters[i];
        let id;
        adapter = nameOrAdapter;
        if (!isResolvedHandle(nameOrAdapter)) {
            adapter = knownAdapters[(id = String(nameOrAdapter)).toLowerCase()];
            if (adapter === undefined) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"](`Unknown adapter '${id}'`);
            }
        }
        if (adapter && (__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isFunction(adapter) || (adapter = adapter.get(config)))) {
            break;
        }
        rejectedReasons[id || '#' + i] = adapter;
    }
    if (!adapter) {
        const reasons = Object.entries(rejectedReasons).map(([id, state])=>`adapter ${id} ` + (state === false ? 'is not supported by the environment' : 'is not available in the build'));
        let s = length ? reasons.length > 1 ? 'since :\n' + reasons.map(renderReason).join('\n') : ' ' + renderReason(reasons[0]) : 'as no adapter specified';
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"](`There is no suitable adapter to dispatch the request ` + s, 'ERR_NOT_SUPPORT');
    }
    return adapter;
}
const __TURBOPACK__default__export__ = {
    /**
   * Resolve an adapter from a list of adapter names or functions.
   * @type {Function}
   */ getAdapter,
    /**
   * Exposes all known adapters
   * @type {Object<string, Function|Object>}
   */ adapters: knownAdapters
};
}),
"[project]/dashboard/node_modules/axios/lib/core/dispatchRequest.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>dispatchRequest
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$transformData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/core/transformData.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$cancel$2f$isCancel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/cancel/isCancel.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$defaults$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/defaults/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$cancel$2f$CanceledError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/cancel/CanceledError.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosHeaders$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/core/AxiosHeaders.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$adapters$2f$adapters$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/adapters/adapters.js [app-client] (ecmascript)");
'use strict';
;
;
;
;
;
;
/**
 * Throws a `CanceledError` if cancellation has been requested.
 *
 * @param {Object} config The config that is to be used for the request
 *
 * @returns {void}
 */ function throwIfCancellationRequested(config) {
    if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
    }
    if (config.signal && config.signal.aborted) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$cancel$2f$CanceledError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"](null, config);
    }
}
function dispatchRequest(config) {
    throwIfCancellationRequested(config);
    config.headers = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosHeaders$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].from(config.headers);
    // Transform request data
    config.data = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$transformData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].call(config, config.transformRequest);
    if ([
        'post',
        'put',
        'patch'
    ].indexOf(config.method) !== -1) {
        config.headers.setContentType('application/x-www-form-urlencoded', false);
    }
    const adapter = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$adapters$2f$adapters$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getAdapter(config.adapter || __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$defaults$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].adapter, config);
    return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);
        // Transform response data
        response.data = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$transformData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].call(config, config.transformResponse, response);
        response.headers = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosHeaders$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].from(response.headers);
        return response;
    }, function onAdapterRejection(reason) {
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$cancel$2f$isCancel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(reason)) {
            throwIfCancellationRequested(config);
            // Transform response data
            if (reason && reason.response) {
                reason.response.data = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$transformData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].call(config, config.transformResponse, reason.response);
                reason.response.headers = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosHeaders$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].from(reason.response.headers);
            }
        }
        return Promise.reject(reason);
    });
}
}),
"[project]/dashboard/node_modules/axios/lib/env/data.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "VERSION",
    ()=>VERSION
]);
const VERSION = "1.13.2";
}),
"[project]/dashboard/node_modules/axios/lib/helpers/validator.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$env$2f$data$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/env/data.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/core/AxiosError.js [app-client] (ecmascript)");
'use strict';
;
;
const validators = {};
// eslint-disable-next-line func-names
[
    'object',
    'boolean',
    'number',
    'function',
    'string',
    'symbol'
].forEach((type, i)=>{
    validators[type] = function validator(thing) {
        return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
    };
});
const deprecatedWarnings = {};
/**
 * Transitional option validator
 *
 * @param {function|boolean?} validator - set to false if the transitional option has been removed
 * @param {string?} version - deprecated version / removed since version
 * @param {string?} message - some message with additional info
 *
 * @returns {function}
 */ validators.transitional = function transitional(validator, version, message) {
    function formatMessage(opt, desc) {
        return '[Axios v' + __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$env$2f$data$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VERSION"] + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
    }
    // eslint-disable-next-line func-names
    return (value, opt, opts)=>{
        if (validator === false) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"](formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')), __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].ERR_DEPRECATED);
        }
        if (version && !deprecatedWarnings[opt]) {
            deprecatedWarnings[opt] = true;
            // eslint-disable-next-line no-console
            console.warn(formatMessage(opt, ' has been deprecated since v' + version + ' and will be removed in the near future'));
        }
        return validator ? validator(value, opt, opts) : true;
    };
};
validators.spelling = function spelling(correctSpelling) {
    return (value, opt)=>{
        // eslint-disable-next-line no-console
        console.warn(`${opt} is likely a misspelling of ${correctSpelling}`);
        return true;
    };
};
/**
 * Assert object's properties type
 *
 * @param {object} options
 * @param {object} schema
 * @param {boolean?} allowUnknown
 *
 * @returns {object}
 */ function assertOptions(options, schema, allowUnknown) {
    if (typeof options !== 'object') {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]('options must be an object', __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].ERR_BAD_OPTION_VALUE);
    }
    const keys = Object.keys(options);
    let i = keys.length;
    while(i-- > 0){
        const opt = keys[i];
        const validator = schema[opt];
        if (validator) {
            const value = options[opt];
            const result = value === undefined || validator(value, opt, options);
            if (result !== true) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]('option ' + opt + ' must be ' + result, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].ERR_BAD_OPTION_VALUE);
            }
            continue;
        }
        if (allowUnknown !== true) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]('Unknown option ' + opt, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].ERR_BAD_OPTION);
        }
    }
}
const __TURBOPACK__default__export__ = {
    assertOptions,
    validators
};
}),
"[project]/dashboard/node_modules/axios/lib/core/Axios.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/utils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$buildURL$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/helpers/buildURL.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$InterceptorManager$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/core/InterceptorManager.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$dispatchRequest$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/core/dispatchRequest.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$mergeConfig$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/core/mergeConfig.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$buildFullPath$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/core/buildFullPath.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$validator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/helpers/validator.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosHeaders$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/core/AxiosHeaders.js [app-client] (ecmascript)");
'use strict';
;
;
;
;
;
;
;
;
const validators = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$validator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].validators;
/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 *
 * @return {Axios} A new instance of Axios
 */ class Axios {
    constructor(instanceConfig){
        this.defaults = instanceConfig || {};
        this.interceptors = {
            request: new __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$InterceptorManager$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"](),
            response: new __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$InterceptorManager$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]()
        };
    }
    /**
   * Dispatch a request
   *
   * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
   * @param {?Object} config
   *
   * @returns {Promise} The Promise to be fulfilled
   */ async request(configOrUrl, config) {
        try {
            return await this._request(configOrUrl, config);
        } catch (err) {
            if (err instanceof Error) {
                let dummy = {};
                Error.captureStackTrace ? Error.captureStackTrace(dummy) : dummy = new Error();
                // slice off the Error: ... line
                const stack = dummy.stack ? dummy.stack.replace(/^.+\n/, '') : '';
                try {
                    if (!err.stack) {
                        err.stack = stack;
                    // match without the 2 top stack lines
                    } else if (stack && !String(err.stack).endsWith(stack.replace(/^.+\n.+\n/, ''))) {
                        err.stack += '\n' + stack;
                    }
                } catch (e) {
                // ignore the case where "stack" is an un-writable property
                }
            }
            throw err;
        }
    }
    _request(configOrUrl, config) {
        /*eslint no-param-reassign:0*/ // Allow for axios('example/url'[, config]) a la fetch API
        if (typeof configOrUrl === 'string') {
            config = config || {};
            config.url = configOrUrl;
        } else {
            config = configOrUrl || {};
        }
        config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$mergeConfig$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(this.defaults, config);
        const { transitional, paramsSerializer, headers } = config;
        if (transitional !== undefined) {
            __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$validator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].assertOptions(transitional, {
                silentJSONParsing: validators.transitional(validators.boolean),
                forcedJSONParsing: validators.transitional(validators.boolean),
                clarifyTimeoutError: validators.transitional(validators.boolean)
            }, false);
        }
        if (paramsSerializer != null) {
            if (__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isFunction(paramsSerializer)) {
                config.paramsSerializer = {
                    serialize: paramsSerializer
                };
            } else {
                __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$validator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].assertOptions(paramsSerializer, {
                    encode: validators.function,
                    serialize: validators.function
                }, true);
            }
        }
        // Set config.allowAbsoluteUrls
        if (config.allowAbsoluteUrls !== undefined) {
        // do nothing
        } else if (this.defaults.allowAbsoluteUrls !== undefined) {
            config.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls;
        } else {
            config.allowAbsoluteUrls = true;
        }
        __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$validator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].assertOptions(config, {
            baseUrl: validators.spelling('baseURL'),
            withXsrfToken: validators.spelling('withXSRFToken')
        }, true);
        // Set config.method
        config.method = (config.method || this.defaults.method || 'get').toLowerCase();
        // Flatten headers
        let contextHeaders = headers && __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].merge(headers.common, headers[config.method]);
        headers && __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].forEach([
            'delete',
            'get',
            'head',
            'post',
            'put',
            'patch',
            'common'
        ], (method)=>{
            delete headers[method];
        });
        config.headers = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosHeaders$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].concat(contextHeaders, headers);
        // filter out skipped interceptors
        const requestInterceptorChain = [];
        let synchronousRequestInterceptors = true;
        this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
            if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
                return;
            }
            synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;
            requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
        });
        const responseInterceptorChain = [];
        this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
            responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
        });
        let promise;
        let i = 0;
        let len;
        if (!synchronousRequestInterceptors) {
            const chain = [
                __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$dispatchRequest$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].bind(this),
                undefined
            ];
            chain.unshift(...requestInterceptorChain);
            chain.push(...responseInterceptorChain);
            len = chain.length;
            promise = Promise.resolve(config);
            while(i < len){
                promise = promise.then(chain[i++], chain[i++]);
            }
            return promise;
        }
        len = requestInterceptorChain.length;
        let newConfig = config;
        while(i < len){
            const onFulfilled = requestInterceptorChain[i++];
            const onRejected = requestInterceptorChain[i++];
            try {
                newConfig = onFulfilled(newConfig);
            } catch (error) {
                onRejected.call(this, error);
                break;
            }
        }
        try {
            promise = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$dispatchRequest$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].call(this, newConfig);
        } catch (error) {
            return Promise.reject(error);
        }
        i = 0;
        len = responseInterceptorChain.length;
        while(i < len){
            promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
        }
        return promise;
    }
    getUri(config) {
        config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$mergeConfig$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(this.defaults, config);
        const fullPath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$buildFullPath$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(config.baseURL, config.url, config.allowAbsoluteUrls);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$buildURL$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(fullPath, config.params, config.paramsSerializer);
    }
}
// Provide aliases for supported request methods
__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].forEach([
    'delete',
    'get',
    'head',
    'options'
], function forEachMethodNoData(method) {
    /*eslint func-names:0*/ Axios.prototype[method] = function(url, config) {
        return this.request((0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$mergeConfig$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(config || {}, {
            method,
            url,
            data: (config || {}).data
        }));
    };
});
__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].forEach([
    'post',
    'put',
    'patch'
], function forEachMethodWithData(method) {
    /*eslint func-names:0*/ function generateHTTPMethod(isForm) {
        return function httpMethod(url, data, config) {
            return this.request((0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$mergeConfig$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(config || {}, {
                method,
                headers: isForm ? {
                    'Content-Type': 'multipart/form-data'
                } : {},
                url,
                data
            }));
        };
    }
    Axios.prototype[method] = generateHTTPMethod();
    Axios.prototype[method + 'Form'] = generateHTTPMethod(true);
});
const __TURBOPACK__default__export__ = Axios;
}),
"[project]/dashboard/node_modules/axios/lib/cancel/CancelToken.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$cancel$2f$CanceledError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/cancel/CanceledError.js [app-client] (ecmascript)");
'use strict';
;
/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @param {Function} executor The executor function.
 *
 * @returns {CancelToken}
 */ class CancelToken {
    constructor(executor){
        if (typeof executor !== 'function') {
            throw new TypeError('executor must be a function.');
        }
        let resolvePromise;
        this.promise = new Promise(function promiseExecutor(resolve) {
            resolvePromise = resolve;
        });
        const token = this;
        // eslint-disable-next-line func-names
        this.promise.then((cancel)=>{
            if (!token._listeners) return;
            let i = token._listeners.length;
            while(i-- > 0){
                token._listeners[i](cancel);
            }
            token._listeners = null;
        });
        // eslint-disable-next-line func-names
        this.promise.then = (onfulfilled)=>{
            let _resolve;
            // eslint-disable-next-line func-names
            const promise = new Promise((resolve)=>{
                token.subscribe(resolve);
                _resolve = resolve;
            }).then(onfulfilled);
            promise.cancel = function reject() {
                token.unsubscribe(_resolve);
            };
            return promise;
        };
        executor(function cancel(message, config, request) {
            if (token.reason) {
                // Cancellation has already been requested
                return;
            }
            token.reason = new __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$cancel$2f$CanceledError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"](message, config, request);
            resolvePromise(token.reason);
        });
    }
    /**
   * Throws a `CanceledError` if cancellation has been requested.
   */ throwIfRequested() {
        if (this.reason) {
            throw this.reason;
        }
    }
    /**
   * Subscribe to the cancel signal
   */ subscribe(listener) {
        if (this.reason) {
            listener(this.reason);
            return;
        }
        if (this._listeners) {
            this._listeners.push(listener);
        } else {
            this._listeners = [
                listener
            ];
        }
    }
    /**
   * Unsubscribe from the cancel signal
   */ unsubscribe(listener) {
        if (!this._listeners) {
            return;
        }
        const index = this._listeners.indexOf(listener);
        if (index !== -1) {
            this._listeners.splice(index, 1);
        }
    }
    toAbortSignal() {
        const controller = new AbortController();
        const abort = (err)=>{
            controller.abort(err);
        };
        this.subscribe(abort);
        controller.signal.unsubscribe = ()=>this.unsubscribe(abort);
        return controller.signal;
    }
    /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */ static source() {
        let cancel;
        const token = new CancelToken(function executor(c) {
            cancel = c;
        });
        return {
            token,
            cancel
        };
    }
}
const __TURBOPACK__default__export__ = CancelToken;
}),
"[project]/dashboard/node_modules/axios/lib/helpers/spread.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>spread
]);
'use strict';
function spread(callback) {
    return function wrap(arr) {
        return callback.apply(null, arr);
    };
}
}),
"[project]/dashboard/node_modules/axios/lib/helpers/isAxiosError.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>isAxiosError
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/utils.js [app-client] (ecmascript)");
'use strict';
;
function isAxiosError(payload) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isObject(payload) && payload.isAxiosError === true;
}
}),
"[project]/dashboard/node_modules/axios/lib/helpers/HttpStatusCode.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
const HttpStatusCode = {
    Continue: 100,
    SwitchingProtocols: 101,
    Processing: 102,
    EarlyHints: 103,
    Ok: 200,
    Created: 201,
    Accepted: 202,
    NonAuthoritativeInformation: 203,
    NoContent: 204,
    ResetContent: 205,
    PartialContent: 206,
    MultiStatus: 207,
    AlreadyReported: 208,
    ImUsed: 226,
    MultipleChoices: 300,
    MovedPermanently: 301,
    Found: 302,
    SeeOther: 303,
    NotModified: 304,
    UseProxy: 305,
    Unused: 306,
    TemporaryRedirect: 307,
    PermanentRedirect: 308,
    BadRequest: 400,
    Unauthorized: 401,
    PaymentRequired: 402,
    Forbidden: 403,
    NotFound: 404,
    MethodNotAllowed: 405,
    NotAcceptable: 406,
    ProxyAuthenticationRequired: 407,
    RequestTimeout: 408,
    Conflict: 409,
    Gone: 410,
    LengthRequired: 411,
    PreconditionFailed: 412,
    PayloadTooLarge: 413,
    UriTooLong: 414,
    UnsupportedMediaType: 415,
    RangeNotSatisfiable: 416,
    ExpectationFailed: 417,
    ImATeapot: 418,
    MisdirectedRequest: 421,
    UnprocessableEntity: 422,
    Locked: 423,
    FailedDependency: 424,
    TooEarly: 425,
    UpgradeRequired: 426,
    PreconditionRequired: 428,
    TooManyRequests: 429,
    RequestHeaderFieldsTooLarge: 431,
    UnavailableForLegalReasons: 451,
    InternalServerError: 500,
    NotImplemented: 501,
    BadGateway: 502,
    ServiceUnavailable: 503,
    GatewayTimeout: 504,
    HttpVersionNotSupported: 505,
    VariantAlsoNegotiates: 506,
    InsufficientStorage: 507,
    LoopDetected: 508,
    NotExtended: 510,
    NetworkAuthenticationRequired: 511,
    WebServerIsDown: 521,
    ConnectionTimedOut: 522,
    OriginIsUnreachable: 523,
    TimeoutOccurred: 524,
    SslHandshakeFailed: 525,
    InvalidSslCertificate: 526
};
Object.entries(HttpStatusCode).forEach(([key, value])=>{
    HttpStatusCode[value] = key;
});
const __TURBOPACK__default__export__ = HttpStatusCode;
}),
"[project]/dashboard/node_modules/axios/lib/axios.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/utils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$bind$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/helpers/bind.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$Axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/core/Axios.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$mergeConfig$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/core/mergeConfig.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$defaults$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/defaults/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$formDataToJSON$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/helpers/formDataToJSON.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$cancel$2f$CanceledError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/cancel/CanceledError.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$cancel$2f$CancelToken$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/cancel/CancelToken.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$cancel$2f$isCancel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/cancel/isCancel.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$env$2f$data$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/env/data.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$toFormData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/helpers/toFormData.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/core/AxiosError.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$spread$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/helpers/spread.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$isAxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/helpers/isAxiosError.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosHeaders$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/core/AxiosHeaders.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$adapters$2f$adapters$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/adapters/adapters.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$HttpStatusCode$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/axios/lib/helpers/HttpStatusCode.js [app-client] (ecmascript)");
'use strict';
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 *
 * @returns {Axios} A new instance of Axios
 */ function createInstance(defaultConfig) {
    const context = new __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$Axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"](defaultConfig);
    const instance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$bind$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$Axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].prototype.request, context);
    // Copy axios.prototype to instance
    __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].extend(instance, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$Axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].prototype, context, {
        allOwnKeys: true
    });
    // Copy context to instance
    __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].extend(instance, context, null, {
        allOwnKeys: true
    });
    // Factory for creating new instances
    instance.create = function create(instanceConfig) {
        return createInstance((0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$mergeConfig$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(defaultConfig, instanceConfig));
    };
    return instance;
}
// Create the default instance to be exported
const axios = createInstance(__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$defaults$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]);
// Expose Axios class to allow class inheritance
axios.Axios = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$Axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"];
// Expose Cancel & CancelToken
axios.CanceledError = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$cancel$2f$CanceledError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"];
axios.CancelToken = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$cancel$2f$CancelToken$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"];
axios.isCancel = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$cancel$2f$isCancel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"];
axios.VERSION = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$env$2f$data$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VERSION"];
axios.toFormData = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$toFormData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"];
// Expose AxiosError class
axios.AxiosError = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"];
// alias for CanceledError for backward compatibility
axios.Cancel = axios.CanceledError;
// Expose all/spread
axios.all = function all(promises) {
    return Promise.all(promises);
};
axios.spread = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$spread$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"];
// Expose isAxiosError
axios.isAxiosError = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$isAxiosError$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"];
// Expose mergeConfig
axios.mergeConfig = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$mergeConfig$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"];
axios.AxiosHeaders = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$core$2f$AxiosHeaders$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"];
axios.formToJSON = (thing)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$formDataToJSON$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isHTMLForm(thing) ? new FormData(thing) : thing);
axios.getAdapter = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$adapters$2f$adapters$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getAdapter;
axios.HttpStatusCode = __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$axios$2f$lib$2f$helpers$2f$HttpStatusCode$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"];
axios.default = axios;
const __TURBOPACK__default__export__ = axios;
}),
]);

//# sourceMappingURL=9f1d4_319b22c6._.js.map