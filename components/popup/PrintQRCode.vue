<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="w-96 rounded-lg bg-white p-4 shadow-lg">
      <div class="modal-content">
        <!-- Printable Area Start -->
        <div id="printable-area" class="rounded-md border border-gray-300 p-4">
          <!-- Header -->
          <div class="border-b border-gray-300 pb-2 text-center">
            <h2 class="text-xl font-bold">{{ restaurantName }}</h2>
          </div>
          <!-- Bill Details -->
          <div class="mt-4">
            <p class="text-left"><strong>สาขา:</strong> {{ branchName }}</p>
            <p class="text-left">
              <strong>วันที่:</strong> {{ new Date().toLocaleDateString() }}
            </p>
            <p class="text-left"><strong>โต๊ะ:</strong> {{ tableNumber }}</p>
          </div>
          <!-- QR Code -->
          <div class="my-4 flex justify-center">
            <vue-qrcode
              :value="`http://localhost:3000/${qrCodeId}`"
              :size="128"
              tag="img"
            />
          </div>
          <p class="text-center text-sm text-gray-500">
            สแกน QR Code เพื่อสั่งเมนู
          </p>
          <!-- Footer -->
        </div>
        <!-- Printable Area End -->
        <!-- Buttons -->
        <div class="mt-4 flex justify-between space-x-4">
          <button
            @click="printBill"
            class="w-1/2 rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600"
          >
            Print
          </button>
          <button
            @click="closeModal"
            class="w-1/2 rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, watch, ref } from "vue";
import VueQrcode from "@chenfengyuan/vue-qrcode";
import axios from "axios";

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: "Restaurant Bill",
  },
  qrCodeId: {
    type: String,
    required: true,
  },
});

const emits = defineEmits(["close"]);

const restaurantName = ref("");
const branchName = ref("");
const tableNumber = ref("");

const closeModal = () => {
  emits("close");
};

const printBill = () => {
  const printContents = document.getElementById("printable-area").innerHTML;
  const printWindow = window.open("", "_blank", "width=800,height=600");
  printWindow.document.open();
  printWindow.document.write(`
    <html>
      <head>
        <title>${props.title}</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <style>
          body { margin: 0; font-family: Arial, sans-serif; }
          .border { border: 1px solid #e5e7eb; padding: 8px; margin: 4px 0; }
        </style>
      </head>
      <body>
        ${printContents}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();

  printWindow.onload = () => {
    printWindow.print();
    printWindow.close();
  };
};

const fetchBillDetails = async () => {
  try {
    const response = await axios.get(`/api/${props.qrCodeId}`);
    const {
      restaurantName: restName,
      branchName: brName,
      tableNumber: tblNumber,
    } = response.data.body;
    restaurantName.value = restName;
    branchName.value = brName;
    tableNumber.value = tblNumber;
  } catch (error) {
    console.error("Error fetching bill details:", error);
  }
};

watch(
  () => props.show,
  (newShow) => {
    if (newShow) fetchBillDetails();
  },
);
</script>
