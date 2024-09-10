import { PrismaClient } from "@prisma/client";
import { defineEventHandler, readBody } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const { notificationId } = await readBody(event);

  if (!notificationId) {
    return { error: "notificationId is required" };
  }

  try {
    // Delete the notification by its ID
    await prisma.notification.delete({
      where: {
        id: Number(notificationId),
      },
    });

    return { message: "Notification cleared successfully" };
  } catch (error) {
    console.error("Error clearing notification:", error); // Log the error
    return { error: "Failed to clear notification" };
  }
});
