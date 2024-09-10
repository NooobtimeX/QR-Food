import { defineEventHandler, createError, readBody } from "h3";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    // Log the request body for debugging
    console.log("Request body:", body);

    // Check for required fields (address is optional)
    if (!body.name || !body.phoneNumber || !body.restaurantId || !body.userId) {
      throw createError({
        statusCode: 400,
        statusMessage:
          "Missing required fields: name, phoneNumber, restaurantId, or userId",
      });
    }

    // Ensure the restaurant exists before creating a branch
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: body.restaurantId },
    });

    if (!restaurant) {
      throw createError({
        statusCode: 404,
        statusMessage: "Restaurant not found",
      });
    }

    // Create the new branch
    const branch = await prisma.branch.create({
      data: {
        name: body.name,
        address: body.address || "", // If address is not provided, set it to an empty string
        phoneNumber: body.phoneNumber,
        restaurantId: body.restaurantId,
      },
    });

    // After branch creation, assign the user as the owner of the branch in UserBranchRole
    await prisma.userBranchRole.create({
      data: {
        userId: body.userId,
        branchId: branch.id,
        role: "owner", // Assign the role as 'owner'
      },
    });

    // Fetch all menus from the restaurant
    const restaurantMenus = await prisma.menu.findMany({
      where: { restaurantId: body.restaurantId },
    });

    // Map the menus to the new branch in the BranchMenu model
    const branchMenusData = restaurantMenus.map((menu) => ({
      branchId: branch.id,
      menuId: menu.id,
      isActive: true, // Mark menus as active for this branch by default
    }));

    // Insert the branch menus in bulk
    await prisma.branchMenu.createMany({
      data: branchMenusData,
    });

    return {
      statusCode: 201,
      body: {
        message:
          "Branch created successfully, user assigned as owner, and menus added to branch",
        branchId: branch.id,
      },
    };
  } catch (error: unknown) {
    // Log the error for debugging
    console.error("Error during branch creation:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Prisma-specific errors
      throw createError({
        statusCode: 500,
        statusMessage: `Prisma error: ${error.message}`,
      });
    } else if (error instanceof Error) {
      // General errors
      throw createError({
        statusCode: 500,
        statusMessage: error.message || "Internal Server Error",
      });
    } else {
      // Fallback for unknown error types
      throw createError({
        statusCode: 500,
        statusMessage: "Unknown error occurred",
      });
    }
  }
});
