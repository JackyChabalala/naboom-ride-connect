import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [totalRides, verifiedDrivers, totalPassengers, completedToday] =
    await Promise.all([
      prisma.ride.count(),
      prisma.driver.count({ where: { status: "APPROVED" } }),
      prisma.passenger.count(),
      prisma.ride.count({
        where: {
          status: "COMPLETED",
          completedAt: { gte: startOfDay },
        },
      }),
    ]);

  return NextResponse.json({
    totalRides,
    verifiedDrivers,
    totalPassengers,
    completedToday,
  });
}
