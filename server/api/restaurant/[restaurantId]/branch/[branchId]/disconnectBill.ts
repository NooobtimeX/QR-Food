import { PrismaClient } from "@prisma/client";
import { defineEventHandler, createError, readBody } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    // Extract tableId from request body
    const { tableId } = await readBody(event);

    if (!tableId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Table ID is required",
      });
    }

    // Fetch the bill associated with this table, including only "finish" OrderMenus and their OrderOptions
    const bill = await prisma.bill.findFirst({
      where: {
        tableId: tableId,
      },
      include: {
        orderMenus: {
          where: {
            status: "finish", // Only include completed order menus
          },
          include: {
            orderOptions: true,
          },
        },
      },
    });

    if (!bill) {
      throw createError({
        statusCode: 404,
        statusMessage: "Bill not found for the specified table",
      });
    }

    // Calculate total price for only completed items
    const totalPrice = bill.orderMenus.reduce((total, orderMenu) => {
      // Calculate total for the base menu price
      const menuTotal = orderMenu.totalPrice * orderMenu.quantity;

      // Add the total price of options for this order menu
      const optionsTotal = orderMenu.orderOptions.reduce((optTotal, option) => {
        return optTotal + option.choicePrice;
      }, 0);

      return total + menuTotal + optionsTotal;
    }, 0);

    // Update bill with the calculated total amount
    await prisma.bill.update({
      where: { id: bill.id },
      data: { totalAmount: totalPrice },
    });

    // Disconnect the bill from the table
    await prisma.bill.updateMany({
      where: {
        tableId: tableId,
      },
      data: {
        tableId: null, // Set tableId to null to disconnect
      },
    });

    return {
      statusCode: 200,
      statusMessage:
        "Bill disconnected and total price calculated successfully",
      totalAmount: totalPrice,
    };
  } catch (error) {
    console.error("Error disconnecting bill:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error disconnecting bill",
    });
  } finally {
    // Ensure Prisma Client is disconnected
    await prisma.$disconnect();
  }
});
