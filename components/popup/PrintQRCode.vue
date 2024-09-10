<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="w-96 rounded-lg bg-white p-4 shadow-lg">
      <div class="modal-content">
        <!-- Printable Area Start -->
        <div
          id="printable-area"
          class="mb-4 rounded-md border border-gray-300 p-4"
        >
          <!-- Header -->
          <div class="border-b border-gray-300 pb-2 text-center">
            <h2 class="text-xl font-bold">{{ restaurantName }}</h2>
          </div>
          <!-- Bill Details -->
          <div>
            <p class="text-center">{{ branchName }}</p>
            <div class="mt-2 border-t border-dashed text-center"></div>
            <p class="text-center"><strong>โต๊ะ:</strong> {{ tableNumber }}</p>
          </div>
          <!-- QR Code -->
          <div class="my-1 flex justify-center">
            <vue-qrcode
              :value="`${baseUrl}${qrCodeId}`"
              :size="128"
              tag="img"
            />
          </div>
          <div class="border-b border-gray-300 pb-4 text-center">
            <p class="text-center text-sm text-gray-500">
              สแกน QR Code เพื่อสั่งเมนู
            </p>
            <div class="mt-2 border-t border-dashed text-center"></div>
            <p class="text-center">
              <strong>วันที่:</strong> {{ new Date().toLocaleDateString() }}
            </p>
          </div>
          <!-- Footer -->
        </div>
        <!-- Printable Area End -->
        <!-- Buttons -->
        <div class="mt-4 flex justify-between space-x-4">
          <button
            @click="printBill"
            class="w-1/2 rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600"
          >
            ปริ้น
          </button>
          <button
            @click="closeModal"
            class="w-1/2 rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            ปิด
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
import { useRouter } from "vue-router";

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: "QR Code",
  },
  qrCodeId: {
    type: String,
    required: true,
  },
});

const emits = defineEmits(["close"]);
const router = useRouter();
const restaurantName = ref("");
const branchName = ref("");
const tableNumber = ref("");

const closeModal = () => {
  emits("close");
};
const baseUrl = `${window.location.origin}${router.resolve("/").href}`;

const printBill = () => {
  const printableArea = document.getElementById("printable-area");
  const printContents = printableArea.innerHTML;
  const printWindow = window.open("", "_blank", "width=800,height=600");

  printWindow.document.open();
  printWindow.document.write(`
    <html>
      <head>
        <title>${props.title}</title>
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
            .border {
              border: 1px solid #e5e7eb;
            }
          }
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
    console.error("Error fetching bill details:", error.message);
  }
};

watch(
  () => props.show,
  (newShow) => {
    if (newShow) fetchBillDetails();
  },
);
</script>

<style>
@media print {
  @page {
    size: 58mm auto; /* Fixed paper width */
    margin: 5px;
  }
  body {
    margin: 0;
    padding: 0;
    width: 58mm; /* Match receipt width */
    font-family: Arial, sans-serif;
  }
  .border {
    border: 1px solid #e5e7eb;
  }
}
</style>
