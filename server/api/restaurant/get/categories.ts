import { PrismaClient } from "@prisma/client";
import { defineEventHandler, createError, readBody } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    // Parse request body
    const body = await readBody(event);
    const { restaurantId } = body as { restaurantId: number };

    if (!restaurantId) {
      throw createError({
        statusCode: 400,
        message: "Restaurant ID is required",
      });
    }

    // Fetch categories from the database
    const categories = await prisma.category.findMany({
      where: { restaurantId },
    });

    // Return categories in the expected format
    return categories.map((category) => ({
      id: category.id,
      name: category.name,
    }));
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw createError({
        statusCode: 500,
        message: error.message || "Failed to fetch categories",
      });
    } else {
      throw createError({
        statusCode: 500,
        message: "An unknown error occurred",
      });
    }
  }
});
