import { defineEventHandler, createError, readBody } from "h3";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    // Parse the request body
    const body = await readBody(event);

    // Extract the restaurant ID from the body
    const { id } = body;

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Restaurant ID is required",
      });
    }

    // Query the database to see if the restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: parseInt(id, 10) }, // Assuming `id` is an integer
    });

    if (restaurant) {
      return { exists: true };
    } else {
      return { exists: false };
    }
  } catch (error) {
    console.error("Error checking restaurant existence:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error",
    });
  }
});
