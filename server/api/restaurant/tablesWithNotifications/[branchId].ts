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
    // Fetch tables with non-empty notifications for the branch
    const tables = await prisma.table.findMany({
      where: {
        branchId: Number(branchId),
        notification: {
          not: "",
        },
      },
    });

    return {
      body: tables,
    };
  } catch (error) {
    console.error("Error fetching tables:", error); // Log the error
    return { error: "Failed to fetch tables with notifications" };
  }
});
