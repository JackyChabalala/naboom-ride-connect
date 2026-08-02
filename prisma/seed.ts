import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.emergencyEvent.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.ride.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.passenger.deleteMany();

  const passenger1 = await prisma.passenger.create({
    data: {
      name: "Thabo Molefe",
      phone: "0821110001",
    },
  });

  const passenger2 = await prisma.passenger.create({
    data: {
      name: "Lerato Dlamini",
      phone: "0821110002",
    },
  });

  const driver1 = await prisma.driver.create({
    data: {
      name: "Sipho Nkosi",
      phone: "0832220001",
      vehicleDesc: "White Toyota Quantum - GP 123 AB",
      idDocName: "sipho-id.pdf",
      licenceDocName: "sipho-licence.pdf",
      status: "APPROVED",
      available: true,
    },
  });

  await prisma.driver.create({
    data: {
      name: "Nomsa Khumalo",
      phone: "0832220002",
      vehicleDesc: "Silver Hyundai H1 - GP 456 CD",
      idDocName: "nomsa-id.pdf",
      licenceDocName: "nomsa-licence.pdf",
      status: "APPROVED",
      available: true,
    },
  });

  await prisma.driver.create({
    data: {
      name: "Bongani Mthembu",
      phone: "0832220003",
      vehicleDesc: "Blue Nissan NV350 - GP 789 EF",
      idDocName: "bongani-id.pdf",
      licenceDocName: "bongani-licence.pdf",
      status: "PENDING",
      available: false,
    },
  });

  const completedRide = await prisma.ride.create({
    data: {
      route: "TOWN_TOWNSHIP",
      price: 60,
      pickupPoint: "Main Taxi Rank",
      status: "COMPLETED",
      passengerId: passenger1.id,
      driverId: driver1.id,
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
  });

  await prisma.rating.create({
    data: {
      rideId: completedRide.id,
      passengerId: passenger1.id,
      driverId: driver1.id,
      stars: 5,
      comment: "Safe drive, on time. Highly recommend!",
    },
  });

  console.log("Seed complete!");
  console.log("");
  console.log("Test accounts:");
  console.log("  Passengers:");
  console.log(`    ${passenger1.name} — ${passenger1.phone}`);
  console.log(`    ${passenger2.name} — ${passenger2.phone}`);
  console.log("  Drivers (APPROVED):");
  console.log("    Sipho Nkosi — 0832220001");
  console.log("    Nomsa Khumalo — 0832220002");
  console.log("  Driver (PENDING):");
  console.log("    Bongani Mthembu — 0832220003");
  console.log("  Mock OTP for all logins: 123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
