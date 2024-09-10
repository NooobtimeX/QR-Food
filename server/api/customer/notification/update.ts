import { PrismaClient } from "@prisma/client";
import { defineEventHandler, readBody } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  // Get the request body
  const { qrCodeId, notification } = await readBody(event);

  // Validate that qrCodeId and notification are provided
  if (!qrCodeId || !notification) {
    return {
      statusCode: 400,
      body: {
        error: "QR Code ID and notification message are required.",
      },
    };
  }

  try {
    // Find the table by qrCodeId
    const table = await prisma.table.findUnique({
      where: {
        qrCodeId: String(qrCodeId),
      },
    });

    // If table is not found, return an error
    if (!table) {
      return {
        statusCode: 404,
        body: {
          error: "Table not found.",
        },
      };
    }

    // Create a new notification in the notification table
    const newNotification = await prisma.notification.create({
      data: {
        tableId: table.id, // Associate the notification with the table's ID
        branchId: table.branchId, // Associate with the branch
        message: notification, // The notification message
        createdAt: new Date(), // Set the creation date
      },
    });

    return {
      statusCode: 200,
      body: {
        message: "Notification created successfully.",
        notification: newNotification,
      },
    };
  } catch (error) {
    console.error("Failed to create notification:", error);
    return {
      statusCode: 500,
      body: {
        error: "Failed to create notification.",
      },
    };
  }
});
