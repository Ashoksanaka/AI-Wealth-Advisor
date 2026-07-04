import { getUserAccounts } from "@/actions/dashboard";
import { defaultCategories } from "@/data/categories";
import { AddTransactionForm } from "../_components/transactions_form";
import { getTransaction } from "@/actions/transaction";
import { PenBox } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { notFound } from "next/navigation";

export default async function AddTransactionPage({ searchParams }) {
  const accounts = await getUserAccounts();
  const { edit } = await searchParams;
  const editId = edit;

  let initialData = null;
  if (editId) {
    try {
      initialData = await getTransaction(editId);
    } catch {
      notFound();
    }
  }

  return (
    <div className="max-w-3xl mx-auto fade-in">
      <PageHeader
        title={editId ? "Edit Transaction" : "Add Transaction"}
        subtitle={
          editId
            ? "Update your transaction details below"
            : "Record a new income or expense"
        }
        backHref="/dashboard"
        backLabel="Back to dashboard"
        icon={PenBox}
      />
      <AddTransactionForm
        accounts={accounts}
        categories={defaultCategories}
        editMode={!!editId}
        initialData={initialData}
      />
    </div>
  );
}
