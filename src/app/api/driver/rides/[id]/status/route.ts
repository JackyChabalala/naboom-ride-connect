import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, driverId } = body;

    if (!status || !driverId) {
      return NextResponse.json(
        { error: "status and driverId are required" },
        { status: 400 }
      );
    }

    const allowed = ["IN_PROGRESS", "COMPLETED"];
    if (!allowed.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status transition" },
        { status: 400 }
      );
    }

    const ride = await prisma.ride.findUnique({ where: { id: params.id } });
    if (!ride) {
      return NextResponse.json({ error: "Ride not found" }, { status: 404 });
    }

    if (ride.driverId !== driverId) {
      return NextResponse.json({ error: "Not your ride" }, { status: 403 });
    }

    if (status === "IN_PROGRESS" && ride.status !== "ACCEPTED") {
      return NextResponse.json(
        { error: "Ride must be ACCEPTED to start" },
        { status: 400 }
      );
    }

    if (status === "COMPLETED" && ride.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: "Ride must be IN_PROGRESS to complete" },
        { status: 400 }
      );
    }

    const updated = await prisma.ride.update({
      where: { id: params.id },
      data: {
        status,
        ...(status === "COMPLETED" ? { completedAt: new Date() } : {}),
      },
      include: {
        passenger: true,
        driver: true,
      },
    });

    if (status === "COMPLETED") {
      await prisma.driver.update({
        where: { id: driverId },
        data: { available: true },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update ride status error:", error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}
