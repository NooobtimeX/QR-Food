<template>
  <div class="container mx-auto p-4">
    <h1 class="mb-4 text-2xl font-bold">Branch Dashboard</h1>
    <div class="grid grid-cols-2 gap-4">
      <TableStatusChart v-if="branchId" :branchId="branchId" />
      <MenuStatusChart v-if="branchId" :branchId="branchId" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import TableStatusChart from "@/components/dashboard/TableStatusChart.vue";
import MenuStatusChart from "@/components/dashboard/MenuStatusChart.vue";

const branchId = ref(null);

onMounted(() => {
  branchId.value = localStorage.getItem("branchId") || "1"; // Fallback to branch ID 1 if not set
});
</script>

<style scoped>
/* Add custom styles if needed */
</style>
