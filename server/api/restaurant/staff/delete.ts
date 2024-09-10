import { defineEventHandler, createError, getQuery } from "h3";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const staffId = parseInt(query.id as string, 10);
  const userId = parseInt(query.userId as string, 10);
  const restaurantId = parseInt(query.restaurantId as string, 10);
  const branchId = parseInt(query.branchId as string, 10); // Assuming the branchId is also passed

  if (!staffId || !userId || !restaurantId || !branchId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing required parameters",
    });
  }

  try {
    // Verify that the user is an owner of the restaurant or branch
    const isOwnerInRestaurant = await prisma.userRestaurantRole.findFirst({
      where: {
        userId: userId,
        restaurantId: restaurantId,
        role: "owner",
      },
    });

    const isOwnerInBranch = await prisma.userBranchRole.findFirst({
      where: {
        userId: userId,
        branchId: branchId,
        role: "owner",
      },
    });

    if (!isOwnerInRestaurant && !isOwnerInBranch) {
      throw createError({
        statusCode: 403,
        statusMessage: "Only owners can delete staff members",
      });
    }

    // Check if the user is trying to delete themselves
    if (staffId === userId) {
      // Check if they are the only owner in the restaurant
      const ownerCount = await prisma.userRestaurantRole.count({
        where: {
          restaurantId: restaurantId,
          role: "owner",
        },
      });

      if (ownerCount === 1) {
        throw createError({
          statusCode: 403,
          statusMessage:
            "You cannot delete yourself if you're the only owner in the restaurant",
        });
      } else {
        throw createError({
          statusCode: 403,
          statusMessage: "You cannot delete yourself",
        });
      }
    }

    // Check if the staff member is an owner in this branch
    const staffIsBranchOwner = await prisma.userBranchRole.findFirst({
      where: {
        userId: staffId,
        branchId: branchId,
        role: "owner",
      },
    });

    if (staffIsBranchOwner) {
      // Check if the branch owner is also a restaurant owner
      const staffIsRestaurantOwner = await prisma.userRestaurantRole.findFirst({
        where: {
          userId: staffId,
          restaurantId: restaurantId,
          role: "owner",
        },
      });

      if (staffIsRestaurantOwner) {
        throw createError({
          statusCode: 403,
          statusMessage:
            "You cannot remove this owner as they are an owner of both the branch and the restaurant",
        });
      }
    }

    // Allow owners to delete staff from a specific branch
    if (staffId !== userId) {
      // Delete the staff member's role in the specific branch
      await prisma.userBranchRole.deleteMany({
        where: {
          userId: staffId,
          branchId: branchId, // Make sure to target the branch for deletion
        },
      });

      return { success: true };
    }
  } catch (error) {
    console.error("Error deleting staff member:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete staff member",
    });
  }
});
