import { defineEventHandler, createError, readBody } from "h3";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    // Read the request body to get the email, role, and branchId
    const body = await readBody(event);
    const { email, role, branchId } = body;

    // Validate the required fields
    if (!email || !role || !branchId) {
      console.error("Missing required fields:", { email, role, branchId });
      throw createError({
        statusCode: 400,
        statusMessage: "Missing required fields",
      });
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error("User not found:", email);
      throw createError({
        statusCode: 404,
        statusMessage: "User not found",
      });
    }

    // Check if the user is already assigned a role in the branch
    const existingRole = await prisma.userBranchRole.findUnique({
      where: {
        branchId_userId: {
          branchId,
          userId: user.id,
        },
      },
    });

    // If the user already has a role in this branch, return a conflict error
    if (existingRole) {
      console.error("User already has a role in this branch:", existingRole);
      throw createError({
        statusCode: 409,
        statusMessage: "User already has a role in this branch",
      });
    }

    // Create a new role assignment for the user in the specified branch
    await prisma.userBranchRole.create({
      data: {
        branchId,
        userId: user.id,
        role,
      },
    });

    // Return success response
    return { success: true };
  } catch (error) {
    // Handle errors and provide a generic error response
    console.error("Failed to add role:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to add role",
    });
  }
});
