import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const events = await prisma.emergencyEvent.findMany({
    include: {
      ride: {
        include: {
          passenger: true,
          driver: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(events);
}
