import { PrismaClient } from "@prisma/client";
import type { H3Event } from "h3";
import { sendError, send } from "h3";

const prisma = new PrismaClient();

export default async (event: H3Event) => {
  const qrCodeId = event.context.params?.qrCodeId;

  if (!qrCodeId) {
    return sendError(
      event,
      createError({ statusCode: 400, message: "qrCodeId is required" }),
    );
  }

  try {
    // Fetch the bill, including related restaurant and branch information
    const bill = await prisma.bill.findUnique({
      where: { qrCodeId: qrCodeId },
      include: {
        orderMenus: {
          include: {
            orderOptions: true, // Include related order options
          },
        },
        branch: {
          select: {
            name: true,
            restaurant: {
              select: { name: true }, // Get restaurant name
            },
          },
        },
      },
    });

    if (!bill) {
      return sendError(
        event,
        createError({ statusCode: 404, message: "Bill not found" }),
      );
    }

    // Transform the response to include options array in each order menu
    const transformedBill = {
      ...bill,
      orderMenus: bill.orderMenus.map(({ orderOptions, ...orderMenu }) => ({
        ...orderMenu,
        options: orderOptions.map((option) => ({
          name: option.name,
          selectedChoice: option.selectedChoice,
          choicePrice: option.choicePrice,
        })),
      })),
    };

    // Return the response as a JSON string
    return send(event, JSON.stringify(transformedBill));
  } catch (error) {
    console.error(error);
    return sendError(
      event,
      createError({ statusCode: 500, message: "Internal Server Error" }),
    );
  }
};
