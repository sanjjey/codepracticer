export async function apiFetch(url: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  
  // Add user API keys if they exist in local storage
  if (typeof window !== "undefined") {
    const groqKey = localStorage.getItem("USER_GROQ_API_KEY");
    const judge0Key = localStorage.getItem("USER_JUDGE0_API_KEY");
    
    if (groqKey) headers.set("x-user-groq-key", groqKey);
    if (judge0Key) headers.set("x-user-judge0-key", judge0Key);
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
