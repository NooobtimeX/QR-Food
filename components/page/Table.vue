<template>
  <div class="container mx-auto p-4">
    <!-- Loading Overlay -->
    <div
      v-if="loading"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="text-white">
        <svg
          class="h-10 w-10 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z"
          ></path>
        </svg>
        <p class="mt-2 text-center">Loading...</p>
      </div>
    </div>
    <h1 class="pb-4">โต๊ะอาหาร</h1>
    <div class="mt-4 flex justify-end pb-2">
      <button
        class="` en bg-green-500 px-4 py-2 text-base text-white hover:bg-green-700"
        @click="showCreateTableForm"
      >
        เพิ่มโต๊ะอาหาร
      </button>
    </div>
    <div></div>
    <div class="flex flex-wrap justify-start gap-4">
      <button
        v-for="table in tables"
        :key="table.id"
        class="flex h-32 w-32 max-w-xs flex-col items-center justify-center bg-gray-100 p-4 shadow-md hover:bg-gray-200"
        :class="getTableClass(table)"
        @click="selectTable(table)"
      >
        <img src="/icon/table.svg" class="h-14 w-14" />
        <p class="mt-2 text-sm font-medium text-black">
          <span class="text-sm font-bold">โต๊ะ:</span> {{ table.name }}
        </p>
        <p class="text-sm font-medium text-black">
          <span class="text-sm font-bold">ที่นั้ง:</span> {{ table.capacity }}
        </p>
      </button>
    </div>
  </div>

  <!-- Table Details Modal -->
  <div
    v-if="selectedTable"
    class="fixed inset-0 z-20 flex items-center justify-center bg-gray-800 bg-opacity-50"
  >
    <div class="w-96 rounded-lg bg-white p-3">
      <div class="-mt-2 flex justify-end">
        <button
          class="-mb-2 text-black hover:text-gray-700"
          @click="
            selectedTable = null;
            isCustomerMenuVisible = false;
          "
        >
          <span class="text-3xl">&times;</span>
        </button>
      </div>
      <p class="text-center text-2xl text-black">
        โต๊ะ : <span class="font-bold">{{ selectedTable.name }}</span>
      </p>
      <div class="ms-auto mt-2 grid justify-center gap-1">
        <button
          v-if="canReserveTable"
          class="w-full bg-green-500 px-2 py-1 text-lg text-white hover:bg-green-700"
          @click="updateTable('isReserved')"
        >
          เปิดโต๊ะอาหาร
        </button>
        <button
          v-if="selectedTable.status === 'isOpen'"
          class="w-full bg-red-500 p-2 px-2 py-1 text-lg text-white hover:bg-red-02"
          @click="updateTable('isUnavailable')"
        >
          ปิดการใช้งานโต๊ะอาหาร
        </button>
      </div>
      <div
        v-if="selectedTable.status === 'isReserved'"
        class="ms-auto mt-2 grid justify-center gap-1"
      >
        <div v-if="selectedTable.qrCodeId" class="text-center">
          <button
            class="mt-2 w-full bg-green-500 px-2 py-1 text-lg text-white hover:bg-green-700"
            @click="showPrintQRCode = true"
          >
            ปริ้น QR Code
          </button>
          <PrintQRCode
            :show="showPrintQRCode"
            :qr-code-id="selectedTable.qrCodeId"
            @close="showPrintQRCode = false"
          >
            <p>This is the content inside the modal.</p>
          </PrintQRCode>
        </div>

        <button
          class="w-full bg-orange-05 px-2 py-1 text-lg text-white hover:bg-yellow-600"
          @click="
            openCustomerMenu(selectedTable.qrCodeId);
            selectedTable = false;
          "
        >
          สั่งอาหาร
        </button>
        <button
          class="w-full bg-red-500 p-2 px-2 py-1 text-lg text-white hover:bg-red-02"
          @click="updateTable('isOpen', 'closeTable')"
        >
          ปิดโต๊ะอาหารและชำระเงิน
        </button>
      </div>
      <div
        v-if="selectedTable.status === 'isUnavailable'"
        class="ms-auto mt-2 grid justify-center gap-1"
      >
        <button
          class="w-full bg-green-600 px-2 py-1 text-lg text-white"
          @click="updateTable('isOpen', 'makeAvailable')"
        >
          เปิดการใช้งานโต๊ะอาหาร
        </button>
      </div>
      <!-- Close Modal Button -->
    </div>
  </div>

  <!-- Create Table Modal -->
  <CreateTableModal
    v-if="isCreateTableFormVisible"
    @close-modal="isCreateTableFormVisible = false"
    @table-created="addTable"
  />
  <CustomerMenu
    v-if="isCustomerMenuVisible"
    :qr-code-id="qrCodeIdForCustomerMenu"
    :menus="menusData"
    @close="isCustomerMenuVisible = false"
  />
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import VueQrcode from "@chenfengyuan/vue-qrcode";
import CustomerMenu from "./table/CustomerMenu.vue"; // Replaced OrderFood with CustomerMenu
import CreateTableModal from "./table/CreateTableModal.vue"; // Import the modal component
import PrintQRCode from "@/components/popup/PrintQRCode.vue";
import {
  setEncryptedItem,
  getDecryptedItem,
  removeItem,
} from "@/utils/storageUtils";
const showPrintQRCode = ref(false);

const loading = ref(false);
const tables = ref([]);
const selectedTable = ref(null);
const isCreateTableFormVisible = ref(false);
const qrCodeIdForCustomerMenu = ref(null);
const isCustomerMenuVisible = ref(false);
const menusData = ref([]); // For storing the menus to pass to CustomerMenu

const openCustomerMenu = (qrCodeId) => {
  qrCodeIdForCustomerMenu.value = qrCodeId;
  fetchMenusForTable(qrCodeId); // Fetch menus for the selected table
  isCustomerMenuVisible.value = true;
};

const fetchMenusForTable = async (qrCodeId) => {
  try {
    const response = await axios.get(`/api/customer/${qrCodeId}`);
    menusData.value = response.data.body.menus || [];
  } catch (error) {
    console.error("Error fetching menus:", error);
  }
};

// Fetch `restaurantId` and `branchId` from localStorage
const restaurantId = getDecryptedItem("restaurantId");
const branchId = getDecryptedItem("branchId");

const selectTable = (table) => {
  selectedTable.value = table;
};

onMounted(async () => {
  await fetchTables();
});

const fetchTables = async () => {
  loading.value = true; // Start loading
  try {
    const response = await axios.get(
      `/api/restaurant/${restaurantId}/branch/${branchId}/getTableById`,
    );
    tables.value = (response.data.body || []).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  } catch (error) {
    console.error("Error fetching tables:", error);
  } finally {
    loading.value = false; // End loading
  }
};

const updateTable = async (newStatus, intent) => {
  loading.value = true; // Start loading
  try {
    const oldStatus = selectedTable.value.status;

    if (intent === "closeTable") {
      const confirmation = confirm(
        "Are you sure you want to close this table?",
      );
      if (!confirmation) return;

      const response = await axios.post(
        `/api/restaurant/${restaurantId}/branch/${branchId}/checkPendingOrders`,
        { tableId: selectedTable.value.id },
      );

      if (response.data.hasPendingOrders) {
        alert("ไม่สามารถปิดโต๊ะอาหารได้ มีรายการอาหารกำลังรอดำเนินการ.");
        return;
      }
    }

    selectedTable.value.status = newStatus;

    if (newStatus === "isOpen" && oldStatus === "isReserved") {
      await disconnectBillFromTable();
    }

    const response = await axios.post(
      `/api/restaurant/${restaurantId}/branch/${branchId}/updateTableStatus`,
      {
        tableId: selectedTable.value.id,
        status: newStatus,
      },
    );

    if (response.data.statusCode !== 200) {
      selectedTable.value.status = oldStatus;
      console.error("Failed to update table status:", response.data);
    } else {
      const updatedTable = response.data.body;
      const tableIndex = tables.value.findIndex(
        (table) => table.id === selectedTable.value.id,
      );
      if (tableIndex !== -1) {
        tables.value[tableIndex] = updatedTable;
      }
      await fetchTables();

      if (intent === "closeTable") {
        // Set the last selected component and reload the page
        setEncryptedItem("lastSelectedComponent", "ใบเสร็จ");
        window.location = `/restaurant/dashboard?qrCodeId=${selectedTable.value.qrCodeId}`;
      }

      if (newStatus === "isReserved") {
        await genQRCode();
      }
    }
  } catch (error) {
    console.error("Error updating table status:", error);
    selectedTable.value.status = oldStatus;
  } finally {
    loading.value = false; // End loading
  }
};

const disconnectBillFromTable = async () => {
  try {
    const response = await axios.post(
      `/api/restaurant/${restaurantId}/branch/${branchId}/disconnectBill`,
      {
        tableId: selectedTable.value.id,
      },
    );

    if (response.data.statusCode !== 200) {
      console.error("Failed to disconnect bill:", response.data);
    }
  } catch (error) {
    console.error("Error disconnecting bill:", error);
  }
};

const canReserveTable = computed(
  () =>
    selectedTable.value &&
    selectedTable.value.status !== "isReserved" &&
    selectedTable.value.status !== "isUnavailable",
);

const showCreateTableForm = () => {
  isCreateTableFormVisible.value = true;
};
const addTable = (newTable) => {
  tables.value.push(newTable);
};

const getTableClass = (table) => {
  switch (table.status) {
    case "isUnavailable":
      return "bg-red-200 hover:bg-red-500";
    case "isReserved":
      return "bg-green-200 hover:bg-green-500";
    default:
      return "bg-gray-300 hover:bg-gray-500";
  }
};

const genQRCode = async () => {
  try {
    const response = await axios.post(
      `/api/restaurant/${restaurantId}/branch/${branchId}/updateQRCode`,
      {
        tableId: selectedTable.value.id, // Pass the tableId
      },
    );

    if (response.data.statusCode !== 200) {
      console.error("Failed to update QRCode:", response.data);
      selectedTable.value.qrCodeId = null; // Reset if failed
    } else {
      const updatedTable = response.data.body;
      const tableIndex = tables.value.findIndex(
        (table) => table.id === selectedTable.value.id,
      );
      if (tableIndex !== -1) {
        tables.value[tableIndex] = updatedTable; // Update the table with the new qrCodeId
      }
    }
  } catch (error) {
    console.error("Error generating QRCode:", error);
    selectedTable.value.qrCodeId = null; // Reset if there's an error
  }
  await fetchTables();
};
</script>
