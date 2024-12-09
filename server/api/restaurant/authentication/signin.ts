import { defineEventHandler, createError, readBody } from "h3";
import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    if (!body.email || !body.password) {
      throw createError({
        statusCode: 400,
        statusMessage: "Missing required fields: email, password",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Invalid email or password",
      });
    }

    // Use bcrypt to compare provided password with hashed password in the database
    const passwordMatch = await bcrypt.compare(body.password, user.password);
    if (!passwordMatch) {
      throw createError({
        statusCode: 401,
        statusMessage: "Invalid email or password",
      });
    }

    return {
      statusCode: 200,
      body: {
        message: "Sign in successful",
        userId: user.id,
      },
    };
  } catch (error) {
    console.error("Error during user sign-in:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw createError({
        statusCode: 500,
        statusMessage: `Database error: ${error.message}`,
      });
    } else if (error instanceof Error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message || "Internal Server Error",
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Unknown error occurred",
    });
  }
});
