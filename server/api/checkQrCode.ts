import { PrismaClient } from "@prisma/client";
import { defineEventHandler, readBody, createError } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { qrCodeId } = body;

  if (!qrCodeId) {
    throw createError({
      statusCode: 400,
      statusMessage: "QR Code ID is required",
    });
  }

  try {
    const bill = await prisma.bill.findUnique({
      where: { qrCodeId: qrCodeId as string },
      include: { table: true },
    });

    if (bill && bill.table) {
      return { success: true, tableId: bill.tableId };
    } else {
      return { success: false }; // Indicate no associated table
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Server error while checking QR Code",
    });
  }
});
