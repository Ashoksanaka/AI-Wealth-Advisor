"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown } from "lucide-react";
import { formatINR, formatINRCompact } from "@/lib/format-currency";

export function SpendingTrend({ monthlyTrend, expenseTrend }) {
  return (
    <Card className="surface">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="icon-ring h-8 w-8">
              <TrendingDown className="h-4 w-4" />
            </div>
            <CardTitle className="text-base font-medium">
              Spending Behavior
            </CardTitle>
          </div>
          <span
            className={`text-xs font-data ${
              expenseTrend > 0 ? "expense-text" : "income-text"
            }`}
          >
            {expenseTrend > 0 ? "+" : ""}
            {expenseTrend}% vs last month
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="month"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickFormatter={(v) => formatINRCompact(v)}
              />
              <Tooltip
                formatter={(value) => [formatINR(value), "Expenses"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
