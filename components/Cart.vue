<template>
  <div v-if="cart.length > 0" class="w-full rounded-xl border bg-white p-2">
    <h1 class="text-3xl font-bold">CART</h1>
    <div class="mb-4">
      <!-- Loop through each product in the cart -->
      <div
        v-for="(product, index) in cart"
        :key="index"
        class="flex items-center border-b py-4 last:border-none"
      >
        <!-- Display product image, with a default if not available -->
        <img
          class="mr-4 h-16 w-16 rounded-xl object-cover"
          :src="product.image || '/default-image.png'"
          alt="Product image"
        />
        <div class="flex-1">
          <h2 class="text-lg font-semibold">{{ product.name }}</h2>
          <div
            v-if="product.selectedOptions && product.selectedOptions.length > 0"
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
          <p class="text-gray-500">{{ calculateProductPrice(product) }} ฿</p>
        </div>
        <div class="flex items-center">
          <!-- Decrease quantity button -->
          <button
            class="flex h-8 w-8 items-center justify-center"
            @click="updateQuantity(index, -1)"
          >
            -
          </button>
          <!-- Display product quantity -->
          <span class="w-8 text-center text-gray-700">{{
            product.quantity
          }}</span>
          <!-- Increase quantity button -->
          <button
            class="flex h-8 w-8 items-center justify-center"
            @click="updateQuantity(index, 1)"
          >
            +
          </button>
        </div>
      </div>
    </div>
    <!-- Display total price -->
    <div class="my-auto mb-4 flex justify-between text-lg font-bold text-black">
      <span>Total {{ cartTotal }} ฿</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

// Define the type for a cart item
interface CartItem {
  name: string;
  image: string;
  price: number;
  quantity: number;
  selectedOptions: Array<{
    optionName: string;
    selectedChoice: string;
    choicePrice: number;
  }>;
}

const cart = ref<CartItem[]>([]);

// Fetch the cart data from localStorage
onMounted(() => {
  const cartData = localStorage.getItem("cart");
  if (cartData) {
    try {
      const parsedCart = JSON.parse(cartData);
      cart.value = parsedCart.map((item: any) => ({
        name: item.name,
        image: item.image || "",
        price: item.price,
        quantity: item.quantity,
        selectedOptions:
          item.options?.map((option: any) => ({
            optionName: option.optionName,
            selectedChoice: option.selectedChoice,
            choicePrice: option.choicePrice,
          })) || [],
      }));
    } catch (error) {
      console.error("Error parsing cart data:", error);
    }
  }
});

// Update quantity and update localStorage
const updateQuantity = (index: number, amount: number) => {
  const newQuantity = cart.value[index].quantity + amount;
  if (newQuantity < 1) {
    cart.value.splice(index, 1);
  } else {
    cart.value[index].quantity = newQuantity;
  }
  localStorage.setItem("cart", JSON.stringify(cart.value));
};

// Calculate total price for each product
const calculateProductPrice = (product: CartItem) => {
  const optionsTotal = product.selectedOptions.reduce(
    (sum, option) => sum + option.choicePrice,
    0,
  );
  return (product.price + optionsTotal) * product.quantity;
};

// Compute total price for all items in the cart
const cartTotal = computed(() => {
  return cart.value.reduce((total, product) => {
    return total + calculateProductPrice(product);
  }, 0);
});
</script>
