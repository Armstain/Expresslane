import PropTypes from "prop-types";
import { useQuery } from "@tanstack/react-query";
import CountUp from "react-countup";
import { Check, CreditCard, Headphones, Lock, PackageCheck, ShieldCheck, Star, Timer, Truck } from "lucide-react";
import { axiosPublic } from "@/api/axiosPublic.js";
import Reveal from "@/components/Shared/Reveal.jsx";
import SectionHeading from "@/components/Shared/SectionHeading.jsx";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const TRACK_STEPS = ["Booked", "Picked up", "On the way", "Delivered"];

const EXTRAS = [
  { icon: ShieldCheck, title: "Handled with care", description: "Sealed and checked at every hand-off." },
  { icon: Headphones, title: "24/7 support", description: "Real people, around the clock." },
  { icon: PackageCheck, title: "Proof of delivery", description: "Every drop-off is confirmed." },
];

const STEPS = [
  { title: "Book online", description: "Enter sender, recipient and parcel details. The price appears instantly." },
  { title: "We assign a rider", description: "A nearby delivery partner is assigned and collects your parcel." },
  { title: "Delivered & rated", description: "Your parcel arrives, you pay securely and rate the delivery." },
];

const BentoCard = ({ className, children }) => (
  <div
    className={cn(
      "group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-soft transition-shadow hover:shadow-lift sm:p-8",
      className
    )}
  >
    {children}
  </div>
);

BentoCard.propTypes = { className: PropTypes.string, children: PropTypes.node };

const ImpactStats = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["statistics"],
    queryFn: async () => (await axiosPublic.get("/statistics")).data,
  });

  // Stats are a nice-to-have; hide the band rather than show an error on the landing page
  if (isError) return null;

  const stats = [
    { label: "Parcels booked", value: data?.totalBooked },
    { label: "Parcels delivered", value: data?.totalDelivered },
    { label: "Happy customers", value: data?.totalUsers },
  ];

  return (
    <section className="container py-16 sm:py-20">
      <Reveal className="relative overflow-hidden rounded-3xl bg-primary px-6 py-14 text-primary-foreground sm:px-12">
        <div
          className="absolute inset-0 opacity-15 [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:22px_22px]"
          aria-hidden="true"
        />
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary-foreground/10 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto mb-10 max-w-xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Trusted every day</h2>
          <p className="mt-3 opacity-80">Numbers straight from the platform, updated live.</p>
        </div>
        <dl className="relative grid gap-10 text-center sm:grid-cols-3 sm:gap-6">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dd className="text-4xl font-extrabold tabular-nums sm:text-5xl">
                {isLoading ? (
                  <Skeleton className="mx-auto h-12 w-24 bg-primary-foreground/20" />
                ) : (
                  <CountUp end={stat.value ?? 0} duration={2} separator="," enableScrollSpy scrollSpyOnce />
                )}
              </dd>
              <dt className="mt-2 text-sm font-medium opacity-80">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  );
};

const Features = () => {
  return (
    <>
      <section id="features" className="border-y bg-card/40 py-16 sm:py-24">
        <div className="container">
          <Reveal>
            <SectionHeading
              eyebrow="Why ExpressLane"
              title="Everything you need to ship with confidence"
              description="From the first click to the final signature, we take care of the details."
            />
          </Reveal>

          <div className="grid gap-4 lg:grid-cols-3">
            {/* Live tracking */}
            <Reveal className="lg:col-span-2">
              <BentoCard className="h-full">
                <Truck className="h-6 w-6 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">Live tracking, every step</h3>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Know when your parcel is booked, picked up, on the way and delivered — without
                  calling anyone.
                </p>
                <ol className="mt-8 grid grid-cols-4 gap-2">
                  {TRACK_STEPS.map((step, i) => (
                    <li key={step} className="space-y-2">
                      <div className={cn("h-1.5 rounded-full", i < 3 ? "bg-primary" : "bg-secondary")}>
                        {i === 2 && <div className="h-full w-full animate-pulse rounded-full bg-primary" />}
                      </div>
                      <p className={cn("text-xs font-medium", i < 3 ? "text-foreground" : "text-muted-foreground")}>
                        {step}
                      </p>
                    </li>
                  ))}
                </ol>
              </BentoCard>
            </Reveal>

            {/* Express */}
            <Reveal delay={100}>
              <BentoCard className="flex h-full flex-col">
                <Timer className="h-6 w-6 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">Next-day express</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Choose Express and it arrives the next day. Regular takes about three.
                </p>
                <p className="mt-auto pt-6 text-5xl font-extrabold tracking-tight text-primary">
                  24<span className="text-2xl">h</span>
                </p>
              </BentoCard>
            </Reveal>

            {/* Pay after delivery */}
            <Reveal delay={100}>
              <BentoCard className="h-full">
                <CreditCard className="h-6 w-6 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">Pay after delivery</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  No upfront charges. Pay by card once your parcel has arrived.
                </p>
                <div className="mt-6 flex items-center gap-3 rounded-xl border bg-background/60 p-3 text-sm">
                  <div className="flex h-8 w-11 items-center justify-center rounded-md bg-foreground text-[10px] font-bold text-background">
                    VISA
                  </div>
                  <span className="font-mono text-muted-foreground">•••• 4242</span>
                  <Lock className="ml-auto h-4 w-4 text-success" />
                </div>
              </BentoCard>
            </Reveal>

            {/* Ratings */}
            <Reveal delay={200} className="lg:col-span-2">
              <BentoCard className="h-full">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <Star className="h-6 w-6 text-primary" />
                    <h3 className="mt-4 text-xl font-semibold">Riders you can rate</h3>
                    <p className="mt-2 max-w-md text-sm text-muted-foreground">
                      Every delivery can be reviewed, so the best riders rise to the top and you
                      always know who&apos;s bringing your parcel.
                    </p>
                  </div>
                  <div className="flex items-center gap-1" aria-label="Five star rating">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-6 w-6 fill-warning text-warning" />
                    ))}
                  </div>
                </div>
              </BentoCard>
            </Reveal>
          </div>

          <Reveal className="mt-10 grid gap-6 sm:grid-cols-3">
            {EXTRAS.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Icon className="h-[18px] w-[18px]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{title}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section id="how-it-works" className="container py-16 sm:py-24">
        <Reveal>
          <SectionHeading eyebrow="How it works" title="Three steps to a delivered parcel" />
        </Reveal>
        <div className="relative">
          <div
            className="absolute left-[16.66%] right-[16.66%] top-5 hidden border-t-2 border-dashed border-border md:block"
            aria-hidden="true"
          />
          <ol className="relative grid gap-8 md:grid-cols-3 md:gap-6">
          {STEPS.map((step, i) => (
            <Reveal as="li" key={step.title} delay={i * 120} className="relative text-center">
              <span className="relative mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground ring-8 ring-background">
                {i === STEPS.length - 1 ? <Check className="h-5 w-5" /> : i + 1}
              </span>
              <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">{step.description}</p>
            </Reveal>
          ))}
          </ol>
        </div>
      </section>

      <ImpactStats />
    </>
  );
};

export default Features;
