export async function handleNotes(): Promise<Response> {
  return Response.json({ generated_notes: [] });
}
