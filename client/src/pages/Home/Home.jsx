import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Banner from "./Banner/Banner.jsx";
import Features from "./Features/Features.jsx";
import TopDeliveryMen from "./TopDeliveryMen/TopDeliveryMen.jsx";

const Home = () => {
  return (
    <>
      <Helmet>
        <title>ExpressLane — Parcel delivery, simplified</title>
      </Helmet>
      <Banner />
      <Features />
      <TopDeliveryMen />
      <section className="container py-16 sm:py-24">
        <div className="flex flex-col items-center gap-6 rounded-2xl border bg-card px-6 py-12 text-center shadow-soft sm:px-12">
          <h2 className="max-w-2xl text-balance text-3xl font-bold sm:text-4xl">
            Ready to send your first parcel?
          </h2>
          <p className="max-w-xl text-muted-foreground">
            Create a free account and book a pickup in under a minute.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link to="/signup">
                Create free account <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/contact">Talk to us</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
