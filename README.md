# SessionFocus MVP

SessionFocus is an AI-assisted psychological support and social work documentation tool. It helps practitioners capture live conversations, identify client needs, highlight areas of distress or barriers, and draft human-reviewed notes, support plans, and follow-up actions.

This MVP uses real microphone capture for live sessions. It does not diagnose, assess risk level, make mandated-reporting decisions, or replace practitioner judgment.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000/dashboard`.

## Current MVP Behavior

- Create sessions with consent confirmation.
- Record microphone audio and store real browser audio chunks.
- Create live transcript segments from browser speech recognition when the browser exposes that capability.
- Display live transcript, speaker role confirmation, highlights, and topic sentiment from captured transcript text.
- Confirm, swap, or manually edit Client / Practitioner speaker roles.
- End a session and review generated editable documentation.
- Export notes to clipboard, JSON, or a printable PDF view.

## Architecture Notes

The web app uses browser local storage for MVP persistence. The live workflow does not fake conversations: if browser speech recognition is unavailable, audio can still record, but transcript generation requires wiring a real cloud or local speech-to-text provider. The worker, provider, schema, and future Python AI folders are present so real Cloudflare, WhisperLive, WhisperX, pyannote.audio, faster-whisper, and local desktop paths can be wired in without reshaping the product surface.
