import { PrismaClient } from "@prisma/client";
import { defineEventHandler } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const params = event.context.params as Record<string, string> | undefined;
  const branchId = params?.branchId;

  if (!branchId) {
    return { error: "branchId is required" };
  }

  try {
    // Fetch notifications for the branch and join related table details
    const notifications = await prisma.notification.findMany({
      where: {
        branchId: Number(branchId), // Match branch ID
        message: {
          not: "", // Ensure message is not empty
        },
      },
      include: {
        table: true, // Include related table details
      },
    });

    // Define the type of `tablesWithNotifications`
    type TableWithNotifications = {
      id: number;
      name: string;
      notifications: { id: number; message: string; createdAt: Date }[];
    };

    const tablesWithNotifications = notifications.reduce<
      Record<number, TableWithNotifications>
    >(
      (result, notification) => {
        const tableId = notification.tableId;

        if (!result[tableId]) {
          result[tableId] = {
            id: notification.table.id,
            name: notification.table.name,
            notifications: [],
          };
        }

        result[tableId].notifications.push({
          id: notification.id,
          message: notification.message,
          createdAt: notification.createdAt,
        });

        return result;
      },
      {}, // Initial value of reduce
    );

    return {
      body: Object.values(tablesWithNotifications),
    };
  } catch (error) {
    console.error("Error fetching notifications:", error); // Log the error
    return { error: "Failed to fetch notifications" };
  }
});
