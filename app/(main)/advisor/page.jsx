import { AdvisorChat } from "@/components/advisor/advisor-chat";
import { PageHeader } from "@/components/page-header";
import { getAdvisorHistory } from "@/actions/advisor";
import { getAdvisorGreeting } from "@/actions/wealth";
import { Bot } from "lucide-react";

export default async function AdvisorPage({ searchParams }) {
  const params = await searchParams;
  const sessionId = params?.session ?? null;
  const [{ session, messages }, coldStartGreeting] = await Promise.all([
    getAdvisorHistory(sessionId),
    getAdvisorGreeting().catch(() => null),
  ]);

  return (
    <div className="flex flex-col h-[calc(100dvh-5rem)] sm:h-[calc(100dvh-5.5rem)] min-h-[42rem]">
      <PageHeader
        title="Ask Arya"
        subtitle="Your AI-powered digital wealth advisor"
        icon={Bot}
        className="mb-1 shrink-0 [&_h1]:text-xl sm:[&_h1]:text-2xl [&_.icon-ring]:h-9 [&_.icon-ring]:w-9"
      />
      <AdvisorChat
        mode="page"
        sessionId={session.id}
        initialMessages={messages}
        initialGreeting={coldStartGreeting}
      />
    </div>
  );
}
