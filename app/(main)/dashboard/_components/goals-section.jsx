import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";
import { SeedDemoButton } from "@/components/seed-demo-button";

export function GoalsSection({ goals }) {
  if (!goals || goals.length === 0) {
    return (
      <Card className="surface">
        <CardContent className="p-8 text-center">
          <Target className="h-8 w-8 mx-auto mb-3 text-muted-foreground opacity-40" />
          <p className="text-sm text-muted-foreground mb-4">
            Set financial goals to track your wealth journey.
          </p>
          <SeedDemoButton />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="surface">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">Financial Goals</CardTitle>
        <Link href="/goals">
          <Button variant="ghost" size="sm">
            Manage goals
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-5">
        {goals.slice(0, 3).map((goal) => (
          <div key={goal.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{goal.name}</p>
              <span className="text-xs font-data text-muted-foreground">
                ${goal.currentAmount.toLocaleString()} / $
                {goal.targetAmount.toLocaleString()}
              </span>
            </div>
            <Progress value={goal.progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {goal.progress}% complete · ${goal.remaining.toLocaleString()} remaining
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
