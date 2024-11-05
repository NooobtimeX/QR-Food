<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="w-96 rounded-lg bg-white p-6">
      <div class="modal-content">
        <!-- Printable Area Start -->
        <div id="printable-area" class="p-4">
          <h2 class="text-center text-xl font-semibold">{{ title }}</h2>
          <div class="mt-4 text-center">
            <p><strong>Date:</strong> {{ new Date().toLocaleDateString() }}</p>
            <p><strong>Bill ID:</strong> {{ qrCodeId }}</p>
          </div>
          <div class="my-4 flex justify-center">
            <vue-qrcode
              :value="`http://localhost:3000/${qrCodeId}`"
              :size="128"
              tag="img"
            />
          </div>
          <p class="text-center text-sm text-gray-600">
            Scan the QR code to order menu
          </p>
        </div>
        <!-- Printable Area End -->
        <div class="mt-4 flex justify-end space-x-2">
          <button
            @click="printBill"
            class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Print
          </button>
          <button
            @click="closeModal"
            class="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { defineProps, defineEmits } from "vue";
import VueQrcode from "@chenfengyuan/vue-qrcode";

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: "QR Code Bill",
  },
  qrCodeId: {
    type: String,
    required: true,
  },
});

const emits = defineEmits(["close"]);

const closeModal = () => {
  emits("close");
};

const printBill = () => {
  const printContents = document.getElementById("printable-area").innerHTML;
  const originalBodyClass = document.body.className;

  const printWindow = window.open("", "_blank", "width=800,height=600");
  printWindow.document.open();
  printWindow.document.write(`
    <html>
      <head>
        <title>${props.title}</title>
        <!-- Include Tailwind CSS -->
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <style>
          /* Additional styling if needed */
          body { margin: 0; }
        </style>
      </head>
      <body class="${originalBodyClass}">
        ${printContents}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();

  printWindow.onload = function () {
    printWindow.print();
    printWindow.close();
  };
};
</script>
