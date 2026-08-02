import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRoutePrice } from "@/lib/pricing";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const passengerId = searchParams.get("passengerId");

  if (passengerId) {
    const rides = await prisma.ride.findMany({
      where: { passengerId },
      include: {
        driver: {
          include: {
            ratingsReceived: true,
          },
        },
        rating: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(rides);
  }

  const rides = await prisma.ride.findMany({
    include: {
      passenger: true,
      driver: true,
      rating: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(rides);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { route, pickupPoint, passengerId } = body;

    if (!route || !pickupPoint || !passengerId) {
      return NextResponse.json(
        { error: "route, pickupPoint, and passengerId are required" },
        { status: 400 }
      );
    }

    const passenger = await prisma.passenger.findUnique({
      where: { id: passengerId },
    });
    if (!passenger) {
      return NextResponse.json(
        { error: "Passenger not found" },
        { status: 404 }
      );
    }

    let price: number;
    try {
      price = getRoutePrice(route);
    } catch {
      return NextResponse.json({ error: "Invalid route" }, { status: 400 });
    }

    const ride = await prisma.ride.create({
      data: {
        route,
        price,
        pickupPoint,
        passengerId,
        status: "REQUESTED",
      },
      include: {
        passenger: true,
        driver: true,
      },
    });

    return NextResponse.json(ride, { status: 201 });
  } catch (error) {
    console.error("Create ride error:", error);
    return NextResponse.json(
      { error: "Failed to create ride" },
      { status: 500 }
    );
  }
}
