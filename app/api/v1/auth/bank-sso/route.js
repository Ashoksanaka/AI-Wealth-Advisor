import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/api/auth";
import { apiSuccess } from "@/lib/api/response";
import { establishBankSsoSession } from "@/lib/bank-sso";

export async function GET(request) {
  const { user, error } = await getApiUser();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const bankUserId = searchParams.get("bankUserId");
  const establish = searchParams.get("establish");

  if (establish === "1") {
    await establishBankSsoSession(bankUserId || user.id);
    const redirectTo = searchParams.get("redirect") || "/embed";
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  return apiSuccess({
    authenticated: true,
    bankUserId: bankUserId || user.id,
    message:
      "SSO simulation: In production, the host bank app passes a pre-authenticated token. Use ?establish=1 to simulate bank handoff.",
    user: { id: user.id, email: user.email },
    establishUrl: `/api/v1/auth/bank-sso?establish=1&bankUserId=${bankUserId || "demo-user"}&redirect=/embed`,
  });
}
