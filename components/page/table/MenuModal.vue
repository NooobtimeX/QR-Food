<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    @click.self="close"
  >
    <section
      class="w-full max-w-lg overflow-hidden rounded-xl border-2 border-gray-300 bg-white p-6 shadow-xl"
    >
      <div v-if="menuItem">
        <!-- Image -->
        <img
          alt="ecommerce"
          class="m-auto aspect-auto max-h-64 w-full rounded-lg border border-gray-200 object-cover object-center"
          :src="menuItem?.photoUrl"
        />

        <!-- Item Name and Price -->
        <h1 class="mt-2 text-2xl font-bold text-gray-800">
          {{ menuItem?.name }}
        </h1>
        <span
          class="mt-2 block text-center text-xl font-semibold text-green-600"
          >{{ totalPrice }} ฿</span
        >

        <!-- Options Section -->
        <div v-if="menuItem?.options" class="mt-4">
          <div
            v-for="(option, index) in menuItem?.options"
            :key="index"
            class="mt-4"
          >
            <h2 class="text-gray-700">{{ option.optionName }}</h2>
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
        <!-- Write Note Section -->
        <div class="mt-2">
          <label for="note" class="block text-sm font-semibold text-gray-700"
            >เขียนโน๊ต</label
          >
          <textarea
            id="note"
            v-model="note"
            class="mt-2 w-full rounded-lg border border-gray-300 p-2 text-gray-700 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
            rows="3"
            placeholder="เช่น ไม่ผัก"
          ></textarea>
        </div>

        <!-- Order Button -->
        <div class="mt-2 flex justify-center">
          <button
            :disabled="isProcessing"
            class="w-full rounded-lg bg-green-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-green-600 disabled:opacity-50"
            @click="orderNow"
          >
            สั่งอาหาร
          </button>
          <button
            class="w-full rounded-lg bg-red-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-red-600 disabled:opacity-50"
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
import axios from "axios";

// Props
const props = defineProps({
  menuId: String,
  qrCodeId: String,
});

// Emit event
const emit = defineEmits(["close"]);

// States
const menuItem = ref(null);
const quantity = ref(1);
const selectedOptions = ref([]);
const note = ref("");
const isProcessing = ref(false);

// Close modal
const close = () => emit("close");

// Fetch menu item
const { data } = await useFetch(`/api/restaurant/menu/${props.menuId}`);
menuItem.value = data.value;

// Initialize options
watchEffect(() => {
  if (menuItem.value?.options) {
    selectedOptions.value = Array(menuItem.value.options.length).fill(0);
  }
});

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

const orderNow = async () => {
  if (isProcessing.value) return; // Prevent multiple clicks
  isProcessing.value = true; // Disable button

  if (menuItem.value) {
    const orderData = {
      qrCodeId: props.qrCodeId,
      menuId: props.menuId,
      name: menuItem.value.name,
      price: menuItem.value.price,
      quantity: quantity.value,
      note: note.value,
      options: menuItem.value.options.map((option, index) => ({
        optionName: option.optionName,
        selectedChoice: option.choices[selectedOptions.value[index]].name,
        choicePrice: option.choices[selectedOptions.value[index]].price,
      })),
    };
    try {
      const response = await axios.post("/api/orderbystaff", {
        qrCodeId: props.qrCodeId,
        cart: [orderData], // Send as a single-item array to match API structure
      });

      if (response.status === 201 || response.status === 200) {
        console.log("Order placed successfully");
        emit("close"); // Close the popup after a successful order
      } else {
        console.error(`Error placing order: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error placing order:", error);
    } finally {
      isProcessing.value = false; // Re-enable button after processing
    }
  }
};
</script>
