import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, vehicleDesc, idDocName, licenceDocName } = body;

    if (!name || !phone || !vehicleDesc) {
      return NextResponse.json(
        { error: "name, phone, and vehicleDesc are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.driver.findUnique({ where: { phone } });
    if (existing) {
      return NextResponse.json(
        { error: "A driver with this phone number already exists" },
        { status: 409 }
      );
    }

    const driver = await prisma.driver.create({
      data: {
        name,
        phone,
        vehicleDesc,
        idDocName: idDocName || null,
        licenceDocName: licenceDocName || null,
        status: "PENDING",
        available: false,
      },
    });

    return NextResponse.json(driver, { status: 201 });
  } catch (error) {
    console.error("Driver register error:", error);
    return NextResponse.json(
      { error: "Failed to register driver" },
      { status: 500 }
    );
  }
}
