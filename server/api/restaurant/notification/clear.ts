import { PrismaClient } from "@prisma/client";
import { defineEventHandler, readBody } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const { tableId } = await readBody(event);

  if (!tableId) {
    return { error: "tableId is required" };
  }

  try {
    // Clear the notification text from the table
    await prisma.table.update({
      where: {
        id: Number(tableId),
      },
      data: {
        notification: "", // Clear the notification
      },
    });

    return { message: "Notification cleared successfully" };
  } catch (error) {
    console.error("Error clearing notification:", error); // Log the error
    return { error: "Failed to clear notification" };
  }
});
