<template>
  <div
    class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50"
  >
    <div class="rounded-lg bg-white p-4">
      <h2 class="mb-4 text-lg font-bold text-black">สร้างโต๊ะอาหาร</h2>
      <label>ชื่อ <span class="text-red-600">*</span></label>
      <input
        v-model="newTableName"
        placeholder="Table Name"
        class="mb-2 block w-full rounded-md border-gray-400 bg-white shadow-sm focus:outline-none focus:ring-2 sm:text-base"
      />
      <label>จำนวนที่นั่ง <span class="text-red-600">*</span></label>
      <input
        v-model.number="newTableCapacity"
        placeholder="Capacity"
        type="number"
        class="mb-4 block w-full rounded-md border-gray-400 bg-white shadow-sm focus:outline-none focus:ring-2 sm:text-base"
      />
      <div class="grid grid-cols-2">
        <button
          class="mr-2 border bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:bg-gray-400"
          @click="createTable"
          :disabled="loading"
        >
          {{ loading ? "กำลังสร้าง..." : "สร้าง" }}
        </button>
        <button
          class="mr-2 border bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-02"
          @click="cancelCreateTable"
        >
          ยกเลิก
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import {
  setEncryptedItem,
  getDecryptedItem,
  removeItem,
} from "@/utils/storageUtils";
// Define emits for custom event
const emit = defineEmits(["closeModal", "tableCreated"]);
const loading = ref(false);
const newTableName = ref("");
const newTableCapacity = ref(4);

// Fetch restaurantId and branchId from localStorage
const restaurantId = getDecryptedItem("restaurantId");
const branchId = getDecryptedItem("branchId");

const createTable = async () => {
  if (loading.value) return; // Prevent multiple submissions
  loading.value = true;
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
  } finally {
    loading.value = false;
  }
};

const cancelCreateTable = () => {
  emit("closeModal"); // Emit an event to close the modal
};
</script>
