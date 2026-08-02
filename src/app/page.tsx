import Link from "next/link";
import { User, Car, Shield } from "lucide-react";
import { IconBadge } from "@/components/icon-badge";

const portals = [
  {
    href: "/passenger/login",
    title: "I'm a Passenger",
    description: "Request a ride with clear fixed prices — no surprises.",
    icon: User,
    color: "teal" as const,
  },
  {
    href: "/driver/login",
    title: "I'm a Driver",
    description: "Get verified, go available, and accept nearby requests.",
    icon: Car,
    color: "orange" as const,
  },
  {
    href: "/admin",
    title: "Admin Dashboard",
    description: "Approve drivers, monitor rides, and review safety alerts.",
    icon: Shield,
    color: "purple" as const,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Full-bleed teal hero */}
      <section className="relative bg-teal overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-teal-dark" />
          <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-yellow/40" />
          <div className="absolute top-1/2 right-1/4 h-32 w-32 rounded-full bg-orange/30" />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 pt-16 pb-20 md:pt-24 md:pb-28 text-center">
          <p className="font-inter text-sm font-medium tracking-widest uppercase text-cream/80 mb-4">
            Your town · Your rides
          </p>
          <h1 className="font-poppins text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight text-balance">
            Local Ride Connect
          </h1>
          <p className="mt-5 font-inter text-base md:text-lg text-cream/90 leading-relaxed max-w-xl mx-auto">
            Fixed-price rides between town and township — connecting passengers
            with trusted local drivers where the big apps don&apos;t go.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-cream rounded-t-[2rem]" />
      </section>

      {/* Portal cards */}
      <section className="mx-auto max-w-3xl px-6 pb-16 -mt-2">
        <div className="space-y-4">
          {portals.map((portal) => (
            <Link
              key={portal.href}
              href={portal.href}
              className="group flex items-center gap-5 rounded-2xl bg-white p-6 md:p-8 shadow-lg shadow-teal-900/5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-teal-900/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            >
              <IconBadge
                icon={portal.icon}
                color={portal.color}
                size="lg"
              />
              <div className="min-w-0 flex-1">
                <h2 className="font-poppins text-xl font-semibold text-ink group-hover:text-teal-dark transition-colors">
                  {portal.title}
                </h2>
                <p className="mt-1 font-inter text-sm text-grey leading-relaxed">
                  {portal.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <p className="mt-10 text-center font-inter text-xs text-grey">
          Prototype for local demo · Cash fares · Mock OTP:{" "}
          <span className="font-semibold text-ink">123456</span>
        </p>
      </section>
    </main>
  );
}
