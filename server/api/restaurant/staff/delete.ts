import { defineEventHandler, createError, getQuery } from "h3";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const staffId = parseInt(query.id as string, 10);
  const userId = parseInt(query.userId as string, 10);
  const restaurantId = parseInt(query.restaurantId as string, 10);

  if (!staffId || !userId || !restaurantId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing required parameters",
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

    if (!isOwner) {
      throw createError({
        statusCode: 403,
        statusMessage: "Only owners can delete staff members",
      });
    }

    // Delete the staff member's role in the restaurant
    await prisma.userRestaurantRole.deleteMany({
      where: {
        userId: staffId,
        restaurantId: restaurantId,
        role: "staff", // Ensure only staff roles are deleted
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting staff member:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete staff member",
    });
  }
});
