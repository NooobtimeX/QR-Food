import { defineEventHandler, createError, readBody } from "h3";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  // Extract request body
  const body = await readBody(event);

  // Extract parameters from body
  const { restaurantId, name } = body;

  // Ensure restaurantId and name are provided
  if (!restaurantId || !name) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "restaurantId and name are required",
    });
  }

  try {
    // Create new category in the database
    const newCategory = await prisma.category.create({
      data: {
        name,
        restaurantId: parseInt(restaurantId, 10), // Ensure restaurantId is an integer
      },
    });

    return {
      statusCode: 201,
      body: newCategory,
    };
  } catch (error) {
    console.error("Error creating category:", error);
    throw createError({
      statusCode: 500,
      message: "Error creating category",
    });
  }
});
