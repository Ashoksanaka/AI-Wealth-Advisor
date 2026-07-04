"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Briefcase, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { createHolding, deleteHolding } from "@/actions/portfolio";
import { SeedDemoButton } from "@/components/seed-demo-button";

export function PortfolioClient({ holdings }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    symbol: "",
    name: "",
    assetClass: "EQUITY",
    quantity: "",
    avgBuyPrice: "",
    currentPrice: "",
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await createHolding({
      ...form,
      quantity: Number(form.quantity),
      avgBuyPrice: Number(form.avgBuyPrice),
      currentPrice: Number(form.currentPrice),
    });
    if (result.success) {
      toast.success("Holding added");
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    const result = await deleteHolding(id);
    if (result.success) {
      toast.success("Holding removed");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  useEffect(() => {
    const amount = searchParams.get("amount");
    const fractional = searchParams.get("fractional");
    if (amount && fractional) {
      toast.success(`Micro-invest $${amount} — fractional share purchase simulated`);
    }
  }, [searchParams]);

  return (
    <div>
      <PageHeader
        title="Portfolio"
        subtitle="Track your investment holdings and allocation"
        icon={Briefcase}
      >
        <div className="flex gap-2">
          <SeedDemoButton />
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Holding
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="mx-auto w-full max-w-md p-6">
              <DrawerHeader>
                <DrawerTitle>Add Investment Holding</DrawerTitle>
              </DrawerHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Symbol</Label>
                    <Input
                      value={form.symbol}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, symbol: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Asset Class</Label>
                    <Select
                      value={form.assetClass}
                      onValueChange={(v) =>
                        setForm((f) => ({ ...f, assetClass: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["EQUITY", "DEBT", "GOLD", "MF", "FD"].map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      step="any"
                      value={form.quantity}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, quantity: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Avg Buy</Label>
                    <Input
                      type="number"
                      step="any"
                      value={form.avgBuyPrice}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, avgBuyPrice: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Current</Label>
                    <Input
                      type="number"
                      step="any"
                      value={form.currentPrice}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, currentPrice: e.target.value }))
                      }
                      required
                    />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Adding…" : "Add Holding"}
                </Button>
              </form>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </PageHeader>

      {holdings.length === 0 ? (
        <Card className="surface">
          <CardContent className="p-12 text-center text-muted-foreground">
            <Briefcase className="h-10 w-10 mx-auto mb-4 opacity-30" />
            <p className="mb-4">No holdings yet. Add investments or load demo data.</p>
            <SeedDemoButton />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {holdings.map((h) => {
            const value = h.quantity * h.currentPrice;
            const invested = h.quantity * h.avgBuyPrice;
            const pnl = value - invested;
            const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;
            return (
              <Card key={h.id} className="surface">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{h.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {h.symbol} · {h.assetClass}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-data font-medium">
                        ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                      <p
                        className={`text-xs font-data ${
                          pnl >= 0 ? "income-text" : "expense-text"
                        }`}
                      >
                        {pnlPct >= 0 ? "+" : ""}
                        {pnlPct.toFixed(1)}%
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(h.id)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
