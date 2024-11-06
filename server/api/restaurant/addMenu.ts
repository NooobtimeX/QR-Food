import { PrismaClient } from "@prisma/client";
import type { H3Event } from "h3";
import { createError, readBody } from "h3";

const prisma = new PrismaClient();

interface Option {
  name: string;
  price: number;
}

interface Section {
  name: string;
  options: Option[];
}

interface CreateMenuBody {
  name: string;
  description: string;
  price: number;
  categoryId: number;
  restaurantId: number;
  sections: Section[];
  photoUrl?: string; // Add photoUrl as an optional field
}

export default async (event: H3Event) => {
  try {
    const body = await readBody<CreateMenuBody>(event);
    const {
      name,
      description,
      price,
      categoryId,
      restaurantId,
      sections,
      photoUrl,
    } = body;

    if (!name || !price || !categoryId || !restaurantId) {
      return createError({
        statusCode: 400,
        message: "Missing required fields",
      });
    }

    const menu = await prisma.menu.create({
      data: {
        name,
        description,
        price,
        categoryId,
        restaurantId,
        photoUrl, // Save the photo URL
        sections: {
          create: sections.map((section) => ({
            name: section.name,
            options: {
              create: section.options.map((option) => ({
                name: option.name,
                price: option.price,
              })),
            },
          })),
        },
      },
    });

    const branches = await prisma.branch.findMany({
      where: {
        restaurantId: restaurantId,
      },
    });

    const branchMenuPromises = branches.map(async (branch) => {
      try {
        await prisma.branchMenu.create({
          data: {
            branchId: branch.id,
            menuId: menu.id,
            isActive: true,
          },
        });
      } catch (error) {
        console.error(
          `Error creating branchMenu for branch ${branch.id}:`,
          error,
        );
      }
    });

    await Promise.all(branchMenuPromises);

    return { status: 201, body: menu };
  } catch (error) {
    console.error("Error creating menu:", error);
    return createError({ statusCode: 500, message: "Internal Server Error" });
  }
};
