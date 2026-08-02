import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json(
        { error: "phone is required" },
        { status: 400 }
      );
    }

    const driver = await prisma.driver.findUnique({ where: { phone } });
    if (!driver) {
      return NextResponse.json(
        { error: "Driver not found. Please register first." },
        { status: 404 }
      );
    }

    return NextResponse.json(driver);
  } catch (error) {
    console.error("Driver login error:", error);
    return NextResponse.json(
      { error: "Failed to login" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const phone = searchParams.get("phone");

  if (id) {
    const driver = await prisma.driver.findUnique({
      where: { id },
      include: {
        rides: true,
        ratingsReceived: true,
      },
    });
    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    const completedRides = driver.rides.filter((r) => r.status === "COMPLETED");
    const acceptedRides = driver.rides.filter((r) =>
      ["ACCEPTED", "IN_PROGRESS", "COMPLETED"].includes(r.status)
    );
    const avgRating =
      driver.ratingsReceived.length > 0
        ? Math.round(
            (driver.ratingsReceived.reduce((a, r) => a + r.stars, 0) /
              driver.ratingsReceived.length) *
              10
          ) / 10
        : null;
    const acceptanceRate =
      driver.rides.length > 0
        ? Math.round((acceptedRides.length / driver.rides.length) * 100)
        : 0;

    return NextResponse.json({
      ...driver,
      stats: {
        completedRides: completedRides.length,
        avgRating,
        acceptanceRate,
        totalRides: driver.rides.length,
      },
    });
  }

  if (phone) {
    const driver = await prisma.driver.findUnique({ where: { phone } });
    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }
    return NextResponse.json(driver);
  }

  return NextResponse.json(
    { error: "id or phone is required" },
    { status: 400 }
  );
}
