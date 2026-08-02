import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const ride = await prisma.ride.findUnique({
    where: { id: params.id },
    include: {
      passenger: true,
      driver: {
        include: {
          ratingsReceived: true,
        },
      },
      rating: true,
      emergencyEvents: true,
    },
  });

  if (!ride) {
    return NextResponse.json({ error: "Ride not found" }, { status: 404 });
  }

  let driverAvgRating: number | null = null;
  if (ride.driver && ride.driver.ratingsReceived.length > 0) {
    const sum = ride.driver.ratingsReceived.reduce((a, r) => a + r.stars, 0);
    driverAvgRating =
      Math.round((sum / ride.driver.ratingsReceived.length) * 10) / 10;
  }

  return NextResponse.json({
    ...ride,
    driverAvgRating,
  });
}
