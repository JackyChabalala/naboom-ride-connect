import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rideId, passengerId, stars, comment } = body;

    if (!rideId || !passengerId || !stars) {
      return NextResponse.json(
        { error: "rideId, passengerId, and stars are required" },
        { status: 400 }
      );
    }

    if (stars < 1 || stars > 5) {
      return NextResponse.json(
        { error: "stars must be between 1 and 5" },
        { status: 400 }
      );
    }

    const ride = await prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) {
      return NextResponse.json({ error: "Ride not found" }, { status: 404 });
    }

    if (ride.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Can only rate completed rides" },
        { status: 400 }
      );
    }

    if (!ride.driverId) {
      return NextResponse.json(
        { error: "Ride has no driver" },
        { status: 400 }
      );
    }

    const existing = await prisma.rating.findUnique({ where: { rideId } });
    if (existing) {
      return NextResponse.json(
        { error: "Ride already rated" },
        { status: 400 }
      );
    }

    const rating = await prisma.rating.create({
      data: {
        rideId,
        passengerId,
        driverId: ride.driverId,
        stars,
        comment: comment || null,
      },
    });

    return NextResponse.json(rating, { status: 201 });
  } catch (error) {
    console.error("Create rating error:", error);
    return NextResponse.json(
      { error: "Failed to create rating" },
      { status: 500 }
    );
  }
}
