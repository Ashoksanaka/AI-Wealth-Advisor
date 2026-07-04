"use client";

import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase } from "lucide-react";
import { SeedDemoButton } from "@/components/seed-demo-button";
import { formatINR } from "@/lib/format-currency";

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function PortfolioSection({ portfolio }) {
  const { holdings, allocation, totalValue, rebalance } = portfolio;
  const [simulated, setSimulated] = useState(false);

  const handleSimulateRebalance = () => {
    setSimulated(true);
    toast.success(
      rebalance?.suggestion || "Portfolio rebalance simulated toward target allocation."
    );
  };

  if (holdings.length === 0) {
    return (
      <Card className="surface">
        <CardContent className="p-8 text-center">
          <Briefcase className="h-8 w-8 mx-auto mb-3 text-muted-foreground opacity-40" />
          <p className="text-sm text-muted-foreground mb-4">
            No investments tracked yet. Load demo data or add holdings.
          </p>
          <SeedDemoButton />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="surface">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-medium">Holdings</CardTitle>
          <Link href="/portfolio">
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-2">
          {holdings.slice(0, 4).map((h) => (
            <div
              key={h.id || h.symbol}
              className="flex items-center justify-between p-2 rounded-md hover:bg-accent/30"
            >
              <div>
                <p className="text-sm font-medium">{h.name}</p>
                <p className="text-xs text-muted-foreground">{h.symbol}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-data font-medium">
                  {formatINR(h.currentValue)}
                </p>
                <p
                  className={`text-xs font-data ${
                    h.gainLoss >= 0 ? "income-text" : "expense-text"
                  }`}
                >
                  {h.gainLossPercent >= 0 ? "+" : ""}
                  {h.gainLossPercent.toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="surface">
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Asset Allocation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name} ${value}%`}
                >
                  {allocation.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value}%`}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-2">
            Total: {formatINR(totalValue)}
          </p>
          {portfolio.rebalance?.needsRebalance && (
            <div className="mt-2 text-center space-y-2">
              <p className="text-xs text-primary">
                Rebalance: {portfolio.rebalance.suggestion}
              </p>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={handleSimulateRebalance}
                disabled={simulated}
              >
                {simulated ? "Rebalance queued" : "Simulate rebalance"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
