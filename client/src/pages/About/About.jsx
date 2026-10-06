import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, Eye, Heart, Leaf, Lightbulb, Rocket, Target, Timer, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATS = [
  { value: "50K+", label: "Parcels delivered" },
  { value: "100+", label: "Team members" },
  { value: "98%", label: "On-time rate" },
  { value: "64", label: "Districts covered" },
];

const VALUES = [
  { icon: Heart, title: "Customer first", description: "Every decision starts with the person waiting for their parcel." },
  { icon: Lightbulb, title: "Built on technology", description: "Smart routing and live tracking keep deliveries on schedule." },
  { icon: Timer, title: "Reliable & punctual", description: "We promise realistic dates, then keep them." },
  { icon: Leaf, title: "Responsible", description: "Optimised routes mean fewer kilometres and lower emissions." },
];

const About = () => {
  return (
    <>
      <Helmet>
        <title>About us | ExpressLane</title>
      </Helmet>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" aria-hidden="true" />
        <div className="container py-16 text-center sm:py-24">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">About ExpressLane</p>
          <h1 className="mx-auto mt-4 max-w-3xl text-balance text-4xl font-extrabold sm:text-5xl">
            Delivering excellence since 2020
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            We&apos;re building the most dependable way to send a parcel in Bangladesh, combining
            modern technology with a team that genuinely cares.
          </p>
        </div>
      </section>

      <section className="container">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border shadow-soft lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="bg-card p-6 text-center sm:p-8">
              <dd className="text-3xl font-extrabold tabular-nums text-primary sm:text-4xl">{stat.value}</dd>
              <dt className="mt-1 text-sm text-muted-foreground">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      <section className="container grid gap-6 py-16 sm:py-24 md:grid-cols-2">
        <div className="rounded-2xl border bg-card p-8 shadow-soft">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Target className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-bold">Our mission</h2>
          <p className="mt-3 text-muted-foreground">
            To provide fast, reliable and affordable delivery while holding ourselves to the highest
            standards of customer service and technological innovation.
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-8 shadow-soft">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Eye className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-bold">Our vision</h2>
          <p className="mt-3 text-muted-foreground">
            To become Bangladesh&apos;s most trusted and innovative logistics partner, setting new
            standards for the whole delivery industry.
          </p>
        </div>
      </section>

      <section className="border-y bg-card/50 py-16 sm:py-24">
        <div className="container">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">What drives us</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Our values</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-xl border bg-card p-6 shadow-soft">
                <Icon className="h-6 w-6 text-primary" />
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-16 sm:py-24">
        <div className="grid items-center gap-8 rounded-2xl bg-primary p-8 text-primary-foreground sm:p-12 md:grid-cols-[1fr_auto]">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold opacity-80">
              <Users className="h-4 w-4" /> We&apos;re hiring
            </div>
            <h2 className="text-2xl font-bold sm:text-3xl">Join our team</h2>
            <p className="mt-2 max-w-xl opacity-80">
              We&apos;re always looking for passionate riders, engineers and support specialists. If
              you&apos;re driven by excellence, we&apos;d love to hear from you.
            </p>
          </div>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/contact">
              <Rocket className="h-4 w-4" /> Get in touch <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
};

export default About;
