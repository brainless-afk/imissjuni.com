export async function fetchWithTimeout(
  url: string | URL | Request,
  options: RequestInit | undefined,
  tag: string,
  timeout = 5000
): Promise<Response> {
  const abortController = new AbortController();
  const signal = abortController.signal;
  setTimeout(() => abortController.abort(), timeout);

  try {
    console.debug("[fetchWithTimeout]", tag || "", "enter");
    const res = await fetch(url, {
      ...options,
      signal: signal,
    });
    return res;
  } catch (e) {
    throw e;
  } finally {
    console.debug("[fetchWithTimeout]", tag || "", "exit");
  }
}
