const BASE_URL = import.meta.env.VITE_API_BASE ?? '/api';

export interface ApiError {
    code: number;
    message: string;
}

export interface ApiResult<T> {
    response: T;
    error: ApiError | null;
}

export class ApiNetworkError extends Error {
    readonly status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = 'ApiNetworkError';
        this.status = status;
    }
}

async function request<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
    try {
        const res = await fetch(`${BASE_URL}${path}`, {
            headers: { 'Content-Type': 'application/json' }, ...init,
        });

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            return {
                response: null as unknown as T,
                error: {
                    code: res.status,
                    message: body.message ?? body.error ?? res.statusText,
                } satisfies ApiError,
            };
        }

        const data: T = await res.json();
        return { response: data, error: null };
    } catch (err) {
        if (err instanceof ApiNetworkError) throw err;
        return {
            response: null as unknown as T,
            error: {
                code: 0,
                message: err instanceof Error ? err.message : 'Network error',
            } satisfies ApiError,
        };
    }
}
