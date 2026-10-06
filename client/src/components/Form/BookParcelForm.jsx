import { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, Loader2, MapPin, Package, Scale, UserRound } from "lucide-react";
import useAuth from "@/hooks/useAuth.jsx";
import useAxiosSecure from "@/hooks/useAxiosSecure.jsx";
import { calculateApproximateDeliveryDate } from "@/api/utils/dateUtils.js";
import { PARCEL_TYPES, calculatePrice, formatPrice } from "@/lib/parcel.js";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button.jsx";
import { Card } from "../ui/card.jsx";
import { Input } from "../ui/input.jsx";
import { Label } from "../ui/label.jsx";

const Section = ({ icon: Icon, title, description, children }) => (
  <Card className="p-5 sm:p-6">
    <div className="mb-5 flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <div>
        <h2 className="font-semibold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
    </div>
    {children}
  </Card>
);

Section.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string,
  description: PropTypes.string,
  children: PropTypes.node,
};

const Field = ({ label, htmlFor, hint, children, className }) => (
  <div className={cn("space-y-2", className)}>
    <Label htmlFor={htmlFor}>{label}</Label>
    {children}
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

Field.propTypes = {
  label: PropTypes.string,
  htmlFor: PropTypes.string,
  hint: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string,
};

const today = () => new Date().toISOString().split("T")[0];

const BookParcelForm = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [parcelType, setParcelType] = useState("Regular");
  const [weight, setWeight] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");

  const price = calculatePrice(weight);
  const eta = deliveryDate ? calculateApproximateDeliveryDate(parcelType, deliveryDate) : null;

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (parcel) => {
      const { data } = await axiosSecure.post(`/parcel`, parcel);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-parcel"] });
      toast.success("Parcel booked! We'll assign a rider shortly.");
      navigate("/dashboard/my-parcels");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.target;
    const latitude = form.latitude.value;
    const longitude = form.longitude.value;

    await mutateAsync({
      name: user?.displayName || "",
      email: user?.email,
      phoneNumber: form.phoneNumber.value,
      parcelType,
      parcelWeight: weight,
      recipientName: form.recipientName.value,
      recipientPhoneNumber: form.recipientPhoneNumber.value,
      recipientAddress: form.recipientAddress.value,
      deliveryDate,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      price,
      status: "pending",
      createdDate: new Date(),
    }).catch(() => {});
  };

  return (
    <form onSubmit={handleSubmit} className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <Section icon={UserRound} title="Sender" description="Pickup contact for the rider.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" htmlFor="name">
              <Input id="name" value={user?.displayName || ""} readOnly className="bg-muted" />
            </Field>
            <Field label="Email" htmlFor="email">
              <Input id="email" value={user?.email || ""} readOnly className="bg-muted" />
            </Field>
            <Field label="Phone number" htmlFor="phoneNumber" className="sm:col-span-2">
              <Input id="phoneNumber" name="phoneNumber" type="tel" autoComplete="tel" placeholder="01XXXXXXXXX" required />
            </Field>
          </div>
        </Section>

        <Section icon={MapPin} title="Recipient" description="Where the parcel is going.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Recipient name" htmlFor="recipientName">
              <Input id="recipientName" name="recipientName" placeholder="Full name" required />
            </Field>
            <Field label="Recipient phone" htmlFor="recipientPhoneNumber">
              <Input id="recipientPhoneNumber" name="recipientPhoneNumber" type="tel" placeholder="01XXXXXXXXX" required />
            </Field>
            <Field label="Delivery address" htmlFor="recipientAddress" className="sm:col-span-2">
              <Input id="recipientAddress" name="recipientAddress" placeholder="House, road, area, city" required />
            </Field>
            <Field label="Latitude" htmlFor="latitude" hint="Optional — helps the rider find the address.">
              <Input id="latitude" name="latitude" type="number" step="any" min="-90" max="90" placeholder="23.8103" />
            </Field>
            <Field label="Longitude" htmlFor="longitude">
              <Input id="longitude" name="longitude" type="number" step="any" min="-180" max="180" placeholder="90.4125" />
            </Field>
          </div>
        </Section>

        <Section icon={Package} title="Parcel" description="Choose a service and enter the weight.">
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Service</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {PARCEL_TYPES.map((type) => (
                <label
                  key={type.value}
                  className={cn(
                    "cursor-pointer rounded-lg border p-4 transition-colors hover:border-primary/50",
                    parcelType === type.value && "border-primary bg-accent ring-1 ring-primary"
                  )}
                >
                  <input
                    type="radio"
                    name="parcelType"
                    value={type.value}
                    checked={parcelType === type.value}
                    onChange={() => setParcelType(type.value)}
                    className="sr-only"
                  />
                  <span className="block text-sm font-semibold">{type.label}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{type.description}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Weight (kg)" htmlFor="parcelWeight" hint="Up to 1kg $50 · up to 2kg $100 · heavier $150">
              <Input
                id="parcelWeight"
                type="number"
                min="0.1"
                step="0.1"
                placeholder="1.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
              />
            </Field>
            <Field label="Requested pickup date" htmlFor="deliveryDate">
              <Input
                id="deliveryDate"
                type="date"
                min={today()}
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                required
              />
            </Field>
          </div>
        </Section>
      </div>

      {/* Summary */}
      <Card className="p-5 sm:p-6 lg:sticky lg:top-24">
        <h2 className="font-semibold">Order summary</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="flex items-center gap-2 text-muted-foreground"><Package className="h-4 w-4" /> Service</dt>
            <dd className="font-medium">{parcelType}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="flex items-center gap-2 text-muted-foreground"><Scale className="h-4 w-4" /> Weight</dt>
            <dd className="font-medium tabular-nums">{weight ? `${weight} kg` : "—"}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="flex items-center gap-2 text-muted-foreground"><CalendarClock className="h-4 w-4" /> Est. arrival</dt>
            <dd className="font-medium tabular-nums">{eta || "—"}</dd>
          </div>
        </dl>
        <div className="my-5 border-t" />
        <div className="flex items-end justify-between">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="text-3xl font-bold tabular-nums">{weight ? formatPrice(price) : "—"}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">You pay after your parcel is delivered.</p>
        <Button type="submit" size="lg" className="mt-5 w-full" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />} Book parcel
        </Button>
      </Card>
    </form>
  );
};

export default BookParcelForm;
