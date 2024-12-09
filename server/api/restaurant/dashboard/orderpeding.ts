import { PrismaClient } from "@prisma/client";
import { defineEventHandler, getQuery, createError } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const query = getQuery(event) as { branchId?: string };
  const { branchId } = query;

  // Validate `branchId` is provided
  if (!branchId) {
    throw createError({
      statusCode: 400,
      statusMessage: "'branchId' query parameter is required.",
    });
  }

  // Validate `branchId` is a number
  const branchIdInt = parseInt(branchId, 10);
  if (isNaN(branchIdInt)) {
    throw createError({
      statusCode: 400,
      statusMessage: "'branchId' must be a valid integer.",
    });
  }

  try {
    // Fetch pending orders count
    const pendingOrdersCount = await prisma.orderMenu.count({
      where: {
        bill: {
          branchId: branchIdInt,
        },
        status: "pending", // Match the exact status in your database
      },
    });

    return {
      branchId: branchIdInt,
      pendingOrdersCount,
    };
  } catch (error) {
    console.error(
      `Error fetching pending orders for branchId ${branchIdInt}:`,
      error,
    );
    throw createError({
      statusCode: 500,
      statusMessage: "Error fetching pending orders for the branch.",
      data: error,
    });
  }
});
