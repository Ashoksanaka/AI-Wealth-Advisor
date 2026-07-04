"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { TrendingDown, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { formatINR, formatINRCompact } from "@/lib/format-currency";

const SCENARIOS = [
  { id: "base", label: "Base case", growth: 0.07, color: "hsl(var(--chart-1))" },
  { id: "bull", label: "Bull market", growth: 0.12, color: "hsl(var(--chart-2))" },
  { id: "bear", label: "Market -10%", growth: -0.1, color: "hsl(var(--chart-3))" },
];

function buildTimeline(goal, scenario) {
  const remaining = goal.targetAmount - goal.currentAmount;
  const monthly = Math.max(remaining / 24, 100);
  const months = Math.min(36, Math.ceil(remaining / monthly));

  const data = [];
  let balance = goal.currentAmount;

  for (let m = 0; m <= months; m++) {
    if (m > 0) {
      balance += monthly;
      if (scenario.id === "bear" && m % 6 === 0) balance *= 0.95;
      else if (scenario.id === "bull") balance *= 1 + scenario.growth / 12;
      else balance *= 1 + scenario.growth / 12;
    }
    data.push({
      month: m === 0 ? "Now" : `M${m}`,
      value: Math.round(balance),
      target: goal.targetAmount,
    });
  }

  return data;
}

export function GoalScenarioDrawer({ goal }) {
  const [scenario, setScenario] = useState(SCENARIOS[0]);
  const timeline = buildTimeline(goal, scenario);
  const finalValue = timeline[timeline.length - 1]?.value ?? goal.currentAmount;
  const onTrack = finalValue >= goal.targetAmount;

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
          <LineChart className="h-3 w-3" />
          Scenarios
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-lg p-6 pb-8">
          <DrawerHeader>
            <DrawerTitle>{goal.name} — Scenario Planning</DrawerTitle>
          </DrawerHeader>

          <div className="flex flex-wrap gap-2 mb-4">
            {SCENARIOS.map((s) => (
              <Button
                key={s.id}
                size="sm"
                variant={scenario.id === s.id ? "default" : "outline"}
                className="h-7 text-xs"
                onClick={() => setScenario(s)}
              >
                {s.id === "bear" && <TrendingDown className="h-3 w-3 mr-1" />}
                {s.label}
              </Button>
            ))}
          </div>

          <div className="h-[220px] mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeline}>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatINRCompact(v)} />
                <Tooltip
                  formatter={(value) => [formatINR(value), "Projected"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {timeline.map((_, i) => (
                    <Cell key={i} fill={scenario.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-sm text-center">
            {onTrack ? (
              <span className="text-primary">
                On track to reach {formatINR(goal.targetAmount)} under {scenario.label}
              </span>
            ) : (
              <span className="text-amber-500">
                {scenario.label}: projected {formatINR(finalValue)} — increase contributions
              </span>
            )}
          </p>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
