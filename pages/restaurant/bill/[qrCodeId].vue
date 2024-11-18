<template>
  <div class="container mx-auto max-w-7xl px-4">
    <h1 class="py-6 text-center text-3xl font-bold">
      บิลสำหรับ {{ qrCodeId }}
    </h1>

    <!-- Loading state -->
    <div v-if="pending" class="text-center text-gray-500">
      Loading bill details...
    </div>

    <!-- Error state -->
    <div v-if="error" class="text-center text-red-500">{{ error.message }}</div>

    <!-- Render bill details if available -->
    <div v-if="bill" class="mt-4">
      <div class="overflow-x-auto">
        <table
          class="mx-auto min-w-[100vh] table-auto border-collapse rounded-lg border border-gray-300 shadow-sm"
        >
          <thead class="bg-orange-500 text-white">
            <tr>
              <th class="px-4 py-2 text-center">รายการอาหาร</th>
              <th class="px-4 py-2 text-center">ราคา</th>
              <th class="px-4 py-2 text-center">ตัวเลือกเพิ่มเติม</th>
              <th class="px-4 py-2 text-center">ราคาตัวเลือก</th>
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
              <td class="px-4 py-2 text-center">
                {{ order.name }} x{{ order.quantity }}
              </td>
              <td class="px-4 py-2 text-center">{{ order.totalPrice }} ฿</td>

              <!-- Order Options -->
              <td class="px-4 py-2">
                <div
                  v-if="order.orderOptions.length"
                  class="list-inside list-disc"
                >
                  <div v-for="option in order.orderOptions" :key="option.id">
                    {{ option.name }} ({{ option.selectedChoice }})
                  </div>
                </div>
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
      <div class="my-3">
        <p class="max-w-5xl text-end text-lg font-semibold">
          <strong>ราคารวม</strong>
          {{ bill.totalAmount }} ฿
        </p>
      </div>
    </div>
    <div class="mx-auto grid max-w-[100vh] grid-cols-2">
      <!-- Print Button -->
      <button
        class="mt-4 bg-green-500 px-4 py-2 font-bold text-white"
        @click="openPrintPreview"
      >
        ปริ้น
      </button>
      <button
        class="mt-4 bg-red-500 px-4 py-2 font-bold text-white"
        @click="goBack"
      >
        ปิด
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

        <div class="mt-4 grid grid-cols-2">
          <button
            class="bg-green-500 px-4 py-2 text-white"
            @click="printPreview"
          >
            Print
          </button>
          <button class="bg-red-500 px-4 py-2" @click="closePrintPreview">
            Cancel
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
const goBack = () => {
  window.location = "/restaurant/dashboard/";
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
