// /server/api/bill/[qrCodeId].ts
import { PrismaClient } from "@prisma/client";
import type { H3Event } from "h3";
import { sendError, send } from "h3";

const prisma = new PrismaClient();

export default async (event: H3Event) => {
  // Get qrCodeId from route params
  const qrCodeId = event.context.params?.qrCodeId;

  if (!qrCodeId) {
    return sendError(
      event,
      createError({ statusCode: 400, message: "qrCodeId is required" }),
    );
  }

  try {
    // Fetch the bill from the database, including the related orderMenus
    const bill = await prisma.bill.findUnique({
      where: { qrCodeId: qrCodeId },
      include: {
        orderMenus: {
          include: {
            orderOptions: true, // Include the related order options
          },
        },
      },
    });

    // If no bill is found, return a 404 error
    if (!bill) {
      return sendError(
        event,
        createError({ statusCode: 404, message: "Bill not found" }),
      );
    }

    // Return the bill as JSON
    return send(event, JSON.stringify(bill));
  } catch (error) {
    console.error(error);
    // Return a 500 error if something goes wrong
    return sendError(
      event,
      createError({ statusCode: 500, message: "Internal Server Error" }),
    );
  }
};
