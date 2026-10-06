import PropTypes from "prop-types";
import { useQuery } from "@tanstack/react-query";
import CountUp from "react-countup";
import { Clock, Headphones, MapPinned, PackageCheck, ShieldCheck, Wallet } from "lucide-react";
import { axiosPublic } from "@/api/axiosPublic.js";
import { Skeleton } from "@/components/ui/skeleton";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Parcel safety",
    description: "Every package is handled with care, sealed, and tracked from pickup to doorstep.",
  },
  {
    icon: Clock,
    title: "Super fast delivery",
    description: "Express parcels arrive next day; regular parcels in about three.",
  },
  {
    icon: Headphones,
    title: "24/7 support",
    description: "Real people on call around the clock for questions, changes and claims.",
  },
  {
    icon: MapPinned,
    title: "Live tracking",
    description: "See exactly where your parcel is and when it will arrive.",
  },
  {
    icon: Wallet,
    title: "Simple pricing",
    description: "Flat rates by weight. No hidden fees, no surprises at checkout.",
  },
  {
    icon: PackageCheck,
    title: "Proof of delivery",
    description: "Every delivery is confirmed so you always know it reached the right hands.",
  },
];

const STEPS = [
  { title: "Book online", description: "Enter sender, recipient and parcel details. You see the price instantly." },
  { title: "We assign a rider", description: "A nearby delivery hero is assigned and picks up your parcel." },
  { title: "Delivered & reviewed", description: "Your parcel arrives, you pay securely and rate the delivery." },
];

const SectionHeading = ({ eyebrow, title, description }) => (
  <div className="mx-auto mb-12 max-w-2xl text-center">
    <p className="text-sm font-semibold uppercase tracking-wider text-primary">{eyebrow}</p>
    <h2 className="mt-3 text-balance text-3xl font-bold sm:text-4xl">{title}</h2>
    {description && <p className="mt-4 text-muted-foreground">{description}</p>}
  </div>
);

SectionHeading.propTypes = {
  eyebrow: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
};

const ImpactStats = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["statistics"],
    queryFn: async () => {
      const res = await axiosPublic.get("/statistics");
      return res.data;
    },
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
      <div className="overflow-hidden rounded-2xl bg-primary px-6 py-12 text-primary-foreground sm:px-12">
        <div className="mx-auto mb-10 max-w-xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Trusted every day</h2>
          <p className="mt-3 opacity-80">Numbers straight from our platform, updated live.</p>
        </div>
        <dl className="grid gap-8 text-center sm:grid-cols-3">
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
      </div>
    </section>
  );
};

const Features = () => {
  return (
    <>
      <section className="border-y bg-card/50 py-16 sm:py-24">
        <div className="container">
          <SectionHeading
            eyebrow="Why ExpressLane"
            title="Everything you need to ship with confidence"
            description="From the first click to the final signature, we take care of the details."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group rounded-xl border bg-card p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lift"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-16 sm:py-24">
        <SectionHeading eyebrow="How it works" title="Three steps to a delivered parcel" />
        <ol className="grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative rounded-xl border bg-card p-6 shadow-soft">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {i + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <ImpactStats />
    </>
  );
};

export default Features;
