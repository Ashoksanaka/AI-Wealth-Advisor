import HeroSection from "@/components/hero";
import { SectionHeading } from "@/components/section-heading";
import {
  featuresData,
  howItWorksData,
  statsData,
  testimonialsData,
} from "@/data/landing";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen fade-in">
      <HeroSection />

      <section className="py-16 border-y border-border/60">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {statsData.map((stat, index) => (
              <div key={index} className="text-center md:text-left">
                <div className="balance-glow text-3xl sm:text-4xl font-semibold mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <SectionHeading
            eyebrow="Capabilities"
            title="Scalable wealth advisory for every customer"
            description="AI-powered tools that unify spending behavior, investments, and personalized guidance."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border/60 rounded-lg overflow-hidden border border-border/60">
            {featuresData.map((feature, index) => (
              <div
                key={index}
                className="bg-card p-8 hover:bg-accent/30 transition-colors"
              >
                <div className="icon-ring h-10 w-10 mb-5">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-border/60">
        <div className="container mx-auto px-4 max-w-6xl">
          <SectionHeading
            eyebrow="Process"
            title="How it works"
            description="Get started in three simple steps."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
            <div className="hidden md:block absolute top-5 left-[16%] right-[16%] h-px bg-border" />
            {howItWorksData.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className="icon-ring h-10 w-10 relative z-10 bg-card">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="font-data text-xs text-muted-foreground">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="font-display font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <SectionHeading
            eyebrow="Testimonials"
            title="Trusted by bank customers"
            description="Personalized wealth advisory at scale."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonialsData.map((testimonial, index) => (
              <div
                key={index}
                className="surface rounded-lg p-6 border-l-2 border-l-primary"
              >
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={36}
                    height={36}
                    className="rounded-full ring-1 ring-border"
                  />
                  <div>
                    <p className="font-medium text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
