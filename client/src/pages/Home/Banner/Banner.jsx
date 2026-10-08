import { Link } from "react-router-dom";
import { ArrowRight, Check, MapPin, Package, ShieldCheck, Timer, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Booked", time: "09:12" },
  { label: "Picked up", time: "10:40" },
  { label: "On the way", time: "Now" },
  { label: "Delivered", time: "ETA 14:30" },
];
const CURRENT_STEP = 2;

// Illustrative tracking card shown beside the hero copy
const TrackingPreview = () => (
  <div className="relative mx-auto w-full max-w-md">
    <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-primary/20 blur-3xl" aria-hidden="true" />
    <div className="rounded-2xl border bg-card p-5 shadow-lift sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tracking ID</p>
          <p className="mt-1 font-mono text-sm font-semibold">EXL-2048-7731</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-info/10 px-2.5 py-1 text-xs font-semibold text-info">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-info opacity-60 motion-reduce:hidden" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-info" />
          </span>
          On the way
        </span>
      </div>

      <div className="mt-5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 rounded-xl bg-secondary/70 p-4 text-sm">
        <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-xs text-muted-foreground">From</p>
          <p className="font-medium">Gulshan, Dhaka</p>
        </div>
        <div className="ml-[7px] h-4 border-l-2 border-dashed border-muted-foreground/30" />
        <div />
        <MapPin className="mt-0.5 h-4 w-4 text-primary" />
        <div>
          <p className="text-xs text-muted-foreground">To</p>
          <p className="font-medium">Agrabad, Chattogram</p>
        </div>
      </div>

      <ol className="mt-5 space-y-3">
        {STEPS.map((step, i) => {
          const done = i < CURRENT_STEP;
          const active = i === CURRENT_STEP;
          return (
            <li key={step.label} className="flex items-center gap-3">
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && "border-primary bg-card text-primary ring-4 ring-primary/15",
                  !done && !active && "border-border bg-card text-muted-foreground"
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span className={cn("flex-1 text-sm", active ? "font-semibold" : done ? "" : "text-muted-foreground")}>
                {step.label}
              </span>
              <span className="text-xs tabular-nums text-muted-foreground">{step.time}</span>
            </li>
          );
        })}
      </ol>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-secondary">
        <div className="h-full w-2/3 origin-left animate-[grow_1.4s_ease-out_both] rounded-full bg-primary motion-reduce:animate-none" />
      </div>
    </div>

    <div className="absolute -bottom-10 -left-6 hidden items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-lift sm:flex">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10 text-success">
        <ShieldCheck className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-semibold">Insured & tracked</p>
        <p className="text-xs text-muted-foreground">Every parcel, every step</p>
      </div>
    </div>
  </div>
);

const Banner = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" aria-hidden="true" />
      <div className="absolute left-1/2 top-0 -z-10 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
      <div className="container grid items-center gap-14 py-16 sm:py-20 lg:grid-cols-2 lg:gap-10 lg:py-28">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Same-day delivery inside Dhaka
          </span>
          <h1 className="mt-6 text-balance text-4xl font-extrabold leading-[1.08] sm:text-5xl lg:text-6xl">
            Parcels delivered,{" "}
            <span className="text-primary">without the wait.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            Book a pickup in under a minute, follow your parcel at every step, and pay only when it
            arrives. Reliable delivery for people and businesses across Bangladesh.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link to="/dashboard/book-parcel">
                Book a parcel <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/dashboard/my-parcels">
                <Package className="h-4 w-4" /> Track my parcels
              </Link>
            </Button>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-primary" /> Next-day express
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" /> Pay on delivery
            </li>
            <li className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" /> Live status updates
            </li>
          </ul>
        </div>

        <div className="animate-fade-up [animation-delay:150ms]">
          <TrackingPreview />
        </div>
      </div>
    </section>
  );
};

export default Banner;
