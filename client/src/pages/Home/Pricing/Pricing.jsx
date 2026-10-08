import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import Reveal from "@/components/Shared/Reveal.jsx";
import SectionHeading from "@/components/Shared/SectionHeading.jsx";
import { Button } from "@/components/ui/button";
import { calculatePrice, formatPrice } from "@/lib/parcel.js";
import { cn } from "@/lib/utils";

// Tiers mirror calculatePrice so the landing page never drifts from checkout
const TIERS = [
  { name: "Light", weight: "Up to 1 kg", price: calculatePrice(1), blurb: "Documents, accessories and small gifts." },
  { name: "Standard", weight: "Up to 2 kg", price: calculatePrice(2), blurb: "Clothing, books and everyday shopping.", featured: true },
  { name: "Heavy", weight: "Over 2 kg", price: calculatePrice(3), blurb: "Electronics, bulk orders and bigger boxes." },
];

const INCLUDED = [
  "Regular, Express or International",
  "Live status tracking",
  "Pay after delivery",
  "Rate your rider",
];

const Pricing = () => (
  <section id="pricing" className="container py-16 sm:py-24">
    <Reveal>
      <SectionHeading
        eyebrow="Pricing"
        title="Simple, flat pricing"
        description="One price per weight band. No fuel surcharges, no hidden fees — and you only pay once it's delivered."
      />
    </Reveal>
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-3">
      {TIERS.map((tier, i) => (
        <Reveal key={tier.name} delay={i * 100}>
          <div
            className={cn(
              "relative flex h-full flex-col rounded-2xl border bg-card p-6 shadow-soft sm:p-8",
              tier.featured && "border-primary shadow-lift ring-1 ring-primary"
            )}
          >
            {tier.featured && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                Most popular
              </span>
            )}
            <h3 className="text-lg font-semibold">{tier.name}</h3>
            <p className="text-sm text-muted-foreground">{tier.weight}</p>
            <p className="mt-6 flex items-baseline gap-1">
              <span className="text-5xl font-extrabold tracking-tight">{formatPrice(tier.price)}</span>
              <span className="text-sm text-muted-foreground">/ parcel</span>
            </p>
            <p className="mt-3 text-sm text-muted-foreground">{tier.blurb}</p>
            <ul className="mt-6 space-y-3 text-sm">
              {INCLUDED.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0 text-primary" /> {item}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-8 w-full" variant={tier.featured ? "default" : "outline"}>
              <Link to="/dashboard/book-parcel">Book a parcel</Link>
            </Button>
          </div>
        </Reveal>
      ))}
    </div>
  </section>
);

export default Pricing;
