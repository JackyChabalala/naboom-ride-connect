"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Shield,
  Users,
  Car,
  Route,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Ban,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconBadge } from "@/components/icon-badge";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { Card } from "@/components/card";
import { getRouteLabel, formatPrice } from "@/lib/pricing";
import { toast } from "@/hooks/use-toast";
import { usePolling } from "@/hooks/use-polling";

type Stats = {
  totalRides: number;
  verifiedDrivers: number;
  totalPassengers: number;
  completedToday: number;
};

type Driver = {
  id: string;
  name: string;
  phone: string;
  vehicleDesc: string;
  idDocName: string | null;
  licenceDocName: string | null;
  status: string;
  available: boolean;
  completedRides: number;
  avgRating: number | null;
  createdAt: string;
};

type Ride = {
  id: string;
  route: string;
  price: number;
  pickupPoint: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
  passenger: { name: string; phone: string };
  driver: { name: string } | null;
};

type Emergency = {
  id: string;
  createdAt: string;
  ride: {
    id: string;
    route: string;
    passenger: { name: string; phone: string };
    driver: { name: string } | null;
  };
};

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [rides, setRides] = useState<Ride[]>([]);
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    try {
      const [statsRes, driversRes, ridesRes, emergRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/drivers"),
        fetch("/api/admin/rides"),
        fetch("/api/admin/emergencies"),
      ]);
      setStats(await statsRes.json());
      setDrivers(await driversRes.json());
      setRides(await ridesRes.json());
      setEmergencies(await emergRes.json());
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  usePolling(loadAll, 5000, true);

  async function driverAction(
    id: string,
    action: "APPROVE" | "REJECT" | "SUSPEND"
  ) {
    try {
      const res = await fetch(`/api/admin/drivers/${id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({
        title:
          action === "APPROVE"
            ? "Driver approved"
            : action === "REJECT"
              ? "Driver rejected"
              : "Driver suspended",
      });
      await loadAll();
    } catch (err) {
      toast({
        title: "Action failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  }

  const pending = drivers.filter((d) => d.status === "PENDING");

  return (
    <main className="min-h-screen bg-cream pb-16">
      <div className="bg-teal px-6 pt-8 pb-14 rounded-b-[2rem]">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/"
            className="inline-flex text-sm text-cream/80 hover:text-white mb-6 font-medium"
          >
            ← Home
          </Link>
          <div className="flex items-start gap-4">
            <IconBadge icon={Shield} color="purple" size="lg" />
            <div>
              <h1 className="font-poppins text-2xl md:text-4xl font-bold text-white">
                Admin Dashboard
              </h1>
              <p className="text-cream/80 text-sm mt-1.5 font-inter leading-relaxed">
                Prototype — this would be password-protected in production.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 -mt-8 space-y-8">
        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            {
              icon: Route,
              color: "teal" as const,
              value: stats?.totalRides ?? "—",
              label: "Total rides",
            },
            {
              icon: Car,
              color: "success" as const,
              value: stats?.verifiedDrivers ?? "—",
              label: "Verified drivers",
            },
            {
              icon: Users,
              color: "orange" as const,
              value: stats?.totalPassengers ?? "—",
              label: "Passengers",
            },
            {
              icon: CheckCircle2,
              color: "purple" as const,
              value: stats?.completedToday ?? "—",
              label: "Completed today",
            },
          ].map((s) => (
            <Card key={s.label} className="p-5">
              <IconBadge icon={s.icon} color={s.color} size="sm" className="mb-3" />
              <p className="font-poppins text-2xl md:text-3xl font-bold text-ink">
                {s.value}
              </p>
              <p className="text-xs text-grey font-inter mt-1">{s.label}</p>
            </Card>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-grey font-inter py-8">Loading…</p>
        ) : (
          <>
            {/* Pending applications */}
            <section>
              <h2 className="font-poppins text-xl font-semibold text-ink mb-4 flex items-center gap-2">
                <IconBadge icon={Clock} color="orange" size="sm" />
                Pending applications
              </h2>
              {pending.length === 0 ? (
                <Card>
                  <EmptyState
                    icon={Car}
                    color="orange"
                    message="No pending applications — new driver sign-ups will appear here for review."
                  />
                </Card>
              ) : (
                <div className="space-y-3">
                  {pending.map((d) => (
                    <Card key={d.id} className="p-5 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-poppins font-semibold text-ink">
                              {d.name}
                            </h3>
                            <StatusBadge status="PENDING" />
                          </div>
                          <p className="text-sm text-grey font-inter">{d.phone}</p>
                          <p className="text-sm text-ink font-inter mt-1">
                            {d.vehicleDesc}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-3 text-xs text-grey font-inter">
                            {d.idDocName && (
                              <span className="inline-flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                ID: {d.idDocName}
                              </span>
                            )}
                            {d.licenceDocName && (
                              <span className="inline-flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                Licence: {d.licenceDocName}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button
                            size="sm"
                            onClick={() => driverAction(d.id, "APPROVE")}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => driverAction(d.id, "REJECT")}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* All drivers */}
            <section>
              <h2 className="font-poppins text-xl font-semibold text-ink mb-4 flex items-center gap-2">
                <IconBadge icon={Car} color="teal" size="sm" />
                All drivers
              </h2>
              <Card className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm font-inter">
                    <thead>
                      <tr className="border-b border-border bg-cream/60 text-left">
                        <th className="px-4 py-3 font-semibold text-ink">Driver</th>
                        <th className="px-4 py-3 font-semibold text-ink">Status</th>
                        <th className="px-4 py-3 font-semibold text-ink">Rides</th>
                        <th className="px-4 py-3 font-semibold text-ink">Rating</th>
                        <th className="px-4 py-3 font-semibold text-ink">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drivers.map((d) => (
                        <tr key={d.id} className="border-b border-border last:border-0">
                          <td className="px-4 py-3">
                            <p className="font-medium text-ink">{d.name}</p>
                            <p className="text-xs text-grey">{d.phone}</p>
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={d.status} />
                          </td>
                          <td className="px-4 py-3 font-poppins font-semibold text-ink">
                            {d.completedRides}
                          </td>
                          <td className="px-4 py-3 font-poppins font-semibold text-ink">
                            {d.avgRating ?? "—"}
                          </td>
                          <td className="px-4 py-3">
                            {d.status !== "SUSPENDED" && d.status !== "REJECTED" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-coral text-coral hover:bg-coral/5"
                                onClick={() => driverAction(d.id, "SUSPEND")}
                              >
                                <Ban className="h-3.5 w-3.5" />
                                Suspend
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </section>

            {/* All rides */}
            <section>
              <h2 className="font-poppins text-xl font-semibold text-ink mb-4 flex items-center gap-2">
                <IconBadge icon={Route} color="orange" size="sm" />
                All rides
              </h2>
              <Card className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm font-inter">
                    <thead>
                      <tr className="border-b border-border bg-cream/60 text-left">
                        <th className="px-4 py-3 font-semibold text-ink">Route</th>
                        <th className="px-4 py-3 font-semibold text-ink">Passenger</th>
                        <th className="px-4 py-3 font-semibold text-ink">Driver</th>
                        <th className="px-4 py-3 font-semibold text-ink">Price</th>
                        <th className="px-4 py-3 font-semibold text-ink">Status</th>
                        <th className="px-4 py-3 font-semibold text-ink">When</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rides.map((r) => (
                        <tr key={r.id} className="border-b border-border last:border-0">
                          <td className="px-4 py-3 font-medium text-ink">
                            {getRouteLabel(r.route)}
                            <p className="text-xs text-grey font-normal">
                              {r.pickupPoint}
                            </p>
                          </td>
                          <td className="px-4 py-3">{r.passenger.name}</td>
                          <td className="px-4 py-3">{r.driver?.name ?? "—"}</td>
                          <td className="px-4 py-3 font-poppins font-bold text-teal">
                            {formatPrice(r.price)}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={r.status} />
                          </td>
                          <td className="px-4 py-3 text-grey text-xs whitespace-nowrap">
                            {new Date(r.createdAt).toLocaleString("en-ZA", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </section>

            {/* Emergency log */}
            <section>
              <h2 className="font-poppins text-xl font-semibold text-ink mb-4 flex items-center gap-2">
                <IconBadge icon={AlertTriangle} color="coral" size="sm" />
                Emergency log
              </h2>
              {emergencies.length === 0 ? (
                <Card>
                  <EmptyState
                    icon={AlertTriangle}
                    color="coral"
                    message="No emergency alerts yet — when a passenger taps Emergency on an active ride, it will be logged here."
                  />
                </Card>
              ) : (
                <Card className="p-0 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm font-inter">
                      <thead>
                        <tr className="border-b border-border bg-cream/60 text-left">
                          <th className="px-4 py-3 font-semibold text-ink">When</th>
                          <th className="px-4 py-3 font-semibold text-ink">Passenger</th>
                          <th className="px-4 py-3 font-semibold text-ink">Ride</th>
                          <th className="px-4 py-3 font-semibold text-ink">Driver</th>
                        </tr>
                      </thead>
                      <tbody>
                        {emergencies.map((e) => (
                          <tr
                            key={e.id}
                            className="border-b border-border last:border-0"
                          >
                            <td className="px-4 py-3 text-grey text-xs whitespace-nowrap">
                              {new Date(e.createdAt).toLocaleString("en-ZA")}
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-ink">
                                {e.ride.passenger.name}
                              </p>
                              <p className="text-xs text-grey">
                                {e.ride.passenger.phone}
                              </p>
                            </td>
                            <td className="px-4 py-3">
                              <StatusBadge status="EMERGENCY" />
                              <p className="text-xs text-grey mt-1">
                                {getRouteLabel(e.ride.route)}
                              </p>
                            </td>
                            <td className="px-4 py-3">
                              {e.ride.driver?.name ?? "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
