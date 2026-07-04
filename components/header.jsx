import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import {
  LayoutDashboard,
  PenBox,
  Briefcase,
  Target,
  Bot,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/advisor", label: "Advisor", icon: Bot },
];

const Header = async () => {
  return (
    <div className="fixed top-0 w-full bg-card/95 backdrop-blur-sm z-50 border-b border-border/60">
      <nav className="w-full px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link href="/" className="transition-opacity hover:opacity-80">
          <div className="flex flex-col">
            <span className="font-display font-semibold text-sm leading-tight">
              Digital Wealth Advisor
            </span>
            <span className="text-[10px] text-muted-foreground">
              Powered by YourBank
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <SignedIn>
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button variant="ghost" size="sm" className="gap-1.5 px-2 sm:px-3">
                  <item.icon size={16} />
                  <span className="hidden lg:inline">{item.label}</span>
                </Button>
              </Link>
            ))}
            <Link href={"/transaction/create"}>
              <Button size="sm" className="gap-1.5 px-2 sm:px-3">
                <PenBox size={16} />
                <span className="hidden md:inline">Add</span>
              </Button>
            </Link>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9 ring-1 ring-border",
                },
              }}
            />
          </SignedIn>
          <SignedOut>
            <SignInButton forceRedirectUrl="/dashboard">
              <Button variant="outline" size="sm">
                Get Started
              </Button>
            </SignInButton>
          </SignedOut>
        </div>
      </nav>
    </div>
  );
};

export default Header;
