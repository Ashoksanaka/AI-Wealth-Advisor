import Link from "next/link";
import { EmbedMode } from "@/components/embed/embed-mode";
import { EmbedWealthSummary } from "@/components/embed/embed-wealth-summary";
import { AdvisorChat } from "@/components/advisor/advisor-chat";
import { getAdvisorHistory } from "@/actions/advisor";
import { getWealthSummary, getAdvisorGreeting } from "@/actions/wealth";
import { DisclaimerBanner } from "@/components/compliance/disclaimer-banner";
import { getBankSsoSession } from "@/lib/bank-sso";
import { Shield } from "lucide-react";

export default async function EmbedPage({ searchParams }) {
  const params = await searchParams;
  const sessionId = params?.session ?? null;
  const [{ session, messages }, wealthSummary, coldStartGreeting, bankSso] =
    await Promise.all([
      getAdvisorHistory(sessionId),
      getWealthSummary().catch(() => null),
      getAdvisorGreeting().catch(() => null),
      getBankSsoSession(),
    ]);

  return (
    <div className="min-h-screen max-w-md mx-auto px-4 py-6 pb-safe">
      <EmbedMode />
      {bankSso && (
        <div className="mb-3 flex items-center justify-center gap-2 text-xs text-primary bg-primary/10 rounded-full py-1.5 px-3">
          <Shield className="h-3 w-3" />
          Authenticated via YourBank SSO · {bankSso.bankUserId}
        </div>
      )}
      <div className="mb-4 text-center">
        <p className="text-xs text-muted-foreground">YourBank Mobile</p>
        <h1 className="font-display font-semibold">Wealth Advisor</h1>
      </div>
      <div className="flex gap-2 mb-4 justify-center text-xs">
        <Link href="/embed" className="text-primary font-medium">
          Advisor
        </Link>
        <span className="text-muted-foreground">|</span>
        <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
          Dashboard
        </Link>
      </div>
      {!bankSso && (
        <p className="text-center text-xs text-muted-foreground mb-4">
          Demo SSO:{" "}
          <Link
            href="/api/v1/auth/bank-sso?establish=1&bankUserId=sarah-demo&redirect=/embed"
            className="text-primary hover:underline"
          >
            Simulate bank login
          </Link>
        </p>
      )}
      {wealthSummary && wealthSummary.dataRichness > 1 && (
        <EmbedWealthSummary summary={wealthSummary} />
      )}
      <AdvisorChat
        mode="page"
        sessionId={session.id}
        initialMessages={messages}
        initialGreeting={coldStartGreeting}
        enableTtsDefault={false}
        compact
      />
      <DisclaimerBanner className="mt-4 text-center" />
    </div>
  );
}
