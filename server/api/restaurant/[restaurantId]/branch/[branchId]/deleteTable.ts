import { PrismaClient } from "@prisma/client";
import { defineEventHandler, createError, readBody } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const { tableId } = await readBody(event);

    if (!tableId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Table ID is required",
      });
    }

    await prisma.table.delete({
      where: { id: parseInt(tableId, 10) },
    });

    return {
      statusCode: 200,
      statusMessage: "Table deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting table:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error",
    });
  } finally {
    await prisma.$disconnect();
  }
});
