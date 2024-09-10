import { PrismaClient } from "@prisma/client";
import { defineEventHandler, readBody } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const { tableId } = await readBody(event);

  if (!tableId) {
    return { error: "Table ID is required", statusCode: 400 };
  }

  try {
    const bill = await prisma.bill.findFirst({
      where: { tableId: Number(tableId) },
      include: {
        orderMenus: true, // Get all orderMenus related to the bill
      },
    });

    if (!bill) {
      return { error: "No bill found for the table", statusCode: 404 };
    }

    // Check if there are any pending orders
    const hasPendingOrders = bill.orderMenus.some(
      (order) => order.status === "pending",
    );

    return {
      statusCode: 200,
      hasPendingOrders,
    };
  } catch (error) {
    console.error("Error checking pending orders:", error);
    return { error: "Failed to check pending orders", statusCode: 500 };
  }
});
