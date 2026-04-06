import { NextRequest, NextResponse } from "next/server";
import path from "path";
import {
  generateAIVideoScenes,
  estimateCost,
  estimateTime,
} from "@/lib/ai-video-generator";
import { extractSceneDescriptions } from "@/lib/scene-to-prompt";

// In-memory job tracking
interface AIVideoJobState {
  id: string;
  status: "queued" | "generating" | "complete" | "error";
  progress: number;
  totalScenes: number;
  scenes: Array<{
    index: number;
    status: "pending" | "generating" | "complete" | "failed";
    prompt?: string;
  }>;
  result?: { scenePaths: string[] };
  error?: string;
  createdAt: string;
}

const aiVideoJobs = new Map<string, AIVideoJobState>();

/**
 * POST /api/ai-video — Start AI video generation job
 * Body: { script: { hook, body, duration }, brand: { name, slug, tone }, resolution? }
 */
export async function POST(req: NextRequest) {
  try {
    const { script, brand, resolution } = await req.json();

    if (!script?.body || !brand?.name) {
      return NextResponse.json(
        { error: "Missing script or brand data" },
        { status: 400 }
      );
    }

    if (!process.env.MINIMAX_API_KEY) {
      return NextResponse.json(
        { error: "MINIMAX_API_KEY not configured. Add it in Settings." },
        { status: 400 }
      );
    }

    // Extract scenes to estimate cost/time
    const scenes = extractSceneDescriptions(script.body);
    if (scenes.length === 0) {
      return NextResponse.json(
        { error: "No [CENA] markers found in script body" },
        { status: 400 }
      );
    }

    const jobId = `ai_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const outputDir = path.resolve(
      process.env.HOME || "/tmp",
      "Desktop/CLAUDE/ContentEngine/videos-ai",
      jobId
    );

    const cost = estimateCost(scenes.length, resolution ?? "1080P");
    const time = estimateTime(scenes.length);

    // Create job
    const job: AIVideoJobState = {
      id: jobId,
      status: "queued",
      progress: 0,
      totalScenes: scenes.length,
      scenes: scenes.map((s) => ({
        index: s.index,
        status: "pending" as "pending",
      })),
      createdAt: new Date().toISOString(),
    };
    aiVideoJobs.set(jobId, job);

    // Start generation in background
    (async () => {
      try {
        job.status = "generating";

        await generateAIVideoScenes({
          script,
          brand,
          outputDir,
          resolution: resolution ?? "1080P",
          sceneDuration: 6,
          useClaude: true,
          onProgress: (sceneIndex, total, status) => {
            const sceneEntry = job.scenes.find((s) => s.index === sceneIndex);
            if (sceneEntry) {
              sceneEntry.status =
                status === "generating"
                  ? "generating"
                  : status === "complete"
                    ? "complete"
                    : "failed";
            }
            const completedCount = job.scenes.filter(
              (s) => s.status === "complete" || s.status === "failed"
            ).length;
            job.progress = Math.round((completedCount / total) * 100);
          },
        });

        job.status = "complete";
        job.progress = 100;
      } catch (err) {
        job.status = "error";
        job.error = err instanceof Error ? err.message : String(err);
      }
    })();

    return NextResponse.json({
      jobId,
      sceneCount: scenes.length,
      estimatedCost: cost,
      estimatedTime: time,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai-video?jobId=xxx — Check AI video generation status
 */
export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get("jobId");

  if (!jobId) {
    // Return all recent jobs
    const jobs = Array.from(aiVideoJobs.values())
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 10);
    return NextResponse.json({ jobs });
  }

  const job = aiVideoJobs.get(jobId);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json(job);
}
