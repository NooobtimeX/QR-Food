<template>
  <div v-if="orders.length > 0" class="mt-4">
    <h2 class="mb-6 text-3xl font-bold text-gray-800">รายการที่สั่ง</h2>
    <div
      v-for="(order, index) in orders"
      :key="index"
      class="my-2 rounded-lg border border-gray-300 bg-white p-6 shadow-md"
    >
      <div class="flex items-center justify-between">
        <h3 class="text-xl font-semibold text-gray-700">
          {{ order.name }} x {{ order.quantity }}
        </h3>
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
      <div v-if="order.options.length > 0" class="mt-1">
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
      <p class="text-gray-600">
        <span class="text-green-600">{{ order.note }}</span>
      </p>
      <p class="text-gray-600">
        ราคา: <span>{{ order.totalPrice }} ฿</span>
      </p>
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
    const response = await axios.post("/api/customer/order/getAll", {
      qrCodeId,
    });
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
