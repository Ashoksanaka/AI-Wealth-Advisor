import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AskAryaButton() {
  return (
    <Link href="/advisor" className="fixed bottom-6 right-6 z-40">
      <Button
        size="lg"
        className="gap-2 rounded-full shadow-lg shadow-primary/20 h-12 px-5"
      >
        <MessageCircle className="h-5 w-5" />
        Ask Arya
      </Button>
    </Link>
  );
}
