import { defineEventHandler, createError } from "h3";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    // Extract qrCodeId from the query parameters
    const qrCodeId = event.context.params?.qrCodeId;

    if (!qrCodeId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Missing required parameter: qrCodeId",
      });
    }

    // Retrieve the bill and related details
    const bill = await prisma.bill.findUnique({
      where: { qrCodeId },
      include: {
        table: {
          select: {
            name: true, // Table name (e.g., "Table 5")
            branch: {
              select: {
                name: true, // Branch name (e.g., "Main Branch")
                restaurant: {
                  select: {
                    name: true, // Restaurant name (e.g., "My Restaurant")
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!bill) {
      throw createError({
        statusCode: 404,
        statusMessage: "Bill not found",
      });
    }

    // Format the response data
    return {
      statusCode: 200,
      body: {
        qrCodeId: bill.qrCodeId,
        totalAmount: bill.totalAmount,
        paymentStatus: bill.paymentStatus,
        createdAt: bill.createdAt,
        updatedAt: bill.updatedAt,
        restaurantName: bill.table?.branch?.restaurant.name || "",
        branchName: bill.table?.branch?.name || "",
        tableNumber: bill.table?.name || "",
      },
    };
  } catch (error) {
    console.error("Error fetching bill:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }
});
