"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative pt-36 pb-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="eyebrow mb-6">Powered by YourBank</p>
          <h1 className="display-title text-4xl sm:text-5xl lg:text-6xl leading-[1.1] mb-6">
            Your AI wealth advisor, inside your banking app
          </h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl leading-relaxed">
            Digital Wealth Advisor delivers personalized, scalable guidance by
            combining your spending habits, investment behavior, and financial
            goals — through an intuitive avatar-based interface.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline">
                Explore Features
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
