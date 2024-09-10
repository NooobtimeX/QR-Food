import { defineEventHandler, createError, getQuery } from "h3";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const branchId = parseInt(query.branchId as string, 10); // Use branchId instead of restaurantId

  if (!branchId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid branch ID",
    });
  }

  try {
    // Fetch users by their role in a specific branch
    const branchRoles = await prisma.userBranchRole.findMany({
      where: { branchId },
      include: {
        user: true, // Include user information
      },
    });

    if (!branchRoles || branchRoles.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "No users found for this branch",
      });
    }

    // Map the roles and users data
    const allStaff = branchRoles.map((role) => ({
      id: role.user.id,
      email: role.user.email,
      role: role.role, // This will be either 'owner' or 'staff'
    }));

    return { body: allStaff };
  } catch (error) {
    console.error("Error fetching staff members:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch staff members",
    });
  }
});
