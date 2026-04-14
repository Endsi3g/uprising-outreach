/**
 * Typed API client — thin wrapper around fetch.
 * All requests go through /api/v1 (proxied by Next.js to the backend).
 */

const BASE_URL = "/api/v1";

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

class ApiClient {
  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const token = getAccessToken();
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      const message = error?.error?.message ?? `HTTP ${res.status}`;
      throw new ApiError(res.status, error?.error?.code ?? "UNKNOWN", message);
    }

    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>("GET", path);
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("POST", path, body);
  }

  async postMultipart<T>(path: string, formData: FormData): Promise<T> {
    const token = getAccessToken();
    const headers: HeadersInit = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      const message = error?.error?.message ?? `HTTP ${res.status}`;
      throw new ApiError(res.status, error?.error?.code ?? "UNKNOWN", message);
    }

    return res.json() as Promise<T>;
  }

  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("PATCH", path, body);
  }

  delete(path: string): Promise<void> {
    return this.request<void>("DELETE", path);
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const apiClient = new ApiClient();
