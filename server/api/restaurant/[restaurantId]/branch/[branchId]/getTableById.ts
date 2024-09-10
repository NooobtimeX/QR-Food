// /server/api/restaurant/[restaurantId]/branch/[branchId]/getTableById.ts
import { PrismaClient } from "@prisma/client";
import { defineEventHandler, sendError } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    // Extract parameters from the request
    const { restaurantId, branchId } = event.context.params as {
      restaurantId: string;
      branchId: string;
    };

    // Fetch tables by restaurantId and branchId
    const tables = await prisma.table.findMany({
      where: {
        branch: {
          restaurantId: Number(restaurantId),
          id: Number(branchId),
        },
      },
    });

    // Return the result
    return {
      statusCode: 200,
      body: tables,
    };
  } catch (error) {
    console.error("Error fetching tables:", error);
    return sendError(event, new Error("Failed to fetch tables"));
  }
});
