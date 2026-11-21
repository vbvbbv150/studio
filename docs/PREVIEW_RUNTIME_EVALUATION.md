# Preview Runtime Evaluation

## Current implementation
The current runtime supports static-source web projects consisting of `index.html`, `style.css`, and `app.js`. Studio composes these source files into a sandboxed iframe `srcdoc`. This is a real browser-rendered preview of the current project source, but it is not a Node.js development environment.

## Not yet evaluated as production runtime
- StackBlitz WebContainers: requires a separate integration spike, cross-origin isolation review, device testing, and quota/licensing validation.
- Remote development workspace: requires a secure workspace service, lifecycle management, resource limits, and cost review.
- GitHub Codespaces: not assumed available; prior notes report exhausted monthly quota on a previous account. Do not bypass quotas by creating extra accounts.
- Vercel Sandbox: not assumed available or free; verify current product terms and account eligibility before integration.

## Required acceptance tests for a future runtime
1. Start a real development server from project source.
2. Edit a source file and observe hot reload in the preview.
3. Confirm logs and runtime errors are surfaced.
4. Confirm process stop/restart and cleanup.
5. Test on the target Android tablet browser under realistic memory pressure.
6. Verify isolation between untrusted project code and Studio credentials/storage.
7. Document provider quotas, pricing, and sleep/persistence behavior.
