import { getJob, getAllJobs } from "@/lib/render-jobs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");

  if (jobId) {
    const job = getJob(jobId);
    if (!job) {
      return Response.json({ error: "Job not found" }, { status: 404 });
    }
    return Response.json(job);
  }

  // Return all jobs if no specific ID
  const jobs = getAllJobs();
  return Response.json({ jobs });
}
