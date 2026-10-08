import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import AuthLayout, { GoogleIcon, OrDivider } from "@/components/Shared/AuthLayout.jsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DEMO_ADMIN = { email: "admin@abc.com", password: "123456" };

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location?.state || "/dashboard";
  const { signInWithGoogle, signIn, loading, setLoading, resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signIn(email, password);
      navigate(from, { replace: true });
      toast.success("Welcome back!");
    } catch (err) {
      toast.error(err.code === "auth/invalid-credential" ? "Incorrect email or password." : err.message);
      setLoading(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) return toast.error("Enter your email first, then click “Forgot password”.");
    try {
      await resetPassword(email);
      toast.success("Password reset email sent. Check your inbox.");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigate(from, { replace: true });
      toast.success("Welcome back!");
    } catch (err) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  const busy = submitting || loading;

  return (
    <AuthLayout title="Welcome back" description="Log in to manage your parcels and deliveries." pageTitle="Log in">
      <Button type="button" variant="outline" size="lg" className="w-full" disabled={busy} onClick={handleGoogleSignIn}>
        <GoogleIcon /> Continue with Google
      </Button>

      <OrDivider label="or with email" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <button
              type="button"
              onClick={handleResetPassword}
              className="text-xs font-medium text-primary hover:underline"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log in"}
        </Button>
      </form>

      <div className="mt-6 flex items-start gap-3 rounded-lg border border-dashed bg-secondary/50 p-3 text-sm">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div className="flex-1">
          <p className="font-medium">Exploring the demo?</p>
          <p className="text-xs text-muted-foreground">Sign in as an admin to see every dashboard.</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 text-primary"
          onClick={() => {
            setEmail(DEMO_ADMIN.email);
            setPassword(DEMO_ADMIN.password);
          }}
        >
          Fill in
        </Button>
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link to="/signup" className="font-semibold text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
