// Canva Connect API client
// Docs: https://www.canva.dev/docs/connect/

export interface CanvaConfig {
  accessToken: string;
}

export interface CanvaDesign {
  id: string;
  title: string;
  urls: { edit_url: string; view_url: string };
  thumbnail?: { url: string };
}

export interface CanvaBrandTemplate {
  id: string;
  name: string;
  thumbnail_url: string;
}

export interface CanvaExportResult {
  id: string;
  status: "in_progress" | "completed" | "failed";
  urls?: Array<{ url: string; page: number }>;
  error?: string;
}

class CanvaApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(`Canva API ${statusCode}: ${message}`);
    this.name = "CanvaApiError";
  }
}

export class CanvaClient {
  private baseUrl = "https://api.canva.com/rest/v1";
  private token: string;

  constructor(config: CanvaConfig) {
    this.token = config.accessToken;
  }

  private async request<T = unknown>(
    method: string,
    path: string,
    body?: object,
  ): Promise<T> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.token}`,
    };
    if (body) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "unknown error");
      throw new CanvaApiError(res.status, errText);
    }

    // Some endpoints return 204 No Content
    if (res.status === 204) return undefined as T;

    return res.json() as Promise<T>;
  }

  /**
   * Create a design cloned from a brand template.
   * Uses Canva's "create design from brand template" endpoint.
   */
  async createDesignFromTemplate(
    templateId: string,
    title: string,
  ): Promise<CanvaDesign> {
    const result = await this.request<{ design: CanvaDesign }>(
      "POST",
      "/designs",
      {
        design_type: { type: "preset", name: "instagram_post" },
        title,
        asset_id: templateId,
      },
    );
    return result.design;
  }

  /**
   * Autofill a design with data using Canva's autofill API.
   * Template placeholders (e.g. {{title}}) are filled with the provided data.
   */
  async autofillDesign(
    designId: string,
    data: Record<string, string>,
  ): Promise<CanvaDesign> {
    const result = await this.request<{ design: CanvaDesign }>(
      "POST",
      `/designs/${designId}/autofill`,
      {
        data: Object.entries(data).map(([key, value]) => ({
          name: key,
          type: "text",
          text: value,
        })),
      },
    );
    return result.design;
  }

  /**
   * Export a design as PNG (high quality).
   * Polls until export is complete or fails.
   */
  async exportDesign(
    designId: string,
    maxAttempts = 30,
  ): Promise<CanvaExportResult> {
    const job = await this.request<{ job: CanvaExportResult }>(
      "POST",
      `/designs/${designId}/exports`,
      {
        format: { type: "png" },
        quality: "high",
      },
    );

    let result = job.job;
    let attempts = 0;

    while (result.status === "in_progress" && attempts < maxAttempts) {
      await new Promise((r) => setTimeout(r, 2000));
      const poll = await this.request<{ job: CanvaExportResult }>(
        "GET",
        `/designs/${designId}/exports/${result.id}`,
      );
      result = poll.job;
      attempts++;
    }

    if (result.status === "in_progress") {
      throw new Error(
        `Canva export timed out after ${maxAttempts * 2}s for design ${designId}`,
      );
    }

    return result;
  }

  /**
   * List available brand templates from the connected Canva account.
   */
  async listBrandTemplates(
    limit = 50,
  ): Promise<CanvaBrandTemplate[]> {
    const result = await this.request<{
      items: Array<{
        id: string;
        title: string;
        thumbnail: { url: string } | null;
      }>;
    }>("GET", `/brand-templates?limit=${limit}`);

    return (result.items || []).map((item) => ({
      id: item.id,
      name: item.title,
      thumbnail_url: item.thumbnail?.url || "",
    }));
  }

  /**
   * Get details of a specific design.
   */
  async getDesign(designId: string): Promise<CanvaDesign> {
    const result = await this.request<{ design: CanvaDesign }>(
      "GET",
      `/designs/${designId}`,
    );
    return result.design;
  }

  /**
   * Quick connectivity check — lists brand templates with limit=1.
   * Returns true if the token is valid.
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.request("GET", "/brand-templates?limit=1");
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Create a CanvaClient from env or provided token.
 * Throws descriptive error if no token is available.
 */
export function createCanvaClient(token?: string): CanvaClient {
  const accessToken = token || process.env.CANVA_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error(
      "Canva Access Token nao configurado. " +
        "Adicione CANVA_ACCESS_TOKEN nas variaveis de ambiente ou configure nas Configuracoes > Canva.",
    );
  }
  return new CanvaClient({ accessToken });
}
