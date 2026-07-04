import { cookies } from "next/headers";

const SSO_COOKIE = "bank_sso_session";

export async function establishBankSsoSession(bankUserId) {
  const cookieStore = await cookies();
  cookieStore.set(SSO_COOKIE, JSON.stringify({ bankUserId, establishedAt: Date.now() }), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function getBankSsoSession() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SSO_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
