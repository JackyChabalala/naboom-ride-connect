"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  Share2,
  Star,
  Phone,
  Car,
  ShieldCheck,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconBadge } from "@/components/icon-badge";
import { StatusBadge } from "@/components/status-badge";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { getPassengerSession, type PassengerSession } from "@/lib/auth";
import { getRouteLabel, formatPrice } from "@/lib/pricing";
import { usePolling } from "@/hooks/use-polling";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type RideData = {
  id: string;
  route: string;
  price: number;
  pickupPoint: string;
  status: string;
  passengerId: string;
  driverId: string | null;
  driver: {
    id: string;
    name: string;
    phone: string;
    vehicleDesc: string;
    status: string;
  } | null;
  driverAvgRating: number | null;
  rating: { stars: number; comment: string | null } | null;
};

export default function PassengerRidePage() {
  const params = useParams();
  const router = useRouter();
  const rideId = params.id as string;

  const [session, setSession] = useState<PassengerSession | null>(null);
  const [ride, setRide] = useState<RideData | null>(null);
  const [statusKey, setStatusKey] = useState(0);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [ratingLoading, setRatingLoading] = useState(false);
  const [emergencyLoading, setEmergencyLoading] = useState(false);

  useEffect(() => {
    const s = getPassengerSession();
    if (!s) {
      router.replace("/passenger/login");
      return;
    }
    setSession(s);
  }, [router]);

  const fetchRide = useCallback(async () => {
    try {
      const res = await fetch(`/api/rides/${rideId}`);
      if (!res.ok) return;
      const data = await res.json();
      setRide((prev) => {
        if (prev && prev.status !== data.status) {
          setStatusKey((k) => k + 1);
        }
        return data;
      });
    } catch {
      /* ignore poll errors */
    }
  }, [rideId]);

  usePolling(fetchRide, 3500, !!session);

  async function handleEmergency() {
    setEmergencyLoading(true);
    try {
      const res = await fetch(`/api/rides/${rideId}/emergency`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed");
      setEmergencyOpen(true);
    } catch {
      toast({ title: "Could not log emergency", variant: "destructive" });
    } finally {
      setEmergencyLoading(false);
    }
  }

  async function handleRating(e: React.FormEvent) {
    e.preventDefault();
    if (!session || stars < 1) return;
    setRatingLoading(true);
    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rideId,
          passengerId: session.id,
          stars,
          comment: comment.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast({ title: "Thanks for your rating!" });
      await fetchRide();
    } catch (err) {
      toast({
        title: "Could not save rating",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setRatingLoading(false);
    }
  }

  if (!session || !ride) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-teal animate-spin" />
      </main>
    );
  }

  const shareText = `I'm on a Local Ride Connect trip (${getRouteLabel(ride.route)}, ${formatPrice(ride.price)}). Status: ${ride.status}. Track: ${typeof window !== "undefined" ? window.location.href : ""}`;

  return (
    <main className="min-h-screen bg-cream pb-28">
      <div className="bg-teal px-6 pt-8 pb-12 rounded-b-[2rem]">
        <div className="mx-auto max-w-lg">
          <PageHeader
            title="Your ride"
            subtitle={getRouteLabel(ride.route)}
            backHref="/passenger/home"
            light
            className="mb-0"
          />
        </div>
      </div>

      <div className="mx-auto max-w-lg px-6 -mt-6 space-y-4">
        <Card
          key={statusKey}
          className={cn("p-5 md:p-6 animate-fade-slide")}
        >
          <div className="flex items-center justify-between mb-4">
            <StatusBadge status={ride.status} />
            <p className="font-poppins text-2xl font-bold text-teal">
              {formatPrice(ride.price)}
            </p>
          </div>
          <p className="text-sm text-grey font-inter">
            Pickup: <span className="text-ink font-medium">{ride.pickupPoint}</span>
          </p>
        </Card>

        {ride.status === "REQUESTED" && (
          <Card className="p-8 text-center animate-fade-slide">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <IconBadge icon={Car} color="yellow" size="lg" />
                <Loader2 className="absolute -bottom-1 -right-1 h-5 w-5 text-teal animate-spin" />
              </div>
            </div>
            <h2 className="font-poppins text-xl font-semibold text-ink animate-pulse-soft">
              Looking for a nearby driver…
            </h2>
            <p className="mt-2 text-sm text-grey font-inter leading-relaxed">
              Hang tight — available drivers will see your request shortly.
            </p>
          </Card>
        )}

        {ride.driver && ["ACCEPTED", "IN_PROGRESS", "COMPLETED"].includes(ride.status) && (
          <Card className="p-5 md:p-6 animate-fade-slide space-y-4">
            <div className="flex items-start gap-4">
              <IconBadge icon={Car} color="teal" size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-poppins text-lg font-semibold text-ink">
                    {ride.driver.name}
                  </h2>
                  {ride.driver.status === "APPROVED" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple/15 text-purple px-2.5 py-0.5 text-xs font-semibold">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-sm text-grey font-inter mt-1 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  {ride.driver.phone}
                </p>
                <p className="text-sm text-ink font-inter mt-1">
                  {ride.driver.vehicleDesc}
                </p>
                {ride.driverAvgRating != null && (
                  <p className="mt-2 flex items-center gap-1 text-sm font-semibold text-ink">
                    <Star className="h-4 w-4 fill-yellow text-yellow" />
                    <span className="font-poppins text-lg">{ride.driverAvgRating}</span>
                    <span className="text-grey font-normal font-inter">avg rating</span>
                  </p>
                )}
              </div>
            </div>

            {ride.status === "IN_PROGRESS" && (
              <div className="rounded-2xl bg-teal/10 px-4 py-3 text-sm text-teal-dark font-medium font-inter">
                Ride in progress — sit back and enjoy the trip.
              </div>
            )}
          </Card>
        )}

        {ride.status === "COMPLETED" && !ride.rating && (
          <Card className="p-5 md:p-6 animate-fade-slide">
            <div className="flex items-center gap-3 mb-4">
              <IconBadge icon={CheckCircle2} color="success" size="sm" />
              <h2 className="font-poppins text-lg font-semibold">Rate your driver</h2>
            </div>
            <form onSubmit={handleRating} className="space-y-4">
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setStars(n)}
                    className="p-1 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal rounded-full"
                    aria-label={`${n} stars`}
                  >
                    <Star
                      className={cn(
                        "h-9 w-9 transition-colors",
                        n <= stars
                          ? "fill-yellow text-yellow"
                          : "text-grey/40"
                      )}
                    />
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <Label htmlFor="comment">Comment (optional)</Label>
                <Input
                  id="comment"
                  placeholder="How was the ride?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={stars < 1 || ratingLoading}
              >
                {ratingLoading ? "Saving…" : "Submit rating"}
              </Button>
            </form>
          </Card>
        )}

        {ride.status === "COMPLETED" && ride.rating && (
          <Card className="p-5 md:p-6 text-center animate-fade-slide">
            <IconBadge icon={CheckCircle2} color="success" size="md" className="mx-auto mb-3" />
            <p className="font-poppins font-semibold text-ink">Thanks for riding!</p>
            <p className="text-sm text-grey mt-1 font-inter">
              You rated this trip {ride.rating.stars}★
            </p>
            <Button
              variant="secondary"
              className="mt-4"
              onClick={() => router.push("/passenger/home")}
            >
              Request another ride
            </Button>
          </Card>
        )}

        {["ACCEPTED", "IN_PROGRESS"].includes(ride.status) && (
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => setShareOpen(true)}
          >
            <Share2 className="h-4 w-4" />
            Share My Trip
          </Button>
        )}
      </div>

      {/* Sticky emergency button */}
      {["REQUESTED", "ACCEPTED", "IN_PROGRESS"].includes(ride.status) && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-cream via-cream to-transparent">
          <div className="mx-auto max-w-lg">
            <Button
              variant="coral"
              size="xl"
              className="w-full"
              onClick={handleEmergency}
              disabled={emergencyLoading}
            >
              <AlertTriangle className="h-5 w-5" />
              Emergency
            </Button>
          </div>
        </div>
      )}

      <Dialog open={emergencyOpen} onOpenChange={setEmergencyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconBadge icon={AlertTriangle} color="coral" size="sm" />
              Emergency alert simulated
            </DialogTitle>
            <DialogDescription>
              In the real app this would notify your emergency contact and share
              your live location immediately. This event has been logged for
              admins to review.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setEmergencyOpen(false)}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share My Trip</DialogTitle>
            <DialogDescription>
              Copy this status link and send it to someone you trust.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-2xl bg-cream p-4 text-sm font-inter text-ink break-all leading-relaxed">
            {shareText}
          </div>
          <DialogFooter>
            <Button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(shareText);
                  toast({ title: "Copied to clipboard" });
                } catch {
                  toast({ title: "Select and copy the text above" });
                }
                setShareOpen(false);
              }}
            >
              Copy text
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
