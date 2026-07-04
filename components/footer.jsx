import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="space-y-4">
            <Link href="/">
              <div className="flex flex-col">
                <span className="font-display font-semibold">
                  Digital Wealth Advisor
                </span>
                <span className="text-xs text-muted-foreground">
                  Powered by YourBank
                </span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              AI-powered digital wealth management that integrates into your
              bank&apos;s mobile app to deliver personalized, scalable advisory
              services.
            </p>
          </div>
          <div>
            <h3 className="font-display font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/advisor"
                  className="hover:text-foreground transition-colors"
                >
                  Ask Arya
                </Link>
              </li>
              <li>
                <Link
                  href="/portfolio"
                  className="hover:text-foreground transition-colors"
                >
                  Portfolio
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <SignedOut>
              <h3 className="font-display font-semibold mb-4">Get Started</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Experience scalable wealth advisory through your banking app.
              </p>
              <Link
                href="/sign-in"
                className="inline-flex items-center text-sm font-medium text-primary hover:underline"
              >
                Sign in to your account
              </Link>
            </SignedOut>
            <SignedIn>
              <h3 className="font-display font-semibold mb-4">Your Account</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Continue your wealth journey with Arya.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center text-sm font-medium text-primary hover:underline"
              >
                Go to dashboard
              </Link>
            </SignedIn>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-border/60 text-center text-sm text-muted-foreground">
          &copy; 2025 YourBank Digital Wealth Advisor. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
