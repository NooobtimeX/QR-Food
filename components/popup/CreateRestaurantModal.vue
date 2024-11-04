<!-- components/popup/CreateRestaurantModal.vue -->
<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-75"
  >
    <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
      <h3 class="mb-4 text-center text-2xl font-bold text-black">
        Create New Restaurant
      </h3>
      <div class="mb-4">
        <label class="block font-bold text-black">Name</label>
        <input
          v-model="newRestaurant.name"
          type="text"
          class="w-full rounded-lg border border-gray-400 p-3 focus:ring"
          required
        />
      </div>
      <div class="flex justify-end">
        <button
          class="mr-2 bg-red-500 pl-2 pr-2 text-white hover:bg-red-02"
          @click="cancel"
        >
          Cancel
        </button>
        <button
          class="bg-green-500 pl-2 pr-2 text-white hover:bg-green-700"
          @click="createRestaurant"
        >
          Create
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { defineProps, defineEmits } from "vue";
import axios from "axios";

// Props and emits for external control
const props = defineProps({
  isOpen: { type: Boolean, required: true },
});

const emit = defineEmits(["close", "restaurantCreated"]);

// Local state for new restaurant details
const newRestaurant = ref({ name: "" });

const cancel = () => {
  emit("close");
};

// Function to create a new restaurant with API call
const createRestaurant = async () => {
  try {
    await axios.post("/api/restaurant/createRestaurant", {
      name: newRestaurant.value.name,
      userId: Number(localStorage.getItem("userId")),
    });
    emit("restaurantCreated"); // Notify parent component of successful creation
    emit("close"); // Close modal after successful creation
    resetForm();
  } catch (error) {
    console.error("Error creating restaurant:", error);
  }
};

// Function to reset the form after creation
const resetForm = () => {
  newRestaurant.value = { name: "" };
};
</script>
