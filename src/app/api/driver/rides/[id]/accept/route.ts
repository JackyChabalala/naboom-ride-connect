import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { driverId } = body;

    if (!driverId) {
      return NextResponse.json(
        { error: "driverId is required" },
        { status: 400 }
      );
    }

    const driver = await prisma.driver.findUnique({ where: { id: driverId } });
    if (!driver || driver.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Driver not approved" },
        { status: 403 }
      );
    }

    const ride = await prisma.ride.findUnique({ where: { id: params.id } });
    if (!ride) {
      return NextResponse.json({ error: "Ride not found" }, { status: 404 });
    }

    if (ride.status !== "REQUESTED") {
      return NextResponse.json(
        { error: "Ride is no longer available" },
        { status: 409 }
      );
    }

    const existingActive = await prisma.ride.findFirst({
      where: {
        driverId,
        status: { in: ["ACCEPTED", "IN_PROGRESS"] },
      },
    });
    if (existingActive) {
      return NextResponse.json(
        { error: "You already have an active ride" },
        { status: 409 }
      );
    }

    const updated = await prisma.ride.update({
      where: { id: params.id },
      data: {
        status: "ACCEPTED",
        driverId,
      },
      include: {
        passenger: true,
        driver: true,
      },
    });

    await prisma.driver.update({
      where: { id: driverId },
      data: { available: false },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Accept ride error:", error);
    return NextResponse.json(
      { error: "Failed to accept ride" },
      { status: 500 }
    );
  }
}
