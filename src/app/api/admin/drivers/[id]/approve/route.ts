import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { action } = body;

    const allowed = ["APPROVE", "REJECT", "SUSPEND"];
    if (!action || !allowed.includes(action)) {
      return NextResponse.json(
        { error: "action must be APPROVE, REJECT, or SUSPEND" },
        { status: 400 }
      );
    }

    const statusMap: Record<string, string> = {
      APPROVE: "APPROVED",
      REJECT: "REJECTED",
      SUSPEND: "SUSPENDED",
    };

    const driver = await prisma.driver.findUnique({ where: { id: params.id } });
    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    const updated = await prisma.driver.update({
      where: { id: params.id },
      data: {
        status: statusMap[action],
        ...(action === "SUSPEND" || action === "REJECT"
          ? { available: false }
          : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Admin driver action error:", error);
    return NextResponse.json(
      { error: "Failed to update driver" },
      { status: 500 }
    );
  }
}
