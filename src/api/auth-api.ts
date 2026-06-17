export async function auth(token: string): Promise<URL> {
    const res = await fetch(`/auth/callback?token=${encodeURIComponent(token)}`, {
        method: 'GET',
        redirect: 'manual',
    });

    // 302 - cookie was set
    if (res.type === 'opaqueredirect' || res.status === 302 || res.status === 301) {
        const location = res.headers.get('Location') ?? '/';
        return new URL(location, window.location.origin);
    }

    const text = await res.text();
    throw new Error(text || `auth failed (HTTP ${res.status})`);
}

