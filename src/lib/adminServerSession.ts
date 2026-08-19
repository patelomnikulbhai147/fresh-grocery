"use client";

/**
 * The admin panel authorizes publishing product/order changes with a server
 * session (an httpOnly `flashkart_session` cookie set by /api/admin/session).
 * That cookie is separate from the long-lived client login (adminAuth in
 * localStorage), so the two can drift apart: the panel stays "logged in" while
 * the cookie is missing/expired, and every edit then silently fails to publish.
 *
 * To make publishing self-heal, the admin's credentials are kept IN MEMORY for
 * the current page session (never persisted) so the session can be transparently
 * re-established when a sync request comes back 401/403. After a full reload the
 * cached credentials are gone and the panel falls back to a reconnect prompt.
 */
let cachedIdentifier: string | null = null;
let cachedPassword: string | null = null;

export function rememberAdminCreds(identifier: string, password: string) {
  if (identifier && password) {
    cachedIdentifier = identifier;
    cachedPassword = password;
  }
}

export function hasAdminCreds(): boolean {
  return !!(cachedIdentifier && cachedPassword);
}

export function forgetAdminCreds() {
  cachedIdentifier = null;
  cachedPassword = null;
}

/** Establish (or refresh) the server session. Caches creds on success. */
export async function establishAdminSession(
  identifier: string,
  password: string
): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });
    if (res.ok) {
      rememberAdminCreds(identifier, password);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/** Silently re-establish the session using the in-memory credentials.
 *  Returns false when none are cached (e.g. after a page reload). */
export async function reconnectAdminSession(): Promise<boolean> {
  if (!cachedIdentifier || !cachedPassword) return false;
  return establishAdminSession(cachedIdentifier, cachedPassword);
}
