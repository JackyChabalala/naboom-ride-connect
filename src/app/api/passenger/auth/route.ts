import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: "name and phone are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.passenger.findUnique({ where: { phone } });
    if (existing) {
      return NextResponse.json({
        ...existing,
        isNew: false,
      });
    }

    const passenger = await prisma.passenger.create({
      data: { name, phone },
    });

    return NextResponse.json({ ...passenger, isNew: true }, { status: 201 });
  } catch (error) {
    console.error("Passenger auth error:", error);
    return NextResponse.json(
      { error: "Failed to authenticate passenger" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone");

  if (!phone) {
    return NextResponse.json({ error: "phone is required" }, { status: 400 });
  }

  const passenger = await prisma.passenger.findUnique({ where: { phone } });
  if (!passenger) {
    return NextResponse.json({ error: "Passenger not found" }, { status: 404 });
  }

  return NextResponse.json(passenger);
}
