import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

export function BehaviorPatterns({ patterns = [] }) {
  return (
    <Card className="surface h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="icon-ring h-8 w-8">
            <Activity className="h-4 w-4" />
          </div>
          <CardTitle className="text-base font-medium">Behavior Patterns</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {patterns.length > 0 ? (
          patterns.map((p, i) => (
            <p key={i} className="text-sm text-muted-foreground">
              • {p.message}
            </p>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            Add more transactions to detect spending patterns and behavioral insights.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
