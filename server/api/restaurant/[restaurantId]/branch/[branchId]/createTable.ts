// /server/api/restaurant/[restaurantId]/branch/[branchId]/createTable.ts
import { PrismaClient } from "@prisma/client";
import { defineEventHandler, sendError, readBody } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    // Extract branchId from the request
    const { branchId } = event.context.params as {
      branchId: string;
    };

    // Read the request body (table name and capacity)
    const body = await readBody(event);
    const { name, capacity } = body;

    // Ensure that name and capacity are provided
    if (!name || !capacity) {
      return sendError(event, new Error("Missing table name or capacity"));
    }

    // Create a new table in the specified branch
    const newTable = await prisma.table.create({
      data: {
        name,
        capacity: Number(capacity),
        branchId: Number(branchId),
        status: "isOpen", // Default status for a new table
      },
    });

    // Return the newly created table
    return {
      statusCode: 201,
      body: newTable,
    };
  } catch (error) {
    console.error("Error creating table:", error);
    return sendError(event, new Error("Failed to create table"));
  }
});
