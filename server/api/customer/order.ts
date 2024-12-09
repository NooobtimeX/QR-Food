import { PrismaClient } from "@prisma/client";
import { defineEventHandler, sendError, readBody } from "h3";

const prisma = new PrismaClient();

interface Option {
  optionName: string;
  selectedChoice: string;
  choicePrice: number;
}

interface CartItem {
  menuId: number;
  name: string;
  price: number;
  quantity: number;
  note?: string;
  options?: Option[];
}

interface RequestBody {
  qrCodeId: string;
  cart: CartItem[];
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<RequestBody>(event);
    const { qrCodeId, cart } = body;

    if (!qrCodeId || !Array.isArray(cart)) {
      return sendError(event, {
        statusCode: 400,
        message: "Invalid data: qrCodeId or cart is missing",
        name: "",
      });
    }

    let bill = await prisma.bill.findUnique({
      where: { qrCodeId },
    });

    if (!bill) {
      bill = await prisma.bill.create({
        data: {
          qrCodeId,
          branchId: 1, // Update with the actual branchId
          totalAmount: 0,
          paymentStatus: "pending",
        },
      });
    }

    let totalAmount = 0;

    for (const item of cart) {
      const orderMenu = await prisma.orderMenu.create({
        data: {
          name: item.name,
          quantity: item.quantity,
          totalPrice: item.price * item.quantity,
          qrCodeId,
          note: item.note || "",
          billId: bill.id,
        },
      });

      if (item.options && item.options.length > 0) {
        await prisma.orderOption.createMany({
          data: item.options.map((option) => ({
            orderMenuId: orderMenu.id,
            name: option.optionName,
            selectedChoice: option.selectedChoice,
            choicePrice: option.choicePrice,
          })),
        });
      }

      totalAmount += item.price * item.quantity;
    }

    await prisma.bill.update({
      where: { id: bill.id },
      data: { totalAmount },
    });

    return {
      statusCode: 201,
      body: { message: "Order placed successfully" },
    };
  } catch (error) {
    console.error("Error placing order:", error);
    return sendError(event, {
      statusCode: 500,
      message: "Failed to place order",
      name: "",
    });
  }
});
