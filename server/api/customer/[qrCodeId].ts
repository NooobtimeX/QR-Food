import { PrismaClient } from "@prisma/client";
import { defineEventHandler, sendError, readBody } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const method = event.req.method;
  const qrCodeId = event.context.params?.qrCodeId;

  if (method === "POST") {
    try {
      const body = await readBody(event);
      const { name, price, description, categoryId, restaurantId, photoUrl } =
        body;

      const newMenu = await prisma.menu.create({
        data: {
          name,
          price,
          description,
          photoUrl,
          categoryId,
          restaurantId,
        },
      });

      return {
        status: 201,
        body: newMenu,
      };
    } catch (error) {
      console.error("Failed to create menu:", error);
      return sendError(event, new Error("Failed to create new menu"));
    }
  } else if (method === "GET") {
    try {
      if (!qrCodeId) {
        throw new Error("QR Code ID not provided");
      }

      // Find table and branch based on QR Code ID
      const table = await prisma.table.findUnique({
        where: {
          qrCodeId: qrCodeId,
        },
        include: {
          branch: true,
        },
      });

      if (!table || !table.branch) {
        throw new Error("Table or Branch not found for the given QR Code");
      }

      const branchId = table.branch.id;

      // Fetch all active menus for the branch with detailed information
      const branchMenus = await prisma.branchMenu.findMany({
        where: {
          branchId: branchId,
          isActive: true,
        },
        include: {
          menu: {
            include: {
              category: true,
              sections: {
                include: {
                  options: true,
                },
              },
            },
          },
        },
      });

      // Format the menus with all details
      const menus = branchMenus.map((branchMenu) => {
        const menu = branchMenu.menu;

        return {
          id: menu.id,
          name: menu.name,
          price: menu.price,
          photoUrl: menu.photoUrl,
          description: menu.description,
          category: menu.category,
          options: menu.sections.map((section) => ({
            optionName: section.name,
            choices: section.options.map((option) => ({
              name: option.name,
              price: option.price,
            })),
          })),
        };
      });

      return {
        status: 200,
        body: {
          branchId,

          menus,
        },
      };
    } catch (error) {
      console.error("Failed to fetch data:", error);
      return sendError(event, new Error("Failed to fetch data"));
    }
  }
});
