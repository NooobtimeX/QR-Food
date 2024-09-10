<!-- components/popup/CreateBranchModal.vue -->
<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-75"
  >
    <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
      <h3 class="mb-4 text-center text-xl font-bold text-black">สร้างสาขา</h3>
      <div class="mb-4">
        <label class="block font-bold text-black"
          >ชื่อสาขา<span class="text-red-600">*</span></label
        >
        <input
          v-model="newBranch.name"
          type="text"
          class="w-full rounded-lg border border-gray-400 p-3 focus:outline-none focus:ring-2"
          required
        />
      </div>

      <div class="mb-4">
        <label class="block font-bold text-black"
          >เบอร์โทร<span class="text-red-600">*</span></label
        >
        <input
          v-model="newBranch.phoneNumber"
          type="tel"
          class="w-full rounded-lg border border-gray-400 p-3 focus:outline-none focus:ring-2"
          pattern="[0-9]*"
          inputmode="tel"
          required
        />
      </div>

      <div class="mb-4">
        <label class="block font-bold text-black"
          >เลือกร้านอาหาร<span class="text-red-600">*</span></label
        >
        <select
          v-model="newBranch.restaurantId"
          class="w-full rounded-lg border border-gray-400 p-3 text-black focus:outline-none focus:ring-2"
          required
        >
          <option
            v-for="restaurant in ownerAccess"
            :key="restaurant.id"
            :value="restaurant.id"
          >
            {{ restaurant.name }}
          </option>
        </select>
      </div>
      <div class="flex justify-end space-x-2">
        <button
          class="w-1/2 bg-green-500 pl-2 pr-2 text-white hover:bg-green-700 disabled:bg-gray-400"
          :disabled="loading"
          @click="createBranch"
        >
          {{ loading ? "กำลังสร้าง..." : "สร้าง" }}
        </button>
        <button
          class="mr-2 w-1/2 bg-red-500 pl-2 pr-2 text-white hover:bg-red-02"
          @click="cancel"
        >
          ยกเลิก
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { defineProps, defineEmits } from "vue";
import axios from "axios";
import {
  setEncryptedItem,
  getDecryptedItem,
  removeItem,
} from "@/utils/storageUtils";
// Define the Restaurant type
interface Restaurant {
  id: number;
  name: string;
}

const props = defineProps<{
  isOpen: boolean;
  ownerAccess: Restaurant[];
}>();

const emit = defineEmits(["close", "branchCreated"]);

// Local state for new branch details
const newBranch = ref({ name: "", phoneNumber: "", restaurantId: 0 });
const ownerAccess = ref<Restaurant[]>([]); // Define local owner access for this modal
const loading = ref(false);

// Set default restaurant on open
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal && ownerAccess.value.length > 0) {
      newBranch.value.restaurantId = ownerAccess.value[0].id;
    }
  },
);

const cancel = () => {
  emit("close");
};

// Fetch restaurants for owner access
const fetchRestaurants = async () => {
  try {
    const response = await axios.get("/api/restaurant/getAll", {
      params: { userId: getDecryptedItem("userId") },
    });
    ownerAccess.value = response.data.body.ownedRestaurants;
    if (ownerAccess.value.length > 0) {
      newBranch.value.restaurantId = ownerAccess.value[0].id;
    }
  } catch (error) {
    console.error("Error fetching restaurants:", error);
  }
};

// Function to create a branch with API call
const createBranch = async () => {
  if (loading.value) return; // Prevent multiple submissions
  loading.value = true;
  try {
    await axios.post("/api/restaurant/branch/createBranch", {
      name: newBranch.value.name,
      phoneNumber: newBranch.value.phoneNumber,
      restaurantId: newBranch.value.restaurantId,
      userId: Number(getDecryptedItem("userId")),
    });
    emit("branchCreated"); // Notify parent component of successful creation
    emit("close"); // Close modal after successful creation
    resetForm();
    await fetchRestaurants(); // Refresh restaurant data after branch creation
  } catch (error) {
    console.error("Error creating branch:", error);
  } finally {
    loading.value = false;
  }
};

// Function to reset the form after creation
const resetForm = () => {
  newBranch.value = { name: "", phoneNumber: "", restaurantId: 0 };
};

// Fetch restaurants on component mount
onMounted(fetchRestaurants);
</script>
