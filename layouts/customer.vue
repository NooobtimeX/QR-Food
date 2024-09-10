<template>
  <h1 class="mt-4 text-center text-3xl font-bold">{{ restaurantName }}</h1>
  <p class="mb-1 text-center">โต๊ะ: {{ tableNumber }}</p>
  <div class="mx-auto max-w-7xl items-center">
    <slot />
  </div>
  <div class="fixed bottom-4 right-4 z-10 grid grid-cols-1 gap-2">
    <!-- Notification Button -->
    <button
      class="flex aspect-square items-center justify-center rounded-full bg-orange-04"
      @click="showPopup = true"
    >
      <img src="/icon/notification.svg" class="h-5 w-5" />
    </button>
    <!-- Cart Button -->
    <a :href="`/${tableNo}/cart`">
      <button
        class="flex aspect-square items-center justify-center rounded-full bg-orange-04"
      >
        <img src="/icon/cart.svg" class="h-8 w-8" />
      </button>
    </a>
    <!-- Popup -->
    <div
      v-if="showPopup"
      class="fixed inset-0 z-10 flex items-center justify-center bg-gray-800 bg-opacity-50"
    >
      <div class="w-80 rounded-xl bg-white p-4 shadow-lg">
        <p class="text-gray-800">เรียกพนักงาน</p>

        <select
          v-model="selectedOption"
          class="mt-2 w-full rounded border border-gray-300 p-2"
          @change="clearCustomMessage"
        >
          <option value="">เลือกตัวเลือก</option>
          <option value="ต้องการน้ำ">ต้องการน้ำ</option>
          <option value="ต้องการความช่วยเหลือเกี่ยวกับอาหาร">
            ต้องการความช่วยเหลือเกี่ยวกับอาหาร
          </option>
          <option value="ต้องการความช่วยเหลือเกี่ยวกับบิล">
            ต้องการความช่วยเหลือเกี่ยวกับบิล
          </option>
          <option value="custom">อื่นๆ (โปรดระบุ)</option>
        </select>

        <div v-if="selectedOption === 'custom'" class="mt-2">
          <input
            v-model="customMessage"
            type="text"
            placeholder="โปรดระบุ"
            class="w-full rounded border-gray-300 p-2"
          />
        </div>

        <div class="mt-4 grid grid-cols-2">
          <button
            class="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-700"
            @click="confirmNotification"
          >
            ยืนยัน
          </button>
          <button
            class="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-700"
            @click="closePopup"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

const route = useRoute();
const router = useRouter();

const tableNo = ref(route.params.table);
const restaurantName = ref("");
const branchName = ref("");
const tableNumber = ref("");
// Popup control
const showPopup = ref(false);

// Selected option for the preset messages
const selectedOption = ref("");
const customMessage = ref("");

// Function to check if the QR code is associated with a table
const checkQrCode = async () => {
  const qrCodeId = route.params.table;
  try {
    const response = await axios.post(`/api/checkQrCode`, { qrCodeId });
    if (response.data.success) {
      console.log("QR Code is associated with a table");
    } else {
      alert("QR Code is not associated with any table.");
      router.push("/"); // Redirect to the homepage
    }
  } catch (error) {
    console.error("Error checking QR Code:", error);
    alert("An error occurred. Redirecting to the homepage.");
    router.push("/");
  }
};

const fetchBillDetails = async () => {
  try {
    const qrCodeId = route.params.table;
    const response = await axios.get(`/api/${qrCodeId}`);
    const {
      restaurantName: restName,
      branchName: brName,
      tableNumber: tblNumber,
    } = response.data.body;
    restaurantName.value = restName;
    branchName.value = brName;
    tableNumber.value = tblNumber;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching bill details:", error.message);
    } else {
      console.error("Error fetching bill details:", error);
    }
  }
};
onMounted(() => {
  checkQrCode();
  fetchBillDetails();
});

const clearCustomMessage = () => {
  customMessage.value = "";
};

const closePopup = () => {
  showPopup.value = false;
  selectedOption.value = "";
  customMessage.value = "";
};

const confirmNotification = async () => {
  let message = selectedOption.value;
  if (selectedOption.value === "custom") {
    message = customMessage.value;
  }

  if (!message) {
    alert("Please select or enter a message.");
    return;
  }

  try {
    const qrCodeId = route.params.table;
    await axios.post("/api/customer/notification/update", {
      qrCodeId,
      notification: message,
    });

    alert("ส่งการแจ้งเตือนแล้ว");
    closePopup();
  } catch (error) {
    console.error("Failed to send notification:", error);
  }
};
</script>
