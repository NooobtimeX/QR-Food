import { defineEventHandler, createError } from "h3";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    // Safely extract userId from context params
    const userId = event.context.params?.userId;

    // Validate the userId
    if (!userId) {
      console.error("Missing userId");
      throw createError({
        statusCode: 400,
        statusMessage: "User ID is required",
      });
    }

    // Parse userId to integer
    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
      console.error("Invalid userId");
      throw createError({
        statusCode: 400,
        statusMessage: "User ID must be a valid number",
      });
    }

    // Check if the user exists in the database
    const user = await prisma.user.findUnique({
      where: { id: parsedUserId },
    });

    if (!user) {
      // Return a redirect response or a specific message to handle redirection
      return {
        success: false,
        redirectTo: "/other-page",
        message: "User not found. Redirecting...",
      };
    }

    // Return success response if user exists
    return { success: true, user };
  } catch (error) {
    // Handle errors
    console.error("Error checking user existence:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to check user existence",
    });
  }
});
