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
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
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
}

export const apiClient = new ApiClient(API_BASE_URL);
