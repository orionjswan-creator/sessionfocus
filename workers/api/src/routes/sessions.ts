import { Env } from "../index";

export async function handleSessions(request: Request, env: Env): Promise<Response> {
  void env;
  const url = new URL(request.url);
  if (request.method === "GET" && url.pathname === "/api/sessions") {
    return Response.json({ sessions: [] });
  }
  if (request.method === "POST" && url.pathname === "/api/sessions") {
    const body = await request.json();
    return Response.json({ session: body }, { status: 201 });
  }
  return Response.json({ error: "Not implemented in mock worker skeleton" }, { status: 501 });
}
