"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, ArrowLeftRight, Home, History, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconBadge } from "@/components/icon-badge";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import {
  getPassengerSession,
  clearPassengerSession,
  type PassengerSession,
} from "@/lib/auth";
import { ROUTES, formatPrice, type RouteId } from "@/lib/pricing";
import { toast } from "@/hooks/use-toast";

export default function PassengerHomePage() {
  const router = useRouter();
  const [session, setSession] = useState<PassengerSession | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<RouteId | null>(null);
  const [pickupPoint, setPickupPoint] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const s = getPassengerSession();
    if (!s) {
      router.replace("/passenger/login");
      return;
    }
    setSession(s);
  }, [router]);

  async function handleRequest() {
    if (!session || !selectedRoute || !pickupPoint.trim()) {
      toast({
        title: "Pick a route and pickup point",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/rides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          route: selectedRoute,
          pickupPoint: pickupPoint.trim(),
          passengerId: session.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to request ride");
      router.push(`/passenger/ride/${data.id}`);
    } catch (err) {
      toast({
        title: "Could not request ride",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    clearPassengerSession();
    router.push("/");
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-grey font-inter">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream pb-10">
      <div className="bg-teal px-6 pt-8 pb-12 rounded-b-[2rem]">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="text-cream/70 hover:text-white text-sm">
              ← Home
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/passenger/history"
                className="text-cream/80 hover:text-white"
                aria-label="Ride history"
              >
                <History className="h-5 w-5" />
              </Link>
              <button
                onClick={handleLogout}
                className="text-cream/80 hover:text-white"
                aria-label="Log out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
          <PageHeader
            title={`Hi, ${session.name.split(" ")[0]}`}
            subtitle="Where are you headed?"
            light
            className="mb-0"
          />
        </div>
      </div>

      <div className="mx-auto max-w-lg px-6 -mt-6 space-y-4">
        {(Object.keys(ROUTES) as RouteId[]).map((key) => {
          const route = ROUTES[key];
          const selected = selectedRoute === key;
          return (
            <Card
              key={key}
              lift
              selected={selected}
              onClick={() => setSelectedRoute(key)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedRoute(key);
                }
              }}
              className="flex items-center gap-4 p-5 md:p-6"
            >
              <IconBadge
                icon={key === "TOWN_TOWNSHIP" ? ArrowLeftRight : Home}
                color={key === "TOWN_TOWNSHIP" ? "teal" : "orange"}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-poppins font-semibold text-ink text-lg">
                  {route.label}
                </h3>
                <p className="text-sm text-grey font-inter mt-0.5">
                  {route.description}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-poppins text-2xl md:text-3xl font-bold text-teal">
                  {formatPrice(route.price)}
                </p>
                <p className="text-xs text-grey font-inter">fixed fare</p>
              </div>
            </Card>
          );
        })}

        <Card className="p-5 md:p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pickup" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-teal" />
              Pickup point
            </Label>
            <Input
              id="pickup"
              placeholder="e.g. Main Taxi Rank"
              value={pickupPoint}
              onChange={(e) => setPickupPoint(e.target.value)}
            />
          </div>
          <Button
            onClick={handleRequest}
            disabled={!selectedRoute || !pickupPoint.trim() || loading}
            className="w-full"
            size="xl"
          >
            {loading ? "Requesting…" : "Request Ride"}
          </Button>
        </Card>
      </div>
    </main>
  );
}
