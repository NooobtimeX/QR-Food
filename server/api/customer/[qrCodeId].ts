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

      const restaurantId = table.branch.restaurantId;
      const branchId = table.branch.id;

      const branchMenus = await prisma.branchMenu.findMany({
        where: {
          branchId: branchId,
          isActive: true,
        },
        include: {
          menu: {
            include: {
              category: true,
            },
          },
        },
      });

      const menus = branchMenus.map((branchMenu) => ({
        id: branchMenu.menu.id,
        name: branchMenu.menu.name,
        price: branchMenu.menu.price,
        photoUrl: branchMenu.menu.photoUrl,
        category: branchMenu.menu.category,
      }));

      return {
        status: 200,
        body: {
          restaurantId,
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
