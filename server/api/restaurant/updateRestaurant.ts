import type { H3Event } from "h3";
import { defineEventHandler, createError, readBody } from "h3";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Read the request body
    const body = await readBody(event);
    const { userId, restaurantId, name, phoneNumber } = body;

    // Validate input
    if (!userId || !restaurantId || !name || !phoneNumber) {
      throw createError({
        statusCode: 400,
        statusMessage: "Missing required fields",
      });
    }

    // Check if the user is the owner of the restaurant
    const isOwner = await prisma.userRestaurantRole.findFirst({
      where: {
        userId: userId,
        restaurantId: restaurantId,
        role: "owner",
      },
    });

    if (!isOwner) {
      throw createError({
        statusCode: 403,
        statusMessage: "You are not authorized to update this restaurant",
      });
    }

    // Update the restaurant's name and phone number
    const updatedRestaurant = await prisma.restaurant.update({
      where: {
        id: restaurantId,
      },
      data: {
        name: name,
        phoneNumber: phoneNumber,
      },
    });

    return {
      statusCode: 200,
      body: updatedRestaurant,
    };
  } catch (error) {
    console.error("Error updating restaurant:", error);

    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error",
    });
  } finally {
    await prisma.$disconnect();
  }
});
