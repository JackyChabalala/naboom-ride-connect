import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const drivers = await prisma.driver.findMany({
    where: status ? { status } : undefined,
    include: {
      rides: true,
      ratingsReceived: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const enriched = drivers.map((d) => {
    const completed = d.rides.filter((r) => r.status === "COMPLETED").length;
    const avgRating =
      d.ratingsReceived.length > 0
        ? Math.round(
            (d.ratingsReceived.reduce((a, r) => a + r.stars, 0) /
              d.ratingsReceived.length) *
              10
          ) / 10
        : null;
    return {
      ...d,
      completedRides: completed,
      avgRating,
    };
  });

  return NextResponse.json(enriched);
}
