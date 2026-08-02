import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const ride = await prisma.ride.findUnique({
    where: { id: params.id },
    include: { passenger: true },
  });

  if (!ride) {
    return NextResponse.json({ error: "Ride not found" }, { status: 404 });
  }

  const event = await prisma.emergencyEvent.create({
    data: { rideId: params.id },
    include: {
      ride: {
        include: { passenger: true },
      },
    },
  });

  return NextResponse.json(event, { status: 201 });
}
