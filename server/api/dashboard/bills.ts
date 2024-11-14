import { PrismaClient } from "@prisma/client";
import { defineEventHandler, getQuery, createError } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const query = getQuery(event) as { date?: string; branchId?: string };
  const { date, branchId } = query;

  if (!date || !branchId) {
    throw createError({
      statusCode: 400,
      statusMessage:
        "Both 'date' and 'branchId' query parameters are required.",
    });
  }

  try {
    const bills = await prisma.bill.findMany({
      where: {
        branchId: parseInt(branchId, 10), // Convert branchId to an integer
        createdAt: {
          gte: new Date(`${date}T00:00:00Z`),
          lt: new Date(`${date}T23:59:59Z`),
        },
      },
    });

    const totalAmount = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);

    return {
      date,
      totalOpenBills: totalAmount,
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Error fetching open bills for the branch",
      data: error,
    });
  }
});
