"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format-currency";

function InvestSlider({ action }) {
  const router = useRouter();
  const [amount, setAmount] = useState(action.default ?? 1000);

  return (
    <div className="mt-2 p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
      <p className="text-xs font-medium">{action.label || "Invest now"}</p>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={action.min ?? 500}
          max={action.max ?? 50000}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="flex-1 accent-primary"
          aria-label="Investment amount"
        />
        <span className="text-xs font-data w-16 text-right">{formatINR(amount)}</span>
      </div>
      <Button
        size="sm"
        className="w-full h-7 text-xs"
        onClick={() =>
          router.push(
            `${action.href || "/portfolio"}?amount=${amount}&fractional=1`
          )
        }
      >
        Micro-invest {formatINR(amount)}
      </Button>
    </div>
  );
}

function GoalSlider({ action }) {
  const router = useRouter();
  const [amount, setAmount] = useState(action.default ?? 2000);

  return (
    <div className="mt-2 p-3 rounded-lg bg-accent/30 border border-border/40 space-y-2">
      <p className="text-xs font-medium">{action.label || "Boost goal"}</p>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={action.min ?? 500}
          max={action.max ?? 10000}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="flex-1 accent-primary"
          aria-label="Goal contribution amount"
        />
        <span className="text-xs font-data w-20 text-right">{formatINR(amount)}/mo</span>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="w-full h-7 text-xs"
        onClick={() =>
          router.push(`${action.href || "/goals"}?contribution=${amount}`)
        }
      >
        Apply {formatINR(amount)}/mo
      </Button>
    </div>
  );
}

export function ChatActionWidgets({ actions = [] }) {
  if (!actions.length) return null;

  return (
    <div className="mt-2 space-y-2">
      {actions.map((action, i) => {
        if (action.type === "invest_slider") {
          return <InvestSlider key={i} action={action} />;
        }
        if (action.type === "goal_slider") {
          return <GoalSlider key={i} action={action} />;
        }
        return (
          <Link key={i} href={action.href || "/portfolio"}>
            <Button size="sm" variant="outline" className="h-7 text-xs mr-2">
              {action.label}
            </Button>
          </Link>
        );
      })}
    </div>
  );
}
