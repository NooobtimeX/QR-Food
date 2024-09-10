// File: server/api/restaurant/orders/updateStatus.ts
import { PrismaClient } from "@prisma/client";
import { defineEventHandler, readBody, createError } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    // Read the request body
    const body = await readBody(event);
    const { orderMenuId, status } = body;
    console.log(orderMenuId);
    // Check if required parameters are provided
    if (!orderMenuId || !status) {
      throw createError({
        statusCode: 400,
        message: "orderMenuId and status are required",
      });
    }

    // Update the order in the database
    const updatedOrder = await prisma.orderMenu.update({
      where: { id: orderMenuId },
      data: { status },
    });

    return { success: true, updatedOrder };
  } catch (error) {
    console.error("Error updating order status:", error);
    throw createError({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
});
