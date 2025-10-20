## Next.js 16 Upgrade Checklist

- Confirm Node version per Next 16 requirements
- Upgrade dependencies: next, react, react-dom, eslint-config-next, types
- Validate app router APIs: route handlers, dynamic segments, headers/cookies
- Verify middleware and edge config compatibility
- Review `next.config.js` options changes; keep `experimental.externalDir`
- Re-enable lint in CI once plugins are aligned; fix any new rules
- Test build with Turbopack dev and standard prod build
- Full route smoke test (pages and APIs) and measure for timeouts
- Audit static export assumptions; remove legacy export paths reliance
- Update CI/CD workflows and cache keys
- Record breaking changes encountered and mitigations

