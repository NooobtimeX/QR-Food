<template>
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
            placeholder="Search Restaurants..."
            class="w-full max-w-md rounded-xl border border-black p-3 focus:outline-none focus:ring-2"
          />
        </div>

        <!-- Buttons for creating restaurant or branch -->
        <div class="mb-8 flex justify-center">
          <button
            class="rounded-lg bg-orange-04 pl-3 pr-3 text-white shadow-xl hover:bg-orange-03"
            @click="showRestaurantModal = true"
          >
            + New Restaurant
          </button>
          <button
            class="rounded-lg bg-orange-04 pl-3 pr-3 text-white shadow-xl hover:bg-orange-03"
            :disabled="!ownerAccess.length"
            @click="showBranchModal = true"
          >
            + New Branch
          </button>
          <button
            class="rounded-lg bg-orange-04 pl-3 pr-3 text-white shadow-xl hover:bg-orange-03"
            :disabled="!ownerAccess.length"
            @click="showMenuModal = true"
          >
            + New Menu
          </button>
        </div>

        <!-- Menu Popup Component -->
        <CreateMenu :is-open="showMenuModal" @close="showMenuModal = false" />

        <!-- Restaurant and branch display -->
        <div v-if="filteredRestaurants.length" class="space-y-8">
          <div
            v-for="restaurant in filteredRestaurants"
            :key="restaurant.id"
            class="rounded-lg border-2 border-gray-300 bg-white p-6 shadow-xl"
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
                  <span class="font-bold">Branch :</span> {{ branch.name }}
                </p>
                <p class="text-lg text-black">
                  <span class="font-bold">Phone Number :</span>
                  {{ branch.phoneNumber }}
                </p>
                <p class="text-lg text-black">
                  <span class="font-bold">Role :</span>
                  <span class="text-black">
                    {{
                      branch.userBranchRoles.length
                        ? branch.userBranchRoles[0].role
                        : "No role assigned"
                    }}
                  </span>
                </p>
              </div>
            </div>
            <p v-else class="text-black">No branches available.</p>
          </div>
        </div>
        <p v-else class="text-xl text-black">No restaurants available.</p>
      </div>
    </div>

    <!-- Modal for creating restaurant -->
    <div
      v-if="showRestaurantModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-75"
    >
      <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h3 class="mb-4 text-center text-2xl font-bold text-black">
          Create New Restaurant
        </h3>
        <div class="mb-4">
          <label class="block font-bold text-black">Name</label>
          <input
            v-model="newRestaurant.name"
            type="text"
            class="w-full rounded-lg border border-gray-400 p-3 focus:ring"
            required
          />
        </div>
        <div class="flex justify-end">
          <button
            class="mr-2 bg-red-500 pl-2 pr-2 text-white hover:bg-red-02"
            @click="cancelRestaurantCreation"
          >
            Cancel
          </button>
          <button
            class="bg-green-500 pl-2 pr-2 text-white hover:bg-green-700"
            @click="createRestaurant"
          >
            Create
          </button>
        </div>
      </div>
    </div>

    <!-- Modal for creating branch -->
    <div
      v-if="showBranchModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-75"
    >
      <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h3 class="mb-4 text-center text-xl font-bold text-black">
          Create New Branch
        </h3>
        <div class="mb-4">
          <label class="block font-bold text-black">Branch Name</label>
          <input
            v-model="newBranch.name"
            type="text"
            class="w-full rounded-lg border border-gray-400 p-3 focus:outline-none focus:ring-2"
            required
          />
        </div>
        <div class="mb-4">
          <label class="block font-bold text-black">Phone Number</label>
          <input
            v-model="newBranch.phoneNumber"
            type="text"
            class="w-full rounded-lg border border-gray-400 p-3 focus:outline-none focus:ring-2"
            required
          />
        </div>
        <div class="mb-4">
          <label class="block font-bold text-black">Select Restaurant</label>
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
        <div class="flex justify-end">
          <button
            class="mr-2 bg-red-500 pl-2 pr-2 text-white hover:bg-red-02"
            @click="cancelBranchCreation"
          >
            Cancel
          </button>
          <button
            class="bg-green-500 pl-2 pr-2 text-white hover:bg-green-700"
            @click="createBranch"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import CreateMenu from "../../components/popup/CreateMenu.vue"; // Import the Menu Popup component

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
}

const showRestaurantModal = ref(false);
const showBranchModal = ref(false);
const searchQuery = ref("");
const newRestaurant = ref({ name: "" });
const newBranch = ref({ name: "", phoneNumber: "", restaurantId: 0 });
const ownerAccess = ref<Restaurant[]>([]);
const staffAccess = ref<Restaurant[]>([]);
const showMenuModal = ref(false);

const router = useRouter();

const cancelRestaurantCreation = () => {
  showRestaurantModal.value = false;
};

const cancelBranchCreation = () => {
  showBranchModal.value = false;
};

const goToDashboard = (restaurantId: number, branchId: number) => {
  localStorage.setItem("restaurantId", restaurantId.toString()); // Save restaurantId in localStorage
  localStorage.setItem("branchId", branchId.toString()); // Save branchId in localStorage
  router.push(`/restaurant/dashboard`); // Redirect to the dashboard
};

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

const fetchRestaurants = async () => {
  try {
    const response = await axios.get("/api/restaurant/getAllRestaurants", {
      params: { userId: localStorage.getItem("userId") },
    });
    ownerAccess.value = response.data.body.ownedRestaurants;
    staffAccess.value = response.data.body.staffRestaurants;
  } catch (error) {
    console.error("Error fetching restaurants:", error);
  }
};

const createRestaurant = async () => {
  try {
    await axios.post("/api/restaurant/createRestaurant", {
      name: newRestaurant.value.name,
      userId: Number(localStorage.getItem("userId")),
    });
    showRestaurantModal.value = false;
    await fetchRestaurants();
  } catch (error) {
    console.error("Error creating restaurant:", error);
  }
};

const createBranch = async () => {
  try {
    await axios.post("/api/branch/createBranch", {
      name: newBranch.value.name,
      phoneNumber: newBranch.value.phoneNumber,
      restaurantId: newBranch.value.restaurantId,
      userId: Number(localStorage.getItem("userId")),
    });
    showBranchModal.value = false;
    await fetchRestaurants();
  } catch (error) {
    console.error("Error creating branch:", error);
  }
};

onMounted(fetchRestaurants);
</script>
