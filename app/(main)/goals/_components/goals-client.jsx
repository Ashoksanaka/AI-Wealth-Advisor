"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Target, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { createGoal, deleteGoal } from "@/actions/goals";
import { SeedDemoButton } from "@/components/seed-demo-button";
import { computeGoalStats } from "@/lib/wealth-stats";
import { GoalScenarioDrawer } from "./goal-scenario-drawer";

export function GoalsClient({ goals }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "0",
    priority: "1",
  });

  const goalStats = computeGoalStats(goals);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await createGoal({
      name: form.name,
      targetAmount: Number(form.targetAmount),
      currentAmount: Number(form.currentAmount),
      priority: Number(form.priority),
    });
    if (result.success) {
      toast.success("Goal created");
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    const result = await deleteGoal(id);
    if (result.success) {
      toast.success("Goal removed");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div>
      <PageHeader
        title="Financial Goals"
        subtitle="Track progress toward your wealth milestones"
        icon={Target}
      >
        <div className="flex gap-2">
          <SeedDemoButton />
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Goal
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="mx-auto w-full max-w-md p-6">
              <DrawerHeader>
                <DrawerTitle>Create Financial Goal</DrawerTitle>
              </DrawerHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label>Goal Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="e.g. Retirement Fund"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Target Amount ($)</Label>
                    <Input
                      type="number"
                      value={form.targetAmount}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, targetAmount: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Current Amount ($)</Label>
                    <Input
                      type="number"
                      value={form.currentAmount}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, currentAmount: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Creating…" : "Create Goal"}
                </Button>
              </form>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </PageHeader>

      {goalStats.length === 0 ? (
        <Card className="surface">
          <CardContent className="p-12 text-center text-muted-foreground">
            <Target className="h-10 w-10 mx-auto mb-4 opacity-30" />
            <p className="mb-4">No goals set. Create one or load demo data.</p>
            <SeedDemoButton />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {goalStats.map((goal) => (
            <Card key={goal.id} className="surface">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium">{goal.name}</p>
                    <p className="text-sm text-muted-foreground font-data">
                      ${goal.currentAmount.toLocaleString()} of $
                      {goal.targetAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <GoalScenarioDrawer goal={goal} />
                    <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(goal.id)}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
                <Progress value={goal.progress} className="h-2 mb-2" />
                <p className="text-xs text-muted-foreground">
                  {goal.progress}% complete · ${goal.remaining.toLocaleString()}{" "}
                  to go
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
