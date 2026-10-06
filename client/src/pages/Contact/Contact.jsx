import { useState } from "react";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import { Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const CONTACTS = [
  { icon: Mail, title: "Email us", lines: ["support@expresslane.com", "business@expresslane.com"] },
  { icon: Phone, title: "Call us", lines: ["+880 1234 567890", "+880 1987 654321"] },
  { icon: MapPin, title: "Visit us", lines: ["123 Express Lane", "Dhaka, Bangladesh"] },
  { icon: Clock, title: "Support hours", lines: ["Open 24 hours, 7 days a week"] },
];

const Contact = () => {
  const [sending, setSending] = useState(false);

  // No contact endpoint exists yet, so confirm receipt locally
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    toast.success("Thanks! We'll get back to you within one business day.");
    e.target.reset();
    setSending(false);
  };

  return (
    <>
      <Helmet>
        <title>Contact us | ExpressLane</title>
      </Helmet>

      <section className="container py-16 sm:py-24">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Contact</p>
          <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl">Get in touch</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Questions about a delivery, pricing or a partnership? Send us a message and we&apos;ll
            respond as soon as possible.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.4fr_1fr]">
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-2xl border bg-card p-6 shadow-soft sm:p-8"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Your name</Label>
                <Input id="name" name="name" autoComplete="name" placeholder="Jane Doe" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" name="subject" placeholder="How can we help?" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" name="message" rows={6} placeholder="Tell us a bit more…" required />
            </div>
            <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={sending}>
              <Send className="h-4 w-4" /> {sending ? "Sending…" : "Send message"}
            </Button>
          </form>

          <ul className="space-y-4">
            {CONTACTS.map(({ icon: Icon, title, lines }) => (
              <li key={title} className="flex gap-4 rounded-2xl border bg-card p-5 shadow-soft">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold">{title}</h2>
                  {lines.map((line) => (
                    <p key={line} className="text-sm text-muted-foreground">
                      {line}
                    </p>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
};

export default Contact;
