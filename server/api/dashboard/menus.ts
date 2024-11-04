import { PrismaClient } from "@prisma/client";
import { defineEventHandler, getQuery } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const branchId = parseInt(query.branchId as string);

  if (isNaN(branchId)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid branch ID",
    });
  }

  const branchMenus = await prisma.branchMenu.findMany({
    where: { branchId },
    select: { isActive: true },
  });

  return branchMenus;
});
