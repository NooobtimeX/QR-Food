<template>
  <NuxtLayout name="customer">
    <div>
      <div
        v-if="cart.length > 0"
        class="w-full rounded-xl border-2 border-gray-300 bg-white p-2 shadow-xl"
      >
        <h1 class="text-3xl font-bold">CART</h1>
        <div class="mb-4">
          <div
            v-for="(product, index) in cart"
            :key="index"
            class="flex items-center border-b py-4 last:border-none"
          >
            <img
              class="mr-4 h-16 w-16 rounded-xl object-cover"
              :src="product.image || '/default-image.png'"
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
          class="my-auto mb-4 flex justify-between text-lg font-bold text-black"
        >
          <span>Total {{ cartTotal }} ฿</span>
        </div>
      </div>
      <div class="grid gap-2 md:grid-cols-2">
        <button class="bg-orange-02 py-3 text-lg text-white" @click="orderMore">
          ORDER MORE
        </button>
        <button
          class="bg-green-500 py-3 text-lg text-white"
          @click="confirmOrder"
        >
          ORDER
        </button>
      </div>
      <useFetchOrders />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import useFetchOrders from "@/components/customer/useFetchOrders";
import axios from "axios";

interface CartItem {
  menuId: string;
  name: string;
  image: string;
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

onMounted(() => {
  const cartData = localStorage.getItem("cart");
  if (cartData) {
    try {
      const parsedCart = JSON.parse(cartData);
      cart.value = parsedCart.map((item: any) => ({
        menuId: item.menuId,
        name: item.name,
        image: item.image || "",
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
  localStorage.setItem("cart", JSON.stringify(cart.value));
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
  console.log("Order button clicked");

  const orderData = cart.value.map((product) => ({
    qrCodeId,
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
  }));

  try {
    const response = await axios.post("/api/user/order", {
      qrCodeId,
      cart: orderData,
    });
    if (response.status === 201) {
      console.log("All orders placed successfully");
      localStorage.removeItem("cart");
      window.location.reload(); // Refresh the page
    } else {
      console.error(`Error placing orders: ${response.statusText}`);
      localStorage.removeItem("cart");
      window.location.reload(); // Refresh the page
    }
  } catch (error) {
    console.error("Error placing orders:", error);
    localStorage.removeItem("cart");
    window.location.reload(); // Refresh the page
  }
};
</script>
