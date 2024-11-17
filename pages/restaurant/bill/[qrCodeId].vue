<template>
  <div class="container mx-auto max-w-7xl px-4">
    <h1 class="py-6 text-center text-3xl font-bold">
      Bill Details for QR Code: {{ qrCodeId }}
    </h1>

    <!-- Loading state -->
    <div v-if="pending" class="text-center text-gray-500">
      Loading bill details...
    </div>

    <!-- Error state -->
    <div v-if="error" class="text-center text-red-500">{{ error.message }}</div>

    <!-- Render bill details if available -->
    <div v-if="bill" class="mt-4">
      <div class="mb-6">
        <p class="text-lg font-semibold">
          <strong>Total Amount:</strong>
          {{ bill.totalAmount }} ฿
        </p>
        <p class="text-lg font-semibold">
          <strong>Payment Status:</strong>
          <span class="capitalize">{{ bill.paymentStatus }}</span>
        </p>
        <p class="text-lg font-semibold">
          <strong>Created At:</strong> {{ formatDate(bill.createdAt) }}
        </p>
      </div>

      <h2 class="mb-4 text-2xl font-bold">Order Menus:</h2>

      <div class="overflow-x-auto">
        <table
          class="min-w-full table-auto border-collapse rounded-lg border border-gray-300 shadow-sm"
        >
          <thead class="bg-orange-500 text-white">
            <tr>
              <th class="px-4 py-2 text-center">Order Name</th>
              <th class="px-4 py-2 text-center">Quantity</th>
              <th class="px-4 py-2 text-center">Base Price</th>
              <th class="px-4 py-2 text-center">Status</th>
              <th class="px-4 py-2 text-center">Order Options</th>
              <th class="px-4 py-2 text-center">Option Price</th>
            </tr>
          </thead>
          <tbody class="bg-gray-100">
            <tr
              v-for="order in bill.orderMenus.filter(
                (order) => order.status === 'finish',
              )"
              :key="order.id"
              class="border-b border-gray-200 hover:bg-gray-200"
            >
              <td class="px-4 py-2 text-center">{{ order.name }}</td>
              <td class="px-4 py-2 text-center">{{ order.quantity }}</td>
              <td class="px-4 py-2 text-center">{{ order.totalPrice }} ฿</td>
              <td class="px-4 py-2 text-center capitalize">
                {{ order.status }}
              </td>

              <!-- Order Options -->
              <td class="px-4 py-2">
                <ul
                  v-if="order.orderOptions.length"
                  class="list-inside list-disc"
                >
                  <li v-for="option in order.orderOptions" :key="option.id">
                    {{ option.name }} ({{ option.selectedChoice }})
                  </li>
                </ul>
                <p v-else class="text-center">No options</p>
              </td>

              <td class="px-4 py-2 text-center">
                <ul v-if="order.orderOptions.length">
                  <li v-for="option in order.orderOptions" :key="option.id">
                    {{ option.choicePrice }} ฿
                  </li>
                </ul>
                <p v-else>--</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <a href="/restaurant/dashboard/">
        <button class="mt-4 bg-red-500 px-4 py-2 font-bold text-white">
          Close
        </button>
      </a>
      <!-- Print Button -->
      <button
        class="mt-4 bg-green-500 px-4 py-2 font-bold text-white"
        @click="openPrintPreview"
      >
        Print Bill
      </button>
    </div>

    <!-- Hidden Bill Print Content for actual printing -->
    <div id="printableBill" class="hidden">
      <div class="w-80 rounded bg-white p-6 shadow-md">
        <h1 class="text-center text-xl font-bold">
          {{ bill.branch.restaurant.name }}
        </h1>
        <h2 class="text-center text-lg">{{ bill.branch.name }}</h2>
        <div class="border-b border-t border-dashed py-2 text-center">
          <p><strong>Total Amount:</strong> {{ bill.totalAmount }} ฿</p>
          <p><strong>Payment Status:</strong> {{ bill.paymentStatus }}</p>
        </div>

        <div class="mt-4 text-left">
          <ul>
            <li
              v-for="order in bill.orderMenus.filter(
                (order) => order.status === 'finish',
              )"
              :key="order.id"
              class="flex justify-between"
            >
              <span>{{ order.name }} (x{{ order.quantity }})</span>
              <span>{{ order.totalPrice }} ฿</span>
            </li>
          </ul>
        </div>

        <div class="mt-4 text-center">
          <p><strong>Created At:</strong> {{ formatDate(bill.createdAt) }}</p>
          <p><strong>QR Code:</strong> {{ qrCodeId }}</p>
        </div>
      </div>
    </div>

    <!-- Bill Print Preview Modal -->
    <div
      v-if="showPrintPreview"
      class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-75"
    >
      <div class="w-80 rounded bg-white p-6 shadow-md">
        <h1 class="text-center text-xl font-bold">
          {{ bill.branch.restaurant.name }}
        </h1>
        <h2 class="text-center text-lg">{{ bill.branch.name }}</h2>
        <p class="mt-2 text-center">
          <strong>Total:</strong> {{ bill.totalAmount }} ฿
        </p>
        <h6></h6>
        <div class="mt-2 border-t border-dashed text-center"></div>
        <div class="mt-2 text-left">
          <ul>
            <li
              v-for="order in bill.orderMenus.filter(
                (order) => order.status === 'finish',
              )"
              :key="order.id"
              class="flex justify-between"
            >
              <span>{{ order.name }} (x{{ order.quantity }})</span>
              <span>{{ order.totalPrice }} ฿</span>
            </li>
          </ul>
        </div>
        <div class="border-b border-dashed py-2 text-center">
          <p><strong>Total:</strong> {{ bill.totalAmount }} ฿</p>
        </div>
        <div class="mt-4 text-center">
          <p><strong>Created At:</strong> {{ formatDate(bill.createdAt) }}</p>
          <p><strong>QR Code:</strong> {{ qrCodeId }}</p>
        </div>

        <div class="mt-4 flex justify-between">
          <button
            class="rounded bg-gray-300 px-4 py-2"
            @click="closePrintPreview"
          >
            Cancel
          </button>
          <button
            class="rounded bg-blue-500 px-4 py-2 text-white"
            @click="printPreview"
          >
            Print
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from "vue";
import { useRoute } from "vue-router";
import { useFetch } from "#app";

// Get the qrCodeId from the route params
const route = useRoute();
const qrCodeId = route.params.qrCodeId;

// Fetch the bill data using qrCodeId
const { data, pending, error } = await useFetch(`/api/bill/${qrCodeId}`);

// Extract the bill from the reactive ref
const bill = data.value ? JSON.parse(data.value) : null;

// Show/Hide print preview modal
const showPrintPreview = ref(false);

// Function to open print preview
const openPrintPreview = () => {
  showPrintPreview.value = true;
};

// Function to close print preview
const closePrintPreview = () => {
  showPrintPreview.value = false;
};

// Function to calculate total price (including options)
const calculateTotalPrice = (orderMenus) => {
  let total = 0;

  // Loop through each order menu
  orderMenus.forEach((order) => {
    total += order.totalPrice; // Add the base price of the order

    // Loop through each order option and add the option price
    if (order.orderOptions) {
      order.orderOptions.forEach((option) => {
        total += option.choicePrice;
      });
    }
  });

  return total.toFixed(2); // Return the total price formatted to 2 decimal places
};

// Function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return isNaN(date.getTime())
    ? "Invalid Date"
    : date.toLocaleString("th-TH", {
        dateStyle: "short",
        timeStyle: "short",
      });
};

// Function to trigger print from print preview
const printPreview = () => {
  const printContent = document.querySelector("#printableBill").innerHTML;
  const win = window.open("", "", "width=900,height=700");
  win.document.write(`
    <html>
      <head>
        <title>Print Bill</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .text-center { text-align: center; }
          .flex { display: flex; justify-content: space-between; }
          .border-t { border-top: 1px dashed #000; }
          .border-b { border-bottom: 1px dashed #000; }
        </style>
      </head>
      <body>${printContent}</body>
    </html>
  `);
  win.document.close();
  win.focus();
  win.print();
  win.close();
};
</script>
