<template>
  <div class="card m-auto w-full">
    <h2 class="mb-2 text-xl font-semibold">คำสั่งซื้อที่รอดำเนินการ</h2>
    <p v-if="!errorMessage" class="text-2xl font-bold">
      {{ pendingOrdersCount }} รายการ
    </p>
    <p v-else class="text-red-500">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue";
import axios from "axios";

// Props
const props = defineProps({
  branchId: {
    type: Number,
    required: true,
  },
});

// Reactive variables
const pendingOrdersCount = ref(0);
const errorMessage = ref("");
let intervalId = null;

// Function to fetch pending orders
const fetchPendingOrders = async () => {
  try {
    const response = await axios.get(
      `/api/restaurant/dashboard/orderpeding?branchId=${props.branchId}`,
    );
    pendingOrdersCount.value = response.data.pendingOrdersCount || 0;
    errorMessage.value = ""; // Clear error message if successful
  } catch (error) {
    console.error("Error fetching pending orders:", error);
    errorMessage.value =
      error.response?.data?.statusMessage || "Failed to fetch pending orders.";
    pendingOrdersCount.value = 0; // Reset the count on error
  }
};

// Fetch data when the component mounts and start polling
onMounted(() => {
  fetchPendingOrders();
  intervalId = setInterval(fetchPendingOrders, 30000); // Poll every 2 seconds
});

// Clear the interval when the component is unmounted
onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});

// Watch for changes in branchId and fetch data again
watch(
  () => props.branchId,
  () => {
    fetchPendingOrders();
  },
);
</script>
