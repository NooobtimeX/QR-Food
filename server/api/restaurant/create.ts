import { defineEventHandler, createError, readBody } from "h3";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    // Log the request body for debugging
    console.log("Request body:", body);

    // Check for required fields
    if (!body.name || !body.userId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Missing required fields: name, or userId",
      });
    }

    // Create the new restaurant
    const restaurant = await prisma.restaurant.create({
      data: {
        name: body.name,
      },
    });

    // Associate the user as the owner using the UserRestaurantRole model
    await prisma.userRestaurantRole.create({
      data: {
        restaurantId: restaurant.id,
        userId: body.userId,
        role: "owner",
      },
    });

    return {
      statusCode: 201,
      body: {
        message: "Restaurant created successfully",
        restaurantId: restaurant.id,
      },
    };
  } catch (error: unknown) {
    // Log the error for debugging
    console.error("Error during restaurant creation:", error);

    if (error instanceof Error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message || "Internal Server Error",
      });
    } else {
      throw createError({
        statusCode: 500,
        statusMessage: "An unknown error occurred",
      });
    }
  }
});
