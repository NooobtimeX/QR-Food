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

  const orders = await prisma.orderMenu.findMany({
    where: { bill: { branchId } },
    select: {
      status: true,
      quantity: true,
      totalPrice: true,
      name: true,
      note: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return orders;
});
