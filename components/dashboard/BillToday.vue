<template>
  <div class="card m-auto my-4 w-full">
    <h2 class="mb-2 text-xl font-semibold">รายได้รวมวันนี้</h2>
    <p class="text-2xl font-bold">{{ totalOpenBills }} THB</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const totalOpenBills = ref(0);

async function fetchOpenBills() {
  const today = new Date().toISOString().split("T")[0];
  const branchId = localStorage.getItem("branchId"); // Retrieve branchId from localStorage

  if (!branchId) {
    console.error("Branch ID not found in localStorage");
    return;
  }

  const response = await axios.get(
    `/api/dashboard/bills?date=${today}&branchId=${branchId}`,
  );
  totalOpenBills.value = response.data.totalOpenBills;
}

onMounted(() => {
  fetchOpenBills();
});
</script>

<style scoped>
/* Add custom styles if needed */
</style>
