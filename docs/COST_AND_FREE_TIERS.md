# Cost and Free-Tier Policy

Studio does not bundle paid AI credits or start paid infrastructure. The local workspace, project editing, preview, and JSON backup do not require an AI subscription.

Optional AI requests use a provider and model selected by the user. Provider charges, rate limits, availability, and free quotas are controlled by that provider and may change. Studio must not silently switch providers or trigger paid fallback. When a quota is exhausted or a provider rejects a request, stop and explain the failure.

The browser-side provider adapter in this MVP is experimental. It is not a secure production secrets-management solution. A hosted Studio must proxy provider requests through an authenticated backend, enforce user-configured budgets, and keep provider keys server-side.

Runtime costs are not applicable to the current local HTML/CSS/JS preview. A future Node-based or remote runtime must be selected only after documenting pricing, free-tier limits, sleep behavior, storage limits, and Android compatibility. No unlimited-free runtime is promised.
