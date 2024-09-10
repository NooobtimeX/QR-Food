<!-- components/popup/CreateRestaurantModal.vue -->
<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-75"
  >
    <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
      <h3 class="mb-4 text-center text-2xl font-bold text-black">
        สร้างร้านอาหาร
      </h3>
      <div class="mb-4">
        <label class="block font-bold text-black"
          >ชื่อร้านอาหาร<span class="text-red-600">*</span></label
        >
        <input
          v-model="newRestaurant.name"
          type="text"
          class="w-full rounded-lg border border-gray-400 p-3 focus:ring"
          required
        />
      </div>
      <div class="flex justify-end space-x-2">
        <button
          class="w-1/2 bg-green-500 pl-2 pr-2 text-white hover:bg-green-700 disabled:bg-gray-400"
          @click="createRestaurant"
          :disabled="loading"
        >
          {{ loading ? "กำลังสร้าง..." : "สร้าง" }}
        </button>
        <button
          class="mr-2 w-1/2 bg-red-500 pl-2 pr-2 text-white hover:bg-red-02"
          @click="cancel"
        >
          ยกเลิก
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { defineProps, defineEmits } from "vue";
import axios from "axios";
import {
  setEncryptedItem,
  getDecryptedItem,
  removeItem,
} from "@/utils/storageUtils";
// Props and emits for external control
const props = defineProps({
  isOpen: { type: Boolean, required: true },
});
const emit = defineEmits(["close", "restaurantCreated"]);

// Local state for new restaurant details
const newRestaurant = ref({ name: "" });
const loading = ref(false);

const cancel = () => {
  emit("close");
};

// Function to create a new restaurant with API call
const createRestaurant = async () => {
  if (loading.value) return; // Prevent multiple submissions
  loading.value = true;
  try {
    await axios.post("/api/restaurant/create", {
      name: newRestaurant.value.name,
      userId: Number(getDecryptedItem("userId")),
    });
    emit("restaurantCreated"); // Notify parent component of successful creation
    emit("close"); // Close modal after successful creation
    location.reload();
    resetForm();
  } catch (error) {
    console.error("Error creating restaurant:", error);
  } finally {
    loading.value = false;
  }
};

// Function to reset the form after creation
const resetForm = () => {
  newRestaurant.value = { name: "" };
};
</script>
