<template>
  <div>
    <h1>Bills</h1>

    <!-- Bills Table -->
    <table class="min-w-full table-auto border-collapse rounded-md">
      <thead class="bg-orange-500 text-white">
        <tr>
          <th class="px-4 py-2 text-center text-lg font-medium">Bill ID</th>
          <th class="px-4 py-2 text-center text-lg font-medium">
            Payment Status
          </th>
          <th class="px-4 py-2 text-center text-lg font-medium">Created At</th>
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
          <td class="px-4 py-2 text-center text-base">
            {{ bill.paymentStatus }}
          </td>
          <td class="px-4 py-2 text-center text-base">
            {{ new Date(bill.createdAt).toLocaleString() }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

// Bills data
const bills = ref([]);
const branchId = localStorage.getItem("branchId") || 1;

// Fetch all bills for the branch
const fetchBills = async () => {
  try {
    const response = await axios.post("/api/restaurant/bills", { branchId });
    bills.value = response.data;
  } catch (error) {
    console.error("Failed to fetch bills", error);
  }
};

// Open bill details and navigate to dynamic route
const openBillDetails = (qrCodeId) => {
  window.location.href = `/restaurant/bill/${qrCodeId}`;
};

onMounted(() => {
  fetchBills();
});
</script>
