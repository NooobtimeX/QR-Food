import { PrismaClient } from "@prisma/client";
import { defineEventHandler, getQuery, createError } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  // Extract the date from the query parameters
  const query = getQuery(event) as { date?: string };
  const { date } = query;

  if (!date) {
    throw createError({
      statusCode: 400,
      statusMessage: "The 'date' query parameter is required.",
    });
  }

  try {
    // Query open bills for the specified date
    const bills = await prisma.bill.findMany({
      where: {
        createdAt: {
          gte: new Date(`${date}T00:00:00Z`),
          lt: new Date(`${date}T23:59:59Z`),
        },
      },
    });

    // Calculate the total amount of open bills for that date
    const totalAmount = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);

    // Return the total amount as JSON response
    return {
      date,
      totalOpenBills: totalAmount,
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Error fetching open bills",
      data: error,
    });
  }
});
