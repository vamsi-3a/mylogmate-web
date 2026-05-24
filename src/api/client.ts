import axios, { type AxiosRequestConfig } from 'axios';

// Import via dynamic reference to avoid circular dep issue at init time
// authStore is a singleton — getState() is safe to call in interceptors
let _getAccessToken: (() => string | null) | null = null;
let _setAccessToken: ((token: string) => void) | null = null;
let _logout: (() => void) | null = null;

/** Called once from authStore after it initializes */
export function configureApiClient(config: {
  getAccessToken: () => string | null;
  setAccessToken: (token: string) => void;
  logout: () => void;
}): void {
  _getAccessToken = config.getAccessToken;
  _setAccessToken = config.setAccessToken;
  _logout = config.logout;
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // send refresh-token httpOnly cookie
});

// ── Request: attach access token ─────────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = _getAccessToken?.();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Endpoints that must NEVER trigger the silent-refresh interceptor.
// Refresh itself failing means there's no session — don't recurse.
// Login/signup/google failing with 401 means bad credentials — don't recurse.
function isAuthBootstrapPath(url: string | undefined): boolean {
  if (!url) return false;
  return (
    url.includes('/auth/refresh') ||
    url.includes('/auth/login') ||
    url.includes('/auth/signup') ||
    url.includes('/auth/google')
  );
}

// ── Response: auto-refresh on 401 ────────────────────────────────────────
apiClient.interceptors.response.use(
  (res) => res,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const originalRequest = error.config as
      | (AxiosRequestConfig & { _retry?: boolean })
      | undefined;

    // Only attempt silent refresh on a 401 for non-auth endpoints, and only once.
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthBootstrapPath(originalRequest.url)
    ) {
      originalRequest._retry = true;
      try {
        const { data } = await apiClient.post<{ data: { access_token: string } }>(
          '/api/v1/auth/refresh',
        );
        const newToken = data.data.access_token;
        _setAccessToken?.(newToken);
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch {
        // Refresh failed — session is gone. Clear local state and let the
        // calling code (AuthGuard / page logic) decide what to render.
        // No window.location reload — that would yank the user out of any
        // page they're on, including /login itself.
        _logout?.();
      }
    }
    return Promise.reject(error);
  },
);
