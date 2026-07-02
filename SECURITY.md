# Security Policy

## Current MVP Security Posture

SessionFocus is an MVP documentation assistant. It is not certified as HIPAA, SOC 2, FedRAMP, FCC, or legal-recording compliant.

The current web app stores session records, transcripts, and audio chunks in the user's browser storage. Do not submit protected health information, legal names, payment data, credentials, or secrets into GitHub issues, pull requests, logs, or public support channels.

## Supported Version

Only the `main` branch is currently supported.

## Reporting a Vulnerability

Report vulnerabilities privately through GitHub private vulnerability reporting or a private security advisory for this repository. Do not open public issues containing sensitive details, exploit steps, client data, audio, transcripts, or credentials.

## Operational Requirements Before Real Use

- Confirm recording consent requirements for every jurisdiction and practice setting.
- Enable GitHub branch protection, secret scanning, Dependabot alerts, and CodeQL.
- Enable Cloudflare WAF, bot protection, usage notifications, and rate limiting where available.
- Keep Cloudflare R2, D1, Workers AI, queues, and Durable Objects disabled until a reviewed data-protection design is in place.
- Use client aliases or test data unless a qualified compliance review approves storing regulated data.
