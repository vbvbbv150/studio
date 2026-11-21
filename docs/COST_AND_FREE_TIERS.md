# Cost and free-tier policy
- No mandatory paid subscription/API/hosting/preview service.
- No automatic paid fallback, upgrade, or overage.
- Pause a feature or offer a verified free alternative when quota is exhausted.
- Never claim free tiers are unlimited or permanent.
- Unknown quota means unavailable until verified.
- Consumer chat access does not imply free API access.
- Never store tokens in client-side source or request secrets in chat.

Runtime candidates:
- StackBlitz WebContainers: Android smoke test succeeded for a small Vite project. Embedded API terms, cross-origin isolation, mobile memory, and project-size limits remain unverified.
- GitHub Codespaces: metered monthly compute/storage; verify current quota and budget before use.
- Vercel Sandbox: secondary candidate after account authorization and current quota verification.
- Static hosting is not a persistent dev-server runtime.

Unlimited always-on cloud development and unlimited AI inference cannot be promised at zero cost. Design around quotas, sleeping workspaces, hard limits, and graceful pauses.
