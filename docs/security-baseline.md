# SessionFocus Security Baseline

This baseline follows the NIST Cybersecurity Framework 2.0 functions: Govern, Identify, Protect, Detect, Respond, and Recover.

## Compliance Status

SessionFocus is not certified as FCC, HIPAA, SOC 2, FedRAMP, or legal-recording compliant. The FCC says it has no rules for individuals recording telephone conversations, but state laws may restrict recording. Confirm consent, privacy, retention, and professional requirements before using the app with real clients.

## Govern

- Assign an owner for Cloudflare, GitHub, billing, and incident response.
- Document whether the app is for demo data, internal testing, or real client use.
- Require explicit practitioner confirmation that recording and AI-assisted documentation are permitted.
- Do not enable paid storage or AI services until data handling, retention, and access controls are approved.

## Identify

- Current data locations: browser localStorage and IndexedDB on the user's device.
- Current Cloudflare role: hosts the web app only.
- Current GitHub role: public source code repository.
- Sensitive data to avoid: legal names, diagnoses, protected health information, payment data, credentials, secrets, and unredacted transcripts in issues or logs.

## Protect

- Security headers are configured in `apps/web/next.config.mjs` and `apps/web/public/_headers`.
- Search indexing is blocked with `robots.txt` and `noindex` metadata.
- GitHub branch protection should require pull requests, passing CI, CodeQL, and no force pushes to `main`.
- Cloudflare should use WAF custom rules, bot protection, and rate limiting where available.
- Cloudflare custom domains should use HTTPS only.

## Detect

- GitHub Actions runs typecheck, build, dependency audit, and CodeQL.
- Dependabot is configured for npm and GitHub Actions updates.
- Cloudflare usage and error monitoring should be reviewed after every deploy.
- Enable Cloudflare notification alerts for traffic spikes, Worker errors, and billing changes where available.

## Respond

- If abuse or cost spikes occur, disable the Worker route or pause the Worker deployment.
- Rotate any leaked tokens immediately.
- Remove sensitive public GitHub content and follow up with GitHub secret scanning/revocation.
- Preserve audit notes: time detected, affected service, action taken, and current status.

## Recover

- Redeploy the last known good GitHub commit from Cloudflare.
- Keep `main` protected so emergency rollback commits are reviewable.
- Re-enable custom domains only after abuse controls are confirmed.

## Cloudflare Free-Plan Cost Guardrails

- Keep the deployment on Workers Free while testing.
- Do not add R2, D1, Workers AI, Durable Objects, queues, or paid Workers unless intentionally approved.
- Use the default `workers.dev` URL first, then add a narrow custom domain such as `app.example.com`.
- Avoid wildcard Worker routes.
- Add WAF/rate limiting rules in the dashboard before publicly sharing the URL.
