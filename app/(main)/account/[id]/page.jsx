import { Suspense } from "react";
import { getAccountWithTransactions } from "@/actions/accounts";
import { TransactionTable } from "../_components/transaction-table";
import { notFound } from "next/navigation";
import { AccountChart } from "../_components/account-chart";
import { AccountSkeleton } from "@/components/page-skeleton";
import { PageHeader } from "@/components/page-header";
import { CreditCard, PiggyBank, IndianRupee, List } from "lucide-react";
import { formatINR } from "@/lib/format-currency";

export default async function AccountPage({ params }) {
  const { id } = await params;
  const accountData = await getAccountWithTransactions(id);

  if (!accountData) {
    notFound();
  }

  const { transactions, ...account } = accountData;
  const TypeIcon = account.type === "SAVINGS" ? PiggyBank : CreditCard;

  return (
    <div className="space-y-8 fade-in">
      <PageHeader
        title={account.name}
        subtitle={`${account.type.charAt(0) + account.type.slice(1).toLowerCase()} Account`}
        backHref="/dashboard"
        backLabel="Back to dashboard"
        icon={TypeIcon}
      />

      <div className="sticky top-[4.5rem] z-40 surface rounded-lg p-4 flex flex-wrap gap-4 justify-between items-center bg-card/95 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="icon-ring h-9 w-9">
            <IndianRupee className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Balance
            </p>
            <p className="balance-glow text-2xl font-semibold">
              {formatINR(account.balance, { decimals: 2 })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="icon-ring h-9 w-9">
            <List className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Transactions
            </p>
            <p className="font-data text-2xl font-semibold">
              {account._count.transactions}
            </p>
          </div>
        </div>
      </div>

      <Suspense fallback={<AccountSkeleton />}>
        <AccountChart transactions={transactions} />
      </Suspense>

      <Suspense fallback={<AccountSkeleton />}>
        <TransactionTable transactions={transactions} />
      </Suspense>
    </div>
  );
}
