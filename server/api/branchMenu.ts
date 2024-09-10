import { PrismaClient } from "@prisma/client";
import { defineEventHandler, sendError, readBody } from "h3";

const prisma = new PrismaClient();

interface RequestBody {
  branchId: number;
  menuId?: number;
  isActive?: boolean;
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<RequestBody>(event);
    const { branchId, menuId, isActive } = body;

    if (!branchId) {
      return sendError(event, {
        statusCode: 400,
        message: "Invalid data: branchId is missing",
        name: "",
      });
    }

    const parsedBranchId = parseInt(branchId as unknown as string, 10);

    if (menuId !== undefined && isActive !== undefined) {
      // Update menu status
      await prisma.branchMenu.update({
        where: { branchId_menuId: { branchId: parsedBranchId, menuId } },
        data: { isActive },
      });
    }

    // Fetch menus
    const branchMenus = await prisma.branchMenu.findMany({
      where: { branchId: parsedBranchId },
      include: {
        menu: {
          include: {
            category: true,
          },
        },
      },
    });

    const menus = branchMenus.map((branchMenu) => ({
      ...branchMenu.menu,
      isActive: branchMenu.isActive,
    }));

    return {
      statusCode: 200,
      body: { menus },
    };
  } catch (error) {
    console.error("Error handling branch menu:", error);
    return sendError(event, {
      statusCode: 500,
      message: "Failed to handle branch menu",
      name: "",
    });
  }
});
