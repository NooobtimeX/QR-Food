import { PrismaClient } from "@prisma/client";
import { createError, readBody } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    // Extract the request body
    const body = await readBody(event);
    const qrCodeId = body.qrCodeId;

    // Validate that qrCodeId is present in the body
    if (!qrCodeId) {
      throw createError({
        statusCode: 400,
        statusMessage: "qrCodeId is required in the request body",
      });
    }

    // Fetch the bill associated with the qrCodeId
    const bill = await prisma.bill.findFirst({
      where: { qrCodeId },
      include: {
        orderMenus: {
          include: {
            orderOptions: true, // Include options for each order
          },
        },
      },
    });

    // If no bill is found, return an error
    if (!bill) {
      throw createError({
        statusCode: 404,
        statusMessage: "No orders found for this qrCodeId",
      });
    }

    // Format the response data
    const responseData = {
      qrCodeId: bill.qrCodeId,
      totalAmount: bill.totalAmount,
      paymentStatus: bill.paymentStatus, // e.g., Pending, Paid
      orders: bill.orderMenus.map((order) => ({
        name: order.name,
        quantity: order.quantity,
        totalPrice: order.totalPrice,
        status: order.status, // Ensure this field is included
        note: order.note, // Ensure this field is included
        options: order.orderOptions.map((option) => ({
          optionName: option.name,
          selectedChoice: option.selectedChoice,
          choicePrice: option.choicePrice,
        })),
      })),
    };

    // Return the formatted response
    return {
      statusCode: 200,
      data: responseData,
    };
  } catch (error) {
    // Handle the error safely by checking its type
    if (error instanceof Error) {
      console.error("Error fetching orders:", error.message);

      // Handle Prisma or application-related errors
      return {
        statusCode: 500,
        statusMessage: error.message,
      };
    } else {
      console.error("Unexpected error:", error);

      // Handle unknown errors
      return {
        statusCode: 500,
        statusMessage: "An unknown error occurred",
      };
    }
  }
});
