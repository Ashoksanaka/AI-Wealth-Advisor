import { getContextualNudges } from "@/actions/wealth";
import { ContextualNudge } from "@/components/nudges/contextual-nudge";
import { PushNotificationCenter } from "@/components/nudges/push-notification-center";

export async function NudgesAsync() {
  const nudges = await getContextualNudges();
  return (
    <>
      <PushNotificationCenter nudges={nudges} />
      <ContextualNudge nudges={nudges} />
    </>
  );
}
