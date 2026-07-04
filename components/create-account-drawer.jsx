"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Wallet, CreditCard, IndianRupee, Star } from "lucide-react";
import useFetch from "@/hooks/use-fetch";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { createAccount } from "@/actions/dashboard";
import { accountSchema } from "@/app/lib/schema";
import { toast } from "sonner";

function FieldLabel({ icon: Icon, children, htmlFor }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-sm font-medium flex items-center gap-2 text-muted-foreground"
    >
      <Icon className="h-3.5 w-3.5 text-primary" />
      {children}
    </label>
  );
}

export function CreateAccountDrawer({ children }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "CURRENT",
      balance: "",
      isDefault: false,
    },
  });

  const {
    loading: createAccountLoading,
    fn: createAccountFn,
    data: newAccount,
  } = useFetch(createAccount);

  const onSubmit = async (data) => {
    await createAccountFn(data);
  };

  useEffect(() => {
    if (newAccount?.success) {
      toast.success("Account created successfully");
      reset();
      setOpen(false);
      router.refresh();
    }
  }, [newAccount, reset, router]);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="bg-card border-t border-border/60">
        <DrawerHeader>
          <div className="flex items-center gap-3">
            <div className="icon-ring h-10 w-10">
              <Wallet className="h-5 w-5" />
            </div>
            <DrawerTitle className="font-display">Create new account</DrawerTitle>
          </div>
        </DrawerHeader>
        <div className="px-4 pb-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <FieldLabel icon={Wallet} htmlFor="name">
                Account name
              </FieldLabel>
              <Input
                id="name"
                placeholder="e.g., Main Checking"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm expense-text">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <FieldLabel icon={CreditCard} htmlFor="type">
                Account type
              </FieldLabel>
              <Select
                onValueChange={(value) => setValue("type", value)}
                defaultValue={watch("type")}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CURRENT">Current</SelectItem>
                  <SelectItem value="SAVINGS">Savings</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm expense-text">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <FieldLabel icon={IndianRupee} htmlFor="balance">
                Initial balance
              </FieldLabel>
              <Input
                id="balance"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="font-data"
                {...register("balance")}
              />
              {errors.balance && (
                <p className="text-sm expense-text">{errors.balance.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border/60 p-4">
              <div className="space-y-0.5">
                <label
                  htmlFor="isDefault"
                  className="text-sm font-medium cursor-pointer flex items-center gap-2"
                >
                  <Star className="h-3.5 w-3.5 text-primary" />
                  Set as default
                </label>
                <p className="text-xs text-muted-foreground">
                  Selected by default for new transactions
                </p>
              </div>
              <Switch
                id="isDefault"
                checked={watch("isDefault")}
                onCheckedChange={(checked) => setValue("isDefault", checked)}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <DrawerClose asChild>
                <Button type="button" variant="outline" className="flex-1">
                  Cancel
                </Button>
              </DrawerClose>
              <Button
                type="submit"
                className="flex-1"
                disabled={createAccountLoading}
              >
                {createAccountLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
