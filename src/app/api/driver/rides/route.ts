import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const driverId = searchParams.get("driverId");

  if (!driverId) {
    return NextResponse.json(
      { error: "driverId is required" },
      { status: 400 }
    );
  }

  const activeRide = await prisma.ride.findFirst({
    where: {
      driverId,
      status: { in: ["ACCEPTED", "IN_PROGRESS"] },
    },
    include: {
      passenger: true,
    },
  });

  if (activeRide) {
    return NextResponse.json({ activeRide, requested: [] });
  }

  const requested = await prisma.ride.findMany({
    where: { status: "REQUESTED" },
    include: { passenger: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ activeRide: null, requested });
}
