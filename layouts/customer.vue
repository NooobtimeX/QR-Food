<template>
  <h1 class="mt-4 text-center text-3xl font-bold">{{ restaurantName }}</h1>
  <p class="text-center">{{ address }}</p>
  <p class="text-center">Table: {{ tableNo }}</p>
  <div class="mx-auto max-w-5xl items-center">
    <slot />
  </div>
  <div class="fixed bottom-4 right-4 z-10 grid grid-cols-1 gap-2">
    <!-- Notification Button -->
    <button
      class="flex h-12 w-12 items-center justify-center rounded-full bg-orange-04"
      @click="showPopup = true"
    >
      <img src="/icon/notification.svg" class="h-7 w-7" />
    </button>
    <!-- Cart Button -->
    <a :href="`/${tableNo}/cart`">
      <!-- Use dynamic route for table/cart -->
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
        <p class="text-gray-800">Call the staff for:</p>

        <!-- Preset Options -->
        <select
          v-model="selectedOption"
          class="mt-2 w-full rounded border-gray-300 p-2"
          @change="clearCustomMessage"
        >
          <option value="">Select an option...</option>
          <option value="Request more water">Request more water</option>
          <option value="Need help with the menu">
            Need help with the menu
          </option>
          <option value="Ask for the bill">Ask for the bill</option>
          <option value="custom">Other (Specify)</option>
        </select>

        <!-- Custom Message Field (only shown when 'custom' is selected) -->
        <div v-if="selectedOption === 'custom'" class="mt-2">
          <input
            v-model="customMessage"
            type="text"
            placeholder="Enter your message"
            class="w-full rounded border-gray-300 p-2"
          />
        </div>

        <!-- Buttons -->
        <div class="mt-4 flex justify-between">
          <button
            class="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-700"
            @click="confirmNotification"
          >
            Confirm
          </button>
          <button
            class="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-700"
            @click="closePopup"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router"; // Import useRoute
import axios from "axios"; // Import axios for API requests

const route = useRoute(); // Get the route object

const restaurantName = "Res Name";
const address = "bababa";
const tableNo = ref(route.params.table); // Set tableNo from route params

// Popup control
const showPopup = ref(false);

// Selected option for the preset messages
const selectedOption = ref("Request more water");
const customMessage = ref("");

// Clear custom message when another option is selected
const clearCustomMessage = () => {
  customMessage.value = "";
};

// Close the popup
const closePopup = () => {
  showPopup.value = false;
  selectedOption.value = "";
  customMessage.value = "";
};

// Confirm notification to call staff
const confirmNotification = async () => {
  let message = selectedOption.value;

  // If the custom option is selected, use the custom message instead
  if (selectedOption.value === "custom") {
    message = customMessage.value;
  }

  if (!message) {
    alert("Please select or enter a message.");
    return;
  }

  try {
    const qrCodeId = route.params.table; // Get QR code from the URL
    // Send the message to the backend to update the table's notification
    await axios.post("/api/updateNotification", {
      qrCodeId, // Use QR code ID directly
      notification: message, // Send the selected or custom message
    });

    alert("Notification sent.");
    closePopup(); // Close the popup after sending the message
  } catch (error) {
    console.error("Failed to send notification:", error);
  }
};
</script>
