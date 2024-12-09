import { defineEventHandler } from "h3";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const { restaurantId, branchId } = await readBody(event);

  if (!restaurantId || !branchId) {
    return {
      success: false,
      message: "Missing restaurantId or branchId",
    };
  }

  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: Number(restaurantId) },
    });

    if (!restaurant) {
      return {
        success: false,
        message: "Restaurant not found",
      };
    }

    const branch = await prisma.branch.findFirst({
      where: {
        id: Number(branchId),
        restaurantId: Number(restaurantId),
      },
    });

    if (!branch) {
      return {
        success: false,
        message: "Branch not found",
      };
    }

    return {
      success: true,
      data: {
        restaurant: { name: restaurant.name },
        branch: { name: branch.name },
      },
    };
  } catch (error) {
    console.error("Error fetching branch and restaurant details:", error);
    return {
      success: false,
      message: "Internal server error",
    };
  }
});
