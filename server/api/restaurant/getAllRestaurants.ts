import { defineEventHandler, createError, getQuery } from "h3";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    // Get the userId from the query string for a GET request
    const query = getQuery(event);
    const { userId } = query;

    // Check if userId is present in the query parameters
    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request: Missing userId in query parameters",
      });
    }

    // Fetch restaurants where the user has a direct relationship
    const restaurants = await prisma.restaurant.findMany({
      where: {
        OR: [
          {
            userRestaurantRoles: {
              some: {
                userId: Number(userId), // Direct relation to the restaurant
              },
            },
          },
          {
            branches: {
              some: {
                userBranchRoles: {
                  some: {
                    userId: Number(userId), // Direct relation to a branch
                  },
                },
              },
            },
          },
        ],
      },
      include: {
        userRestaurantRoles: {
          where: { userId: Number(userId) },
          select: { role: true },
        },
        branches: {
          include: {
            userBranchRoles: {
              where: { userId: Number(userId) },
              select: { role: true },
            },
          },
        },
      },
    });

    // Transform data to include relation type
    const formattedRestaurants = restaurants.map((restaurant) => {
      const isDirectRestaurantRelation =
        restaurant.userRestaurantRoles.length > 0;

      // Map branches to add relation type for branch relations
      const formattedBranches = restaurant.branches.map((branch) => ({
        ...branch,
        relationType: branch.userBranchRoles.length > 0 ? "branch" : null,
        userBranchRoles: branch.userBranchRoles, // keep the role information
      }));

      return {
        ...restaurant,
        relationType: isDirectRestaurantRelation ? "restaurant" : "branch",
        branches: formattedBranches,
      };
    });

    // Separate out owned and staff restaurants for better structure
    const ownedRestaurants = formattedRestaurants.filter(
      (restaurant) => restaurant.relationType === "restaurant",
    );
    const staffRestaurants = formattedRestaurants.filter(
      (restaurant) => restaurant.relationType === "branch",
    );

    // Return the response with additional metadata
    return {
      statusCode: 200,
      body: {
        ownedRestaurants,
        staffRestaurants,
      },
    };
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch restaurants",
    });
  }
});
