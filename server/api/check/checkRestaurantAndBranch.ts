import { defineEventHandler, readBody } from "h3";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { restaurantId, branchId, userId } = body;

  if (!userId || !restaurantId || !branchId) {
    return {
      exists: false,
      message: "Missing userId, restaurantId, or branchId",
    };
  }

  try {
    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });

    if (!user) {
      return {
        exists: false,
        message: "User not found",
      };
    }

    // Check if the restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: Number(restaurantId) },
    });

    if (!restaurant) {
      return {
        exists: false,
        message: "Restaurant not found",
      };
    }

    // Check if the branch exists for the given restaurant
    const branch = await prisma.branch.findFirst({
      where: {
        id: Number(branchId),
        restaurantId: Number(restaurantId),
      },
    });

    if (!branch) {
      return {
        exists: false,
        message: "Branch not found",
      };
    }

    // Optionally, check if the user has a role in the branch
    const userBranchRole = await prisma.userBranchRole.findFirst({
      where: {
        userId: Number(userId),
        branchId: Number(branchId),
      },
    });

    if (!userBranchRole) {
      return {
        exists: false,
        message: "User does not have access to this branch",
      };
    }

    // If everything is valid, return the restaurant and branch names
    return {
      exists: true,
      restaurant: { name: restaurant.name },
      branch: { name: branch.name },
      userRole: {
        branchRole: userBranchRole.role,
      },
    };
  } catch (error) {
    console.error("Error checking restaurant, branch, and user roles:", error);
    return {
      exists: false,
      message: "Internal server error",
    };
  }
});
