export function resolveApiBaseUrl(): string {
  const raw = (
    import.meta.env.VITE_API_URL || 'https://justimobileapi.onrender.com/api/v1'
  )
    .trim()
    .replace(/\/+$/, '');
  return raw.endsWith('/api/v1') ? raw : `${raw}/api/v1`;
}

export const API_BASE_URL = resolveApiBaseUrl();

export async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const errMessage =
      data?.error?.message ||
      data?.message ||
      `Error HTTP ${res.status} al comunicarse con el servidor`;
    const error = new Error(errMessage) as Error & {
      status?: number;
      code?: string;
      details?: Record<string, any>;
    };
    error.status = res.status;
    error.code = data?.error?.code || data?.code;
    error.details = data?.error?.details || data?.details;
    throw error;
  }

  return data as T;
}
