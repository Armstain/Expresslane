import { useQuery } from "@tanstack/react-query";
import { Package, Star, Trophy } from "lucide-react";
import { axiosPublic } from "@/api/axiosPublic.js";
import UserAvatar from "@/components/Shared/UserAvatar.jsx";
import { Skeleton } from "@/components/ui/skeleton";
import Reveal from "@/components/Shared/Reveal.jsx";

const TopDeliveryMen = () => {
  // Ranked on the server; only public fields (name, photo, counts) come back
  const { data: topDeliveryMen = [], isLoading, isError } = useQuery({
    queryKey: ["top-delivery-men"],
    queryFn: async () => (await axiosPublic.get("/top-delivery-men")).data,
  });

  if (isError) return null;
  if (!isLoading && topDeliveryMen.length === 0) return null;

  return (
    <section className="border-t bg-card/50 py-16 sm:py-24">
      <div className="container">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Our team</p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Top delivery heroes</h2>
          <p className="mt-4 text-muted-foreground">
            The riders our customers rate highest, ranked by completed deliveries.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)
            : topDeliveryMen.map((man, i) => (
                <Reveal
                  as="article"
                  key={man._id}
                  delay={i * 100}
                  className="relative rounded-2xl border bg-card p-6 text-center shadow-soft hover:shadow-lift"
                >
                  {i === 0 && (
                    <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-1 text-xs font-semibold text-warning">
                      <Trophy className="h-3.5 w-3.5" /> #1
                    </span>
                  )}
                  <UserAvatar
                    src={man.photoURL}
                    name={man.displayName}
                    className="mx-auto h-20 w-20 ring-4 ring-accent"
                  />
                  <h3 className="mt-4 text-lg font-semibold">{man.displayName || "Delivery hero"}</h3>
                  <div className="mt-5 grid grid-cols-2 divide-x rounded-lg bg-secondary/70 py-3">
                    <div>
                      <p className="flex items-center justify-center gap-1.5 text-xl font-bold tabular-nums">
                        <Package className="h-4 w-4 text-primary" /> {man.numDeliveries}
                      </p>
                      <p className="text-xs text-muted-foreground">Deliveries</p>
                    </div>
                    <div>
                      <p className="flex items-center justify-center gap-1.5 text-xl font-bold tabular-nums">
                        <Star className="h-4 w-4 fill-warning text-warning" />
                        {man.averageRating ? man.averageRating.toFixed(1) : "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
                  </div>
                </Reveal>
              ))}
        </div>
      </div>
    </section>
  );
};

export default TopDeliveryMen;
