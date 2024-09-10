import { PrismaClient } from "@prisma/client";
import { defineEventHandler, readBody, sendError } from "h3";

const prisma = new PrismaClient();

// Function to generate a unique QR code
const generateUniqueQRCode = async (): Promise<string> => {
  let qrCodeId: string = ""; // Initialize qrCodeId as an empty string
  let qrCodeExists = true;

  // Keep generating QR code until it's unique
  while (qrCodeExists) {
    qrCodeId = Math.random().toString(36).substring(2, 12).toUpperCase();

    // Check if the generated QR code already exists
    const existingTable = await prisma.table.findUnique({
      where: { qrCodeId },
    });

    // If QR code exists, generate a new one
    if (!existingTable) {
      qrCodeExists = false;
    }
  }

  return qrCodeId; // Return the generated unique QR code
};

export default defineEventHandler(async (event) => {
  try {
    // Extract branchId from the URL parameters
    const { branchId } = event.context.params as { branchId: string };

    // Read the request body (tableId)
    const body = await readBody(event);
    const { tableId } = body;

    // Validate input
    if (!tableId) {
      return sendError(event, new Error("Missing tableId"));
    }

    // Generate a unique QR code
    const qrCodeId = await generateUniqueQRCode();

    // Start a database transaction
    const result = await prisma.$transaction(async (prisma2) => {
      // Update the QR code for the specified table
      const updatedTable = await prisma2.table.update({
        where: {
          id: Number(tableId),
        },
        data: {
          qrCodeId, // qrCodeId is guaranteed to be a string
        },
      });

      // Create a new bill linked with the updated table
      const newBill = await prisma2.bill.create({
        data: {
          tableId: updatedTable.id,
          qrCodeId, // qrCodeId is guaranteed to be a string
          branchId: Number(branchId), // Include branchId
          totalAmount: 0, // Default value or calculate if necessary
          paymentStatus: "PENDING", // Set a default or appropriate value
          // Add any additional bill details here
        },
      });

      return {
        updatedTable,
        newBill,
      };
    });

    // Return the updated table and new bill data
    return {
      statusCode: 200,
      body: result,
    };
  } catch (error) {
    console.error("Error updating QR code and creating bill:", error);
    return sendError(
      event,
      new Error("Failed to update QR code and create bill"),
    );
  }
});
