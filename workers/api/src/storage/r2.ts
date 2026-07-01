export function audioChunkKey(sessionId: string, chunkIndex: number): string {
  return `sessions/${sessionId}/chunks/${String(chunkIndex).padStart(6, "0")}.webm`;
}
