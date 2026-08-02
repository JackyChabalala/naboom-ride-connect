import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { driverId, available } = body;

    if (!driverId || typeof available !== "boolean") {
      return NextResponse.json(
        { error: "driverId and available (boolean) are required" },
        { status: 400 }
      );
    }

    const driver = await prisma.driver.findUnique({ where: { id: driverId } });
    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    if (driver.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Only approved drivers can set availability" },
        { status: 403 }
      );
    }

    const updated = await prisma.driver.update({
      where: { id: driverId },
      data: { available },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Availability error:", error);
    return NextResponse.json(
      { error: "Failed to update availability" },
      { status: 500 }
    );
  }
}
