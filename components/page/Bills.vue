<template>
  <div class="container mx-auto p-4">
    <h1 class="pb-4">บิลส์</h1>

    <!-- Date Controls with Custom Ranges -->
    <div class="mb-4 flex items-center space-x-4 pt-2 w-1/3 pb-2">
      <VueDatePicker
        v-model="selected"
        range
        placeholder="Choose date range"
        :close-on-select="true"
        class="rounded-md bg-gray-300 p-1 text-white hover:bg-gray-500"
      />
    </div>

    <!-- Bills Table -->
    <table class="min-w-full table-auto border-collapse rounded-md ">
      <thead class="bg-orange-500 text-white">
        <tr>
          <th class="px-4 py-2 text-center text-lg font-medium">Bill ID</th>
          <th class="px-4 py-2 text-center text-lg font-medium">QR Code ID</th>
          <th class="px-4 py-2 text-center text-lg font-medium">Created At</th>
          <th class="px-4 py-2 text-center text-lg font-medium">
            Total Amount
          </th>
        </tr>
      </thead>
      <tbody class="bg-gray-100 text-black">
        <tr
          v-for="bill in bills"
          :key="bill.id"
          class="cursor-pointer border-b border-gray-200 transition duration-200 hover:bg-gray-200"
          @click="openBillDetails(bill.qrCodeId)"
        >
          <td class="px-4 py-2 text-center text-base">{{ bill.id }}</td>
          <td class="px-4 py-2 text-center text-base">{{ bill.qrCodeId }}</td>
          <td class="px-4 py-2 text-center text-base">
            {{ new Date(bill.createdAt).toLocaleString() }}
          </td>
          <td class="px-4 py-2 text-center text-base">
            {{ bill.totalAmount }} ฿
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import axios from "axios";
import { sub, format, startOfDay, endOfDay } from "date-fns";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

const selected = ref<[Date, Date]>([sub(new Date(), { days: 14 }), new Date()]);

interface Bill {
  id: number;
  qrCodeId: string;
  createdAt: string;
  totalAmount: number;
}

const bills = ref<Bill[]>([]);
const branchId = localStorage.getItem("branchId") || 1;

// Fetch bills within the selected date range
const fetchBills = async () => {
  try {
    const response = await axios.post("/api/restaurant/bills", {
      branchId,
      startDate: format(startOfDay(selected.value[0]), "yyyy-MM-dd HH:mm:ss"),
      endDate: format(endOfDay(selected.value[1]), "yyyy-MM-dd HH:mm:ss"),
    });
    bills.value = response.data;
  } catch (error) {
    console.error("Failed to fetch bills", error);
  }
};

// Watch for changes in selected date range and fetch bills
watch(selected, fetchBills);

const openBillDetails = (qrCodeId: string) => {
  window.location.href = `/restaurant/bill/${qrCodeId}`;
};

// Initial fetch when component mounts
onMounted(fetchBills);
</script>
