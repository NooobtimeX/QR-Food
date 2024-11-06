import { PrismaClient } from "@prisma/client";
import { defineEventHandler, readBody } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  // Get branchId, startDate, and endDate from the request body
  const { branchId, startDate, endDate } = await readBody(event);

  if (!branchId) {
    return { error: "branchId is required" };
  }

  try {
    const bills = await prisma.bill.findMany({
      where: {
        branchId: Number(branchId),
        createdAt: {
          gte: new Date(startDate), // Greater than or equal to startDate
          lte: new Date(endDate), // Less than or equal to endDate
        },
      },
      select: {
        id: true,
        totalAmount: true,
        createdAt: true,
        qrCodeId: true,
      },
    });
    return bills;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message || "Failed to fetch bills" };
    }
    return { error: "Unknown error occurred" };
  }
});
