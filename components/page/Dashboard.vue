<template>
  <div class="container mx-auto p-4">
    <h1 class="pb-4">แดชบอร์ด</h1>
    <div class="mb-2">
      <OrderPeding v-if="branchId" :branchId="branchId" />
    </div>
    <div class="grid gap-2 md:grid-cols-2">
      <TableStatusChart v-if="branchId" :branchId="branchId" />
      <OrderStatusChart v-if="branchId" :branchId="branchId" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import TableStatusChart from "@/components/dashboard/TableStatusChart.vue";
import OrderStatusChart from "~/components/dashboard/OrderStatusChart.vue";
import BillToday from "@/components/dashboard/BillToday.vue";
import OrderPeding from "@/components/dashboard/OrderPeding.vue";
import {
  setEncryptedItem,
  getDecryptedItem,
  removeItem,
} from "@/utils/storageUtils";
const branchId = ref(null);

onMounted(() => {
  branchId.value = getDecryptedItem("branchId") || "1"; // Fallback to branch ID 1 if not set
});
</script>
