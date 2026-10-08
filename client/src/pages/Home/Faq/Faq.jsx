import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import Reveal from "@/components/Shared/Reveal.jsx";
import SectionHeading from "@/components/Shared/SectionHeading.jsx";

const FAQS = [
  {
    q: "How is the price calculated?",
    a: "By weight only: up to 1 kg is $50, up to 2 kg is $100 and anything heavier is $150. The same price applies to Regular, Express and International.",
  },
  {
    q: "When do I pay?",
    a: "After your parcel is delivered. You'll see a Pay button on the parcel in your dashboard, and card payments are processed securely by Stripe.",
  },
  {
    q: "How long does delivery take?",
    a: "Express parcels arrive the day after your requested date, Regular parcels in about three days and International in about seven.",
  },
  {
    q: "Can I cancel a booking?",
    a: "Yes — any parcel that's still pending (before a rider is assigned) can be cancelled from My parcels at no cost.",
  },
  {
    q: "How do I become a delivery partner?",
    a: "Create an account and get in touch through the contact page. Once approved, your account is upgraded and you'll see your assigned deliveries.",
  },
];

const Faq = () => (
  <section id="faq" className="border-t bg-card/40 py-16 sm:py-24">
    <div className="container max-w-3xl">
      <Reveal>
        <SectionHeading eyebrow="FAQ" title="Questions, answered" />
      </Reveal>
      <Reveal className="divide-y rounded-2xl border bg-card shadow-soft">
        {FAQS.map(({ q, a }) => (
          <details key={q} className="group px-6 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-medium">
              {q}
              <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <p className="pb-5 text-sm text-muted-foreground">{a}</p>
          </details>
        ))}
      </Reveal>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Still have questions?{" "}
        <Link to="/contact" className="font-semibold text-primary hover:underline">
          Contact our team
        </Link>
      </p>
    </div>
  </section>
);

export default Faq;
