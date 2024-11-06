<template>
  <div class="m-auto my-4 w-full rounded-lg border p-4 shadow">
    <h2 class="mb-2 text-xl font-semibold">Total Earn Today</h2>
    <p class="text-2xl font-bold">{{ totalOpenBills }} THB</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const totalOpenBills = ref(0);

async function fetchOpenBills() {
  const today = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format
  const response = await axios.get(`/api/dashboard/bills?date=${today}`);
  const bills = response.data;

  // Calculate the total amount of open bills for today
  totalOpenBills.value = bills.reduce((acc, bill) => acc + bill.totalAmount, 0);
}

onMounted(() => {
  fetchOpenBills();
});
</script>

<style scoped>
/* Add custom styles if needed */
</style>
