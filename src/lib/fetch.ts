// ponytail: use tauri native fetch when running inside Tauri webview, otherwise browser fetch (dev)
function isTauri(): boolean {
    return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export async function appFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    if (isTauri()) {
        const { fetch: tauriFetch } = await import('@tauri-apps/plugin-http');
        return tauriFetch(input as string, init);
    }
    return fetch(input, init);
}