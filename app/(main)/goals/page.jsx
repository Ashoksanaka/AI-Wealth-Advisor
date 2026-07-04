import { getGoals } from "@/actions/goals";
import { GoalsClient } from "./_components/goals-client";

export default async function GoalsPage() {
  const goals = await getGoals();
  return <GoalsClient goals={goals} />;
}
