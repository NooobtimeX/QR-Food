<template>
  <NuxtLayout name="customer">
    <div class="px-2">
      <div
        v-if="cart.length > 0"
        class="w-full rounded-xl border-2 border-gray-300 bg-white shadow-xl"
      >
        <h1 class="mt-2 text-3xl font-bold">รถเข็น</h1>
        <div class="mx-2 mb-4">
          <div
            v-for="(product, index) in cart"
            :key="index"
            class="flex items-center border-b py-4 last:border-none"
          >
            <img
              class="mr-4 h-16 w-16 rounded-xl object-cover"
              :src="product.photoUrl || '/default-image.png'"
              alt="Product image"
            />
            <div class="flex-1">
              <h2 class="text-lg font-semibold text-black">
                {{ product.name }}
              </h2>
              <div
                v-if="
                  product.selectedOptions && product.selectedOptions.length > 0
                "
              >
                <div v-for="(option, i) in product.selectedOptions" :key="i">
                  <p class="text-sm text-black">
                    {{ option.optionName }}: {{ option.selectedChoice }} (+{{
                      option.choicePrice
                    }}
                    ฿)
                  </p>
                </div>
              </div>
              <div v-if="product.note" class="mt-1">
                <p class="text-sm text-gray-500">Note: {{ product.note }}</p>
              </div>
              <p class="text-black">{{ calculateProductPrice(product) }} ฿</p>
            </div>
            <div class="flex items-center">
              <button
                class="flex h-8 w-8 items-center justify-center bg-red-500"
                @click="updateQuantity(index, -1)"
              >
                -
              </button>
              <span class="w-8 text-center text-black">{{
                product.quantity
              }}</span>
              <button
                class="flex h-8 w-8 items-center justify-center bg-green-500"
                @click="updateQuantity(index, 1)"
              >
                +
              </button>
            </div>
          </div>
        </div>
        <div
          class="mx-2 my-auto mb-4 flex justify-between text-lg font-bold text-black"
        >
          <span>ยอดรวม {{ cartTotal }} ฿</span>
        </div>
      </div>
      <div class="mt-2 grid grid-cols-2 gap-1">
        <button class="bg-orange-02 py-3 text-lg text-white" @click="orderMore">
          สั่งอาหารเพิ่มเติม
        </button>
        <button
          :disabled="isProcessing"
          class="bg-green-500 py-3 text-lg text-white disabled:bg-gray-500"
          @click="confirmOrder"
        >
          <span v-if="isProcessing">กำลังสั่งอาหาร</span>
          <span v-else>ยืนยันการสั่ง</span>
        </button>
      </div>
      <useFetchOrders />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import useFetchOrders from "@/components/customer/useFetchOrders.vue";
import axios from "axios";
import {
  setEncryptedItem,
  getDecryptedItem,
  removeItem,
} from "@/utils/storageUtils";
interface CartItem {
  menuId: string;
  name: string;
  photoUrl: string;
  price: number;
  quantity: number;
  note?: string;
  selectedOptions: Array<{
    optionName: string;
    selectedChoice: string;
    choicePrice: number;
  }>;
}

const cart = ref<CartItem[]>([]);
const isProcessing = ref(false);

onMounted(() => {
  const cartData = getDecryptedItem("cart");
  if (cartData) {
    try {
      const parsedCart = JSON.parse(cartData);
      cart.value = parsedCart.map((item: any) => ({
        menuId: item.menuId,
        name: item.name,
        photoUrl: item.photoUrl || "",
        price: item.price,
        quantity: item.quantity,
        note: item.note || "",
        selectedOptions:
          item.options?.map((option: any) => ({
            optionName: option.optionName,
            selectedChoice: option.selectedChoice,
            choicePrice: option.choicePrice,
          })) || [],
      }));
    } catch (error) {}
  }
});

const updateQuantity = (index: number, amount: number) => {
  const newQuantity = cart.value[index].quantity + amount;
  if (newQuantity < 1) {
    cart.value.splice(index, 1);
  } else {
    cart.value[index].quantity = newQuantity;
  }
  setEncryptedItem("cart", JSON.stringify(cart.value));
};

const calculateProductPrice = (product: CartItem) => {
  const optionsTotal = product.selectedOptions.reduce(
    (sum, option) => sum + option.choicePrice,
    0,
  );
  return (product.price + optionsTotal) * product.quantity;
};

const cartTotal = computed(() => {
  return cart.value.reduce((total, product) => {
    return total + calculateProductPrice(product);
  }, 0);
});

const route = useRoute();
const router = useRouter();
const qrCodeId = route.params.table || "defaultTable";

const orderMore = () => {
  window.location.replace(`/${qrCodeId}/`);
};

const confirmOrder = async () => {
  if (isProcessing.value) return; // Prevent multiple clicks

  isProcessing.value = true; // Disable button
  console.log("Order button clicked");

  // Prepare order data
  const orderData = {
    qrCodeId,
    cart: cart.value.map((product) => ({
      menuId: product.menuId,
      name: product.name,
      price: product.price,
      quantity: product.quantity,
      note: product.note || "",
      options: product.selectedOptions.map((option) => ({
        optionName: option.optionName,
        selectedChoice: option.selectedChoice,
        choicePrice: option.choicePrice,
      })),
    })),
  };

  try {
    // Send the entire order data in one API call
    const response = await axios.post("/api/customer/order", orderData);

    if (response.status === 201) {
      console.log("Order placed successfully");
      removeItem("cart"); // Clear cart
      window.location.reload(); // Refresh the page
    } else {
      console.error(`Error placing order: ${response.statusText}`);
      removeItem("cart"); // Clear cart
      window.location.reload(); // Refresh the page
    }
  } catch (error) {
    console.error("Error placing orders:", error);
    removeItem("cart"); // Clear cart
    window.location.reload(); // Refresh the page
  } finally {
    isProcessing.value = false; // Re-enable button after processing
  }
};
</script>
