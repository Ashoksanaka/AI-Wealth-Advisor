"use client";

import { useState, useEffect } from "react";
import { Pencil, Check, X, Wallet } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateBudget } from "@/actions/budget";
import { formatINR } from "@/lib/format-currency";

export function BudgetProgress({ initialBudget, currentExpenses }) {
  const router = useRouter();
  const [budget, setBudget] = useState(initialBudget);
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(
    initialBudget?.amount?.toString() || ""
  );

  const {
    loading: isLoading,
    fn: updateBudgetFn,
    data: updatedBudget,
  } = useFetch(updateBudget);

  useEffect(() => {
    setBudget(initialBudget);
    setNewBudget(initialBudget?.amount?.toString() || "");
  }, [initialBudget]);

  const percentUsed = budget
    ? (currentExpenses / budget.amount) * 100
    : 0;

  const handleUpdateBudget = async () => {
    const amount = parseFloat(newBudget);

    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    await updateBudgetFn(amount);
  };

  const handleCancel = () => {
    setNewBudget(budget?.amount?.toString() || "");
    setIsEditing(false);
  };

  useEffect(() => {
    if (updatedBudget?.success) {
      setBudget(updatedBudget.data);
      setNewBudget(updatedBudget.data.amount.toString());
      setIsEditing(false);
      toast.success("Budget updated successfully");
      router.refresh();
    }
  }, [updatedBudget, router]);

  const progressColor =
    percentUsed >= 90
      ? "bg-destructive"
      : percentUsed >= 75
        ? "bg-amber-500"
        : "bg-primary";

  return (
    <Card className="surface">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-start gap-3 flex-1">
          <div className="icon-ring h-10 w-10 shrink-0">
            <Wallet className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-sm font-medium">
              Monthly Budget (Default Account)
            </CardTitle>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="w-32"
                    placeholder="Enter amount"
                    autoFocus
                    disabled={isLoading}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleUpdateBudget}
                    disabled={isLoading}
                  >
                    <Check className="h-4 w-4 income-text" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4 expense-text" />
                  </Button>
                </div>
              ) : (
                <>
                  <CardDescription>
                    {budget ? (
                      <>
                        <span className="font-data">
                          {formatINR(currentExpenses, { decimals: 2 })}
                        </span>{" "}
                        of{" "}
                        <span className="font-data">
                          {formatINR(budget.amount, { decimals: 2 })}
                        </span>{" "}
                        spent
                      </>
                    ) : (
                      "No budget set"
                    )}
                  </CardDescription>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="h-7 gap-1.5 text-xs"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit budget
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {budget && (
          <div className="space-y-2">
            <Progress value={percentUsed} extraStyles={progressColor} />
            <p className="text-xs text-muted-foreground text-right font-data">
              {percentUsed.toFixed(1)}% used
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
