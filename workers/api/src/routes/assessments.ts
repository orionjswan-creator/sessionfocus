export async function handleAssessments(): Promise<Response> {
  return Response.json({ psychological: {}, social_work: {} });
}
