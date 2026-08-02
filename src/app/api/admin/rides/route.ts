import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
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
