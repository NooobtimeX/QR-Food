<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    @click.self="close"
  >
    <section
      class="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-xl border-2 border-gray-300 bg-white p-6 shadow-xl"
    >
      <div v-if="menuItem">
        <!-- Image -->
        <img
          alt="ecommerce"
          class="m-auto max-h-64 w-full rounded-lg border border-gray-200 object-cover object-center"
          :src="menuItem.photoUrl || '/default-image.jpg'"
        />

        <!-- Item Name and Price -->
        <h1 class="mt-6 text-2xl font-bold text-gray-800">
          {{ menuItem.name }}
        </h1>
        <span
          class="mt-2 block text-center text-xl font-semibold text-green-600"
        >
          {{ totalPrice }} ฿
        </span>

        <!-- Options Section -->
        <div v-if="menuItem.options" class="mt-4">
          <div
            v-for="(option, index) in menuItem.options"
            :key="index"
            class="mt-4"
          >
            <h3 class="text-gray-700">{{ option.optionName }}</h3>
            <div class="mt-2 flex flex-wrap gap-2">
              <label
                v-for="(subOption, subIndex) in option.choices"
                :key="subIndex"
                class="relative flex cursor-pointer items-center justify-center rounded-lg border border-gray-300 p-2 text-sm font-medium text-gray-700 transition duration-300 hover:bg-green-500 hover:text-white"
                :class="{
                  'bg-green-500 text-white':
                    selectedOptions[index] === subIndex,
                }"
              >
                <input
                  v-model="selectedOptions[index]"
                  type="radio"
                  :name="`option-${index}`"
                  :value="subIndex"
                  class="absolute inset-0 opacity-0"
                />
                <span> {{ subOption.name }} (+{{ subOption.price }} ฿) </span>
              </label>
            </div>
          </div>
        </div>
        <!-- Quantity Control -->
        <div class="mt-2 flex items-center justify-center space-x-4">
          <button
            class="flex h-10 w-10 items-center justify-center rounded-full border bg-gray-100 text-gray-700 transition hover:bg-red-500 hover:text-white"
            @click="decrementQuantity"
          >
            -
          </button>
          <span class="text-lg font-bold">{{ quantity }}</span>
          <button
            class="flex h-10 w-10 items-center justify-center rounded-full border bg-gray-100 text-gray-700 transition hover:bg-green-500 hover:text-white"
            @click="incrementQuantity"
          >
            +
          </button>
        </div>
        <label for="note" class="block text-sm font-semibold text-gray-700"
          >เขียนโน๊ต</label
        >
        <textarea
          v-model="orderNote"
          placeholder="เช่น ไม่ผัก"
          class="w-full rounded-md border-2 border-gray-300 p-2"
        ></textarea>

        <div class="grid grid-cols-2">
          <!-- Add to Cart Button -->
          <button
            class="bg-green-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-green-600 disabled:opacity-50"
            @click="addToCart"
          >
            เพิ่มลงรถเข็น
          </button>

          <!-- Close Button -->
          <button
            class="bg-red-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-red-600 disabled:opacity-50"
            @click="close"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect } from "vue";
import { useFetch } from "#app";
import {
  setEncryptedItem,
  getDecryptedItem,
  removeItem,
} from "@/utils/storageUtils";

// Props
const props = defineProps({
  menuItem: Object,
  qrCodeId: String,
});

// Emit event
const emit = defineEmits(["close"]);

// States
const menuItem = ref(props.menuItem);
const quantity = ref(1);
const selectedOptions = ref([]);
const orderNote = ref("");

// Close modal
const close = () => emit("close");

// Initialize options
watchEffect(() => {
  if (menuItem.value?.options) {
    selectedOptions.value = Array(menuItem.value.options.length).fill(0);
  }
});

// Generate unique identifier for cart items
const generateOptionIdentifier = () => {
  if (!menuItem.value) return "";

  const selectedOptionsString = selectedOptions.value
    .map((optionIndex, index) => {
      const option = menuItem.value?.options[index];
      const choice = option?.choices[optionIndex];
      return `${option?.optionName}:${choice?.name}`;
    })
    .join("|");

  return `${props.menuItem.id}-${selectedOptionsString}`;
};

// Total price calculation
const totalPrice = computed(() => {
  let total = menuItem.value?.price || 0;
  menuItem.value?.options.forEach((option, index) => {
    const optionIndex = selectedOptions.value[index];
    if (optionIndex !== undefined) {
      total += option.choices[optionIndex]?.price || 0;
    }
  });
  return total * quantity.value;
});

// Increment and decrement quantity
const incrementQuantity = () => quantity.value++;
const decrementQuantity = () => quantity.value > 1 && quantity.value--;

// Add to cart logic
const addToCart = () => {
  if (menuItem.value) {
    const cart = JSON.parse(getDecryptedItem("cart") || "[]");
    const itemKey = generateOptionIdentifier();
    const existingItemIndex = cart.findIndex((item) => item.key === itemKey);

    if (existingItemIndex !== -1) {
      cart[existingItemIndex].quantity += quantity.value;
      cart[existingItemIndex].note = orderNote.value; // Update note if it exists
    } else {
      cart.push({
        key: itemKey,
        menuId: props.menuItem.id,
        name: menuItem.value.name,
        price: menuItem.value.price,
        quantity: quantity.value,
        photoUrl: menuItem.value.photoUrl || "/default-image.jpg",
        note: orderNote.value, // Add note
        options: menuItem.value.options.map((option, index) => ({
          optionName: option.optionName,
          selectedChoice: option.choices[selectedOptions.value[index]].name,
          choicePrice: option.choices[selectedOptions.value[index]].price,
        })),
      });
    }

    setEncryptedItem("cart", JSON.stringify(cart));
    close();
  }
};
</script>
