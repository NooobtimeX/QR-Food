import { PrismaClient } from "@prisma/client";
import { defineEventHandler, readBody } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    // Parse the body to get branchId
    const { branchId } = await readBody(event);

    // Ensure branchId is valid
    if (!branchId) {
      throw new Error("branchId is missing");
    }

    // Fetch orders from OrderMenu for the specific branchId
    const orders = await prisma.orderMenu.findMany({
      where: {
        bill: {
          branchId: Number(branchId), // Ensure branchId is treated as an integer
        },
      },
      include: {
        orderOptions: true, // Include related options if needed
        bill: {
          include: {
            table: true, // Include the table info related to the bill
          },
        },
      },
    });

    // Filter out orders that are not connected to any table
    const ordersWithTable = orders.filter((order) => order.bill?.table);

    // Map and return only the important data
    const importantData = ordersWithTable.map((order) => ({
      id: order.id,
      table: order.bill?.table?.name || "Unknown", // Get table name, default to 'Unknown' if not found
      status: order.status,
      time: order.createdAt, // Assuming createdAt is the order time
      menuName: order.name, // Assuming 'name' is the menu name in OrderMenu
      quantity: order.quantity,
      menuPrice: order.totalPrice, // Assuming 'totalPrice' is the menu price
      note: order.note, // Assuming 'note' is the order note
      whoOrdered: order.whoOrdered,
      items: order.orderOptions.map((option) => ({
        optionName: option.name, // Name of the option
        selectedChoice: option.selectedChoice, // User's selected choice
        choicePrice: option.choicePrice, // Price of the selected choice
      })),
    }));

    return importantData;
  } catch (error) {
    console.error("Error fetching orders:", error);
    event.res.statusCode = 500;
    return { error: "Internal Server Error" };
  }
});
