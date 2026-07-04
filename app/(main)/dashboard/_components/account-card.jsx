"use client";

import {
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  PiggyBank,
  Star,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useEffect } from "react";
import useFetch from "@/hooks/use-fetch";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateDefaultAccount } from "@/actions/accounts";
import { toast } from "sonner";

export function AccountCard({ account }) {
  const { name, type, balance, id, isDefault } = account;
  const router = useRouter();

  const {
    loading: updateDefaultLoading,
    fn: updateDefaultFn,
    data: updatedAccount,
  } = useFetch(updateDefaultAccount);

  const handleDefaultChange = async (checked) => {
    if (isDefault && !checked) {
      toast.warning("You need atleast 1 default account");
      return;
    }

    if (!checked) return;

    await updateDefaultFn(id);
  };

  useEffect(() => {
    if (updatedAccount?.success) {
      toast.success("Default account updated successfully");
      router.refresh();
    }
  }, [updatedAccount, router]);

  const TypeIcon = type === "SAVINGS" ? PiggyBank : CreditCard;

  return (
    <Card className="surface group relative transition-colors hover:border-primary/30">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Link href={`/account/${id}`} className="flex items-center gap-2 flex-1 min-w-0">
          <div className="icon-ring h-8 w-8 shrink-0">
            <TypeIcon className="h-4 w-4" />
          </div>
          <CardTitle className="text-sm font-medium capitalize truncate">
            {name}
          </CardTitle>
        </Link>
        <div
          className="flex items-center gap-2 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {isDefault && (
            <Badge variant="secondary" className="gap-1 text-xs">
              <Star className="h-3 w-3 text-primary" />
              Default
            </Badge>
          )}
          <Switch
            checked={isDefault}
            onCheckedChange={handleDefaultChange}
            disabled={updateDefaultLoading}
          />
        </div>
      </CardHeader>
      <Link href={`/account/${id}`}>
        <CardContent>
          <div className="balance-glow text-2xl font-semibold">
            ${parseFloat(balance).toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {type.charAt(0) + type.slice(1).toLowerCase()} Account
          </p>
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center income-text">
            <ArrowUpRight className="mr-1 h-4 w-4" />
            Income
          </div>
          <div className="flex items-center expense-text">
            <ArrowDownRight className="mr-1 h-4 w-4" />
            Expense
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
}
