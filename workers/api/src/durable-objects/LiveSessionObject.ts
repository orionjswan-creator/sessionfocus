import { MockLiveTranscriptionProvider } from "../services/transcription/MockTranscriptionProvider";

export class LiveSessionObject {
  private provider = new MockLiveTranscriptionProvider();

  constructor(private readonly state: DurableObjectState, private readonly env: unknown) {
    void this.state;
    void this.env;
  }

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get("upgrade") !== "websocket") {
      return Response.json({ error: "Expected websocket" }, { status: 426 });
    }
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    server.accept();
    server.addEventListener("message", async (event) => {
      const segments = await this.provider.transcribeChunk({
        sessionId: "durable-session",
        chunkIndex: Date.now(),
        audio: new ArrayBuffer(0)
      });
      server.send(JSON.stringify({ type: "transcript_partial", segments, receivedBytes: String(event.data).length }));
    });
    return new Response(null, { status: 101, webSocket: client });
  }
}
