// In-memory job tracker — separate from renderer to avoid importing heavy deps

export interface RenderJob {
  id: string;
  status: "queued" | "rendering" | "complete" | "error";
  progress: number;
  result?: {
    videoPath: string;
    audioPath: string | null;
    durationSeconds: number;
  };
  error?: string;
  createdAt: string;
}

const jobs = new Map<string, RenderJob>();

export function getJob(id: string): RenderJob | undefined {
  return jobs.get(id);
}

export function setJob(id: string, job: RenderJob): void {
  jobs.set(id, job);
}

export function getAllJobs(): RenderJob[] {
  return Array.from(jobs.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
