<template>
  <div class="card m-auto w-full">
    <h2 class="mb-2 text-xl font-semibold">รายได้รวมวันนี้</h2>
    <p class="text-2xl font-bold">{{ totalOpenBills }} THB</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import axios from "axios";
import {
  setEncryptedItem,
  getDecryptedItem,
  removeItem,
} from "@/utils/storageUtils";
const totalOpenBills = ref(0);
let intervalId;

async function fetchOpenBills() {
  const today = new Date().toISOString().split("T")[0];
  const branchId = getDecryptedItem("branchId"); // Retrieve branchId from localStorage

  if (!branchId) {
    console.error("Branch ID not found in localStorage");
    return;
  }

  try {
    const response = await axios.get(
      `/api/restaurant/dashboard/bills?date=${today}&branchId=${branchId}`,
    );
    totalOpenBills.value = response.data.totalOpenBills;
  } catch (error) {
    console.error("Error fetching open bills:", error);
  }
}

onMounted(() => {
  fetchOpenBills();
  intervalId = setInterval(fetchOpenBills, 30000); // Fetch every 2 seconds
});

onUnmounted(() => {
  clearInterval(intervalId); // Clear interval when the component is destroyed
});
</script>
