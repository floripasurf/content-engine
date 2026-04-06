import fs from "fs";

const API_BASE = "https://api.minimax.io/v1";

interface MinimaxConfig {
  apiKey: string;
}

interface VideoTask {
  taskId: string;
  status: "Processing" | "Success" | "Fail";
  fileId?: string;
  failReason?: string;
}

class MinimaxClient {
  private apiKey: string;

  constructor(config: MinimaxConfig) {
    this.apiKey = config.apiKey;
  }

  private async request(method: string, path: string, body?: object) {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (data.base_resp?.status_code !== 0) {
      throw new Error(
        `Minimax API error: ${data.base_resp?.status_msg || "unknown"}`
      );
    }
    return data;
  }

  /** Create a text-to-video generation task */
  async createVideoTask(
    prompt: string,
    options?: {
      duration?: 6 | 10;
      resolution?: "720P" | "1080P";
    }
  ): Promise<string> {
    const data = await this.request("POST", "/video_generation", {
      model: "MiniMax-Hailuo-2.3",
      prompt,
      duration: options?.duration ?? 6,
      resolution: options?.resolution ?? "1080P",
      prompt_optimizer: true,
    });
    return data.task_id;
  }

  /** Poll task status until complete */
  async waitForTask(
    taskId: string,
    maxWaitMs: number = 600000
  ): Promise<VideoTask> {
    const startTime = Date.now();
    while (Date.now() - startTime < maxWaitMs) {
      const data = await this.request("POST", "/query/video_generation", {
        task_id: taskId,
      });

      if (data.status === "Success") {
        return { taskId, status: "Success", fileId: data.file_id };
      }
      if (data.status === "Fail") {
        return { taskId, status: "Fail", failReason: data.fail_reason };
      }

      console.log(
        `  [minimax] Task ${taskId}: ${data.status}... (${Math.round((Date.now() - startTime) / 1000)}s)`
      );
      await new Promise((r) => setTimeout(r, 10000));
    }
    throw new Error(
      `Minimax task ${taskId} timed out after ${maxWaitMs / 1000}s`
    );
  }

  /** Get download URL for completed video */
  async getVideoUrl(fileId: string): Promise<string> {
    const data = await this.request("POST", "/files/retrieve", {
      file_id: fileId,
    });
    return data.file_url;
  }

  /** Full pipeline: prompt -> video file on disk */
  async generateVideo(
    prompt: string,
    outputPath: string,
    options?: {
      duration?: 6 | 10;
      resolution?: "720P" | "1080P";
    }
  ): Promise<string> {
    console.log(
      `  [minimax] Generating: "${prompt.slice(0, 80)}..."`
    );

    const taskId = await this.createVideoTask(prompt, options);
    const result = await this.waitForTask(taskId);

    if (result.status !== "Success" || !result.fileId) {
      throw new Error(`Video generation failed: ${result.failReason}`);
    }

    const url = await this.getVideoUrl(result.fileId);

    // Download video
    const response = await fetch(url);
    const buffer = Buffer.from(await response.arrayBuffer());

    fs.writeFileSync(outputPath, buffer);
    console.log(
      `  [minimax] Downloaded: ${outputPath} (${(buffer.length / 1024 / 1024).toFixed(1)}MB)`
    );

    return outputPath;
  }
}

export { MinimaxClient, type MinimaxConfig, type VideoTask };
