Development notes — Alex AI Universal (VSCode extension)

Quick dev loop

- Install dependencies for the extension:

  ```bash
  cd /path/to/packages/vscode-extension
  npm install
  ```

- Launch Extension Development Host in VS Code:

  ```bash
  npm run dev
  ```

- Run the smoke test (node-only check that the runtime entry loads):

  ```bash
  npm test
  ```

Local linking (when developing the core `@alex-ai/universal-extension`)

If you're developing the core package locally (recommended for fast iteration), you have two good options:

- npm link (simple, built-in):

  1. In the core package folder: `npm link`
  2. In this extension folder: `npm link @alex-ai/universal-extension`

  Notes: This creates a global symlink. Works but can be brittle across Node versions.

- yalc (safer for package development):

  1. Install yalc globally: `npm i -g yalc`
  2. In the core package folder: `yalc publish`
  3. In this extension folder: `yalc add @alex-ai/universal-extension`
  4. Reinstall: `npm install`

  Notes: yalc copies packages into a local store and is less brittle than npm link.

Smoke test purpose

- The `test/smoke.js` script only ensures that the compiled entrypoint (`./dist/extension.js`) can be required and that `activate`/`deactivate` exist and can be invoked with a minimal mock context. It does not emulate VS Code APIs or open a UI.

Next steps you might want

- Add a lightweight integration harness that mocks the `vscode` API surface used by the extension to assert that commands register and status bar item creation occurs.
- Add a CI job that runs `npm test` and optionally runs ESLint/type checks.

Local core package in this repo

This repository includes a minimal local stub at `packages/universal-core` which exports `createVSCodeExtension`. For local development you can:

1. From the repo root, install deps in the core and extension folders:

   ```bash
   cd packages/universal-core && npm install
   cd ../vscode-extension && npm install
   ```

2. Use `npm link` or `yalc` to link the local core into the extension:

   - npm link (quick):

     ```bash
     # in packages/universal-core
     npm link

     # in packages/vscode-extension
     npm link @alex-ai/universal-extension
     ```

   - yalc (recommended for stability):

     ```bash
     # in packages/universal-core
     yalc publish

     # in packages/vscode-extension
     yalc add @alex-ai/universal-extension
     npm install
     ```

The local core is intentionally minimal — replace with the real implementation as you develop.

Integration tests and CI

- Run integration tests locally (these will launch a test instance of VS Code):

  ```bash
  cd packages/vscode-extension
  npm install
  npm run test:integration
  ```

- CI: there's a package-level workflow at `packages/vscode-extension/.github/workflows/ci.yml` that runs lint, the smoke test, and (optionally) integration tests. If you prefer a monorepo-level workflow, we can move it to `.github/workflows/ci.yml` at the repo root.

Troubleshooting

- If integration tests fail due to extension ID mismatch, ensure `package.json` `publisher` and `name` fields match the extension ID used in the tests (format: `publisher.name`).
- If running integration tests on CI, increase test timeouts or use `--version` to pin a VS Code version supported by @vscode/test-electron.
