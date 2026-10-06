import PropTypes from "prop-types";
import { Helmet } from "react-helmet-async";
import { CheckCircle2 } from "lucide-react";
import Logo, { LogoMark } from "@/components/Shared/Logo.jsx";
import ModeToggle from "@/components/ModeToggle/ModeToggle.jsx";

const HIGHLIGHTS = [
  "Book a pickup in under a minute",
  "Live status on every parcel",
  "Pay securely after delivery",
];

const AuthLayout = ({ title, description, pageTitle, children }) => (
  <div className="grid min-h-screen lg:grid-cols-2">
    <Helmet>
      <title>{`${pageTitle || title} | ExpressLane`}</title>
    </Helmet>

    {/* Brand panel */}
    <aside className="relative hidden overflow-hidden bg-primary p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
      <div
        className="absolute inset-0 opacity-20 [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:22px_22px]"
        aria-hidden="true"
      />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary-foreground/10 blur-3xl" aria-hidden="true" />
      <div className="relative flex items-center gap-2.5 text-lg font-extrabold">
        <LogoMark className="[&_rect]:fill-primary-foreground [&_path]:stroke-primary" />
        ExpressLane
      </div>
      <div className="relative max-w-md">
        <h2 className="text-4xl font-extrabold leading-tight">Ship it today. Track it every step.</h2>
        <ul className="mt-8 space-y-3">
          {HIGHLIGHTS.map((item) => (
            <li key={item} className="flex items-center gap-3 opacity-90">
              <CheckCircle2 className="h-5 w-5 shrink-0" /> {item}
            </li>
          ))}
        </ul>
      </div>
      <p className="relative text-sm opacity-70">&copy; {new Date().getFullYear()} ExpressLane</p>
    </aside>

    {/* Form panel */}
    <main className="flex flex-col px-4 py-6 sm:px-8">
      <div className="flex items-center justify-between">
        <Logo className="lg:invisible" />
        <ModeToggle />
      </div>
      <div className="flex flex-1 items-center justify-center py-10">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="mb-8 space-y-2">
            <h1 className="text-3xl font-bold">{title}</h1>
            {description && <p className="text-muted-foreground">{description}</p>}
          </div>
          {children}
        </div>
      </div>
    </main>
  </div>
);

AuthLayout.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  pageTitle: PropTypes.string,
  children: PropTypes.node,
};

export const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.4 14.6 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z" />
  </svg>
);

export const OrDivider = ({ label = "or" }) => (
  <div className="relative my-6">
    <div className="absolute inset-0 flex items-center" aria-hidden="true">
      <span className="w-full border-t" />
    </div>
    <p className="relative mx-auto w-fit bg-background px-3 text-xs uppercase tracking-wide text-muted-foreground">
      {label}
    </p>
  </div>
);

OrDivider.propTypes = { label: PropTypes.string };

export default AuthLayout;
