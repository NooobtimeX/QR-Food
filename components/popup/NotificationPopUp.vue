<template>
  <div>
    <!-- Floating Action Button -->
    <button
      class="fixed bottom-6 right-6 z-10 flex h-16 w-16 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg hover:bg-orange-600 focus:outline-none"
      @click="toggleNotificationPopup"
    >
      <img
        src="/icon/notification.svg"
        class="h-8 w-8"
        alt="Notification Icon"
      />
    </button>

    <!-- Notification Popup -->
    <div
      v-if="showPopup"
      class="fixed bottom-24 right-6 z-20 max-h-96 w-80 overflow-y-auto rounded-lg bg-white shadow-lg"
    >
      <div class="p-2">
        <div class="flex items-center justify-between">
          <h2 class="mb-4 text-xl font-bold text-gray-800">การแจ้งเตือน</h2>
          <!-- Close Button -->
          <button
            class="text-gray-500 hover:text-gray-700 focus:outline-none"
            @click="toggleNotificationPopup"
          >
            <svg
              class="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Notifications List -->
        <div v-if="tablesWithNotifications.length > 0">
          <div
            v-for="table in tablesWithNotifications"
            :key="table.id"
            class="my-1 border-b py-1"
          >
            <h3 class="text-lg font-semibold text-gray-700">
              โต๊ะ: {{ table.name }}
            </h3>
            <div
              v-for="notification in table.notifications"
              :key="notification.id"
            >
              <p class="mt-2 text-gray-600">{{ notification.message }}</p>
              <button
                class="mt-3 w-full rounded bg-green-500 px-4 py-2 text-white hover:bg-green-700"
                @click="acceptNotification(notification.id)"
              >
                ตกลง
              </button>
            </div>
          </div>
        </div>

        <!-- No Notifications Available -->
        <div v-else class="text-center text-gray-500">ไม่มีการแจ้งเตือน</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import axios from "axios";
import {
  setEncryptedItem,
  getDecryptedItem,
  removeItem,
} from "@/utils/storageUtils";
const tables = ref([]);
const showPopup = ref(false);
const previousNotificationCount = ref(0);

// Fetch tables with notifications
const fetchTablesWithNotifications = async () => {
  const branchId = getDecryptedItem("branchId"); // Assuming branchId is stored in localStorage
  const response = await axios.get(
    `/api/restaurant/tablesWithNotifications/${branchId}`,
  );
  tables.value = response.data.body || [];

  // Get the current number of notifications
  const currentNotificationCount = tablesWithNotifications.value.reduce(
    (total, table) => total + table.notifications.length,
    0,
  );

  // Automatically show popup if there's a new notification
  if (
    currentNotificationCount > previousNotificationCount.value &&
    previousNotificationCount.value >= 0
  ) {
    showPopup.value = true;
  }

  // Update the previous notification count
  previousNotificationCount.value = currentNotificationCount;
};

// Toggle the notification popup
const toggleNotificationPopup = () => {
  showPopup.value = !showPopup.value;
};

// Accept notification and clear it
const acceptNotification = async (notificationId) => {
  await axios.post("/api/restaurant/notification/clear", { notificationId });

  // Fetch updated table list
  await fetchTablesWithNotifications();
};

onMounted(() => {
  fetchTablesWithNotifications();
  const intervalId = setInterval(fetchTablesWithNotifications, 5000); // Fetch every 5 seconds

  // Clear the interval when the component is unmounted
  onUnmounted(() => {
    clearInterval(intervalId);
  });
});

const tablesWithNotifications = computed(() => {
  return tables.value.filter(
    (table) => table.notifications && table.notifications.length > 0,
  );
});
</script>

<style>
/* Optional: Add custom styles here if needed */
</style>
