import { Link } from "react-router-dom";
import { BsFacebook, BsInstagram, BsTwitterX } from "react-icons/bs";
import Logo from "@/components/Shared/Logo.jsx";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { to: "/dashboard/book-parcel", label: "Book a parcel" },
      { to: "/dashboard/my-parcels", label: "Track parcels" },
      { to: "/dashboard", label: "Dashboard" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About us" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Account",
    links: [
      { to: "/login", label: "Log in" },
      { to: "/signup", label: "Create account" },
    ],
  },
];

const SOCIALS = [
  { href: "https://facebook.com", label: "Facebook", icon: BsFacebook },
  { href: "https://instagram.com", label: "Instagram", icon: BsInstagram },
  { href: "https://x.com", label: "X (Twitter)", icon: BsTwitterX },
];

const Footer = () => {
  return (
    <footer className="border-t bg-card">
      <div className="container py-12">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div className="max-w-xs space-y-4">
            <Logo />
            <p className="text-sm text-muted-foreground">
              Fast, reliable parcel delivery across Bangladesh. Book in minutes, track every step.
            </p>
            <div className="flex gap-2">
              {SOCIALS.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} ExpressLane. All rights reserved.</p>
          <p>Made for people who can&apos;t wait.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
