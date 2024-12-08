<template>
  <div class="container mx-auto p-4">
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
          Make available
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

const showPrintQRCode = ref(false);

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
const restaurantId = localStorage.getItem("restaurantId");
const branchId = localStorage.getItem("branchId");

const selectTable = (table) => {
  selectedTable.value = table;
};

onMounted(async () => {
  await fetchTables();
});

const fetchTables = async () => {
  try {
    const response = await axios.get(
      `/api/restaurant/${restaurantId}/branch/${branchId}/getTableById`,
    );
    tables.value = (response.data.body || []).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  } catch (error) {
    console.error("Error fetching tables:", error);
  }
};

const updateTable = async (newStatus, intent) => {
  try {
    const oldStatus = selectedTable.value.status;

    // If the intent is 'closeTable', confirm with the user and check pending orders
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
        alert("Cannot close the table because there are pending orders.");
        return;
      }
    }

    // Update the table status
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
      if (newStatus === "isReserved") {
        await genQRCode();
      }
    }
  } catch (error) {
    console.error("Error updating table status:", error);
    selectedTable.value.status = oldStatus;
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
    const qrCodeId = Math.random().toString(36).substring(2, 12).toUpperCase();
    selectedTable.value.qrCodeId = qrCodeId;

    const response = await axios.post(
      `/api/restaurant/${restaurantId}/branch/${branchId}/updateQRCode`,
      {
        tableId: selectedTable.value.id,
        qrCodeId,
      },
    );

    if (response.data.statusCode !== 200) {
      console.error("Failed to update QRCode:", response.data);
      selectedTable.value.qrCodeId = null;
    } else {
      const updatedTable = response.data.body;
      const tableIndex = tables.value.findIndex(
        (table) => table.id === selectedTable.value.id,
      );
      if (tableIndex !== -1) {
        tables.value[tableIndex] = updatedTable;
      }
    }
  } catch (error) {
    console.error("Error generating QRCode:", error);
    selectedTable.value.qrCodeId = null;
  }
  await fetchTables();
};
</script>
