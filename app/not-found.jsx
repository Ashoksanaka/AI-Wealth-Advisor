import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SearchX, Home, LayoutDashboard } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center fade-in">
      <div className="surface rounded-lg p-10 max-w-md w-full">
        <SearchX className="h-12 w-12 mx-auto mb-6 text-muted-foreground opacity-50" />
        <h1 className="display-title text-5xl mb-2">404</h1>
        <h2 className="text-lg font-medium mb-3">Page not found</h2>
        <p className="text-muted-foreground text-sm mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto gap-2">
              <Home className="h-4 w-4" />
              Return home
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button className="w-full sm:w-auto gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Go to dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
