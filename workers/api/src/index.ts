import { handleSessions } from "./routes/sessions";
import { LiveSessionObject } from "./durable-objects/LiveSessionObject";

export { LiveSessionObject };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/sessions")) {
      return handleSessions(request, env);
    }
    return Response.json({ ok: true, name: "SessionFocus API" });
  }
};

export type Env = {
  DB: D1Database;
  AUDIO_BUCKET: R2Bucket;
  LIVE_SESSION_OBJECT: DurableObjectNamespace<LiveSessionObject>;
};
