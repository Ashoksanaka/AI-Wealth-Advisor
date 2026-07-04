"use client";

import { useState } from "react";
import { Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { seedAllDemoData } from "@/actions/seed";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const PERSONAS = [
  {
    key: "sarah",
    label: "Sarah",
    description: "Moderate risk, high savings",
  },
  {
    key: "raj",
    label: "Raj",
    description: "Aggressive, high weekend spend",
  },
];

export function SeedDemoButton({ label = "Load demo data" }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSeed = async (personaKey) => {
    setLoading(true);
    const result = await seedAllDemoData(personaKey);
    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to seed data");
    }
    setLoading(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {label}
          <ChevronDown className="h-3 w-3 ml-1 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {PERSONAS.map((persona) => (
          <DropdownMenuItem
            key={persona.key}
            onClick={() => handleSeed(persona.key)}
            disabled={loading}
          >
            <div>
              <p className="font-medium">{persona.label}</p>
              <p className="text-xs text-muted-foreground">{persona.description}</p>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
