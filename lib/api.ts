const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async get<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => null)) as ErrorResponse | null;
      throw new ApiError(
        response.status,
        errorBody?.error?.code || 'UNKNOWN_ERROR',
        errorBody?.error?.message || `API error: ${response.status}`
      );
    }

    return response.json();
  }

  async post<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    // Extract only what we need from options - explicitly exclude 'body' and 'method'
    const { headers: optionHeaders, signal } = options || {};

    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(optionHeaders as Record<string, string>),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => null)) as ErrorResponse | null;
      throw new ApiError(
        response.status,
        errorBody?.error?.code || 'UNKNOWN_ERROR',
        errorBody?.error?.message || `API error: ${response.status}`
      );
    }

    return response.json();
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

class AuthenticatedApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async fetchWithAuth<T>(
    path: string,
    options: RequestInit & { token: string }
  ): Promise<T> {
    const { token, ...fetchOptions } = options;

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...fetchOptions.headers,
      },
    });

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => null)) as ErrorResponse | null;
      throw new ApiError(
        response.status,
        errorBody?.error?.code || 'UNKNOWN_ERROR',
        errorBody?.error?.message || `API error: ${response.status}`
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  async getContentItems(token: string): Promise<{ items: Record<string, unknown>[] }> {
    return this.fetchWithAuth('/content-items', {
      method: 'GET',
      token,
    });
  }

  async getContentItem(id: string, token: string): Promise<Record<string, unknown>> {
    return this.fetchWithAuth(`/content-items/${id}`, {
      method: 'GET',
      token,
    });
  }

  async deleteContentItem(id: string, token: string): Promise<void> {
    return this.fetchWithAuth(`/content-items/${id}`, {
      method: 'DELETE',
      token,
    });
  }

  async retryProcessing(id: string, token: string): Promise<Record<string, unknown>> {
    return this.fetchWithAuth(`/content-items/${id}/process`, {
      method: 'POST',
      token,
    });
  }
}

export const contentApi = new AuthenticatedApiClient(API_BASE_URL);
