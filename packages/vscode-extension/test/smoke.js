// Smoke test that runs in plain Node by mocking 'vscode' and
// '@alex-ai/universal-extension' at require-time.

const path = require('path');
// Module not needed when using wrapped execution

// Minimal mock of the VS Code API surface used by the extension
const mockVscode = {
  commands: {
    registerCommand: (_id, _fn) => ({ dispose: () => { /* noop */ } }),
  },
  window: {
    showInputBox: async () => null,
    showInformationMessage: (_msg) => { /* noop */ },
    showErrorMessage: (_msg) => { /* noop */ },
    showTextDocument: async () => ({ /* mock editor */ }),
    createStatusBarItem: (_alignment, _priority) => ({
      text: '',
      tooltip: '',
      command: '',
      show: () => {},
      dispose: () => {}
    }),
  },
  workspace: {
    openTextDocument: async () => ({ /* mock doc */ }),
  },
  StatusBarAlignment: { Left: 0 },
  StatusBarItem: function () { return { show: () => { }, dispose: () => { } }; },
};

// Minimal mock of the core package used by the extension
const mockCorePackage = {
  createVSCodeExtension: (_vscode) => {
    return {
      core: {
        initialize: async () => Promise.resolve(),
        processMessage: async (msg) => ({ success: true, coordinatedResponse: `mock response for: ${msg}` }),
      },
      commands: {}
    };
  }
};

// No global Module._load overrides — we'll execute the extension in a wrapper
// and provide a custom `require` that returns our mocks for specific module names.

function createMockContext() {
  return { subscriptions: [] };
}

(async function run() {
  const extPath = path.resolve(__dirname, '../dist/extension.js');
  console.log('Loading extension from', extPath);

  let mod;
  try {
    // Read the extension source and execute it in a wrapper so we can provide a custom require
    const fs = require('fs');
    const path = require('path');
    const code = fs.readFileSync(extPath, 'utf8');

    const moduleWrapper = `(function(require,module,exports,__filename,__dirname){\n${code}\n})`;
    const wrapperFn = eval(moduleWrapper); // eslint-disable-line no-eval

    const localModule = { exports: {} };

    const originalRequire = require;
    // hoist localRequire to avoid function-in-block in strict mode
    const localRequire = function (name) {
      if (name === 'vscode') return mockVscode;
      if (name === '@alex-ai/universal-extension') return mockCorePackage;
      return originalRequire(name);
    };

    // Execute the wrapped module
    wrapperFn(localRequire, localModule, localModule.exports, extPath, path.dirname(extPath));
    console.log('wrapper executed, exports keys:', Object.keys(localModule.exports || {}));
    mod = localModule.exports;
  } catch (err) {
    console.error('FAILED to require extension:', err && err.message ? err.message : err);
    process.exitCode = 2;
    return;
  }

  if (typeof mod.activate !== 'function') {
    console.error('Extension export missing activate()');
    process.exitCode = 3;
    return;
  }

  if (typeof mod.deactivate !== 'function') {
    console.error('Extension export missing deactivate()');
    process.exitCode = 4;
    return;
  }

  try {
    const ctx = createMockContext();
    const maybePromise = mod.activate(ctx);
    if (maybePromise && typeof maybePromise.then === 'function') {
      await maybePromise;
    }
    console.log('activate() completed');
  } catch (err) {
    console.error('activate() threw:', err && err.message ? err.message : err);
    process.exitCode = 5;
    return;
  }

  try {
    mod.deactivate();
    console.log('deactivate() completed');
  } catch (err) {
    console.error('deactivate() threw:', err && err.message ? err.message : err);
    process.exitCode = 6;
    return;
  }

  console.log('SMOKE TEST PASSED');
})();

