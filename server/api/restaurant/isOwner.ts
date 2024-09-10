import type { H3Event } from "h3";
import { defineEventHandler, createError, getQuery } from "h3";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event: H3Event) => {
  const query = getQuery(event);
  const userId = parseInt(query.userId as string, 10);
  const restaurantId = parseInt(query.restaurantId as string, 10);

  if (!userId || !restaurantId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid user ID or restaurant ID",
    });
  }

  try {
    // Check if the user is an owner of the restaurant
    const isOwner = await prisma.userRestaurantRole.findFirst({
      where: {
        userId: userId,
        restaurantId: restaurantId,
        role: "owner",
      },
    });

    return { isOwner: !!isOwner };
  } catch (error) {
    console.error("Error verifying ownership:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to verify ownership",
    });
  }
});
