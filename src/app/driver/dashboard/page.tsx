"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Car,
  Clock,
  LogOut,
  MapPin,
  Star,
  CheckCircle2,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { IconBadge } from "@/components/icon-badge";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import {
  getDriverSession,
  clearDriverSession,
  type DriverSession,
} from "@/lib/auth";
import { getRouteLabel, formatPrice } from "@/lib/pricing";
import { usePolling } from "@/hooks/use-polling";
import { toast } from "@/hooks/use-toast";

type DriverProfile = {
  id: string;
  name: string;
  phone: string;
  status: string;
  available: boolean;
  vehicleDesc: string;
  stats: {
    completedRides: number;
    avgRating: number | null;
    acceptanceRate: number;
    totalRides: number;
  };
};

type RideRequest = {
  id: string;
  route: string;
  price: number;
  pickupPoint: string;
  status: string;
  passenger: { name: string; phone: string };
};

export default function DriverDashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<DriverSession | null>(null);
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [activeRide, setActiveRide] = useState<RideRequest | null>(null);
  const [requested, setRequested] = useState<RideRequest[]>([]);
  const [statusKey, setStatusKey] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const s = getDriverSession();
    if (!s) {
      router.replace("/driver/login");
      return;
    }
    setSession(s);
  }, [router]);

  const fetchProfile = useCallback(async () => {
    if (!session) return;
    try {
      const res = await fetch(`/api/driver/auth?id=${session.id}`);
      if (!res.ok) return;
      const data = await res.json();
      setProfile(data);
    } catch {
      /* ignore */
    }
  }, [session]);

  const fetchRides = useCallback(async () => {
    if (!session) return;
    try {
      const res = await fetch(`/api/driver/rides?driverId=${session.id}`);
      if (!res.ok) return;
      const data = await res.json();
      setActiveRide((prev) => {
        if (prev && data.activeRide && prev.status !== data.activeRide.status) {
          setStatusKey((k) => k + 1);
        }
        return data.activeRide;
      });
      setRequested(data.requested || []);
    } catch {
      /* ignore */
    }
  }, [session]);

  useEffect(() => {
    if (session) fetchProfile();
  }, [session, fetchProfile]);

  const shouldPoll =
    !!session &&
    !!profile &&
    profile.status === "APPROVED" &&
    (profile.available || !!activeRide);

  usePolling(
    async () => {
      await fetchRides();
      await fetchProfile();
    },
    3500,
    shouldPoll
  );

  async function toggleAvailability(available: boolean) {
    if (!session) return;
    try {
      const res = await fetch("/api/driver/availability", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId: session.id, available }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProfile((p) => (p ? { ...p, available: data.available } : p));
      if (available) fetchRides();
    } catch (err) {
      toast({
        title: "Could not update availability",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  }

  async function acceptRide(rideId: string) {
    if (!session) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/driver/rides/${rideId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId: session.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: "Ride accepted!" });
      setStatusKey((k) => k + 1);
      await fetchRides();
      await fetchProfile();
    } catch (err) {
      toast({
        title: "Could not accept ride",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  }

  async function updateStatus(status: "IN_PROGRESS" | "COMPLETED") {
    if (!session || !activeRide) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/driver/rides/${activeRide.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId: session.id, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({
        title: status === "IN_PROGRESS" ? "Ride started" : "Ride completed!",
      });
      setStatusKey((k) => k + 1);
      await fetchRides();
      await fetchProfile();
    } catch (err) {
      toast({
        title: "Could not update ride",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  }

  function handleLogout() {
    clearDriverSession();
    router.push("/");
  }

  if (!session || !profile) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-teal animate-spin" />
      </main>
    );
  }

  if (profile.status === "PENDING") {
    return (
      <main className="min-h-screen bg-cream">
        <div className="mx-auto max-w-lg px-6 pt-12">
          <div className="flex justify-between mb-6">
            <Link href="/" className="text-teal text-sm font-medium">
              ← Home
            </Link>
            <button onClick={handleLogout} className="text-grey hover:text-ink">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
          <Card className="p-8 text-center">
            <IconBadge icon={Clock} color="orange" size="lg" className="mx-auto mb-5" />
            <h1 className="font-poppins text-2xl font-bold text-ink">
              Application under review
            </h1>
            <p className="mt-3 text-grey font-inter leading-relaxed text-sm">
              Thanks, {profile.name}. An admin is checking your documents.
              You&apos;ll be able to go available once you&apos;re approved.
            </p>
            <StatusBadge status="PENDING" className="mt-5" />
          </Card>
        </div>
      </main>
    );
  }

  if (profile.status === "REJECTED" || profile.status === "SUSPENDED") {
    return (
      <main className="min-h-screen bg-cream">
        <div className="mx-auto max-w-lg px-6 pt-12">
          <Card className="p-8 text-center">
            <IconBadge icon={Car} color="coral" size="lg" className="mx-auto mb-5" />
            <h1 className="font-poppins text-2xl font-bold text-ink">
              Account {profile.status.toLowerCase()}
            </h1>
            <p className="mt-3 text-grey font-inter text-sm leading-relaxed">
              Please contact an admin if you believe this is a mistake.
            </p>
            <Button variant="secondary" className="mt-6" onClick={handleLogout}>
              Back to home
            </Button>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream pb-10">
      <div className="bg-teal px-6 pt-8 pb-14 rounded-b-[2rem]">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="text-cream/70 hover:text-white text-sm">
              ← Home
            </Link>
            <button
              onClick={handleLogout}
              className="text-cream/80 hover:text-white"
              aria-label="Log out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
          <PageHeader
            title={profile.name}
            subtitle={profile.vehicleDesc}
            light
            className="mb-0"
          />
        </div>
      </div>

      <div className="mx-auto max-w-lg px-6 -mt-8 space-y-4">
        {/* Availability toggle */}
        {!activeRide && (
          <Card className="p-5 md:p-6 flex items-center justify-between gap-4">
            <div>
              <p className="font-poppins font-semibold text-ink">
                {profile.available ? "You're available" : "You're offline"}
              </p>
              <p className="text-sm text-grey font-inter mt-0.5">
                {profile.available
                  ? "New requests will appear below"
                  : "Toggle on to receive ride requests"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="avail" className="sr-only">
                Available
              </Label>
              <Switch
                id="avail"
                checked={profile.available}
                onCheckedChange={toggleAvailability}
              />
            </div>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              icon: CheckCircle2,
              color: "teal" as const,
              value: profile.stats.completedRides,
              label: "Completed",
            },
            {
              icon: Star,
              color: "yellow" as const,
              value: profile.stats.avgRating ?? "—",
              label: "Avg rating",
            },
            {
              icon: TrendingUp,
              color: "orange" as const,
              value: `${profile.stats.acceptanceRate}%`,
              label: "Accept rate",
            },
          ].map((stat) => (
            <Card key={stat.label} className="p-4 text-center">
              <IconBadge
                icon={stat.icon}
                color={stat.color}
                size="sm"
                className="mx-auto mb-2"
              />
              <p className="font-poppins text-xl font-bold text-ink">{stat.value}</p>
              <p className="text-xs text-grey font-inter mt-0.5">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Active ride */}
        {activeRide && (
          <Card key={statusKey} className="p-5 md:p-6 animate-fade-slide space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-poppins text-lg font-semibold">Active ride</h2>
              <StatusBadge status={activeRide.status} />
            </div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-poppins font-semibold text-ink">
                  {getRouteLabel(activeRide.route)}
                </p>
                <p className="text-sm text-grey font-inter mt-1 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {activeRide.pickupPoint}
                </p>
                <p className="text-sm text-ink font-inter mt-1">
                  Passenger: {activeRide.passenger.name}
                </p>
              </div>
              <p className="font-poppins text-3xl font-bold text-teal">
                {formatPrice(activeRide.price)}
              </p>
            </div>
            {activeRide.status === "ACCEPTED" && (
              <Button
                className="w-full"
                size="lg"
                onClick={() => updateStatus("IN_PROGRESS")}
                disabled={actionLoading}
              >
                Start Ride
              </Button>
            )}
            {activeRide.status === "IN_PROGRESS" && (
              <Button
                className="w-full"
                size="lg"
                variant="orange"
                onClick={() => updateStatus("COMPLETED")}
                disabled={actionLoading}
              >
                Complete Ride
              </Button>
            )}
          </Card>
        )}

        {/* Incoming requests */}
        {profile.available && !activeRide && (
          <div>
            <h2 className="font-poppins text-lg font-semibold text-ink mb-3">
              Nearby requests
            </h2>
            {requested.length === 0 ? (
              <Card>
                <EmptyState
                  icon={Car}
                  color="orange"
                  message="No ride requests yet — they'll show up here the moment someone nearby needs a lift."
                />
              </Card>
            ) : (
              <div className="space-y-3">
                {requested.map((ride) => (
                  <Card key={ride.id} className="p-5 animate-fade-slide">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="font-poppins font-semibold text-ink">
                          {getRouteLabel(ride.route)}
                        </p>
                        <p className="text-sm text-grey font-inter mt-1 flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          {ride.pickupPoint}
                        </p>
                        <p className="text-sm text-ink mt-1 font-inter">
                          {ride.passenger.name}
                        </p>
                      </div>
                      <p className="font-poppins text-3xl font-bold text-teal">
                        {formatPrice(ride.price)}
                      </p>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => acceptRide(ride.id)}
                      disabled={actionLoading}
                    >
                      Accept
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {!profile.available && !activeRide && (
          <Card>
            <EmptyState
              icon={Car}
              color="grey"
              message="You're currently unavailable. Flip the switch above when you're ready to take rides."
            />
          </Card>
        )}
      </div>
    </main>
  );
}
