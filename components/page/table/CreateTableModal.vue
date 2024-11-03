<template>
  <div
    class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50"
  >
    <div class="rounded-lg bg-white p-4">
      <h2 class="mb-4 text-lg font-bold text-black">Create New Table</h2>
      <input
        v-model="newTableName"
        placeholder="Table Name"
        class="mb-2 block w-full rounded-md border-gray-400 bg-white shadow-sm focus:outline-none focus:ring-2 sm:text-base"
      />
      <input
        v-model.number="newTableCapacity"
        placeholder="Capacity"
        type="number"
        class="mb-4 block w-full rounded-md border-gray-400 bg-white shadow-sm focus:outline-none focus:ring-2 sm:text-base"
      />
      <div class="flex justify-end">
        <button
          class="rounded-mb mr-2 border border-transparent bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-700"
          @click="createTable"
        >
          Create
        </button>
        <button
          class="rounded-mb mr-2 rounded-md border bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-02"
          @click="cancelCreateTable"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";

// Define emits for custom event
const emit = defineEmits(["closeModal", "tableCreated"]);

const newTableName = ref("");
const newTableCapacity = ref(4);

// Fetch restaurantId and branchId from localStorage
const restaurantId = localStorage.getItem("restaurantId");
const branchId = localStorage.getItem("branchId");

const createTable = async () => {
  try {
    const response = await axios.post(
      `/api/restaurant/${restaurantId}/branch/${branchId}/createTable`,
      {
        name: newTableName.value,
        capacity: newTableCapacity.value,
      },
    );

    if (response.data.statusCode === 201) {
      emit("tableCreated", response.data.body); // Emit the created table data
      cancelCreateTable();
    } else {
      console.error("Unexpected response format:", response.data);
    }
  } catch (error) {
    console.error("Error creating table:", error);
  }
};

const cancelCreateTable = () => {
  emit("closeModal"); // Emit an event to close the modal
};
</script>
