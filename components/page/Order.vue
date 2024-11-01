<template>
  <div>
    <h1 class="pb-6 text-center text-5xl font-bold text-orange-500">Order</h1>

    <!-- Status Filter -->
    <div class="mb-4 flex flex-wrap items-center space-x-4">
      <div
        v-for="status in availableStatuses"
        :key="status"
        :class="statusFilterClass(status)"
        class="cursor-pointer rounded-lg px-4 py-2 transition duration-200"
        @click="toggleStatusFilter(status)"
      >
        {{ status }}
      </div>
    </div>

    <!-- Orders Table -->
    <table class="min-w-full table-auto border-collapse rounded-md">
      <thead class="bg-orange-500 text-white">
        <tr>
          <th class="px-4 py-2 text-center text-lg font-medium">Table</th>
          <th class="px-4 py-2 text-center text-lg font-medium">Menu</th>
          <th class="px-4 py-2 text-center text-lg font-medium">Date</th>
          <th class="px-4 py-2 text-center text-lg font-medium">Status</th>
          <th class="px-4 py-2 text-center text-lg font-medium">who Ordered</th>
        </tr>
      </thead>
      <tbody class="bg-gray-100 text-black">
        <tr
          v-for="order in filteredOrders"
          :key="order.id"
          class="border-b border-gray-200 transition duration-200 hover:bg-gray-200"
          @click="selectOrder(order)"
        >
          <td class="px-4 py-2 text-base">{{ order.table }}</td>
          <td class="px-4 py-2 text-base">{{ order.menuName }}</td>
          <td class="px-4 py-2 text-base">{{ formatDate(order.time) }}</td>
          <td class="px-4 py-2 text-base">
            <span
              class="rounded-xl px-2 py-1"
              :class="statusClass(order.status)"
            >
              {{ order.status }}
            </span>
          </td>
          <td class="px-4 py-2 text-base">{{ order.whoOrdered }}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Popup Modal -->
  <div
    v-if="selectedOrder"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="w-64 rounded-lg bg-white p-4 text-black">
      <h2 class="pb-4 text-center">Table: {{ selectedOrder.table }}</h2>
      <select
        v-model="selectedOrder.status"
        class="mb-1 w-full rounded-xl border-2 bg-gray-200"
      >
        <option value="finish">finish</option>
        <option value="pending">pending</option>
        <option value="cancel">cancel</option>
      </select>

      <!-- Display menu name and price -->
      <div v-if="selectedOrder.menuName && selectedOrder.menuPrice">
        <div class="font-bold">
          เมนู: <span class="font-normal">{{ selectedOrder.menuName }}</span>
        </div>
        <div class="font-bold">
          ราคา: <span class="font-normal">{{ selectedOrder.menuPrice }}฿</span>
        </div>
      </div>

      <!-- Display order items and options -->
      <div
        v-for="(item, index) in selectedOrder.items || []"
        :key="index"
        class="mb-1 rounded-xl border border-gray-300 bg-gray-100 p-2 transition duration-150"
      >
        <div>
          <strong>{{ item.optionName }}</strong> - {{ item.choicePrice }}฿
        </div>
        <div>• {{ item.selectedChoice }}</div>
      </div>

      <!-- OK button to update order status -->
      <button
        class="mt-2 w-full rounded-xl bg-green-500 text-white hover:bg-green-700"
        @click="updateOrderStatus"
      >
        OK
      </button>

      <!-- Close button -->
      <button
        class="mt-2 w-full rounded-xl bg-red-500 p-2 text-white hover:bg-red-700"
        @click="closePopup"
      >
        Close
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import axios from "axios";

type OrderStatus = "pending" | "finish" | "cancel";

interface OrderOption {
  name: string;
  selectedChoice: string;
  choicePrice: number;
}

interface OrderItem {
  selectedChoice: string;
  choicePrice: string;
  optionName: string;
  name: string;
  options: OrderOption[];
  price: number;
}

interface Order {
  id: number; // Ensure each order has a unique ID
  table: string;
  status: OrderStatus;
  items?: OrderItem[];
  whoOrdered: string;
  time: string;
  menuName?: string;
  menuPrice?: number;
}

const orders = ref<Order[]>([]);
const availableStatuses: OrderStatus[] = ["pending", "finish", "cancel"];
const selectedOrder = ref<Order | null>(null);
const selectedStatuses = ref<OrderStatus[]>([]);

// Fetch branchId from localStorage
const branchId = localStorage.getItem("branchId");

// Fetch orders from API on component mount
const fetchOrders = async () => {
  try {
    const response = await axios.post("/api/restaurant/getOrders", {
      branchId,
    });
    orders.value = response.data;
    console.log(orders.value); // Debug API response
    sortOrders();
  } catch (error) {
    console.error("Failed to fetch orders:", error);
  }
};

// Polling mechanism to fetch orders periodically
const startPolling = () => {
  const intervalId = setInterval(fetchOrders, 5000); // Fetch orders every 5 seconds
  onUnmounted(() => clearInterval(intervalId)); // Clear interval on component unmount
};

// Run on component mount
onMounted(() => {
  fetchOrders();
  startPolling();
});

const selectOrder = (order: Order) => {
  selectedOrder.value = order;
  console.log("Selected order ID:", order.id); // Ensure that the selected order has a valid ID
};

const updateOrderStatus = async () => {
  if (!selectedOrder.value) return;

  try {
    console.log("Updating order with ID:", selectedOrder.value.id); // Debug log
    // Call API to update the order status
    const response = await axios.post("/api/orders/updateStatus", {
      orderMenuId: selectedOrder.value.id, // Pass the ID to the backend as orderMenuId
      status: selectedOrder.value.status, // Pass the status to the backend
    });

    console.log("Order status updated successfully:", response.data);
    closePopup(); // Close the popup after a successful update
    fetchOrders();
  } catch (error) {
    console.error("Failed to update order status:", error);
  }
};

// Toggle status filter on click
const toggleStatusFilter = (status: OrderStatus) => {
  if (selectedStatuses.value.includes(status)) {
    selectedStatuses.value = selectedStatuses.value.filter((s) => s !== status);
  } else {
    selectedStatuses.value.push(status);
  }
};

// Define CSS classes for selected/unselected statuses
const statusFilterClass = (status: OrderStatus) => {
  return selectedStatuses.value.includes(status)
    ? "bg-orange-500 text-white"
    : "bg-gray-200 text-gray-700";
};

// Sort orders by status priority
const sortOrders = () => {
  const orderPriority: Record<OrderStatus, number> = {
    pending: 1,
    finish: 2,
    cancel: 3,
  };
  orders.value.sort(
    (a, b) => orderPriority[a.status] - orderPriority[b.status],
  );
};

// Filter orders based on selected statuses
const filteredOrders = computed(() => {
  return selectedStatuses.value.length === 0
    ? orders.value
    : orders.value.filter((order) =>
        selectedStatuses.value.includes(order.status),
      );
});

// Define CSS classes for order statuses
const statusClass = (status: OrderStatus) => {
  return {
    "bg-green-400 text-green-900": status === "finish",
    "bg-yellow-400 text-yellow-900": status === "pending",
    "bg-red-400 text-red-900": status === "cancel",
  };
};

// Format date
const formatDate = (time: string) => {
  const date = new Date(time);
  return date.toLocaleString("th-TH", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

// Close popup
const closePopup = () => {
  selectedOrder.value = null;
};

watch(orders, sortOrders, { deep: true });
</script>
