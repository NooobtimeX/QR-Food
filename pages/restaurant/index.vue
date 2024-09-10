<template>
  <NuxtLayout></NuxtLayout>
  <div class="min-h-screen">
    <!-- Navbar -->
    <AppNav />
    <!-- Main content -->
    <div class="p-6">
      <div class="container mx-auto max-w-7xl">
        <!-- Search input -->
        <div class="mb-8 flex justify-center">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ค้นหาร้านอาหาร..."
            class="w-full max-w-md rounded-xl border border-black p-3 focus:outline-none focus:ring-2"
          />
        </div>

        <!-- Buttons for creating restaurant or branch -->
        <div class="mb-8 flex justify-center">
          <button
            class="bg-orange-04 pl-3 pr-3 text-white shadow-xl hover:bg-orange-03"
            @click="openRestaurantModal"
          >
            + เพิ่มร้านอาหาร
          </button>
          <button
            class="bg-orange-04 pl-3 pr-3 text-white shadow-xl hover:bg-orange-03 disabled:cursor-not-allowed disabled:bg-gray-400"
            :disabled="!hasRestaurants"
            @click="openBranchModal"
          >
            + เพิ่มสาขา
          </button>
          <button
            class="bg-orange-04 pl-3 pr-3 text-white shadow-xl hover:bg-orange-03 disabled:cursor-not-allowed disabled:bg-gray-400"
            :disabled="!hasRestaurants"
            @click="openMenuModal"
          >
            + เพิ่มเมนู
          </button>
        </div>

        <!-- Menu Popup Component -->
        <CreateMenu :is-open="showMenuModal" @close="showMenuModal = false" />

        <!-- Create Branch Modal Component -->
        <CreateBranchModal
          :isOpen="showBranchModal"
          :ownerAccess="ownerAccess"
          @close="showBranchModal = false"
          @branchCreated="fetchRestaurants"
        ></CreateBranchModal>

        <!-- Create Restaurant Modal Component -->
        <CreateRestaurantModal
          :isOpen="showRestaurantModal"
          @close="showRestaurantModal = false"
          @restaurantCreated="fetchRestaurants"
        ></CreateRestaurantModal>

        <!-- Restaurant and branch display -->
        <div v-if="filteredRestaurants.length" class="space-y-8">
          <div
            v-for="restaurant in filteredRestaurants"
            :key="restaurant.id"
            class="card"
          >
            <h3 class="mb-4 text-2xl text-black">
              {{ restaurant.name }}
            </h3>

            <!-- Branch display -->
            <div
              v-if="restaurant.branches.length"
              class="mt-4 grid grid-cols-4 gap-2"
            >
              <div
                v-for="branch in restaurant.branches"
                :key="branch.id"
                class="mb-4 block cursor-pointer rounded-lg bg-gray-200 p-4 shadow-md hover:bg-gray-300"
                @click="goToDashboard(restaurant.id, branch.id)"
              >
                <p class="text-lg text-black">
                  <span class="font-bold">สาขา:</span> {{ branch.name }}
                </p>
                <p class="text-lg text-black">
                  <span class="font-bold">เบอร์โทร:</span>
                  {{ branch.phoneNumber }}
                </p>
                <p class="text-lg text-black">
                  <span class="font-bold">ตำแหน่ง: </span>
                  <span class="text-black">
                    <!-- Display branch role if available, otherwise fallback to restaurant role -->
                    <template
                      v-if="
                        branch.userBranchRoles &&
                        branch.userBranchRoles.length > 0
                      "
                    >
                      {{
                        branch.userBranchRoles
                          .map((role) => role.role)
                          .join(", ")
                      }}
                    </template>
                    <template
                      v-else-if="
                        restaurant.userRestaurantRoles &&
                        restaurant.userRestaurantRoles.length > 0
                      "
                    >
                      {{
                        restaurant.userRestaurantRoles
                          .map((role) => role.role)
                          .join(", ")
                      }}
                      <!-- Fallback to restaurant role -->
                    </template>
                    <template v-else> No role assigned </template>
                  </span>
                </p>
              </div>
            </div>
            <p v-else class="text-black">ไม่มีสาขาในร้านอาหารนี้</p>
          </div>
        </div>
        <p v-else class="text-xl text-black">ไม่มีร้านอาหารที่คุณเป็นเจ้าของ</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import CreateMenu from "@/components/popup/CreateMenu.vue";
import CreateBranchModal from "@/components/popup/CreateBranchModal.vue";
import CreateRestaurantModal from "@/components/popup/CreateRestaurantModal.vue";
import {
  setEncryptedItem,
  getDecryptedItem,
  removeItem,
} from "@/utils/storageUtils";

// Define types
interface Branch {
  id: number;
  name: string;
  phoneNumber: string;
  userBranchRoles: { role: string }[]; // Include userBranchRoles to get roles
}

interface Restaurant {
  id: number;
  name: string;
  branches: Branch[];
  userRestaurantRoles: { role: string }[]; // Include userRestaurantRoles to get roles
}

const showRestaurantModal = ref(false);
const showBranchModal = ref(false);
const showMenuModal = ref(false);
const searchQuery = ref("");
const ownerAccess = ref<Restaurant[]>([]);
const staffAccess = ref<Restaurant[]>([]);

const router = useRouter();

const goToDashboard = (restaurantId: number, branchId: number) => {
  setEncryptedItem("restaurantId", restaurantId.toString());
  setEncryptedItem("branchId", branchId.toString());
  router.push(`/restaurant/dashboard`);
};

const hasRestaurants = computed(
  () => ownerAccess.value.length > 0 || staffAccess.value.length > 0,
); // Add this here
// Computed property for filtering restaurants
const filteredRestaurants = computed(() => {
  const query = searchQuery.value.toLowerCase();

  const filterByQuery = (restaurants: Restaurant[]) =>
    restaurants.filter(
      (restaurant) =>
        restaurant.name.toLowerCase().includes(query) ||
        restaurant.branches.some(
          (branch: Branch) =>
            branch.name.toLowerCase().includes(query) ||
            branch.phoneNumber.includes(query),
        ),
    );

  // Merge and remove duplicates by restaurant ID
  const mergedRestaurants = [
    ...filterByQuery(ownerAccess.value),
    ...filterByQuery(staffAccess.value),
  ];

  const uniqueRestaurants = mergedRestaurants.reduce((acc, current) => {
    if (!acc.some((restaurant) => restaurant.id === current.id)) {
      acc.push(current);
    }
    return acc;
  }, [] as Restaurant[]);

  return uniqueRestaurants;
});

// Fetch restaurants from API
const fetchRestaurants = async () => {
  const userId = getDecryptedItem("userId");
  try {
    const response = await axios.get("/api/restaurant/getAll", {
      params: { userId: userId },
    });
    ownerAccess.value = response.data.body.ownedRestaurants;
    staffAccess.value = response.data.body.staffRestaurants;
    console.log("Owner Access:", ownerAccess.value);
    console.log("Staff Access:", staffAccess.value);
  } catch (error) {
    console.error("Error fetching restaurants:", error);
  }
  removeItem("restaurantId");
  removeItem("branchId");
};

// Function to open branch modal after fetching restaurants
const openRestaurantModal = async () => {
  showRestaurantModal.value = true;
};
const openBranchModal = async () => {
  await fetchRestaurants();
  showBranchModal.value = true;
};
const openMenuModal = async () => {
  await fetchRestaurants();
  showMenuModal.value = true;
};
onMounted(fetchRestaurants);
</script>
