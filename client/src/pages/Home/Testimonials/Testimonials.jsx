import { useQuery } from "@tanstack/react-query";
import { Quote, Star } from "lucide-react";
import { axiosPublic } from "@/api/axiosPublic.js";
import Reveal from "@/components/Shared/Reveal.jsx";
import SectionHeading from "@/components/Shared/SectionHeading.jsx";
import UserAvatar from "@/components/Shared/UserAvatar.jsx";

// Shows the best real customer reviews; the section hides itself when there are none
const Testimonials = () => {
  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews"],
    queryFn: async () => (await axiosPublic.get("/reviews")).data,
  });

  const featured = reviews
    .filter((r) => r.feedback?.trim().length > 20 && Number(r.rating) >= 4)
    .sort((a, b) => Number(b.rating) - Number(a.rating) || new Date(b.reviewDate) - new Date(a.reviewDate))
    .slice(0, 3);

  if (featured.length === 0) return null;

  return (
    <section id="reviews" className="container py-16 sm:py-24">
      <Reveal>
        <SectionHeading eyebrow="Reviews" title="Loved by the people we deliver to" />
      </Reveal>
      <div className="grid gap-6 md:grid-cols-3">
        {featured.map((review, i) => (
          <Reveal key={review._id} delay={i * 100}>
            <figure className="flex h-full flex-col rounded-2xl border bg-card p-6 shadow-soft">
              <Quote className="h-8 w-8 text-primary/30" aria-hidden="true" />
              <div className="mt-3 flex gap-0.5" aria-label={`${review.rating} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    className={s < Math.round(review.rating) ? "h-4 w-4 fill-warning text-warning" : "h-4 w-4 text-border"}
                  />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-pretty">“{review.feedback.trim()}”</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <UserAvatar src={review.reviewerImage} name={review.reviewerName} email={review.reviewerEmail} className="h-9 w-9" />
                <div>
                  <p className="text-sm font-semibold">{review.reviewerName || "Verified customer"}</p>
                  <p className="text-xs text-muted-foreground">Verified delivery</p>
                </div>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
