<template>
  <h1 class="mt-4 text-center text-3xl font-bold">{{ restaurantName }}</h1>
  <p class="text-center">Table: {{ tableNo }}</p>
  <div class="mx-auto max-w-5xl items-center">
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
        class="flex h-12 w-12 items-center justify-center rounded-full bg-orange-04"
      >
        <img src="/icon/clipboard.svg" class="h-7 w-7" />
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
          class="mt-2 w-full rounded border-gray-300 p-2"
          @change="clearCustomMessage"
        >
          <option value="">Select an option...</option>
          <option value="Request more water">Request for water</option>
          <option value="Need help with the menu">
            Need help with the menu
          </option>
          <option value="Ask for the bill">Ask for the bill</option>
          <option value="custom">Other (Specify)</option>
        </select>

        <div v-if="selectedOption === 'custom'" class="mt-2">
          <input
            v-model="customMessage"
            type="text"
            placeholder="Enter your message"
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

const restaurantName = "Res Name";
const tableNo = ref(route.params.table);

// Popup control
const showPopup = ref(false);

// Selected option for the preset messages
const selectedOption = ref("Request more water");
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

onMounted(() => {
  checkQrCode();
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
    await axios.post("/api/updateNotification", {
      qrCodeId,
      notification: message,
    });

    alert("Notification sent.");
    closePopup();
  } catch (error) {
    console.error("Failed to send notification:", error);
  }
};
</script>
