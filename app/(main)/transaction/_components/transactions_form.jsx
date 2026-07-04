"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarIcon,
  Loader2,
  ArrowUpDown,
  IndianRupee,
  Tag,
  FileText,
  Repeat,
  Wallet,
} from "lucide-react";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateAccountDrawer } from "@/components/create-account-drawer";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/format-currency";
import { createTransaction, updateTransaction } from "@/actions/transaction";
import { transactionSchema } from "@/app/lib/schema";
import { ReceiptScanner } from "./receipt-scanner";

function FieldLabel({ icon: Icon, children }) {
  return (
    <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
      <Icon className="h-3.5 w-3.5 text-primary" />
      {children}
    </label>
  );
}

function FormSection({ title, children }) {
  return (
    <div className="space-y-4">
      <h3 className="eyebrow">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export function AddTransactionForm({
  accounts,
  categories,
  editMode = false,
  initialData = null,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
    reset,
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues:
      editMode && initialData
        ? {
            type: initialData.type,
            amount: initialData.amount.toString(),
            description: initialData.description,
            accountId: initialData.accountId,
            category: initialData.category,
            date: new Date(initialData.date),
            isRecurring: initialData.isRecurring,
            ...(initialData.recurringInterval && {
              recurringInterval: initialData.recurringInterval,
            }),
          }
        : {
            type: "EXPENSE",
            amount: "",
            description: "",
            accountId: accounts.find((ac) => ac.isDefault)?.id,
            date: new Date(),
            isRecurring: false,
          },
  });

  const {
    loading: transactionLoading,
    fn: transactionFn,
    data: transactionResult,
  } = useFetch(editMode ? updateTransaction : createTransaction);

  const onSubmit = (data) => {
    const formData = {
      ...data,
      amount: parseFloat(data.amount),
    };

    if (editMode) {
      transactionFn(editId, formData);
    } else {
      transactionFn(formData);
    }
  };

  const handleScanComplete = (scannedData) => {
    if (scannedData) {
      setValue("amount", scannedData.amount.toString());
      setValue("date", new Date(scannedData.date));
      if (scannedData.description) {
        setValue("description", scannedData.description);
      }
      if (scannedData.category) {
        setValue("category", scannedData.category);
      }
      toast.success("Receipt scanned successfully");
    }
  };

  useEffect(() => {
    if (transactionResult?.success && !transactionLoading) {
      toast.success(
        editMode
          ? "Transaction updated successfully"
          : "Transaction created successfully"
      );
      reset();
      router.push(`/account/${transactionResult.data.accountId}`);
    }
  }, [transactionResult, transactionLoading, editMode]);

  const type = watch("type");
  const isRecurring = watch("isRecurring");
  const date = watch("date");
  const accountId = watch("accountId");
  const category = watch("category");
  const recurringInterval = watch("recurringInterval");

  const filteredCategories = categories.filter(
    (category) => category.type === type
  );

  useEffect(() => {
    const currentCategory = getValues("category");
    if (
      currentCategory &&
      !filteredCategories.some((c) => c.id === currentCategory)
    ) {
      setValue("category", "");
    }
  }, [type, filteredCategories, getValues, setValue]);

  return (
    <Card className="surface">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Transaction details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {!editMode && <ReceiptScanner onScanComplete={handleScanComplete} />}

          <FormSection title="Details">
            <div
              className={cn(
                "space-y-2 p-4 rounded-lg border transition-colors",
                type === "EXPENSE"
                  ? "border-expense/30 bg-expense/5"
                  : "border-income/30 bg-income/5"
              )}
            >
              <FieldLabel icon={ArrowUpDown}>Type</FieldLabel>
              <Select
                value={type}
                onValueChange={(value) => setValue("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                  <SelectItem value="INCOME">Income</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm expense-text">{errors.type.message}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel icon={IndianRupee}>Amount</FieldLabel>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="font-data"
                  {...register("amount")}
                />
                {errors.amount && (
                  <p className="text-sm expense-text">{errors.amount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <FieldLabel icon={Wallet}>Account</FieldLabel>
                <Select
                  value={accountId}
                  onValueChange={(value) => setValue("accountId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} ({formatINR(account.balance, { decimals: 2 })})
                      </SelectItem>
                    ))}
                    <CreateAccountDrawer>
                      <Button
                        variant="ghost"
                        className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                      >
                        Create Account
                      </Button>
                    </CreateAccountDrawer>
                  </SelectContent>
                </Select>
                {errors.accountId && (
                  <p className="text-sm expense-text">
                    {errors.accountId.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <FieldLabel icon={FileText}>Description</FieldLabel>
              <Input
                placeholder="Enter description"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm expense-text">
                  {errors.description.message}
                </p>
              )}
            </div>
          </FormSection>

          <div className="h-px bg-border/60" />

          <FormSection title="Classification">
            <div className="space-y-2">
              <FieldLabel icon={Tag}>Category</FieldLabel>
              <Select
                value={category || ""}
                onValueChange={(value) => setValue("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm expense-text">{errors.category.message}</p>
              )}
            </div>
          </FormSection>

          <div className="h-px bg-border/60" />

          <FormSection title="Schedule">
            <div className="space-y-2">
              <FieldLabel icon={CalendarIcon}>Date</FieldLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => setValue("date", date)}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.date && (
                <p className="text-sm expense-text">{errors.date.message}</p>
              )}
            </div>

            <div className="flex flex-row items-center justify-between rounded-lg border border-border/60 p-4">
              <div className="space-y-0.5">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Repeat className="h-3.5 w-3.5 text-primary" />
                  Recurring transaction
                </label>
                <div className="text-xs text-muted-foreground">
                  Set up a recurring schedule for this transaction
                </div>
              </div>
              <Switch
                checked={isRecurring}
                onCheckedChange={(checked) => setValue("isRecurring", checked)}
              />
            </div>

            {isRecurring && (
              <div className="space-y-2">
                <FieldLabel icon={Repeat}>Recurring interval</FieldLabel>
                <Select
                  value={recurringInterval || ""}
                  onValueChange={(value) =>
                    setValue("recurringInterval", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAILY">Daily</SelectItem>
                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="YEARLY">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                {errors.recurringInterval && (
                  <p className="text-sm expense-text">
                    {errors.recurringInterval.message}
                  </p>
                )}
              </div>
            )}
          </FormSection>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" className="w-full" disabled={transactionLoading}>
              {transactionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editMode ? "Updating..." : "Creating..."}
                </>
              ) : editMode ? (
                "Update transaction"
              ) : (
                "Create transaction"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
