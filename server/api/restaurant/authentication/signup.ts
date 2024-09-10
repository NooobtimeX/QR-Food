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

    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      throw createError({
        statusCode: 409,
        statusMessage: "User already exists",
      });
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(body.password, 10);

    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: hashedPassword,
      },
    });

    return {
      statusCode: 201,
      body: {
        message: "User created successfully",
        userId: user.id,
      },
    };
  } catch (error) {
    console.error("Error during user sign-up:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw createError({
        statusCode: 500,
        statusMessage: `Prisma error: ${error.message}`,
      });
    } else if (error instanceof Error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message || "Internal Server Error",
      });
    } else {
      throw createError({
        statusCode: 500,
        statusMessage: "Unknown error occurred",
      });
    }
  }
});
