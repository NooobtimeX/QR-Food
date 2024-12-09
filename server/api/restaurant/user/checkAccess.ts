import { defineEventHandler, readBody } from "h3";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const { userId, branchId } = await readBody(event);

  if (!userId || !branchId) {
    return {
      success: false,
      message: "Missing userId or branchId",
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    // Check if the user has any role in the specified branch
    const userBranchRole = await prisma.userBranchRole.findFirst({
      where: {
        userId: Number(userId),
        branchId: Number(branchId),
      },
    });

    if (userBranchRole) {
      return {
        success: true,
        data: {
          role: userBranchRole.role,
        },
      };
    }

    // If no role found, deny access
    return {
      success: false,
      message: "User does not have access to this branch",
    };
  } catch (error) {
    console.error("Error checking user access:", error);
    return {
      success: false,
      message: "Internal server error",
    };
  }
});
