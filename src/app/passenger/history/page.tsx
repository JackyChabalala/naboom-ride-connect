"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { History, Star } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { getPassengerSession, type PassengerSession } from "@/lib/auth";
import { getRouteLabel, formatPrice } from "@/lib/pricing";

type RideItem = {
  id: string;
  route: string;
  price: number;
  pickupPoint: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
  rating: { stars: number; comment: string | null } | null;
  driver: { name: string } | null;
};

export default function PassengerHistoryPage() {
  const router = useRouter();
  const [session, setSession] = useState<PassengerSession | null>(null);
  const [rides, setRides] = useState<RideItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = getPassengerSession();
    if (!s) {
      router.replace("/passenger/login");
      return;
    }
    setSession(s);

    fetch(`/api/rides?passengerId=${s.id}`)
      .then((r) => r.json())
      .then((data) => setRides(data))
      .finally(() => setLoading(false));
  }, [router]);

  if (!session) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-grey">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream pb-10">
      <div className="mx-auto max-w-lg px-6 pt-8">
        <PageHeader
          title="Ride history"
          subtitle="Your past trips and ratings"
          backHref="/passenger/home"
        />

        {loading ? (
          <p className="text-grey text-center py-12 font-inter">Loading…</p>
        ) : rides.length === 0 ? (
          <Card>
            <EmptyState
              icon={History}
              color="teal"
              message="No rides yet — request your first trip from the home screen and it'll show up here."
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {rides.map((ride) => (
              <Link key={ride.id} href={`/passenger/ride/${ride.id}`}>
                <Card lift className="p-5 mb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={ride.status} />
                      </div>
                      <h3 className="font-poppins font-semibold text-ink">
                        {getRouteLabel(ride.route)}
                      </h3>
                      <p className="text-sm text-grey font-inter mt-0.5">
                        {new Date(ride.createdAt).toLocaleDateString("en-ZA", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                        {ride.driver ? ` · ${ride.driver.name}` : ""}
                      </p>
                      {ride.rating && (
                        <p className="mt-1.5 flex items-center gap-1 text-sm font-medium text-ink">
                          <Star className="h-3.5 w-3.5 fill-yellow text-yellow" />
                          {ride.rating.stars}/5
                        </p>
                      )}
                    </div>
                    <p className="font-poppins text-xl font-bold text-teal shrink-0">
                      {formatPrice(ride.price)}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
