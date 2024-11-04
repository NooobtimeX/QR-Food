import { PrismaClient } from "@prisma/client";
import { defineEventHandler, sendRedirect, getQuery } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  // Retrieve qrCodeId from query parameters
  const { qrCodeId } = getQuery(event);

  if (!qrCodeId) {
    throw createError({
      statusCode: 400,
      statusMessage: "QR Code ID is required",
    });
  }

  try {
    // Check if the qrCodeId is associated with a table in the Bill model
    const bill = await prisma.bill.findUnique({
      where: { qrCodeId: qrCodeId as string }, // Explicitly pass qrCodeId
      include: { table: true },
    });

    if (bill && bill.table) {
      // If there's a table associated, return a success response
      return { success: true, tableId: bill.tableId };
    } else {
      // Redirect if no table is associated with this QR code
      sendRedirect(event, "/no-table-associated"); // Change the redirect path as needed
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Server error while checking QR Code",
    });
  }
});
