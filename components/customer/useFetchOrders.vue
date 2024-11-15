<template>
  <div v-if="orders.length > 0" class="mt-8">
    <h2 class="mb-6 text-3xl font-bold text-gray-800">Your Orders</h2>
    <div
      v-for="(order, index) in orders"
      :key="index"
      class="my-4 rounded-lg border border-gray-300 bg-white p-6 shadow-md"
    >
      <div class="flex items-center justify-between">
        <h3 class="text-xl font-semibold text-gray-700">{{ order.name }}</h3>
        <p
          :class="{
            'text-green-500': order.status === 'finish',
            'text-yellow-500': order.status === 'pending',
            'text-red-500': order.status === 'cancel',
          }"
          class="font-medium capitalize"
        >
          {{ order.status }}
        </p>
      </div>
      <p class="mt-2 text-gray-600">
        Quantity: <span>{{ order.quantity }}</span>
      </p>
      <p class="text-gray-600">
        <span>Note: {{ order.note }}</span>
      </p>
      <p class="text-gray-600">
        Total Price: <span>{{ order.totalPrice }} ฿</span>
      </p>

      <div v-if="order.options.length > 0" class="mt-4">
        <h4 class="text-lg font-semibold text-gray-700">Options:</h4>
        <ul class="mt-2 space-y-1">
          <li
            v-for="(option, idx) in order.options"
            :key="idx"
            class="text-gray-600"
          >
            {{ option.optionName }}: {{ option.selectedChoice }} (+{{
              option.choicePrice
            }}
            ฿)
          </li>
        </ul>
      </div>
    </div>
  </div>
  <div v-else class="mt-8 text-center">
    <p class="text-lg text-gray-600">ยังไม่มีรายการอาหาร</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import axios from "axios";
import { useRoute } from "vue-router";

interface Order {
  name: string;
  quantity: number;
  totalPrice: number;
  status: string;
  note: string;
  options: Array<{
    optionName: string;
    selectedChoice: string;
    choicePrice: number;
  }>;
}

const orders = ref<Order[]>([]);
const route = useRoute();
const qrCodeId = route.params.table as string;

const fetchOrders = async () => {
  try {
    const response = await axios.post("/api/user/orders", { qrCodeId });
    if (response.status === 200 && response.data?.data?.orders) {
      orders.value = response.data.data.orders;
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
  }
};

onMounted(() => {
  fetchOrders();
  const interval = setInterval(() => {
    fetchOrders();
  }, 10000); // Fetch every 10 seconds (10000 ms)

  // Cleanup interval on component unmount
  onBeforeUnmount(() => {
    clearInterval(interval);
  });
});
</script>
