// /server/api/restaurant/[restaurantId]/branch/[branchId]/updateTableStatus.ts
import { PrismaClient } from "@prisma/client";
import { defineEventHandler, readBody, sendError } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    // Read the request body (tableId and new status)
    const body = await readBody(event);
    const { tableId, status } = body;

    // Validate input
    if (!tableId || !status) {
      return sendError(event, new Error("Missing tableId or status"));
    }

    // Update the table status
    const updatedTable = await prisma.table.update({
      where: {
        id: Number(tableId),
      },
      data: {
        status,
      },
    });

    // Return the updated table data
    return {
      statusCode: 200,
      body: updatedTable,
    };
  } catch (error) {
    console.error("Error updating table status:", error);
    return sendError(event, new Error("Failed to update table status"));
  }
});
