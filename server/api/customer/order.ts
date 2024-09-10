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

    // Find or create a bill
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

    // Prepare orderMenus data
    const orderMenusData = cart.map((item) => {
      totalAmount += item.price * item.quantity;
      return {
        name: item.name,
        quantity: item.quantity,
        totalPrice: item.price * item.quantity,
        qrCodeId,
        note: item.note || "",
        billId: bill.id,
      };
    });

    // Insert orderMenus in bulk
    const createdOrderMenus = await prisma.orderMenu.createMany({
      data: orderMenusData,
    });

    // Get created orderMenus' IDs
    const orderMenus = await prisma.orderMenu.findMany({
      where: { billId: bill.id },
    });

    // Prepare orderOptions data
    const orderOptionsData: Array<{
      orderMenuId: number;
      name: string;
      selectedChoice: string;
      choicePrice: number;
    }> = [];

    orderMenus.forEach((orderMenu, index) => {
      const itemOptions = cart[index].options || [];
      itemOptions.forEach((option) => {
        orderOptionsData.push({
          orderMenuId: orderMenu.id,
          name: option.optionName,
          selectedChoice: option.selectedChoice,
          choicePrice: option.choicePrice,
        });
      });
    });

    // Insert orderOptions in bulk (if any)
    if (orderOptionsData.length > 0) {
      await prisma.orderOption.createMany({
        data: orderOptionsData,
      });
    }

    // Update the totalAmount in the bill
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
