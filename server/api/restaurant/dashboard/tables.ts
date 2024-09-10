import { PrismaClient } from "@prisma/client";
import { defineEventHandler, getQuery, createError } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const branchId = parseInt(query.branchId as string);

  // Validate branchId to ensure it’s a number
  if (isNaN(branchId)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid branch ID",
    });
  }

  // Fetch table statuses for the specified branch
  const tables = await prisma.table.findMany({
    where: { branchId },
    select: { status: true },
  });

  return tables;
});
