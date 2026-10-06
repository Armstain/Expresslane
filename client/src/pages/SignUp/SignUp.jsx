import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Camera, Eye, EyeOff, Loader2 } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { imageUpload } from "../../api/utils";
import AuthLayout, { GoogleIcon, OrDivider } from "@/components/Shared/AuthLayout.jsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SignUp = () => {
  const navigate = useNavigate();
  const { createUser, signInWithGoogle, updateUserProfile, loading, setLoading, saveUser } = useAuth();
  const [preview, setPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value.trim();
    const email = form.email.value;
    const phone = form.phone.value;
    const password = form.password.value;
    const image = form.image.files[0];

    if (password.length < 6) return toast.error("Password must be at least 6 characters.");

    setSubmitting(true);
    try {
      const image_url = image ? await imageUpload(image) : null;
      await createUser(email, password);
      await updateUserProfile(name, image_url);
      await saveUser({
        displayName: name,
        email,
        phoneNumber: phone,
        photoURL: image_url,
      });
      navigate("/dashboard");
      toast.success("Account created — welcome to ExpressLane!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigate("/dashboard");
      toast.success("Welcome to ExpressLane!");
    } catch (err) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  const busy = submitting || loading;

  return (
    <AuthLayout title="Create your account" description="Start sending parcels in minutes." pageTitle="Sign up">
      <Button type="button" variant="outline" size="lg" className="w-full" disabled={busy} onClick={handleGoogleSignIn}>
        <GoogleIcon /> Sign up with Google
      </Button>

      <OrDivider label="or with email" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-4">
          <label
            htmlFor="image"
            className="relative flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed bg-secondary text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            {preview ? (
              <img src={preview} alt="Selected profile" className="h-full w-full object-cover" />
            ) : (
              <Camera className="h-5 w-5" />
            )}
            <input id="image" name="image" type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
          </label>
          <div className="text-sm">
            <p className="font-medium">Profile photo</p>
            <p className="text-muted-foreground">Optional · JPG or PNG</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" autoComplete="name" placeholder="Jane Doe" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone number</Label>
          <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="01XXXXXXXXX" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 6 characters"
              minLength={6}
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
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default SignUp;
