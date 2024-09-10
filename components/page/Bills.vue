<template>
  <div class="container mx-auto p-4">
    <h1 class="pb-4">ใบเสร็จ</h1>

    <!-- Date Controls with Custom Ranges -->
    <div class="mx-auto mb-4 flex w-1/2 items-center space-x-4 pb-2 pt-2">
      <VueDatePicker
        v-model="selected"
        range
        placeholder="Choose date range"
        :close-on-select="true"
        class="rounded-xl text-white"
      />
    </div>

    <!-- Bills Table -->
    <table class="mx-auto min-w-[100vh] table-auto border-collapse rounded-md">
      <thead class="bg-orange-500 text-white">
        <tr>
          <th class="px-4 py-2 text-center text-lg font-medium">
            หมายเลขใบเสร็จ
          </th>
          <th class="px-4 py-2 text-center text-lg font-medium">
            หมายเลข QR Code
          </th>
          <th class="px-4 py-2 text-center text-lg font-medium">วันที่</th>
          <th class="px-4 py-2 text-center text-lg font-medium">ยอดรวม</th>
        </tr>
      </thead>
      <tbody class="bg-gray-100 text-black">
        <tr
          v-for="bill in bills"
          :key="bill.id"
          class="cursor-pointer border-b border-gray-200 transition duration-200 hover:bg-gray-200"
          @click="openBillPopup(bill.qrCodeId)"
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

    <!-- Bill Popup -->
    <div
      v-if="isPopupVisible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-75"
    >
      <div class="w-96 overflow-y-auto rounded-lg bg-white p-4 shadow-lg">
        <div class="bg-white">
          <div v-if="bill?.tableId">
            <p class="text-center font-bold text-red-500">
              บิลนี้ยังไม่เสร็จสิ้น
            </p>
          </div>
          <div v-else>
            <div
              id="printableBill"
              class="mb-4 rounded-md border border-gray-300 p-4"
            >
              <div class="border-b border-gray-300 pb-2 text-center">
                <h2 class="text-center text-xl font-bold">
                  {{ bill?.branch?.restaurant?.name || "ร้านอาหาร" }}
                </h2>
              </div>

              <h2 class="text-center text-lg">
                {{ bill?.branch?.name || "สาขา" }}
              </h2>
              <div class="mt-2 border-t border-dashed text-center"></div>
              <div class="mt-2 text-left">
                <ul>
                  <li
                    v-for="order in bill?.orderMenus?.filter(
                      (order) => order.status === 'finish',
                    ) || []"
                    :key="order.id"
                    class="mb-2"
                  >
                    <div class="flex justify-between">
                      <span>{{ order.name }} (x{{ order.quantity }})</span>
                      <span>{{ order.totalPrice }} ฿</span>
                    </div>
                    <!-- Display options for each menu -->
                    <ul class="ml-4 mt-1 text-sm text-gray-600">
                      <li
                        v-for="option in order.options || []"
                        :key="option.name"
                        class="flex justify-between"
                      >
                        <span
                          >- {{ option.name }}:
                          {{ option.selectedChoice }}</span
                        >
                        <span>{{ option.choicePrice }} ฿</span>
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>
              <div class="border-b border-dashed py-2 text-right">
                <p><strong>รวม:</strong> {{ bill?.totalAmount }} ฿</p>
              </div>
              <div class="mt-2 border-b border-gray-300 pb-4 text-center">
                <p>
                  <strong>วันที่:</strong>
                  {{ formatDate(bill?.createdAt || "") }}
                </p>
              </div>
            </div>
          </div>
          <div class="mt-4 grid grid-cols-2">
            <button
              class="bg-green-500 px-4 py-2 text-white"
              @click="printPreview"
            >
              ปริ้น
            </button>
            <button class="bg-red-500 px-4 py-2 text-white" @click="closePopup">
              ยกเลิก
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import axios from "axios";
import { sub, format, startOfDay, endOfDay } from "date-fns";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { useRoute, useRouter } from "vue-router";
import {
  setEncryptedItem,
  getDecryptedItem,
  removeItem,
} from "@/utils/storageUtils";

const route = useRoute();
const router = useRouter();
const selected = ref<[Date, Date]>([sub(new Date(), { days: 14 }), new Date()]);

interface Bill {
  id: number;
  qrCodeId: string;
  createdAt: string;
  totalAmount: number;
  tableId?: number;
  branch?: {
    restaurant?: { name: string };
    name: string;
  };
  orderMenus?: {
    id: number;
    name: string;
    quantity: number;
    totalPrice: number;
    status: string;
    options?: {
      name: string;
      selectedChoice: string;
      choicePrice: number;
    }[];
  }[];
}

const bills = ref<Bill[]>([]);
const branchId = getDecryptedItem("branchId") || 1;

// State for popup
const isPopupVisible = ref(false);
const selectedQrCodeId = ref<string | null>(null);
const bill = ref<Bill | null>(null);

// Fetch bills within the selected date range
const fetchBills = async () => {
  try {
    const response = await axios.post("/api/restaurant/bill/getByRange", {
      branchId,
      startDate: format(startOfDay(selected.value[0]), "yyyy-MM-dd HH:mm:ss"),
      endDate: format(endOfDay(selected.value[1]), "yyyy-MM-dd HH:mm:ss"),
    });
    bills.value = response.data.sort((a: Bill, b: Bill) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // Descending order
    });
  } catch (error) {
    console.error("Failed to fetch bills", error);
  }
};

// Fetch single bill details
const fetchBillData = async (qrCodeId: string) => {
  try {
    const response = await axios.get(`/api/restaurant/bill/${qrCodeId}`);
    bill.value = response.data;
  } catch (error) {
    console.error("Failed to fetch bill data", error);
  }
};

// Watch for changes in selected date range and fetch bills
watch(selected, fetchBills);

// Open the popup with the selected QR Code ID
const openBillPopup = (qrCodeId: string) => {
  selectedQrCodeId.value = qrCodeId;
  fetchBillData(qrCodeId);
  isPopupVisible.value = true;

  // Update URL with query parameter
  router.push({ query: { ...route.query, qrCodeId } });
};

// Close the popup
const closePopup = () => {
  isPopupVisible.value = false;
  selectedQrCodeId.value = null;
  bill.value = null;
  // Remove qrCodeId from URL
  const { qrCodeId, ...restQuery } = route.query;
  router.push({ query: restQuery });
};

// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return isNaN(date.getTime())
    ? "Invalid Date"
    : date.toLocaleString("th-TH", {
        dateStyle: "short",
        timeStyle: "short",
      });
};

// Print the bill
const printPreview = () => {
  const printableContent = document.querySelector("#printableBill")?.innerHTML;

  if (printableContent) {
    const printWindow = window.open("", "_blank", "width=800,height=600");

    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Bill</title>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
            <style>
              @media print {
                @page {
                  size: 58mm auto;
                  margin: 0;
                }
                body {
                  margin: 0;
                  padding: 0;
                  width: 58mm;
                  font-family: Arial, sans-serif;
                }
              }
            </style>
          </head>
          <body>${printableContent}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
    }
  }
};

// Initial fetch when component mounts
onMounted(async () => {
  await fetchBills(); // Fetch bills when the page loads

  const qrCodeId = route.query.qrCodeId as string;
  if (qrCodeId) {
    openBillPopup(qrCodeId); // Open the popup for the specified bill
  }
});
</script>
